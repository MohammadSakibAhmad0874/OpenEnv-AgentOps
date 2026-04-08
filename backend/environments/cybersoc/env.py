"""
CyberSOC Environment — Security Operations Center
Agents classify and respond to a queue of security alerts.
"""

from __future__ import annotations

import copy
from datetime import datetime
from typing import Any, Optional

from core.base_env import BaseEnvironment
from core.models import Action, Reward, ScoreCard, StepResult
from core.reward_engine import compute_grade
from core.storage import load_scenario, save_session

VALID_ACTIONS = {"classify_alert", "escalate", "dismiss", "block_ip"}
VALID_SEVERITIES = {"critical", "high", "medium", "low", "false_positive"}


class CyberSOCEnv(BaseEnvironment):
    env_id = "cybersoc"
    max_steps = 20
    max_score = 100.0

    def reset(self) -> dict[str, Any]:
        scenario = load_scenario(self.env_id, self.scenario_id)
        self.scenario_id = scenario["id"]
        self._scenario = scenario

        self._alert_actions: dict[str, list[str]] = {}  # alert_id -> list of actions taken
        self._correct_classifications: dict[str, bool] = {}
        self._correct_followups: dict[str, bool] = {}

        self._state = {
            "alerts": copy.deepcopy(scenario["alerts"]),
            "action_queue": [],
            "blocked_ips": [],
            "escalated_alerts": [],
            "dismissed_alerts": [],
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

        # Auto-terminate if all alerts are handled
        if self._all_alerts_handled():
            result = StepResult(
                observation=result.observation,
                reward=result.reward,
                done=True,
                info={"terminal": True, "reason": "All alerts processed"},
            )
            self._done = True

        save_session(self.to_session_dict())
        return result

    def _action_classify_alert(self, action: Action) -> StepResult:
        alert_id = action.parameters.get("alert_id", "")
        severity = action.parameters.get("severity", "").lower()

        alert = self._find_alert(alert_id)
        if not alert:
            return self._invalid_action(f"Alert '{alert_id}' not found.")
        if severity not in VALID_SEVERITIES:
            return self._invalid_action(f"Invalid severity '{severity}'.")

        # Update alert in state
        for a in self._state["alerts"]:
            if a["id"] == alert_id:
                a["classified_severity"] = severity
                a["status"] = "classified"

        correct_severity = alert["true_severity"]
        if alert["true_label"] == "false_positive":
            correct_severity = "false_positive"

        correct = severity == correct_severity
        self._correct_classifications[alert_id] = correct

        if correct:
            reward_val = 15.0 if alert["true_severity"] == "critical" else 10.0
            explanation = f"✓ Alert {alert_id} correctly classified as '{severity}'."
            breakdown = {"correct_classification": reward_val}
        else:
            # Severity mismatch — partial credit if direction is right
            reward_val = -5.0
            explanation = f"✗ Alert {alert_id} classified as '{severity}' (expected '{correct_severity}')."
            breakdown = {"misclassification_penalty": -5.0}

        return StepResult(observation=self.state(), reward=Reward(value=reward_val, explanation=explanation, breakdown=breakdown), done=False)

    def _action_escalate(self, action: Action) -> StepResult:
        alert_id = action.parameters.get("alert_id", "")
        team = action.parameters.get("team", "SOC")

        alert = self._find_alert(alert_id)
        if not alert:
            return self._invalid_action(f"Alert '{alert_id}' not found.")

        correct_follow = self._scenario["correct_actions"].get(alert_id, {}).get("follow_up")
        classified_correctly = self._correct_classifications.get(alert_id, False)
        self._state["escalated_alerts"].append(alert_id)

        for a in self._state["alerts"]:
            if a["id"] == alert_id:
                a["status"] = "escalated"

        if correct_follow == "escalate" and classified_correctly:
            reward_val = 20.0
            explanation = f"✓ Alert {alert_id} correctly escalated to {team}."
            self._correct_followups[alert_id] = True
        elif correct_follow != "escalate":
            reward_val = -10.0
            explanation = f"✗ Alert {alert_id} should not be escalated (expected '{correct_follow}')."
            self._correct_followups[alert_id] = False
        else:
            reward_val = 5.0
            explanation = f"Escalated {alert_id} but classification was wrong — partial credit."

        return StepResult(observation=self.state(), reward=Reward(value=reward_val, explanation=explanation), done=False)

    def _action_dismiss(self, action: Action) -> StepResult:
        alert_id = action.parameters.get("alert_id", "")
        reason = action.parameters.get("reason", "")

        alert = self._find_alert(alert_id)
        if not alert:
            return self._invalid_action(f"Alert '{alert_id}' not found.")

        correct_follow = self._scenario["correct_actions"].get(alert_id, {}).get("follow_up")
        self._state["dismissed_alerts"].append(alert_id)
        for a in self._state["alerts"]:
            if a["id"] == alert_id:
                a["status"] = "dismissed"

        if correct_follow == "dismiss":
            reward_val = 10.0
            explanation = f"✓ Correctly dismissed alert {alert_id}."
            self._correct_followups[alert_id] = True
        else:
            reward_val = -15.0
            explanation = f"✗ Alert {alert_id} was dismissed but needed '{correct_follow}' — critical miss."
            self._correct_followups[alert_id] = False

        return StepResult(observation=self.state(), reward=Reward(value=reward_val, explanation=explanation), done=False)

    def _action_block_ip(self, action: Action) -> StepResult:
        ip = action.parameters.get("ip", "")
        alert_id = action.parameters.get("alert_id", "")

        if not ip:
            return self._invalid_action("block_ip requires 'ip' parameter.")

        self._state["blocked_ips"].append(ip)
        for a in self._state["alerts"]:
            if a["id"] == alert_id:
                a["status"] = "blocked"

        correct_follow = self._scenario["correct_actions"].get(alert_id, {}).get("follow_up")
        if correct_follow == "block_ip":
            # Check IP matches
            alert = self._find_alert(alert_id)
            expected_ip = alert.get("source_ip") if alert else None
            if expected_ip and ip == expected_ip:
                reward_val = 15.0
                explanation = f"✓ Correct IP {ip} blocked for alert {alert_id}."
                self._correct_followups[alert_id] = True
            else:
                reward_val = 5.0
                explanation = f"Blocked IP {ip} (expected {expected_ip}) — partial credit."
        else:
            reward_val = -5.0
            explanation = f"✗ Blocking IP was not the correct action for alert {alert_id}."
            self._correct_followups[alert_id] = False

        return StepResult(observation=self.state(), reward=Reward(value=reward_val, explanation=explanation), done=False)

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
            breakdown={
                "correct_classifications": sum(1 for v in self._correct_classifications.values() if v) * 10.0,
                "correct_followups": sum(1 for v in self._correct_followups.values() if v) * 10.0,
            },
            action_log=self._action_log,
            completed=self._done,
        )

    def _find_alert(self, alert_id: str) -> Optional[dict]:
        for a in self._scenario["alerts"]:
            if a["id"] == alert_id:
                return a
        return None

    def _all_alerts_handled(self) -> bool:
        handled = set(self._state["escalated_alerts"] + self._state["dismissed_alerts"] + self._state["blocked_ips"])
        all_ids = {a["id"] for a in self._state["alerts"]}
        statuses = {a["id"]: a.get("status", "open") for a in self._state["alerts"]}
        return all(s in {"escalated", "dismissed", "blocked"} for s in statuses.values())
