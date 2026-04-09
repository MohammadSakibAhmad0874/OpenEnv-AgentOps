"""
RefundOps Environment — Refund & Returns Policy Engine
Agents approve, deny, or request more info on refund requests.
"""

from __future__ import annotations

import copy
from datetime import datetime
from typing import Any

from core.base_env import BaseEnvironment
from core.models import Action, Reward, ScoreCard, StepResult
from core.reward_engine import compute_grade, keyword_match_score
from core.storage import load_scenario, save_session

VALID_ACTIONS = {"approve", "deny", "request_info"}


class RefundOpsEnv(BaseEnvironment):
    env_id = "refundops"
    max_steps = 10
    max_score = 100.0

    def reset(self) -> dict[str, Any]:
        scenario = load_scenario(self.env_id, self.scenario_id)
        self.scenario_id = scenario["id"]
        self._scenario = scenario
        self._decision_made = False
        self._correct_decision = False

        self._state = {
            "refund_request": copy.deepcopy(scenario["request"]),
            "policy": copy.deepcopy(scenario["policy"]),
            "status": "pending",
            "notes": [],
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
        save_session(self.to_session_dict())
        return result

    def _action_approve(self, action: Action) -> StepResult:
        note = action.parameters.get("note", "")
        correct = self._scenario["correct_action"] == "approve"
        self._decision_made = True
        self._state["status"] = "approved"

        if correct:
            self._correct_decision = True
            kw = keyword_match_score(note, self._scenario["correct_reason_keywords"], 20.0)
            reward_val = 60.0 + kw
            explanation = f"✓ Correct decision: Approved. Justification quality: +{kw:.0f}/20."
            breakdown = {"correct_decision": 60.0, "justification_quality": kw}
        else:
            reward_val = -30.0
            explanation = f"✗ Wrong decision: Should have been '{self._scenario['correct_action']}'."
            breakdown = {"wrong_decision_penalty": -30.0}

        return self._terminal_result(reward_val, explanation, breakdown)

    def _action_deny(self, action: Action) -> StepResult:
        reason = action.parameters.get("reason", "")
        correct = self._scenario["correct_action"] == "deny"
        self._decision_made = True
        self._state["status"] = "denied"

        if correct:
            self._correct_decision = True
            kw = keyword_match_score(reason, self._scenario["correct_reason_keywords"], 20.0)
            reward_val = 60.0 + kw
            explanation = f"✓ Correct decision: Denied. Justification quality: +{kw:.0f}/20."
            breakdown = {"correct_decision": 60.0, "justification_quality": kw}
        else:
            reward_val = -30.0
            explanation = f"✗ Wrong decision: Should have been '{self._scenario['correct_action']}'."
            breakdown = {"wrong_decision_penalty": -30.0}

        return self._terminal_result(reward_val, explanation, breakdown)

    def _action_request_info(self, action: Action) -> StepResult:
        info_needed = action.parameters.get("info_needed", "").strip()
        if not info_needed:
            return self._invalid_action("request_info requires 'info_needed' parameter.")

        correct = self._scenario["correct_action"] == "request_info"
        self._decision_made = True
        self._state["status"] = "info_requested"
        self._state["notes"].append({"type": "info_request", "content": info_needed})

        if correct:
            self._correct_decision = True
            kw = keyword_match_score(info_needed, self._scenario["correct_reason_keywords"], 20.0)
            reward_val = 60.0 + kw
            explanation = f"✓ Correct decision: More info requested. Quality: +{kw:.0f}/20."
            breakdown = {"correct_decision": 60.0, "request_quality": kw}
        else:
            # Partial credit — wasn't wrong, just not final
            reward_val = 10.0
            explanation = f"Requested info, but the correct action was '{self._scenario['correct_action']}'."
            breakdown = {"partial_credit": 10.0}

        return self._terminal_result(reward_val, explanation, breakdown)

    def score(self) -> ScoreCard:
        total = max(0.0, round(self._total_reward, 2))
        pct = round((total / self.max_score) * 100, 1)
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
            breakdown={"correct_decision": 60.0 if self._correct_decision else 0.0},
            action_log=self._action_log,
            completed=self._done,
        )
