"use client";

import { create } from "zustand";
import { api, type Action, type ScoreCard, type SessionRecord, type StepResult } from "@/lib/api";

interface AgentState {
  // Active session
  activeEnvId: string | null;
  activeSessionId: string | null;
  observation: Record<string, unknown> | null;
  stepHistory: StepResult[];
  isLoading: boolean;
  isDone: boolean;
  error: string | null;

  // Scores
  scorecards: Record<string, ScoreCard>; // session_id -> scorecard
  sessions: SessionRecord[];

  // Actions
  resetEnv: (envId: string, scenarioId?: string) => Promise<void>;
  stepEnv: (envId: string, action: Action) => Promise<StepResult | null>;
  fetchScore: (envId: string, sessionId: string) => Promise<void>;
  fetchSessions: () => Promise<void>;
  clearError: () => void;
  setActiveEnv: (envId: string | null) => void;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  activeEnvId: null,
  activeSessionId: null,
  observation: null,
  stepHistory: [],
  isLoading: false,
  isDone: false,
  error: null,
  scorecards: {},
  sessions: [],

  resetEnv: async (envId, scenarioId) => {
    set({ isLoading: true, error: null, stepHistory: [], isDone: false });
    try {
      const res = await api.resetEnvironment(envId, scenarioId);
      set({
        activeEnvId: envId,
        activeSessionId: res.session_id,
        observation: res.observation,
        isLoading: false,
      });
    } catch (e: unknown) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  stepEnv: async (envId, action) => {
    const { activeSessionId } = get();
    if (!activeSessionId) return null;
    set({ isLoading: true, error: null });
    try {
      const result = await api.stepEnvironment(envId, activeSessionId, action);
      set((s) => ({
        observation: result.observation,
        stepHistory: [...s.stepHistory, result],
        isDone: result.done,
        isLoading: false,
      }));
      if (result.done) {
        await get().fetchScore(envId, activeSessionId);
      }
      return result;
    } catch (e: unknown) {
      set({ error: (e as Error).message, isLoading: false });
      return null;
    }
  },

  fetchScore: async (envId, sessionId) => {
    try {
      const card = await api.getScore(envId, sessionId);
      set((s) => ({ scorecards: { ...s.scorecards, [sessionId]: card } }));
    } catch {
      // silent
    }
  },

  fetchSessions: async () => {
    try {
      const data = await api.listAllSessions();
      set({ sessions: data.sessions });
    } catch {
      // silent
    }
  },

  clearError: () => set({ error: null }),
  setActiveEnv: (envId) => set({ activeEnvId: envId }),
}));
