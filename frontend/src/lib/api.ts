/**
 * Typed API client — all calls to the FastAPI backend.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail ?? `HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
  } catch (err) {
    // Rethrow so callers can decide — but they should use safeRequest for non-critical data
    throw err;
  }
}

/** Like request() but returns null instead of throwing — for dashboard widgets */
async function safeRequest<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    return await request<T>(path, options);
  } catch (e) {
    console.warn("[API]", path, (e as Error).message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Types (mirrored from backend Pydantic models)
// ---------------------------------------------------------------------------

export interface Action {
  type: string;
  parameters: Record<string, unknown>;
}

export interface Reward {
  value: number;
  explanation: string;
  breakdown: Record<string, number>;
}

export interface StepResult {
  session_id: string;
  step: number;
  observation: Record<string, unknown>;
  reward: Reward;
  done: boolean;
  info: Record<string, unknown>;
}

export interface ScoreCard {
  session_id: string;
  env_id: string;
  scenario_id: string | null;
  total: number;
  max_possible: number;
  percentage: number;
  grade: string;
  steps_taken: number;
  invalid_actions: number;
  breakdown: Record<string, number>;
  action_log: ActionLogEntry[];
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActionLogEntry {
  step: number;
  action_type: string;
  action_params: Record<string, unknown>;
  reward_value: number;
  reward_explanation: string;
  done: boolean;
  timestamp: string;
}

export interface EnvironmentMeta {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  tag: string;
  actions: string[];
  max_steps: number;
  max_score: number;
  scenario_count: number;
  status: string;
  category: string;
}

export interface ResetResponse {
  session_id: string;
  env_id: string;
  scenario_id: string | null;
  observation: Record<string, unknown>;
  message: string;
}

export interface SessionRecord {
  session_id: string;
  env_id: string;
  scenario_id: string | null;
  total_reward: number;
  steps: number;
  invalid_actions: number;
  done: boolean;
  created_at: string;
  updated_at: string;
  action_log: ActionLogEntry[];
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

export const api = {
  // Environments
  listEnvironments: () =>
    safeRequest<{ environments: EnvironmentMeta[] }>("/api/v1/environments/"),

  getEnvironment: (envId: string) =>
    request<EnvironmentMeta>(`/api/v1/environments/${envId}`),

  resetEnvironment: (envId: string, scenarioId?: string) =>
    request<ResetResponse>(`/api/v1/environments/${envId}/reset`, {
      method: "POST",
      body: JSON.stringify({ scenario_id: scenarioId ?? null }),
    }),

  stepEnvironment: (envId: string, sessionId: string, action: Action) =>
    request<StepResult>(`/api/v1/environments/${envId}/step`, {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId, action }),
    }),

  getState: (envId: string, sessionId: string) =>
    request<{ session_id: string; env_id: string; state: Record<string, unknown>; done: boolean }>(
      `/api/v1/environments/${envId}/state?session_id=${sessionId}`
    ),

  getScore: (envId: string, sessionId: string) =>
    request<ScoreCard>(`/api/v1/environments/${envId}/score?session_id=${sessionId}`),

  listEnvSessions: (envId: string) =>
    request<{ sessions: SessionRecord[]; total: number }>(
      `/api/v1/environments/${envId}/sessions`
    ),

  // Sessions
  listAllSessions: (envId?: string) =>
    request<{ sessions: SessionRecord[]; total: number }>(
      `/api/v1/sessions/${envId ? `?env_id=${envId}` : ""}`
    ),

  getSession: (sessionId: string) =>
    request<SessionRecord>(`/api/v1/sessions/${sessionId}`),

  getReplay: (sessionId: string) =>
    request<SessionRecord & { action_log: ActionLogEntry[] }>(
      `/api/v1/sessions/${sessionId}/replay`
    ),

  // Settings
  getSettings: () =>
    request<PlatformSettings>("/api/v1/settings/"),

  setMode: (mode: "demo" | "live") =>
    request<PlatformSettings>("/api/v1/settings/mode", {
      method: "POST",
      body: JSON.stringify({ mode }),
    }),

  // Live Data
  submitTicket: (payload: Record<string, unknown>) =>
    request<LiveSubmission>("/api/v1/live/tickets", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  submitAlert: (payload: Record<string, unknown>) =>
    request<LiveSubmission>("/api/v1/live/alerts", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  submitEmail: (payload: Record<string, unknown>) =>
    request<LiveSubmission>("/api/v1/live/emails", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  listSubmissions: () =>
    request<LiveSubmission[]>("/api/v1/live/submissions"),
};

// ---------------------------------------------------------------------------
// Additional types
// ---------------------------------------------------------------------------

export interface PlatformSettings {
  mode: "demo" | "live";
  version: string;
  updated_at: string;
  features: Record<string, boolean>;
}

export interface LiveSubmission {
  id: string;
  type: "ticket" | "alert" | "email";
  env_id: string;
  submitted_at: string;
  status: string;
  data: Record<string, unknown>;
}
