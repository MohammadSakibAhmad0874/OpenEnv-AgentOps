#!/usr/bin/env python3
"""
OpenEnv AgentOps — Baseline Agent

A deterministic rule-based agent that runs across all environments
and produces reproducible evaluation results.

Usage:
    python baseline_agent.py                          # run all envs
    python baseline_agent.py --env supportdesk        # single env
    python baseline_agent.py --env supportdesk --scenario SD-001
    python baseline_agent.py --verbose                # detailed logs
    python baseline_agent.py --trials 3               # multiple runs per env

Output example:
    ══════════════════════════════════════════════════
     OpenEnv AgentOps — Baseline Agent Results
    ══════════════════════════════════════════════════
     SupportDesk  │ Score:  72.5 / 100  │ Grade: B
     CyberSOC     │ Score:  58.0 / 100  │ Grade: C
     RefundOps    │ Score:  81.0 / 100  │ Grade: A
     ClinicOps    │ Score:  65.5 / 100  │ Grade: C
    ──────────────────────────────────────────────────
     Overall Avg  │ Score:  69.3 / 100  │
    ══════════════════════════════════════════════════
"""

from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path

# Ensure the backend directory is on sys.path
BACKEND_DIR = Path(__file__).parent
sys.path.insert(0, str(BACKEND_DIR))

from core.models import Action  # noqa: E402
from environments.registry import get_env_class, ENV_META  # noqa: E402

# ---------------------------------------------------------------------------
# Rule-based strategies per environment
# ---------------------------------------------------------------------------

def _supportdesk_strategy(obs: dict) -> Action | None:
    """Deterministic SupportDesk agent."""
    ticket = obs.get("ticket", {})
    status = obs.get("status", "open")
    step = obs.get("step_count", 0)

    # Step 0: always classify first
    if not ticket.get("category") or ticket.get("status") == "open":
        return Action(
            type="classify",
            parameters={"category": "billing", "priority": "P2"},
        )

    # Step 1: ask one clarifying question
    conversation = obs.get("conversation", [])
    agent_turns = [m for m in conversation if m.get("role") == "agent"]
    if len(agent_turns) == 0:
        return Action(
            type="ask_question",
            parameters={"question": "Can you please provide your order ID and describe the issue in detail?"},
        )

    # Step 2+: resolve
    return Action(
        type="resolve",
        parameters={"resolution_note": "Account access reset. Billing discrepancy investigated and corrected. Refund processed if applicable."},
    )


def _cybersoc_strategy(obs: dict) -> Action | None:
    """Deterministic CyberSOC agent."""
    alerts = obs.get("alerts", [])
    processed = obs.get("processed_alert_ids", [])

    for alert in alerts:
        aid = alert.get("alert_id", "")
        if aid not in processed:
            severity = alert.get("severity", "low")
            if severity in ("critical", "high"):
                return Action(
                    type="classify_alert",
                    parameters={"alert_id": aid, "severity": severity},
                )
            else:
                return Action(
                    type="dismiss",
                    parameters={
                        "alert_id": aid,
                        "reason": "Low severity — confirmed benign after pattern analysis.",
                    },
                )
    return None  # done


def _refundops_strategy(obs: dict) -> Action | None:
    """Deterministic RefundOps agent."""
    requests = obs.get("refund_requests", [])
    processed = obs.get("processed_ids", [])

    for req in requests:
        rid = req.get("id", "")
        if rid not in processed:
            days = req.get("days_since_purchase", 999)
            reason = req.get("reason", "").lower()
            has_evidence = req.get("has_evidence", False)

            if days <= 30 and has_evidence:
                return Action(
                    type="approve",
                    parameters={"note": "Within 30-day window with valid evidence. Approved."},
                )
            elif days > 60:
                return Action(
                    type="deny",
                    parameters={"reason": "Request is outside the 60-day return policy window."},
                )
            else:
                return Action(
                    type="request_info",
                    parameters={"info_needed": "Please provide proof of purchase and photos of the item defect."},
                )
    return None  # done


def _clinicops_strategy(obs: dict) -> Action | None:
    """Deterministic ClinicOps agent."""
    patients = obs.get("patients", [])
    processed = obs.get("scheduled_patient_ids", [])
    slots = obs.get("available_slots", [])

    # First: triage unprocessed patients
    for patient in patients:
        pid = patient.get("patient_id", "")
        if pid not in processed and not patient.get("urgency_level"):
            return Action(
                type="triage",
                parameters={
                    "patient_id": pid,
                    "urgency_level": 7 if "chest" in str(patient.get("symptoms", "")).lower() else 4,
                },
            )

    # Then: schedule triaged patients
    for patient in sorted(patients, key=lambda p: -p.get("urgency_level", 0)):
        pid = patient.get("patient_id", "")
        if pid not in processed and slots:
            slot = slots[0]
            return Action(
                type="schedule",
                parameters={"patient_id": pid, "slot_id": slot.get("slot_id", "SLOT-001")},
            )
    return None  # done


