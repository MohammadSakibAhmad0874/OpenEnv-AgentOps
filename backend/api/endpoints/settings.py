"""
Settings API — manages platform mode (Demo/Live) and global config.
"""

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/settings", tags=["Settings"])

SETTINGS_FILE = Path(__file__).parent.parent.parent / "data" / "settings.json"
SETTINGS_FILE.parent.mkdir(parents=True, exist_ok=True)

DEFAULT_SETTINGS = {
    "mode": "demo",
    "version": "1.0.0",
    "updated_at": datetime.utcnow().isoformat(),
    "features": {
        "live_data": True,
        "replay": True,
        "leaderboard": True,
    }
}


class PlatformSettings(BaseModel):
    mode: Literal["demo", "live"] = "demo"
    version: str = "1.0.0"
    updated_at: str = ""
    features: dict = {}


class ModeUpdate(BaseModel):
    mode: Literal["demo", "live"]


def _load() -> dict:
    if SETTINGS_FILE.exists():
        with open(SETTINGS_FILE, "r") as f:
            return json.load(f)
    return dict(DEFAULT_SETTINGS)


def _save(data: dict) -> None:
    with open(SETTINGS_FILE, "w") as f:
        json.dump(data, f, indent=2)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("/", response_model=PlatformSettings)
def get_settings():
    """Get current platform settings."""
    return PlatformSettings(**_load())


@router.post("/mode")
def set_mode(payload: ModeUpdate):
    """Toggle between Demo and Live mode."""
    data = _load()
    data["mode"] = payload.mode
    data["updated_at"] = datetime.utcnow().isoformat()
    _save(data)
    return {"mode": payload.mode, "updated_at": data["updated_at"]}


@router.get("/info")
def platform_info():
    """Return platform info and health."""
    data = _load()
    return {
        "product": "OpenEnv AgentOps",
        "version": data.get("version", "1.0.0"),
        "mode": data.get("mode", "demo"),
        "status": "operational",
        "build": "production",
        "environments": 4,
        "contributors": [
            {"name": "Mohammad Sakib Ahmad", "github": "MohammadSakibAhmad0874"},
            {"name": "adi4sure", "github": "adi4sure"},
        ]
    }
