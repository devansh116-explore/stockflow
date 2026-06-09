# ============================================
# StockFlow Frontend — Production Dockerfile
# ============================================
# Multi-stage build: Node for building, Nginx for serving
# ============================================

# --- Stage 1: Build the React/Vite app ---
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies first (leverages Docker layer caching)
COPY package.json package-lock.json* ./
RUN npm ci --silent

# Copy source files and build
COPY . .

# Accept the API URL as a build argument (no hardcoded values)
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build


# --- Stage 2: Serve with lightweight Nginx ---
FROM nginx:1.27-alpine

# Remove default nginx config
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Healthcheck to verify nginx is serving content
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
