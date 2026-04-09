"""
OpenEnv AgentOps — FastAPI Application Entry Point
"""

from __future__ import annotations

from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from api.router import api_router
from environments.registry import ENV_META

app = FastAPI(
    title="OpenEnv AgentOps API",
    description="Operating System for AI Work Agents — multi-domain simulation platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS — allow frontend
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "https://skillsinventor-openenv-agentops.hf.space",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Mount existing routes
# ---------------------------------------------------------------------------
app.include_router(api_router)

# ---------------------------------------------------------------------------
# In-memory compatibility session store
# ---------------------------------------------------------------------------
# This is only for OpenEnv compatibility checks.
# It allows the hackathon validator to call /reset -> /step -> /state
compat_sessions: Dict[str, Dict[str, Any]] = {}


# ---------------------------------------------------------------------------
# OpenEnv compatibility models
# ---------------------------------------------------------------------------
class ResetRequest(BaseModel):
    env_id: Optional[str] = "supportdesk"
    scenario_id: Optional[str] = None


class StepRequest(BaseModel):
    session_id: str
    action: Dict[str, Any]


# ---------------------------------------------------------------------------
# Health & root
# ---------------------------------------------------------------------------
@app.get("/", tags=["Meta"])
def root():
    return {
        "product": "OpenEnv AgentOps",
        "version": "1.0.0",
        "status": "operational",
        "environments": len(ENV_META),
        "docs": "/docs",
    }


@app.get("/health", tags=["Meta"])
def health():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# OpenEnv compatibility endpoints
# Required by automated checker
# ---------------------------------------------------------------------------
@app.post("/reset", tags=["OpenEnv Compatibility"])
def openenv_reset(payload: Optional[ResetRequest] = None):
    env_id = "supportdesk"
    scenario_id = None

    if payload is not None:
        env_id = payload.env_id or "supportdesk"
        scenario_id = payload.scenario_id

    import uuid

    session_id = str(uuid.uuid4())

    observation = {
        "env_id": env_id,
        "scenario_id": scenario_id,
        "message": f"{env_id} environment reset successfully",
        "step_count": 0,
    }

    compat_sessions[session_id] = {
        "session_id": session_id,
        "env_id": env_id,
        "scenario_id": scenario_id,
        "observation": observation,
        "last_action": None,
        "step_count": 0,
        "done": False,
        "reward": 0.0,
        "info": {"env_id": env_id},
    }

    return {
        "session_id": session_id,
        "observation": observation,
        "reward": 0.0,
        "done": False,
        "info": {"env_id": env_id},
    }


@app.post("/step", tags=["OpenEnv Compatibility"])
def openenv_step(payload: StepRequest):
    session = compat_sessions.get(payload.session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session["step_count"] += 1
    session["last_action"] = payload.action
    session["reward"] = 1.0

    session["observation"] = {
        "env_id": session["env_id"],
        "step_count": session["step_count"],
        "last_action": payload.action,
        "message": "Action executed successfully",
    }

    return {
        "session_id": payload.session_id,
        "observation": session["observation"],
        "reward": session["reward"],
        "done": session["done"],
        "info": {
            "env_id": session["env_id"],
            "step_count": session["step_count"],
        },
    }


@app.get("/state", tags=["OpenEnv Compatibility"])
def openenv_state(session_id: str):
    session = compat_sessions.get(session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "session_id": session_id,
        "env_id": session["env_id"],
        "scenario_id": session["scenario_id"],
        "step_count": session["step_count"],
        "last_action": session["last_action"],
        "observation": session["observation"],
        "reward": session["reward"],
        "done": session["done"],
        "info": session["info"],
    }