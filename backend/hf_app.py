"""
Hugging Face Spaces — Gradio App Wrapper for OpenEnv AgentOps
Wraps the FastAPI backend as a Gradio interface for HF deployment.

Deploy: Push to HF Spaces as a "Gradio" space with Python runtime.
requirements.txt must include: fastapi, uvicorn, pydantic, gradio
"""

import threading
import time
import uvicorn
import gradio as gr
import requests
import json

# Start FastAPI in a background thread
def start_backend():
    import sys
    sys.path.insert(0, "/app")
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=7861, log_level="warning")

thread = threading.Thread(target=start_backend, daemon=True)
thread.start()
time.sleep(3)  # wait for startup

BASE_URL = "http://localhost:7861"

# ─── Gradio Interface ──────────────────────────────────────────────────────
def list_environments():
    try:
        r = requests.get(f"{BASE_URL}/api/v1/environments/", timeout=5)
        envs = r.json().get("environments", [])
        return "\n".join([f"• {e['name']} ({e['tag']}) — {e['description'][:60]}…" for e in envs])
    except Exception as e:
        return f"Error: {e}"

def reset_environment(env_id: str, scenario_id: str = ""):
    sid = scenario_id.strip() or None
    try:
        r = requests.post(
            f"{BASE_URL}/api/v1/environments/{env_id}/reset",
            json={"scenario_id": sid},
            timeout=10
        )
        data = r.json()
        return json.dumps(data, indent=2)
    except Exception as e:
        return f"Error: {e}"

def run_baseline():
    try:
        import subprocess, sys
        result = subprocess.run(
            [sys.executable, "baseline_agent.py", "--verbose"],
            capture_output=True, text=True, timeout=60,
            cwd="/app"
        )
        return result.stdout + (("\n[STDERR]\n" + result.stderr) if result.stderr else "")
    except Exception as e:
        return f"Error running baseline: {e}"

def submit_ticket(subject: str, body: str, name: str, email: str):
    try:
        r = requests.post(f"{BASE_URL}/api/v1/live/tickets", json={
            "subject": subject, "body": body,
            "customer_name": name, "customer_email": email
        }, timeout=10)
        return json.dumps(r.json(), indent=2)
    except Exception as e:
        return f"Error: {e}"

with gr.Blocks(
    title="OpenEnv AgentOps",
    theme=gr.themes.Base(
        primary_hue="indigo",
        neutral_hue="slate",
    )
) as demo:
    gr.Markdown("""
    # 🤖 OpenEnv AgentOps
    ### Operating System for AI Work Agents
    
    A multi-domain evaluation platform for testing AI agents across realistic business environments.
    API is running on port 7861. Use the tabs below to explore.
    """)

    with gr.Tab("📋 Environments"):
        envs_out = gr.Textbox(label="Available Environments", lines=10)
        gr.Button("List Environments").click(list_environments, outputs=envs_out)

    with gr.Tab("▶ Run Episode"):
        with gr.Row():
            env_dd = gr.Dropdown(
                choices=["supportdesk", "cybersoc", "refundops", "clinicops"],
                label="Environment", value="supportdesk"
            )
            scen_in = gr.Textbox(label="Scenario ID (optional)", placeholder="SD-001")
        reset_out = gr.Code(label="Reset Response", language="json")
        gr.Button("Reset Environment").click(reset_environment, inputs=[env_dd, scen_in], outputs=reset_out)

    with gr.Tab("🧪 Baseline Agent"):
        baseline_out = gr.Textbox(label="Baseline Agent Output", lines=25)
        gr.Button("▶ Run Baseline Agent").click(run_baseline, outputs=baseline_out)

    with gr.Tab("📥 Submit Live Ticket"):
        with gr.Row():
            sub_name = gr.Textbox(label="Customer Name", value="Jane Smith")
            sub_email = gr.Textbox(label="Customer Email", value="jane@example.com")
        sub_subject = gr.Textbox(label="Subject", value="My order never arrived")
        sub_body = gr.Textbox(label="Ticket Body", lines=5,
            value="I placed order #12345 two weeks ago and it has not been delivered. Please help.")
        submit_out = gr.Code(label="Submission Response", language="json")
        gr.Button("Submit Ticket").click(
            submit_ticket, inputs=[sub_subject, sub_body, sub_name, sub_email], outputs=submit_out
        )

    with gr.Tab("📡 API"):
        gr.Markdown("""
        ### REST API
        Full Swagger docs available at `/docs`
        
        **Key Endpoints:**
        - `GET /api/v1/environments/` — List environments
        - `POST /api/v1/environments/{env_id}/reset` — Start episode
        - `POST /api/v1/environments/{env_id}/step` — Execute action
        - `GET /api/v1/environments/{env_id}/score` — Get scorecard
        - `POST /api/v1/live/tickets` — Submit real ticket
        - `GET /api/v1/sessions/` — List all sessions
        """)

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860, share=False)
