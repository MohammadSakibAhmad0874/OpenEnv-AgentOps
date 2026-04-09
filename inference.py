import os
import json
import urllib.request
import urllib.error
import urllib.parse

API_BASE_URL = os.getenv("API_BASE_URL", "https://skillsinventor-openenv-agentops.hf.space")
MODEL_NAME = os.getenv("MODEL_NAME", "baseline")
HF_TOKEN = os.getenv("HF_TOKEN")


def _post_json(url: str, payload: dict, timeout: int = 30) -> dict:
    """Send a JSON POST request using only stdlib."""
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _get_json(url: str, params: dict | None = None, timeout: int = 30) -> dict:
    """Send a GET request using only stdlib."""
    if params:
        url = f"{url}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    # ── Step 1: Reset the environment ────────────────────────────────────
    try:
        reset_data = _post_json(
            f"{API_BASE_URL}/reset",
            {"env_id": "supportdesk", "scenario_id": None},
        )
        print("RESET RESPONSE:")
        print(reset_data)
    except Exception as exc:
        print(f"[ERROR] Failed to reset environment: {exc}")
        return

    session_id = reset_data.get("session_id")
    if not session_id:
        print("[ERROR] No session_id in reset response")
        return

    # ── Step 2: Send an action ───────────────────────────────────────────
    try:
        step_data = _post_json(
            f"{API_BASE_URL}/step",
            {
                "session_id": session_id,
                "action": {
                    "type": "classify",
                    "parameters": {
                        "category": "billing",
                        "priority": "P1",
                    },
                },
            },
        )
        print("STEP RESPONSE:")
        print(step_data)
    except Exception as exc:
        print(f"[ERROR] Step request failed: {exc}")
        return

    # ── Step 3: Get current state ────────────────────────────────────────
    try:
        state_data = _get_json(
            f"{API_BASE_URL}/state",
            params={"session_id": session_id},
        )
        print("STATE RESPONSE:")
        print(state_data)
    except Exception as exc:
        print(f"[ERROR] State request failed: {exc}")
        return


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"[FATAL] Unhandled exception: {exc}")
        import traceback
        traceback.print_exc()