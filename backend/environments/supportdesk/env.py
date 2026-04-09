"""
SupportDesk Environment — HERO MODULE
Simulates a customer support workflow: classify → investigate → resolve.
"""

from __future__ import annotations

import copy
from datetime import datetime, timezone
from typing import Any, Optional

from core.base_env import BaseEnvironment
from core.models import Action, Reward, ScoreCard, StepResult
from core.reward_engine import compute_grade, keyword_match_score, sla_score
from core.storage import load_scenario, save_session


VALID_ACTIONS = {"classify", "ask_question", "resolve", "refund", "escalate"}
VALID_CATEGORIES = {"account", "billing", "shipping", "technical", "general"}
VALID_PRIORITIES = {"P1", "P2", "P3"}


class SupportDeskEnv(BaseEnvironment):
    env_id = "supportdesk"
    max_steps = 15
    max_score = 100.0

    def reset(self) -> dict[str, Any]:
        scenario = load_scenario(self.env_id, self.scenario_id)
        self.scenario_id = scenario["id"]
        self._scenario = scenario

        # Internal grading flags (prefixed _ so they are stripped from state())
        self._classified = False
        self._correct_category = False
        self._correct_priority = False
        self._resolution_taken = False
        self._correct_resolution = False
        self._kb_consulted = False
        self._unsafe_action_taken = False
        self._sla_minutes = scenario["sla_minutes"]
        self._start_time = datetime.now(timezone.utc)

        # Public state
        self._state = {
            "ticket": copy.deepcopy(scenario["ticket"]),
            "customer": copy.deepcopy(scenario["customer"]),
            "conversation": [],
            "sla_remaining_minutes": scenario["sla_minutes"],
            "knowledge_base": self._get_kb(scenario),
            "available_actions": list(VALID_ACTIONS),
            "step_count": 0,
            "status": "open",
        }

        self._action_log = []
        self._reward_log = []
        self._total_reward = 0.0
        self._steps = 0
        self._invalid_actions = 0
        self._done = False

        save_session(self._build_session_dict())
        return self.state()

    # ------------------------------------------------------------------
    # step()
    # ------------------------------------------------------------------

    def step(self, action: Action) -> StepResult:
        if self._done:
            return self._invalid_action("Episode already terminated. Call /reset to start a new session.")

        if self._steps >= self.max_steps:
            return self._terminal_result(-5.0, "Max steps exceeded", {"penalty": -5.0})

        self._steps += 1
        self._state["step_count"] = self._steps
        self._update_sla()

        if action.type not in VALID_ACTIONS:
            result = self._invalid_action(
                f"Unknown action '{action.type}'. Valid: {', '.join(VALID_ACTIONS)}"
            )
            self._log_action(action, result)
            save_session(self._build_session_dict())
            return result

        handler = getattr(self, f"_action_{action.type}")
        result = handler(action)

        self._log_action(action, result)
        save_session(self._build_session_dict())
        return result

    # ------------------------------------------------------------------
    # Action handlers
    # ------------------------------------------------------------------

    def _action_classify(self, action: Action) -> StepResult:
        category = action.parameters.get("category", "").lower()
        priority = action.parameters.get("priority", "").upper()

        if category not in VALID_CATEGORIES:
            return self._invalid_action(
                f"Invalid category '{category}'. Valid: {', '.join(VALID_CATEGORIES)}"
            )
        if priority not in VALID_PRIORITIES:
            return self._invalid_action(
                f"Invalid priority '{priority}'. Valid: P1, P2, P3"
            )

        if self._classified:
            # Reclassifying — small penalty
            reward_val = -2.0
            explanation = "Ticket already classified — reclassification incurs a small penalty."
            breakdown = {"reclassify_penalty": -2.0}
        else:
            self._classified = True
            reward_val = 10.0
            breakdown: dict[str, float] = {"classified": 10.0}
            explanation = "Ticket classified."

            correct = self._scenario["correct_classification"]
            if category == correct["category"]:
                self._correct_category = True
                reward_val += 10.0
                breakdown["correct_category"] = 10.0
                explanation += f" ✓ Correct category '{category}'."
            else:
                explanation += f" ✗ Wrong category '{category}' (expected '{correct['category']}')."

            if priority == correct["priority"]:
                self._correct_priority = True
                reward_val += 5.0
                breakdown["correct_priority"] = 5.0
                explanation += f" ✓ Correct priority {priority}."
            else:
                explanation += f" ✗ Wrong priority {priority} (expected '{correct['priority']}')."

        self._state["ticket"]["category"] = category
        self._state["ticket"]["priority"] = priority
        self._state["ticket"]["status"] = "classified"
        self._state["status"] = "in_progress"

        reward = Reward(value=reward_val, explanation=explanation, breakdown=breakdown)
        return StepResult(observation=self.state(), reward=reward, done=False)

    def _action_ask_question(self, action: Action) -> StepResult:
        question = action.parameters.get("question", "").strip()
        if not question:
            return self._invalid_action("ask_question requires a 'question' parameter.")

        # Check repeat questions
        questions = [
            e["content"]
            for e in self._state["conversation"]
            if e.get("role") == "agent"
        ]
        repeat = any(q.lower() == question.lower() for q in questions)

        self._state["conversation"].append(
            {"role": "agent", "content": question, "timestamp": datetime.utcnow().isoformat()}
        )
        # Simulated customer reply
        reply = self._simulate_customer_reply(question)
        self._state["conversation"].append(
            {"role": "customer", "content": reply, "timestamp": datetime.utcnow().isoformat()}
        )

        if repeat:
            reward_val = -2.0
            explanation = "Repeated question penalised."
            breakdown = {"repeat_penalty": -2.0}
        else:
            reward_val = 2.0
            explanation = "Question asked — gathered more context."
            breakdown = {"information_gathering": 2.0}

        reward = Reward(value=reward_val, explanation=explanation, breakdown=breakdown)
        return StepResult(observation=self.state(), reward=reward, done=False)

    def _action_resolve(self, action: Action) -> StepResult:
        note = action.parameters.get("resolution_note", "").strip()
        if not note:
            return self._invalid_action("resolve requires a 'resolution_note' parameter.")

        self._resolution_taken = True
        breakdown: dict[str, float] = {}
        reward_val = 0.0

        # Must classify before resolving (partial credit structure)
        if not self._classified:
            reward_val -= 5.0
            breakdown["no_classification_penalty"] = -5.0
            explanation = "⚠ Resolved without classifying first."
        else:
            explanation = ""

        # Check resolution keywords
        keywords = self._scenario["resolution_keywords"]
        kw_score = keyword_match_score(note, keywords, max_score=20.0)
        reward_val += kw_score
        breakdown["resolution_quality"] = kw_score

        correct_res = self._scenario["correct_resolution"]
        if correct_res == "resolve":
            self._correct_resolution = True
            reward_val += 15.0
            breakdown["correct_action_type"] = 15.0
            explanation += " ✓ Correct resolution action."
        else:
            explanation += f" ✗ This ticket required '{correct_res}', not 'resolve'."

        # SLA bonus
        sla_bonus = sla_score(self._state["sla_remaining_minutes"], self._sla_minutes, 20.0)
        reward_val += sla_bonus
        breakdown["sla_adherence"] = sla_bonus

        # Check unsafe
        unsafe = self._scenario.get("unsafe_actions", {})
        if "resolve" in unsafe:
            reward_val -= 15.0
            breakdown["unsafe_action_penalty"] = -15.0
            self._unsafe_action_taken = True
            explanation += f" ⚠ UNSAFE: {unsafe['resolve']}"

        explanation = (explanation or "Ticket resolved.").strip()
        self._state["ticket"]["status"] = "resolved"
        self._state["status"] = "completed"

        return self._terminal_result(reward_val, explanation, breakdown)

    def _action_refund(self, action: Action) -> StepResult:
        amount = action.parameters.get("amount")
        reason = action.parameters.get("reason", "").strip()

        if amount is None:
            return self._invalid_action("refund requires 'amount' parameter.")
        if not reason:
            return self._invalid_action("refund requires 'reason' parameter.")

        self._resolution_taken = True
        breakdown: dict[str, float] = {}
        reward_val = 0.0

        # Check if classified
        if not self._classified:
            reward_val -= 5.0
            breakdown["no_classification_penalty"] = -5.0

        # Check unsafe
        unsafe = self._scenario.get("unsafe_actions", {})
        if "refund" in unsafe:
            reward_val -= 20.0
            breakdown["unsafe_refund_penalty"] = -20.0
            self._unsafe_action_taken = True
            explanation = f"⚠ UNSAFE REFUND: {unsafe['refund']}"
        else:
            correct_res = self._scenario["correct_resolution"]
            if correct_res == "refund":
                self._correct_resolution = True
                # Check amount accuracy
                orders = self._scenario["customer"].get("order_history", [])
                expected_amount = max(o["amount"] for o in orders) if orders else 0
                if abs(float(amount) - expected_amount) <= 1.0:
                    reward_val += 25.0
                    breakdown["correct_amount"] = 25.0
                    explanation = f"✓ Correct refund of ${amount}."
                else:
                    reward_val += 10.0
                    breakdown["partial_amount_credit"] = 10.0
                    explanation = f"Refund issued for ${amount} (expected ~${expected_amount})."

                # Keyword check on reason
                kw = keyword_match_score(reason, self._scenario["resolution_keywords"], 10.0)
                reward_val += kw
                breakdown["reason_quality"] = kw
            else:
                explanation = f"✗ This ticket required '{correct_res}', not 'refund'."

            # SLA
            sla_bonus = sla_score(self._state["sla_remaining_minutes"], self._sla_minutes, 15.0)
            reward_val += sla_bonus
            breakdown["sla_adherence"] = sla_bonus

        self._state["ticket"]["status"] = "resolved"
        self._state["status"] = "completed"
        return self._terminal_result(reward_val, explanation, breakdown)

    def _action_escalate(self, action: Action) -> StepResult:
        team = action.parameters.get("team", "").strip()
        reason = action.parameters.get("reason", "").strip()

        if not team:
            return self._invalid_action("escalate requires 'team' parameter.")
        if not reason:
            return self._invalid_action("escalate requires 'reason' parameter.")

        self._resolution_taken = True
        breakdown: dict[str, float] = {}
        reward_val = 0.0

        if not self._classified:
            reward_val -= 5.0
            breakdown["no_classification_penalty"] = -5.0

        correct_res = self._scenario["correct_resolution"]
        if correct_res == "escalate":
            self._correct_resolution = True
            reward_val += 25.0
            breakdown["correct_escalation"] = 25.0
            kw_score = keyword_match_score(reason, self._scenario["resolution_keywords"], 10.0)
            reward_val += kw_score
            breakdown["reason_quality"] = kw_score
            explanation = f"✓ Correctly escalated to '{team}'."
        else:
            reward_val -= 10.0
            breakdown["wrong_escalation_penalty"] = -10.0
            explanation = f"✗ This ticket didn't require escalation (expected '{correct_res}')."

        sla_bonus = sla_score(self._state["sla_remaining_minutes"], self._sla_minutes, 15.0)
        reward_val += sla_bonus
        breakdown["sla_adherence"] = sla_bonus

        self._state["ticket"]["status"] = "escalated"
        self._state["status"] = "completed"
        return self._terminal_result(reward_val, explanation, breakdown)

    # ------------------------------------------------------------------
    # Scoring
    # ------------------------------------------------------------------

    def score(self) -> ScoreCard:
        total = max(0.0, round(self._total_reward, 2))
        pct = round((total / self.max_score) * 100, 1)
        return ScoreCard(
            session_id=self.session_id,
            env_id=self.env_id,
            scenario_id=self.scenario_id,
            total=total,
            max_possible=self.max_score,
            percentage=pct,
            grade=self._grade(pct),
            steps_taken=self._steps,
            invalid_actions=self._invalid_actions,
            breakdown={
                "classified": 10.0 if self._classified else 0.0,
                "correct_category": 10.0 if self._correct_category else 0.0,
                "correct_priority": 5.0 if self._correct_priority else 0.0,
                "correct_resolution": 25.0 if self._correct_resolution else 0.0,
                "unsafe_penalty": -20.0 if self._unsafe_action_taken else 0.0,
            },
            action_log=self._action_log,
            completed=self._done,
        )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _update_sla(self) -> None:
        elapsed = (datetime.now(timezone.utc) - self._start_time).total_seconds() / 60.0
        self._state["sla_remaining_minutes"] = round(self._sla_minutes - elapsed, 1)

    def _get_kb(self, scenario: dict) -> list[dict]:
        all_kb = load_scenario.__module__  # not used
        import json
        from core.storage import SCENARIOS_DIR

        kb_path = SCENARIOS_DIR / "supportdesk.json"
        with open(kb_path) as f:
            data = json.load(f)
        kb_ids = set(scenario.get("knowledge_base_ids", []))
        return [a for a in data.get("knowledge_base", []) if a["id"] in kb_ids]

    def _simulate_customer_reply(self, question: str) -> str:
        q = question.lower()
        customer_name = self._scenario["customer"]["name"].split()[0]
        if "order" in q or "purchase" in q:
            orders = self._scenario["customer"]["order_history"]
            return f"My most recent order is {orders[0]['order_id']} from {orders[0]['date']}."
        if "email" in q or "account" in q:
            return f"My email is {self._scenario['customer']['email']}."
        if "photo" in q or "evidence" in q or "picture" in q:
            return "I can send photos — where should I email them?"
        if "how long" in q or "when" in q or "date" in q:
            return f"This happened on {self._scenario['ticket']['created_at'][:10]}."
        return f"Thank you for your help, {customer_name} here. Please let me know what you need."

    def _build_session_dict(self) -> dict:
        d = self.to_session_dict()
        d["scenario_id"] = self.scenario_id
        return d
