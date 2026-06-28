# ==========================================
# SmartBabyScale - Web Dashboard Dockerfile
# Multi-stage production build for Next.js & Socket.io Custom Server
# ==========================================

# --- Stage 1: Dependencies and Build ---
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies needed for node-gyp or other build tools if any
RUN apk add --no-cache libc6-compat

# Copy package descriptors first to optimize Docker layer caching
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy the rest of the application files
COPY . .

# Disable telemetry during build to speed it up and maintain privacy
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the Next.js application
RUN npm run build

# --- Stage 2: Production Runner ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3777

# Create a non-root system user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy essential runtime files from the builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/server.js ./
COPY --from=builder /app/postcss.config.js ./
COPY --from=builder /app/tailwind.config.js ./
COPY --from=builder /app/tsconfig.json ./

# Copy public assets and built pages/server outputs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

# Install only production dependencies to minimize image size
RUN npm ci --only=production

# Set proper ownership for security
RUN chown -R nextjs:nodejs /app

# Switch to the non-privileged user
USER nextjs

# Expose the default Socket.io & Web Server port
EXPOSE 3777

# Start the application using our custom Node.js server (server.js)
CMD ["node", "server.js"]
