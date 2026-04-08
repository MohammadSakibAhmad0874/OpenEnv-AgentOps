"""
ClinicOps Environment — Clinic Scheduling & Triage
Agents schedule patients into appropriate slots based on urgency.
"""

from __future__ import annotations

import copy
from typing import Any

from core.base_env import BaseEnvironment
from core.models import Action, Reward, ScoreCard, StepResult
from core.storage import load_scenario, save_session

VALID_ACTIONS = {"schedule", "reschedule", "triage", "cancel"}


class ClinicOpsEnv(BaseEnvironment):
    env_id = "clinicops"
    max_steps = 15
    max_score = 100.0

    def reset(self) -> dict[str, Any]:
        scenario = load_scenario(self.env_id, self.scenario_id)
        self.scenario_id = scenario["id"]
        self._scenario = scenario
        self._scheduled: dict[str, str] = {}  # patient_id -> slot_id
        self._triaged: dict[str, int] = {}    # patient_id -> urgency assigned

        self._state = {
            "patients": copy.deepcopy(scenario["patients"]),
            "available_slots": copy.deepcopy(scenario["available_slots"]),
            "scheduled": {},
            "step_count": 0,
        }

        self._action_log = []
        self._reward_log = []
        self._total_reward = 0.0
        self._steps = 0
        self._invalid_actions = 0
        self._done = False

        save_session(self.to_session_dict())
        return self.state()

    def step(self, action: Action) -> StepResult:
        if self._done:
            return self._invalid_action("Episode already terminated.")
        if self._steps >= self.max_steps:
            return self._terminal_result(-5.0, "Max steps exceeded", {"penalty": -5.0})

        self._steps += 1
        self._state["step_count"] = self._steps

        if action.type not in VALID_ACTIONS:
            result = self._invalid_action(
                f"Unknown action '{action.type}'. Valid: {', '.join(VALID_ACTIONS)}"
            )
            self._log_action(action, result)
            save_session(self.to_session_dict())
            return result

        handler = getattr(self, f"_action_{action.type}")
        result = handler(action)
        self._log_action(action, result)

        # Auto-terminate if all patients scheduled
        if self._all_scheduled():
            self._done = True
            result = StepResult(
                observation=result.observation,
                reward=result.reward,
                done=True,
                info={"terminal": True, "reason": "All patients scheduled"},
            )

        save_session(self.to_session_dict())
        return result

    def _action_triage(self, action: Action) -> StepResult:
        patient_id = action.parameters.get("patient_id", "")
        urgency = action.parameters.get("urgency_level", 0)

        patient = self._find_patient(patient_id)
        if not patient:
            return self._invalid_action(f"Patient '{patient_id}' not found.")

        self._triaged[patient_id] = int(urgency)
        correct_urgency = patient["true_urgency"]
        diff = abs(int(urgency) - correct_urgency)

        for p in self._state["patients"]:
            if p["id"] == patient_id:
                p["assigned_urgency"] = urgency

        if diff == 0:
            reward_val = 10.0
            explanation = f"✓ Correct urgency {urgency} for {patient_id}."
            breakdown = {"correct_triage": 10.0}
        elif diff == 1:
            reward_val = 5.0
            explanation = f"Close triage — assigned {urgency}, expected {correct_urgency}."
            breakdown = {"partial_triage": 5.0}
        else:
            # Critical miss: emergeny triaged as low
            penalty = -15.0 if correct_urgency >= 4 else -5.0
            reward_val = penalty
            explanation = f"✗ Bad triage — assigned {urgency}, expected {correct_urgency}."
            breakdown = {"bad_triage_penalty": penalty}

        return StepResult(observation=self.state(), reward=Reward(value=reward_val, explanation=explanation, breakdown=breakdown), done=False)

    def _action_schedule(self, action: Action) -> StepResult:
        patient_id = action.parameters.get("patient_id", "")
        slot_id = action.parameters.get("slot_id", "")

        patient = self._find_patient(patient_id)
        slot = self._find_slot(slot_id)

        if not patient:
            return self._invalid_action(f"Patient '{patient_id}' not found.")
        if not slot:
            return self._invalid_action(f"Slot '{slot_id}' not found.")

        correct_slot = self._scenario["correct_scheduling"].get(patient_id)
        self._scheduled[patient_id] = slot_id
        self._state["scheduled"][patient_id] = slot_id

        for p in self._state["patients"]:
            if p["id"] == patient_id:
                p["status"] = "scheduled"
                p["slot"] = slot_id

        if slot_id == correct_slot:
            reward_val = 20.0
            explanation = f"✓ {patient_id} correctly scheduled into {slot_id}."
            breakdown = {"correct_schedule": 20.0}
        else:
            # Check urgency compatibility
            urgency = patient["true_urgency"]
            slot_req = slot.get("urgency_min", 0)
            if urgency >= slot_req:
                reward_val = 5.0
                explanation = f"Scheduled {patient_id} in {slot_id} — compatible but not optimal (expected {correct_slot})."
                breakdown = {"compatible_schedule": 5.0}
            else:
                reward_val = -10.0
                explanation = f"✗ Urgency mismatch — {patient_id} (urgency {urgency}) placed in slot needing {slot_req}+."
                breakdown = {"urgency_mismatch_penalty": -10.0}

        return StepResult(observation=self.state(), reward=Reward(value=reward_val, explanation=explanation, breakdown=breakdown), done=False)

    def _action_reschedule(self, action: Action) -> StepResult:
        patient_id = action.parameters.get("patient_id", "")
        new_slot_id = action.parameters.get("new_slot_id", "")
        reason = action.parameters.get("reason", "")

        if not patient_id or not new_slot_id:
            return self._invalid_action("reschedule requires 'patient_id' and 'new_slot_id'.")

        if patient_id not in self._scheduled:
            return self._invalid_action(f"{patient_id} is not scheduled yet — use 'schedule' first.")

        old_slot = self._scheduled[patient_id]
        self._scheduled[patient_id] = new_slot_id
        self._state["scheduled"][patient_id] = new_slot_id

        correct_slot = self._scenario["correct_scheduling"].get(patient_id)
        if new_slot_id == correct_slot:
            reward_val = 10.0
            explanation = f"✓ Rescheduled {patient_id} from {old_slot} to correct slot {new_slot_id}."
        else:
            reward_val = -5.0
            explanation = f"Rescheduled {patient_id} but still not optimal slot (expected {correct_slot})."

        return StepResult(observation=self.state(), reward=Reward(value=reward_val, explanation=explanation), done=False)

    def _action_cancel(self, action: Action) -> StepResult:
        patient_id = action.parameters.get("patient_id", "")
        reason = action.parameters.get("reason", "")

        patient = self._find_patient(patient_id)
        if not patient:
            return self._invalid_action(f"Patient '{patient_id}' not found.")

        urgency = patient["true_urgency"]
        if urgency >= 4:
            reward_val = -20.0
            explanation = f"✗ DANGEROUS: Cancelled emergency patient {patient_id} (urgency={urgency})."
        else:
            reward_val = -5.0
            explanation = f"Cancelled {patient_id} — generally avoid cancellations."

        return StepResult(observation=self.state(), reward=Reward(value=reward_val, explanation=explanation), done=False)

    def score(self) -> ScoreCard:
        total = max(0.0, round(self._total_reward, 2))
        pct = round((total / self.max_score) * 100, 1)
        correct_count = sum(
            1 for pid, sid in self._scheduled.items()
            if sid == self._scenario["correct_scheduling"].get(pid)
        )
        return ScoreCard(
            session_id=self.session_id,
            env_id=self.env_id,
            scenario_id=self.scenario_id,
            total=total,
            max_possible=self.max_score,
            percentage=pct,
            grade=self._grade(pct),
            steps_taken=self._steps,
            invalid_actions=self._invalid_actions,
            breakdown={"correct_schedulings": correct_count * 20.0},
            action_log=self._action_log,
            completed=self._done,
        )

    def _find_patient(self, patient_id: str):
        for p in self._scenario["patients"]:
            if p["id"] == patient_id:
                return p
        return None

    def _find_slot(self, slot_id: str):
        for s in self._scenario["available_slots"]:
            if s["id"] == slot_id:
                return s
        return None

    def _all_scheduled(self) -> bool:
        all_ids = {p["id"] for p in self._scenario["patients"]}
        return all_ids == set(self._scheduled.keys())
