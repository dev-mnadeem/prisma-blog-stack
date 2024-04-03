# syntax=docker/dockerfile:1

# ---- deps: install with the workspace lockfile so versions match local runs ----
FROM node:22-alpine AS deps
WORKDIR /repo
COPY package.json package-lock.json ./
COPY server/package.json server/
COPY web/package.json web/
RUN npm ci --workspace @blogs/server --include-workspace-root

# ---- build: generate the Prisma client, then compile TypeScript ----
FROM deps AS build
COPY server/ server/
RUN npm run prisma:generate --workspace @blogs/server \
 && npm run build --workspace @blogs/server

# ---- runtime: production deps only, running as the node user ----
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json server/
COPY web/package.json web/
RUN npm ci --workspace @blogs/server --include-workspace-root --omit=dev

COPY --from=build /repo/server/dist server/dist
COPY --from=build /repo/server/prisma server/prisma
COPY --from=build /repo/node_modules/.prisma node_modules/.prisma
COPY --from=build /repo/node_modules/@prisma node_modules/@prisma

USER node
EXPOSE 7231
# Migrations run in their own one-shot service (see docker-compose.yml), which
# keeps the Prisma CLI and its engines out of the runtime image.
CMD ["node", "server/dist/src/server.js"]
