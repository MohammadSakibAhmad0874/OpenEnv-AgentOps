"""
OpenEnv AgentOps — Reward Engine
Reusable grading utilities used across environments.
"""

from __future__ import annotations

from typing import Any


def compute_grade(percentage: float) -> str:
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


def clamp(value: float, min_val: float = 0.0, max_val: float = 100.0) -> float:
    return max(min_val, min(max_val, value))


def keyword_match_score(text: str, keywords: list[str], max_score: float = 10.0) -> float:
    """Score based on how many keywords appear in a free-text field."""
    if not text or not keywords:
        return 0.0
    text_lower = text.lower()
    matched = sum(1 for kw in keywords if kw.lower() in text_lower)
    return round((matched / len(keywords)) * max_score, 2)


def sla_score(remaining_minutes: float, sla_minutes: float, max_score: float = 20.0) -> float:
    """
    Full score if resolved with time remaining.
    Partial score if slightly over.
    Zero if very late.
    """
    if remaining_minutes >= 0:
        # On time — scale bonus by how early
        ratio = min(remaining_minutes / sla_minutes, 1.0)
        return round(max_score * (0.7 + 0.3 * ratio), 2)
    else:
        # Overtime — decay penalty
        over_ratio = abs(remaining_minutes) / sla_minutes
        score = max_score * max(0.0, 1.0 - over_ratio * 2)
        return round(score, 2)


def penalty_for_repeats(action_log: list[dict], action_type: str, max_allowed: int = 2) -> float:
    """Apply -2 penalty per repeat beyond max_allowed."""
    count = sum(1 for a in action_log if a.get("action_type") == action_type)
    excess = max(0, count - max_allowed)
    return -2.0 * excess


def safe_get(d: dict[str, Any], *keys: str, default: Any = None) -> Any:
    """Safely traverse nested dicts."""
    current = d
    for key in keys:
        if not isinstance(current, dict):
            return default
        current = current.get(key, default)
    return current
