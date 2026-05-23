FROM oven/bun:1

WORKDIR /app

# Install dependencies first (layer cache)
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Copy source
COPY src ./src

# Data lives on a mounted volume; /data is the default in container context
RUN mkdir -p /data

EXPOSE 7700

ENV LB_PORT=7700
ENV LB_DATA_DIR=/data

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:7700/health || exit 1

CMD ["bun", "src/cli.ts", "start"]
