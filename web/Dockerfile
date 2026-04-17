# syntax=docker/dockerfile:1.6
# ============================================================================
# Stage 1 — build the Vite bundle
# ============================================================================
FROM node:22-alpine AS builder

RUN corepack enable

WORKDIR /app

# Dependencies first so Docker caches them when only source changes
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000

# Bring the rest of the source
COPY . .

# The frontend talks to `/api/v1` — nginx (stage 2) proxies that to the
# backend container. This lets the compiled bundle work on any host without
# hard-coding a URL.
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build disables the vite-plugin-checker type-check by skipping the dev server;
# yarn build runs `tsc && vite build`.
RUN yarn build

# ============================================================================
# Stage 2 — serve the static bundle through nginx
# ============================================================================
FROM nginx:alpine AS runner

# Drop the default site
RUN rm /etc/nginx/conf.d/default.conf

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
