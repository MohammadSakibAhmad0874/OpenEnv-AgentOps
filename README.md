---
title: OpenEnv AgentOps
emoji: 🤖
colorFrom: indigo
colorTo: purple
sdk: docker
app_port: 8000
pinned: false
---
# OpenEnv AgentOps

<div align="center">

![OpenEnv AgentOps](https://img.shields.io/badge/OpenEnv-AgentOps-6366F1?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iNyIgaGVpZ2h0PSI3IiByeD0iMS41IiBmaWxsPSJ3aGl0ZSIvPjxyZWN0IHg9IjE0IiB5PSIzIiB3aWR0aD0iNyIgaGVpZ2h0PSI3IiByeD0iMS41IiBmaWxsPSJ3aGl0ZSIvPjxyZWN0IHg9IjMiIHk9IjE0IiB3aWR0aD0iNyIgaGVpZ2h0PSI3IiByeD0iMS41IiBmaWxsPSJ3aGl0ZSIvPjxyZWN0IHg9IjE0IiB5PSIxNCIgd2lkdGg9IjciIGhlaWdodD0iNyIgcng9IjEuNSIgZmlsbD0id2hpdGUiLz48L3N2Zz4=)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**The Operating System for AI Work Agents**

*A multi-domain evaluation platform for testing AI agents across realistic business environments — with deterministic grading, reward shaping, and real-world simulation.*

[Live Demo](http://localhost:3000) · [API Docs](http://localhost:8000/docs) · [OpenEnv Spec](./openenv.yaml)

</div>

---

## Overview

OpenEnv AgentOps is a **production-grade, full-stack SaaS platform** for evaluating AI agents across realistic business workflows. Unlike toy environments, every simulation here mirrors a real operational task — classifying support tickets, triaging security alerts, adjudicating refund requests, and scheduling clinic appointments.

> "An internal tool used by companies to test and evaluate AI agents before deployment."

### Why OpenEnv AgentOps?

| Traditional Eval | OpenEnv AgentOps |
|---|---|
| One-off scripts | Multi-environment platform |
| Toy benchmarks | Real business workflows |
| Binary pass/fail | Partial progress rewards |
| No UI | Premium dashboard |
| No live data | Real user submissions |

---

## Features

- 🌍 **Multi-domain simulation** — 4 independent environments, same agent interface
- 🎯 **Deterministic grading** — reproducible scores from 0.0 → 100.0
- 🏆 **Partial progress rewards** — agents earn credit for each correct sub-step
- ⚡ **Real-time evaluation** — run episodes live in the browser
- 🔄 **Replay system** — step-by-step action log review
- 📊 **Agent Scorecard** — cross-environment performance dashboard
- 📥 **Live data ingestion** — submit real tickets/alerts/emails via API or UI
- 🔀 **Demo / Live mode** — toggle between sample and real user data
- 🐳 **Docker ready** — single-command deployment
- 🤗 **HuggingFace deployable** — Gradio wrapper included

---

## Environments

### 🎧 SupportDesk (Hero Module) — `difficulty: medium`

Customer support ticket resolution. The agent receives a customer ticket with full context (conversation history, order history, SLA timer, knowledge base) and must:

1. **Classify** the ticket (category + priority)
2. **Gather information** (ask targeted questions)
3. **Resolve** appropriately (resolve / refund / escalate)

**Reward drivers:** correct classification (+20), resolution quality (+35), SLA adherence (+20), knowledge base usage (+5)

**Penalties:** wrong resolution type (-10), unsafe action (-20), repeated questions (-2)

---

### 🛡️ CyberSOC — `difficulty: hard`

Security Operations Center alert triage. The agent processes a queue of network security alerts and must classify, dismiss, escalate, or block IPs — distinguishing true positives from false positives.

**Reward drivers:** correct severity classification (+20), appropriate escalation (+25), blocking malicious IPs (+30)

**Penalties:** escalating false positives (-15), dismissing real threats (-20)

---

### 🧾 RefundOps — `difficulty: easy`

Policy-based refund adjudication. The agent reviews customer return requests against business rules (time window, evidence, amount) and approves, denies, or requests more information.

**Reward drivers:** correct approval/denial (+40), staying within policy (+10)

**Penalties:** approving ineligible requests (-20), denying valid requests (-15)

---

### 🏥 ClinicOps — `difficulty: medium`

Clinic scheduling system. The agent must triage patients by urgency level and schedule them into optimal appointment slots — higher urgency patients get earlier times.

**Reward drivers:** correct urgency assessment (+20), optimal slot assignment (+25)

**Penalties:** wrong triage (-10), scheduling low-urgency before critical (-15)

---

## OpenEnv Spec

All environments implement the `BaseEnvironment` interface defined in `openenv.yaml`:

### Observation Space

Each environment returns a structured observation dict on every step. The observation contains all information the agent needs (no hidden state):

```python
# SupportDesk example
{
  "ticket": {"subject": "...", "body": "...", "priority": "P1", ...},
  "customer": {"name": "...", "order_history": [...], ...},
  "conversation": [{"role": "agent", "content": "..."}, ...],
  "sla_remaining_minutes": 28.5,
  "knowledge_base": [...],
  "step_count": 2
}
```

### Action Space

Each action is a typed object with a name and parameters:

```python
from core.models import Action

action = Action(
    type="classify",
    parameters={"category": "billing", "priority": "P1"}
)
```

Available action types per environment:
- **SupportDesk:** `classify`, `ask_question`, `resolve`, `refund`, `escalate`
- **CyberSOC:** `classify_alert`, `escalate`, `dismiss`, `block_ip`
- **RefundOps:** `approve`, `deny`, `request_info`
- **ClinicOps:** `triage`, `schedule`, `reschedule`, `cancel`

### Reward System

```
reward ∈ [-20, +100]     (normalized 0–100 for scoring)
```

All rewards are **deterministic** — the same action in the same state always yields the same reward. Partial progress is rewarded at each substep.

**Grading:**
| Grade | Score |
|---|---|
| A+ | ≥ 95 |
| A  | ≥ 85 |
| B  | ≥ 75 |
| C  | ≥ 65 |
| D  | ≥ 50 |
| F  | < 50 |

---

## Installation

### Prerequisites

- Python 3.11+
- Node.js 20+ / pnpm 8+

### Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # Unix/Mac

pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd frontend
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Running Locally

1. Start the backend: `cd backend && uvicorn main:app --reload`
2. Start the frontend: `cd frontend && pnpm dev`
3. Visit `http://localhost:3000`
4. Navigate to an environment (e.g., SupportDesk)
5. Click **Start** to create a session
6. Execute actions using the Console panel
7. View your scorecard in Evaluations

---

## Docker Setup

### Build & Run

```bash
# Build
docker build -t openenv-agentops .

# Run (backend only)
docker run -p 8000:8000 openenv-agentops

# With environment variables
docker run -p 8000:8000 \
  -e PORT=8000 \
  openenv-agentops
```

### Docker Compose (recommended)

```yaml
version: '3.9'
services:
  backend:
    build: .
    ports: ["8000:8000"]
    volumes: ["./backend/data:/app/data"]
    environment:
      - PORT=8000

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.frontend
    ports: ["3000:3000"]
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on: [backend]
```

---

## Hugging Face Deployment

1. Create a new HuggingFace Space (Gradio · Python)
2. Upload the `backend/` folder contents
3. Add `hf_app.py` as the main entrypoint
4. Set `app_file: hf_app.py` in README frontmatter

```yaml
---
title: OpenEnv AgentOps
emoji: 🤖
colorFrom: indigo
colorTo: purple
sdk: gradio
sdk_version: "4.0"
app_file: hf_app.py
pinned: false
---
```

5. Install requirements: `requirements.txt` must include `gradio>=4.0`

---

## Example Usage

### Python (direct)

```python
import sys
sys.path.insert(0, "backend")

from environments.supportdesk.env import SupportDeskEnv
from core.models import Action

env = SupportDeskEnv()
obs = env.reset()

print(obs["ticket"]["subject"])
# "I was charged twice for my subscription"

result = env.step(Action(
    type="classify",
    parameters={"category": "billing", "priority": "P1"}
))
print(result.reward.value)        # 20.0
print(result.reward.explanation)  # "✓ Correct category 'billing'. ✓ Correct priority P1."

result = env.step(Action(
    type="resolve",
    parameters={"resolution_note": "Duplicate charge identified. Initiated full refund to the original payment method."}
))
print(result.done)        # True
print(env.score().grade)  # "A"
```

### REST API

```bash
# Reset environment
curl -X POST http://localhost:8000/api/v1/environments/supportdesk/reset \
  -H "Content-Type: application/json" \
  -d '{"scenario_id": null}'

# Execute action
curl -X POST http://localhost:8000/api/v1/environments/supportdesk/step \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "YOUR_SESSION_ID",
    "action": {
      "type": "classify",
      "parameters": {"category": "billing", "priority": "P1"}
    }
  }'

# Get scorecard
curl "http://localhost:8000/api/v1/environments/supportdesk/score?session_id=YOUR_SESSION_ID"
```

### Submit Live Data

```bash
# Submit a real customer ticket
curl -X POST http://localhost:8000/api/v1/live/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "My order never arrived",
    "body": "I ordered #12345 two weeks ago and it has not arrived.",
    "customer_name": "Jane Smith",
    "customer_email": "jane@example.com",
    "priority_hint": "P2"
  }'
```

---

## Baseline Agent

A deterministic rule-based agent is included for reproducible benchmarks:

```bash
cd backend

# Run across all environments
python baseline_agent.py

# Single environment with verbose output
python baseline_agent.py --env supportdesk --verbose

# Multiple trials for statistical robustness
python baseline_agent.py --trials 5
```

---

## Results / Scoring

### Baseline Agent Performance

| Environment | Score | Grade | Strategy |
|---|---|---|---|
| SupportDesk | ~72/100 | B | Classify → Ask → Resolve |
| CyberSOC | ~58/100 | C | Classify by severity |
| RefundOps | ~81/100 | A | Policy-window check |
| ClinicOps | ~65/100 | C | Urgency-first |
| **Overall** | **~69/100** | **C+** | — |

*Scores vary by scenario since scenarios are randomly selected. Human baseline: ~90/100.*

### Agent Scorecard Fields

```json
{
  "session_id": "abc123...",
  "env_id": "supportdesk",
  "total": 72.5,
  "max_possible": 100.0,
  "percentage": 72.5,
  "grade": "B",
  "steps_taken": 4,
  "invalid_actions": 0,
  "breakdown": {
    "classified": 10.0,
    "correct_category": 10.0,
    "correct_priority": 5.0,
    "resolution_quality": 18.0,
    "sla_adherence": 15.0,
    "correct_resolution": 15.0
  },
  "completed": true
}
```

---

## Architecture

```
OpenEnv AgentOps
├── backend/              FastAPI (Python 3.11)
│   ├── main.py           App entry point + CORS
│   ├── core/
│   │   ├── base_env.py   BaseEnvironment (reset/step/state/score)
│   │   ├── models.py     Pydantic typed models
│   │   ├── reward_engine.py  Reward helpers
│   │   └── storage.py    JSON file persistence
│   ├── environments/
│   │   ├── supportdesk/  Hero environment (5 scenarios)
│   │   ├── cybersoc/     Security ops
│   │   ├── refundops/    Refund processing
│   │   └── clinicops/    Healthcare scheduling
│   ├── api/endpoints/
│   │   ├── environments.py  Reset/step/score/state
│   │   ├── sessions.py      Session history + replay
│   │   ├── live_data.py     Real data ingestion
│   │   └── settings.py      Platform config
│   ├── baseline_agent.py  Deterministic evaluation script
│   └── hf_app.py          HuggingFace Spaces wrapper
│
├── frontend/             Next.js 16 (App Router)
│   └── src/
│       ├── app/
│       │   ├── page.tsx             Dashboard
│       │   ├── environments/        Environment list + detail
│       │   ├── agents/              Agent registry
│       │   ├── evaluations/         Scorecard + replay
│       │   ├── live/                Live data ingestion
│       │   └── settings/            Platform settings
│       ├── components/
│       │   ├── layout/              Sidebar, TopBar
│       │   ├── dashboard/           MetricCard
│       │   ├── environments/        ActionConsole, EnvironmentCard
│       │   └── kanban/              KanbanBoard
│       ├── stores/agentStore.ts     Zustand state
│       └── lib/api.ts               Typed API client
│
├── openenv.yaml          Full OpenEnv spec manifest
├── Dockerfile            Production container
└── README.md             This file
```

---

## Future Work

- [ ] PostgreSQL backend for production-scale storage
- [ ] Multi-agent comparison (run two agents on same scenario)
- [ ] LLM agent integration (OpenAI / Claude function calling)
- [ ] Leaderboard with public submissions
- [ ] WebSocket streaming for real-time agent visualization
- [ ] More environments: HR screening, financial compliance, content moderation
- [ ] A/B testing framework for prompt engineering
- [ ] CI/CD pipeline with automated evaluation on PR

---

## Developer : TEAM ANTI-GRAVITY


## License

MIT © 2024 OpenEnv AgentOps Contributors

---

<div align="center">
Built with ❤️ as an open-source AI agent evaluation platform.
</div>
