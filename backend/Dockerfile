# ============================================
# StockFlow Backend — Production Dockerfile
# ============================================
# Multi-stage build using slim base image
# ============================================

# --- Stage 1: Builder (install dependencies) ---
FROM python:3.12-slim AS builder

WORKDIR /build

# Install only the build-time deps needed for psycopg2-binary
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


# --- Stage 2: Runtime (lean production image) ---
FROM python:3.12-slim

# Install only the minimal runtime library for PostgreSQL
RUN apt-get update && \
    apt-get install -y --no-install-recommends libpq5 curl && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN addgroup --system app && adduser --system --ingroup app app

WORKDIR /app

# Copy pre-built Python packages from builder stage
COPY --from=builder /install /usr/local

# Copy application source code
COPY app ./app

# Prevent Python from writing .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Environment variables — set via docker-compose or .env, NOT hardcoded
# DATABASE_URL, CORS_ORIGINS are required at runtime

# Switch to non-root user
USER app

EXPOSE 8000

# Healthcheck to verify the backend is responding
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/docs || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
