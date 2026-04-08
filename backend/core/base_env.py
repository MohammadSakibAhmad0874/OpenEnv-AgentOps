"""
OpenEnv AgentOps — Abstract Base Environment
All environments must inherit from this class.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any, Optional

from core.models import Action, Reward, ScoreCard, StepResult


class BaseEnvironment(ABC):
    env_id: str = "base"
    max_steps: int = 20
    max_score: float = 100.0

    def __init__(self, session_id: str, scenario_id: Optional[str] = None):
        self.session_id = session_id
        self.scenario_id = scenario_id
        self._state: dict[str, Any] = {}
        self._action_log: list[dict[str, Any]] = []
        self._reward_log: list[dict[str, Any]] = []
        self._total_reward: float = 0.0
        self._steps: int = 0
        self._invalid_actions: int = 0
        self._done: bool = False

    # ------------------------------------------------------------------
    # Abstract interface — every env MUST implement these
    # ------------------------------------------------------------------

    @abstractmethod
    def reset(self) -> dict[str, Any]:
        """Reset to fresh scenario, return initial observation."""
        ...

    @abstractmethod
    def step(self, action: Action) -> StepResult:
        """Execute action, return StepResult."""
        ...

    @abstractmethod
    def score(self) -> ScoreCard:
        """Return final deterministic ScoreCard."""
        ...

    # ------------------------------------------------------------------
    # Concrete helpers available to all subclasses
    # ------------------------------------------------------------------

    def state(self) -> dict[str, Any]:
        """Return sanitized current observation (no internal grader state)."""
        return {k: v for k, v in self._state.items() if not k.startswith("_")}

    def get_action_log(self) -> list[dict[str, Any]]:
        return list(self._action_log)

    # ------------------------------------------------------------------
    # Internal utilities
    # ------------------------------------------------------------------

    def _log_action(self, action: Action, result: StepResult) -> None:
        entry = {
            "step": self._steps,
            "action_type": action.type,
            "action_params": action.parameters,
            "reward_value": result.reward.value,
            "reward_explanation": result.reward.explanation,
            "done": result.done,
            "timestamp": datetime.utcnow().isoformat(),
        }
        self._action_log.append(entry)
        self._reward_log.append(
            {"step": self._steps, "value": result.reward.value, "breakdown": result.reward.breakdown}
        )
        self._total_reward += result.reward.value

    def _invalid_action(self, reason: str) -> StepResult:
        """Return a standardised penalty result for invalid actions."""
        self._invalid_actions += 1
        reward = Reward(
            value=-3.0,
            explanation=f"Invalid action: {reason}",
            breakdown={"penalty": -3.0},
        )
        result = StepResult(
            observation=self.state(),
            reward=reward,
            done=False,
            info={"error": reason, "valid": False},
        )
        return result

    def _terminal_result(self, reward_value: float, explanation: str, breakdown: dict) -> StepResult:
        """Return a terminal step that ends the episode."""
        self._done = True
        reward = Reward(value=reward_value, explanation=explanation, breakdown=breakdown)
        return StepResult(
            observation=self.state(),
            reward=reward,
            done=True,
            info={"terminal": True},
        )

    @staticmethod
    def _grade(percentage: float) -> str:
        if percentage >= 95:
            return "A+"
        if percentage >= 85:
            return "A"
        if percentage >= 75:
            return "B"
        if percentage >= 65:
            return "C"
        if percentage >= 50:
            return "D"
        return "F"

    def to_session_dict(self) -> dict[str, Any]:
        """Serialize current env state to a dict for JSON persistence."""
        return {
            "session_id": self.session_id,
            "env_id": self.env_id,
            "scenario_id": self.scenario_id,
            "state": self._state,
            "action_log": self._action_log,
            "reward_log": self._reward_log,
            "total_reward": self._total_reward,
            "steps": self._steps,
            "invalid_actions": self._invalid_actions,
            "done": self._done,
        }
