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

# Set environment variables (defaults, can be overridden)
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["npm", "start"]
