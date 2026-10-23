# ---- Build stage ----
FROM node:22-slim AS build
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json ./
COPY server/package.json server/
COPY client/package.json client/
RUN npm install

# Copy source and build both workspaces
COPY server server
COPY client client
RUN npm run build

# ---- Runtime stage ----
FROM node:22-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY package.json ./
COPY server/package.json server/
COPY client/package.json client/
RUN npm install --omit=dev && npm cache clean --force

# Copy build artifacts
COPY --from=build /app/server/dist server/dist
COPY --from=build /app/client/dist client/dist

ENV PORT=3000
ENV DATA_DIR=/app/data
EXPOSE 3000

CMD ["node", "server/dist/index.js"]
