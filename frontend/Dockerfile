# ── Build Stage ──
FROM node:20-alpine AS build
WORKDIR /app

# Cache dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build production bundle
COPY . .
RUN npm run build

# ── Production Stage ──
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Clean default assets and copy custom nginx configuration
RUN rm -rf ./*
COPY --from=build /app/dist ./
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
