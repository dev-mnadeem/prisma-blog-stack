# syntax=docker/dockerfile:1

# ---- build: Vite bakes VITE_API_URL in, so it is a build argument ----
FROM node:20-alpine AS build
ARG VITE_API_URL=http://localhost:7231/api
ENV VITE_API_URL=$VITE_API_URL
WORKDIR /repo
COPY package.json package-lock.json ./
COPY server/package.json server/
COPY web/package.json web/
RUN npm ci --workspace @blogs/web --include-workspace-root
COPY web/ web/
RUN npm run build --workspace @blogs/web

# ---- runtime: static files behind nginx, unprivileged image, port 8080 ----
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime
COPY --from=build /repo/web/dist /usr/share/nginx/html
COPY web/nginx.conf /etc/nginx/conf.d/default.conf
USER 101
EXPOSE 8080
