# ══════════════════════════════════════════════════════════════════════════════
# OpenEnv AgentOps — Production Dockerfile
# Build: docker build -t openenv-agentops .
# Run:   docker run -p 8000:8000 openenv-agentops
# ══════════════════════════════════════════════════════════════════════════════

FROM python:3.11-slim AS backend

LABEL maintainer="Mohammad Sakib Ahmad <MohammadSakibAhmad0874>"
LABEL description="OpenEnv AgentOps — Operating System for AI Work Agents"
LABEL version="1.0.0"

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
        curl \
        && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend files
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./

# Ensure data directories exist
RUN mkdir -p data/sessions data/scenarios data/live

# Copy scenarios (if any exist)
COPY backend/data/ ./data/ 2>/dev/null || true

# Expose API port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Run FastAPI with uvicorn
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
