"""
OpenEnv AgentOps — JSON File Storage
All session data persisted to data/sessions/*.json
"""

from __future__ import annotations

import json
import random
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
SESSIONS_DIR = DATA_DIR / "sessions"
SCENARIOS_DIR = DATA_DIR / "scenarios"


def _ensure_dirs() -> None:
    SESSIONS_DIR.mkdir(parents=True, exist_ok=True)
    SCENARIOS_DIR.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------------------------
# Session CRUD
# ---------------------------------------------------------------------------

def save_session(session: dict[str, Any]) -> None:
    _ensure_dirs()
    session["updated_at"] = datetime.utcnow().isoformat()
    path = SESSIONS_DIR / f"{session['session_id']}.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(session, f, indent=2, default=str)


def load_session(session_id: str) -> Optional[dict[str, Any]]:
    path = SESSIONS_DIR / f"{session_id}.json"
    if not path.exists():
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def list_sessions(env_id: Optional[str] = None) -> list[dict[str, Any]]:
    _ensure_dirs()
    sessions = []
    for path in SESSIONS_DIR.glob("*.json"):
        with open(path, "r", encoding="utf-8") as f:
            session = json.load(f)
        if env_id is None or session.get("env_id") == env_id:
            sessions.append(session)
    return sorted(sessions, key=lambda s: s.get("created_at", ""), reverse=True)


def delete_session(session_id: str) -> bool:
    path = SESSIONS_DIR / f"{session_id}.json"
    if path.exists():
        path.unlink()
        return True
    return False


# ---------------------------------------------------------------------------
# Scenario loading
# ---------------------------------------------------------------------------

def load_scenario(env_id: str, scenario_id: Optional[str] = None) -> dict[str, Any]:
    path = SCENARIOS_DIR / f"{env_id}.json"
    if not path.exists():
        raise FileNotFoundError(f"No scenario file for env '{env_id}'")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    scenarios = data.get("scenarios", [])
    if not scenarios:
        raise ValueError(f"No scenarios defined for env '{env_id}'")
    if scenario_id:
        for s in scenarios:
            if s["id"] == scenario_id:
                return s
        raise ValueError(f"Scenario '{scenario_id}' not found in env '{env_id}'")
    return random.choice(scenarios)


def list_scenarios(env_id: str) -> list[dict[str, Any]]:
    path = SCENARIOS_DIR / f"{env_id}.json"
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("scenarios", [])


def get_scenario_count(env_id: str) -> int:
    return len(list_scenarios(env_id))
