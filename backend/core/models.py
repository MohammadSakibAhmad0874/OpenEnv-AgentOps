"""
OpenEnv AgentOps — Core Pydantic Models
Shared types used across all environments and API layers.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Action
# ---------------------------------------------------------------------------

class Action(BaseModel):
    type: str
    parameters: dict[str, Any] = Field(default_factory=dict)


# ---------------------------------------------------------------------------
# Reward & Step
# ---------------------------------------------------------------------------

class Reward(BaseModel):
    value: float
    explanation: str
    breakdown: dict[str, float] = Field(default_factory=dict)


class StepResult(BaseModel):
    observation: dict[str, Any]
    reward: Reward
    done: bool
    info: dict[str, Any] = Field(default_factory=dict)


# ---------------------------------------------------------------------------
# Scoring
# ---------------------------------------------------------------------------

class ScoreCard(BaseModel):
    session_id: str
    env_id: str
    scenario_id: Optional[str] = None
    total: float
    max_possible: float
    percentage: float
    grade: str
    steps_taken: int
    invalid_actions: int
    breakdown: dict[str, float] = Field(default_factory=dict)
    action_log: list[dict[str, Any]] = Field(default_factory=list)
    completed: bool = False
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


# ---------------------------------------------------------------------------
# Session Record (persisted to JSON)
# ---------------------------------------------------------------------------

class SessionRecord(BaseModel):
    session_id: str
    env_id: str
    scenario_id: Optional[str] = None
    state: dict[str, Any] = Field(default_factory=dict)
    action_log: list[dict[str, Any]] = Field(default_factory=list)
    reward_log: list[dict[str, Any]] = Field(default_factory=list)
    total_reward: float = 0.0
    steps: int = 0
    invalid_actions: int = 0
    done: bool = False
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


# ---------------------------------------------------------------------------
# Environment Metadata
# ---------------------------------------------------------------------------

class EnvironmentMeta(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    color: str
    tag: str
    actions: list[str]
    max_steps: int
    max_score: float
    scenario_count: int
    status: str = "active"
    category: str = "general"


# ---------------------------------------------------------------------------
# API Request/Response shapes
# ---------------------------------------------------------------------------

class ResetRequest(BaseModel):
    scenario_id: Optional[str] = None


class StepRequest(BaseModel):
    session_id: str
    action: Action


class ResetResponse(BaseModel):
    session_id: str
    env_id: str
    scenario_id: Optional[str]
    observation: dict[str, Any]
    message: str = "Environment reset successfully"


class StepResponse(BaseModel):
    session_id: str
    step: int
    observation: dict[str, Any]
    reward: Reward
    done: bool
    info: dict[str, Any] = Field(default_factory=dict)