STRATEGY_MAP = {
    "supportdesk": _supportdesk_strategy,
    "cybersoc": _cybersoc_strategy,
    "refundops": _refundops_strategy,
    "clinicops": _clinicops_strategy,
}


# ---------------------------------------------------------------------------
# Agent runner
# ---------------------------------------------------------------------------

def run_episode(
    env_id: str,
    scenario_id: str | None = None,
    verbose: bool = False,
) -> tuple[float, str, int, int]:
    """
    Run one episode and return (score, grade, steps, invalid_actions).
    """
    env_class = get_env_class(env_id)
    env = env_class(session_id=None, scenario_id=scenario_id)

    obs = env.reset()
    strategy = STRATEGY_MAP[env_id]
    step = 0
    max_steps = env.max_steps

    if verbose:
        print(f"\n  [RESET] {env_id} | session={env.session_id[:12]}…")

    for step in range(max_steps):
        action = strategy(obs)
        if action is None:
            if verbose:
                print(f"  [step {step+1}] Agent signalled done — no more actions.")
            break

        result = env.step(action)
        obs = result.observation

        if verbose:
            sign = "+" if result.reward.value >= 0 else ""
            print(
                f"  [step {step+1}] {action.type:<18} "
                f"reward={sign}{result.reward.value:.1f}  "
                f"| {result.reward.explanation[:70]}"
            )

        if result.done:
            break

    scorecard = env.score()
    return scorecard.total, scorecard.grade, scorecard.steps_taken, scorecard.invalid_actions


def main() -> None:
    parser = argparse.ArgumentParser(
        description="OpenEnv AgentOps — Baseline Agent Evaluator"
    )
    parser.add_argument(
        "--env",
        choices=["supportdesk", "cybersoc", "refundops", "clinicops", "all"],
        default="all",
        help="Environment to evaluate (default: all)",
    )
    parser.add_argument("--scenario", default=None, help="Specific scenario ID")
    parser.add_argument("--trials", type=int, default=1, help="Trials per environment")
    parser.add_argument("--verbose", action="store_true", help="Detailed step logs")
    args = parser.parse_args()

    env_ids = (
        [m.id for m in ENV_META]
        if args.env == "all"
        else [args.env]
    )

    results: dict[str, list[float]] = {}
    grades: dict[str, str] = {}

    print("\n" + "═" * 54)
    print(" OpenEnv AgentOps — Baseline Agent")
    print(" Running deterministic policy across all environments")
    print("═" * 54)

    for env_id in env_ids:
        scores_for_env = []
        last_grade = "?"
        for trial in range(args.trials):
            if args.trials > 1 and args.verbose:
                print(f"\n── {env_id} trial {trial+1}/{args.trials} ──")
            score, grade, steps, invalid = run_episode(
                env_id, scenario_id=args.scenario, verbose=args.verbose
            )
            scores_for_env.append(score)
            last_grade = grade
            if args.trials > 1:
                print(f"  Trial {trial+1}: {score:.1f}/100  Grade={grade}  Steps={steps}  Invalid={invalid}")

        avg = sum(scores_for_env) / len(scores_for_env)
        results[env_id] = scores_for_env
        grades[env_id] = last_grade

    # ── Summary table ──────────────────────────────────────────────────────
    print("\n" + "═" * 54)
    print(" FINAL RESULTS")
    print("─" * 54)

    all_scores = []
    env_names = {m.id: m.name for m in ENV_META}

    for env_id, scores in results.items():
        avg = sum(scores) / len(scores)
        all_scores.append(avg)
        name = env_names.get(env_id, env_id)
        grade = grades[env_id]
        bar_len = int(avg / 5)
        bar = "█" * bar_len + "░" * (20 - bar_len)
        print(f" {name:<14} │ Score: {avg:5.1f}/100 │ Grade: {grade}  [{bar}]")

    overall = sum(all_scores) / len(all_scores) if all_scores else 0.0
    print("─" * 54)
    print(f" {'Overall Avg':<14} │ Score: {overall:5.1f}/100  │")
    print("═" * 54)
    print(f"\n Final Score: {overall:.1f}/100\n")


if __name__ == "__main__":
    main()
