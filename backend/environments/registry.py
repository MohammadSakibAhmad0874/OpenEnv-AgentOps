"""
Environment registry — maps env_id strings to their classes.
"""

from environments.supportdesk.env import SupportDeskEnv
from environments.cybersoc.env import CyberSOCEnv
from environments.refundops.env import RefundOpsEnv
from environments.clinicops.env import ClinicOpsEnv
from core.models import EnvironmentMeta
from core.storage import get_scenario_count

REGISTRY: dict = {
    "supportdesk": SupportDeskEnv,
    "cybersoc": CyberSOCEnv,
    "refundops": RefundOpsEnv,
    "clinicops": ClinicOpsEnv,
}

ENV_META: list[EnvironmentMeta] = [
    EnvironmentMeta(
        id="supportdesk",
        name="SupportDesk",
        description="Customer support ticket resolution with SLA timers, conversation history, and knowledge base.",
        icon="headset",
        color="#6366F1",
        tag="Hero Module",
        actions=["classify", "ask_question", "resolve", "refund", "escalate"],
        max_steps=15,
        max_score=100.0,
        scenario_count=5,
        status="active",
        category="Customer Operations",
    ),
    EnvironmentMeta(
        id="cybersoc",
        name="CyberSOC",
        description="Security operations — classify and respond to live alerts across a production network.",
        icon="shield",
        color="#EF4444",
        tag="Security",
        actions=["classify_alert", "escalate", "dismiss", "block_ip"],
        max_steps=20,
        max_score=100.0,
        scenario_count=1,
        status="active",
        category="Security Operations",
    ),
    EnvironmentMeta(
        id="refundops",
        name="RefundOps",
        description="Policy-based refund adjudication — approve, deny, or request more information.",
        icon="receipt",
        color="#F59E0B",
        tag="Finance",
        actions=["approve", "deny", "request_info"],
        max_steps=10,
        max_score=100.0,
        scenario_count=3,
        status="active",
        category="Finance & Compliance",
    ),
    EnvironmentMeta(
        id="clinicops",
        name="ClinicOps",
        description="Clinic scheduling — triage patients by urgency and assign optimal appointment slots.",
        icon="stethoscope",
        color="#10B981",
        tag="Healthcare",
        actions=["triage", "schedule", "reschedule", "cancel"],
        max_steps=15,
        max_score=100.0,
        scenario_count=1,
        status="active",
        category="Healthcare",
    ),
]


def get_env_class(env_id: str):
    cls = REGISTRY.get(env_id)
    if cls is None:
        raise ValueError(f"Unknown environment: '{env_id}'")
    return cls


def get_env_meta(env_id: str) -> EnvironmentMeta:
    for m in ENV_META:
        if m.id == env_id:
            return m
    raise ValueError(f"No metadata for environment: '{env_id}'")
