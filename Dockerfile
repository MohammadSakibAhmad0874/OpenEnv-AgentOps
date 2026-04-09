# ══════════════════════════════════════════════════════════════════════════════
# OpenEnv AgentOps — Production Dockerfile
# Build: docker build -t openenv-agentops .
# Run:   docker run -p 8000:8000 openenv-agentops
# ══════════════════════════════════════════════════════════════════════════════

FROM python:3.11-slim

LABEL maintainer="Mohammad Sakib Ahmad <MohammadSakibAhmad0874>"
LABEL description="OpenEnv AgentOps - Operating System for AI Work Agents"
LABEL version="1.0.0"

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Install Python dependencies
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ ./

# Create runtime data directories
RUN mkdir -p /app/data/sessions /app/data/scenarios /app/data/live

# Expose backend port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start FastAPI app
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]