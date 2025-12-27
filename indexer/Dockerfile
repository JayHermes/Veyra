# Indexer Dockerfile
# IMPORTANT: Railway must build from ROOT directory with Dockerfile path: indexer/Dockerfile
# In Railway Settings → Build → Set Root Directory to empty (or /) and Dockerfile Path to: indexer/Dockerfile

FROM node:20-alpine

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files (when building from root, use indexer/ prefix)
COPY indexer/package*.json ./
COPY indexer/pnpm-lock.yaml* ./

# Install pnpm and dependencies
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

# Rebuild native modules for Alpine Linux
RUN npm rebuild better-sqlite3

# Copy protocol artifacts (contract ABIs) - required for event listening
# This assumes build context is root directory
COPY protocol/artifacts /protocol/artifacts

# Copy source code
COPY indexer/src ./src
COPY indexer/tsconfig.json ./

# Build TypeScript
RUN pnpm run build

# Expose port
EXPOSE 4001

# Start the server
CMD ["node", "dist/server.js"]
