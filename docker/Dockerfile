# ---- Build stage ----
FROM node:22-slim AS build
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json ./
COPY src/server/package.json src/server/
COPY src/client/package.json src/client/
RUN npm install

# Copy source and build both workspaces
COPY src/server src/server
COPY src/client src/client
RUN npm run build

# ---- Runtime stage ----
FROM node:22-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY package.json ./
COPY src/server/package.json src/server/
COPY src/client/package.json src/client/
RUN npm install --omit=dev && npm cache clean --force

# Copy build artifacts
COPY --from=build /app/src/server/dist src/server/dist
COPY --from=build /app/src/client/dist src/client/dist


ENV PORT=3000
ENV DATA_DIR=/app/data
EXPOSE 3000

CMD ["node", "src/server/dist/index.js"]
