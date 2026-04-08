"""
OpenEnv AgentOps — FastAPI Application Entry Point
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.router import api_router
from environments.registry import ENV_META

app = FastAPI(
    title="OpenEnv AgentOps API",
    description="Operating System for AI Work Agents — multi-domain simulation platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS — allow Next.js frontend on any local port
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Mount routes
# ---------------------------------------------------------------------------
app.include_router(api_router)


# ---------------------------------------------------------------------------
# Health & root
# ---------------------------------------------------------------------------

@app.get("/", tags=["Meta"])
def root():
    return {
        "product": "OpenEnv AgentOps",
        "version": "1.0.0",
        "status": "operational",
        "environments": len(ENV_META),
        "docs": "/docs",
    }


@app.get("/health", tags=["Meta"])
def health():
    return {"status": "ok"}
