# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY server.ts ./
COPY public ./public

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled/source files from builder
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/public ./public

# Install tsx for running TypeScript directly
RUN npm install -g tsx

# Expose the port your app runs on
EXPOSE 3443

# Set environment variables (these can be overridden in k8s)
ENV NODE_ENV=production
ENV PROXY_BASE_URL=http://localhost:8000/v1
ENV PROXY_API_KEY=sk-not-needed

# Run the application
CMD ["tsx", "server.ts"]
