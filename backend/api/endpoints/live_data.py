"""
Live Data Ingestion API — allows real users to submit tickets, alerts, and emails.
These are stored as live scenarios and can be used in Demo or Live mode.
"""

from __future__ import annotations

import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/live", tags=["Live Data"])

LIVE_DATA_DIR = Path(__file__).parent.parent.parent / "data" / "live"
LIVE_DATA_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# Pydantic models for ingestion
# ---------------------------------------------------------------------------

class TicketSubmission(BaseModel):
    subject: str = Field(..., min_length=5, max_length=200)
    body: str = Field(..., min_length=20, max_length=5000)
    customer_name: str = Field(..., min_length=2, max_length=100)
    customer_email: str = Field(..., min_length=5, max_length=200)
    priority_hint: Optional[str] = Field(None, pattern="^(P1|P2|P3)$")
    category_hint: Optional[str] = None
    source: str = Field("web_form", description="Source: web_form, email, api")

class AlertSubmission(BaseModel):
    alert_type: str = Field(..., min_length=3, max_length=100)
    severity: str = Field(..., pattern="^(low|medium|high|critical)$")
    source_ip: Optional[str] = None
    description: str = Field(..., min_length=10, max_length=3000)
    affected_system: Optional[str] = None
    raw_log: Optional[str] = None

class EmailSubmission(BaseModel):
    sender_name: str
    sender_email: str
    subject: str
    body: str
    received_at: Optional[str] = None

class LiveSubmission(BaseModel):
    id: str
    type: str  # ticket | alert | email
    data: dict
    submitted_at: str
    env_id: str
    status: str  # pending | processed


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _save_submission(sub: dict) -> None:
    path = LIVE_DATA_DIR / f"{sub['id']}.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(sub, f, indent=2, default=str)


def _list_submissions(type_filter: Optional[str] = None) -> list[dict]:
    items = []
    for p in sorted(LIVE_DATA_DIR.glob("*.json"), reverse=True):
        try:
            with open(p, "r", encoding="utf-8") as f:
                item = json.load(f)
            if type_filter is None or item.get("type") == type_filter:
                items.append(item)
        except Exception:
            pass
    return items


def _get_submission(sub_id: str) -> Optional[dict]:
    path = LIVE_DATA_DIR / f"{sub_id}.json"
    if not path.exists():
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post("/tickets", response_model=LiveSubmission, status_code=201)
def submit_ticket(payload: TicketSubmission):
    """Submit a real support ticket for SupportDesk simulation."""
    sub_id = f"live-tick-{uuid.uuid4().hex[:12]}"
    sub = {
        "id": sub_id,
        "type": "ticket",
        "env_id": "supportdesk",
        "submitted_at": datetime.utcnow().isoformat(),
        "status": "pending",
        "data": {
            "ticket": {
                "id": f"TKT-{sub_id[-6:].upper()}",
                "subject": payload.subject,
                "body": payload.body,
                "created_at": datetime.utcnow().isoformat(),
                "status": "open",
                "category": payload.category_hint or "general",
                "priority": payload.priority_hint or "P2",
                "source": payload.source,
            },
            "customer": {
                "name": payload.customer_name,
                "email": payload.customer_email,
                "tier": "standard",
                "account_age_days": 90,
                "order_history": [],
            },
        },
    }
    _save_submission(sub)
    return LiveSubmission(**sub)


@router.post("/alerts", response_model=LiveSubmission, status_code=201)
def submit_alert(payload: AlertSubmission):
    """Submit a real security alert for CyberSOC simulation."""
    sub_id = f"live-alert-{uuid.uuid4().hex[:12]}"
    sub = {
        "id": sub_id,
        "type": "alert",
        "env_id": "cybersoc",
        "submitted_at": datetime.utcnow().isoformat(),
        "status": "pending",
        "data": {
            "alert_id": f"ALT-{sub_id[-6:].upper()}",
            "alert_type": payload.alert_type,
            "severity": payload.severity,
            "source_ip": payload.source_ip or "0.0.0.0",
            "description": payload.description,
            "affected_system": payload.affected_system or "unknown",
            "raw_log": payload.raw_log or "",
            "timestamp": datetime.utcnow().isoformat(),
        },
    }
    _save_submission(sub)
    return LiveSubmission(**sub)


@router.post("/emails", response_model=LiveSubmission, status_code=201)
def submit_email(payload: EmailSubmission):
    """Submit an inbound email for SupportDesk simulation."""
    sub_id = f"live-email-{uuid.uuid4().hex[:12]}"
    sub = {
        "id": sub_id,
        "type": "email",
        "env_id": "supportdesk",
        "submitted_at": datetime.utcnow().isoformat(),
        "status": "pending",
        "data": {
            "ticket": {
                "id": f"EML-{sub_id[-6:].upper()}",
                "subject": payload.subject,
                "body": payload.body,
                "created_at": (payload.received_at or datetime.utcnow().isoformat()),
                "status": "open",
                "category": "general",
                "priority": "P2",
                "source": "email",
            },
            "customer": {
                "name": payload.sender_name,
                "email": payload.sender_email,
                "tier": "standard",
                "account_age_days": 0,
                "order_history": [],
            },
        },
    }
    _save_submission(sub)
    return LiveSubmission(**sub)


@router.get("/submissions", response_model=list[LiveSubmission])
def list_submissions(type: Optional[str] = None, limit: int = 50):
    """List all live submissions (optionally filtered by type)."""
    subs = _list_submissions(type_filter=type)
    return [LiveSubmission(**s) for s in subs[:limit]]


@router.get("/submissions/{sub_id}", response_model=LiveSubmission)
def get_submission(sub_id: str):
    """Fetch a specific live submission."""
    sub = _get_submission(sub_id)
    if not sub:
        raise HTTPException(status_code=404, detail=f"Submission '{sub_id}' not found")
    return LiveSubmission(**sub)


@router.delete("/submissions/{sub_id}")
def delete_submission(sub_id: str):
    """Delete a live submission."""
    path = LIVE_DATA_DIR / f"{sub_id}.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Submission not found")
    path.unlink()
    return {"deleted": sub_id}


@router.get("/stats")
def live_stats():
    """Summary statistics for live data."""
    subs = _list_submissions()
    by_type: dict[str, int] = {}
    by_env: dict[str, int] = {}
    for s in subs:
        t = s.get("type", "unknown")
        e = s.get("env_id", "unknown")
        by_type[t] = by_type.get(t, 0) + 1
        by_env[e] = by_env.get(e, 0) + 1
    return {
        "total": len(subs),
        "by_type": by_type,
        "by_env": by_env,
    }
