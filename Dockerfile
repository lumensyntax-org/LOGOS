# LOGOS Service Dockerfile
# Multi-stage build for optimal size and security

FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@9

WORKDIR /app

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json ./

# Copy packages
COPY packages/logos-core ./packages/logos-core
COPY packages/logos-service ./packages/logos-service

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build packages
RUN pnpm -r build

# Production stage
FROM node:20-alpine AS runner

# Install pnpm
RUN npm install -g pnpm@9

WORKDIR /app

# Copy only necessary files
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages/logos-core/package.json ./packages/logos-core/
COPY --from=builder /app/packages/logos-core/dist ./packages/logos-core/dist
COPY --from=builder /app/packages/logos-service/package.json ./packages/logos-service/
COPY --from=builder /app/packages/logos-service/dist ./packages/logos-service/dist

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

# Environment variables
ENV NODE_ENV=production
ENV PORT=8787
ENV HOST=0.0.0.0

EXPOSE 8787

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8787/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start service
CMD ["node", "packages/logos-service/dist/index.js"]
