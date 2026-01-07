# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install build tools for native modules (like better-sqlite3)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Copy built node_modules and app source
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Create necessary directories
RUN mkdir -p logs data archive && \
    chown -R node:node /app

# Set environment variables (defaults, can be overridden)
ENV NODE_ENV=production
ENV PORT=8080

# Switch to non-root user for security
USER node

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["npm", "start"]

# Labels
LABEL maintainer="gAIng Collective" \
      version="1.0.0" \
      description="Collective memory database for AI agents"
