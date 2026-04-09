"""
API Endpoints — Environments
/api/v1/environments/*
"""

from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from core.models import (
    Action,
    ResetRequest,
    ResetResponse,
    ScoreCard,
    StepRequest,
    StepResponse,
)
from core.storage import load_session, save_session, list_sessions
from environments.registry import ENV_META, get_env_class, get_env_meta

router = APIRouter(prefix="/environments", tags=["Environments"])

# ---------------------------------------------------------------------------
# In-memory active env cache (session_id -> env instance)
# Env instances cannot be serialised to JSON, so we reconstruct on demand.
# ---------------------------------------------------------------------------
_active_envs: dict[str, object] = {}


def _get_or_restore_env(session_id: str, env_id: str):
    """Return cached env, or raise 404 if session not found."""
    if session_id in _active_envs:
        return _active_envs[session_id]

    session = load_session(session_id)
    if not session:
        raise HTTPException(404, f"Session '{session_id}' not found.")

    cls = get_env_class(env_id)
    env = cls(session_id=session_id, scenario_id=session.get("scenario_id"))

    # Restore state from persisted session
    env._state = session["state"]
    env._action_log = session["action_log"]
    env._reward_log = session["reward_log"]
    env._total_reward = session["total_reward"]
    env._steps = session["steps"]
    env._invalid_actions = session["invalid_actions"]
    env._done = session["done"]

    # Restore scenario for grading
    from core.storage import load_scenario
    scenario = load_scenario(env_id, session.get("scenario_id"))
    env._scenario = scenario
    env.scenario_id = scenario["id"]
    env._sla_minutes = scenario.get("sla_minutes", 60)

    # Restore environment-specific flags
    if env_id == "supportdesk":
        _restore_supportdesk_flags(env)
    elif env_id == "cybersoc":
        _restore_cybersoc_flags(env)

    _active_envs[session_id] = env
    return env


def _restore_supportdesk_flags(env):
    from datetime import datetime, timezone
    ticket = env._state.get("ticket", {})
    env._classified = ticket.get("category") is not None
    env._correct_category = ticket.get("category") == env._scenario["correct_classification"]["category"]
    env._correct_priority = ticket.get("priority") == env._scenario["correct_classification"]["priority"]
    status = env._state.get("status", "open")
    env._resolution_taken = status in {"completed"}
    env._correct_resolution = False
    env._unsafe_action_taken = False
    env._start_time = datetime.now(timezone.utc)


def _restore_cybersoc_flags(env):
    env._alert_actions = {}
    env._correct_classifications = {}
    env._correct_followups = {}


# ---------------------------------------------------------------------------
# List all environments
# ---------------------------------------------------------------------------

@router.get("/", summary="List all environments")
def list_environments():
    return {"environments": [m.model_dump() for m in ENV_META]}


# ---------------------------------------------------------------------------
# GET single env meta
# ---------------------------------------------------------------------------

@router.get("/{env_id}", summary="Get environment metadata")
def get_environment(env_id: str):
    try:
        meta = get_env_meta(env_id)
    except ValueError as e:
        raise HTTPException(404, str(e))
    return meta.model_dump()


# ---------------------------------------------------------------------------
# POST /reset
# ---------------------------------------------------------------------------

@router.post("/{env_id}/reset", response_model=ResetResponse, summary="Reset environment")
def reset_environment(env_id: str, body: ResetRequest = ResetRequest()):
    try:
        cls = get_env_class(env_id)
    except ValueError as e:
        raise HTTPException(404, str(e))

    session_id = str(uuid.uuid4())
    env = cls(session_id=session_id, scenario_id=body.scenario_id)
    observation = env.reset()
    _active_envs[session_id] = env

    return ResetResponse(
        session_id=session_id,
        env_id=env_id,
        scenario_id=env.scenario_id,
        observation=observation,
    )


# ---------------------------------------------------------------------------
# POST /step
# ---------------------------------------------------------------------------

@router.post("/{env_id}/step", response_model=StepResponse, summary="Execute one action step")
def step_environment(env_id: str, body: StepRequest):
    env = _get_or_restore_env(body.session_id, env_id)
    result = env.step(body.action)

    return StepResponse(
        session_id=body.session_id,
        step=env._steps,
        observation=result.observation,
        reward=result.reward,
        done=result.done,
        info=result.info,
    )


# ---------------------------------------------------------------------------
# GET /state
# ---------------------------------------------------------------------------

@router.get("/{env_id}/state", summary="Get current environment state")
def get_state(env_id: str, session_id: str = Query(...)):
    env = _get_or_restore_env(session_id, env_id)
    return {"session_id": session_id, "env_id": env_id, "state": env.state(), "done": env._done}


# ---------------------------------------------------------------------------
# GET /score
# ---------------------------------------------------------------------------

@router.get("/{env_id}/score", response_model=ScoreCard, summary="Get score card")
def get_score(env_id: str, session_id: str = Query(...)):
    env = _get_or_restore_env(session_id, env_id)
    return env.score()


# ---------------------------------------------------------------------------
# GET /sessions — list sessions for env
# ---------------------------------------------------------------------------

@router.get("/{env_id}/sessions", summary="List sessions for this environment")
def list_env_sessions(env_id: str, limit: int = Query(20, ge=1, le=100)):
    sessions = list_sessions(env_id)[:limit]
    return {"env_id": env_id, "sessions": sessions, "total": len(sessions)}
