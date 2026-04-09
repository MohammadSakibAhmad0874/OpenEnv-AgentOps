"""
API Endpoints — Sessions
/api/v1/sessions/*
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from core.storage import load_session, list_sessions, delete_session

router = APIRouter(prefix="/sessions", tags=["Sessions"])


@router.get("/", summary="List all sessions across all environments")
def list_all_sessions(
    env_id: str = Query(None, description="Filter by environment ID"),
    limit: int = Query(50, ge=1, le=200),
):
    sessions = list_sessions(env_id)[:limit]
    return {
        "sessions": sessions,
        "total": len(sessions),
    }


@router.get("/{session_id}", summary="Get a single session record")
def get_session(session_id: str):
    session = load_session(session_id)
    if not session:
        raise HTTPException(404, f"Session '{session_id}' not found.")
    return session


@router.get("/{session_id}/replay", summary="Get the full action replay log")
def get_replay(session_id: str):
    session = load_session(session_id)
    if not session:
        raise HTTPException(404, f"Session '{session_id}' not found.")
    return {
        "session_id": session_id,
        "env_id": session.get("env_id"),
        "scenario_id": session.get("scenario_id"),
        "steps": session.get("steps", 0),
        "total_reward": session.get("total_reward", 0.0),
        "done": session.get("done", False),
        "action_log": session.get("action_log", []),
        "reward_log": session.get("reward_log", []),
    }


@router.delete("/{session_id}", summary="Delete a session")
def remove_session(session_id: str):
    deleted = delete_session(session_id)
    if not deleted:
        raise HTTPException(404, f"Session '{session_id}' not found.")
    return {"message": f"Session '{session_id}' deleted.", "session_id": session_id}
