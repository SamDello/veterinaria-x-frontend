FROM node:22-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

ENV API_URL=http://localhost:3000/api

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.d/40-envsubst.sh /docker-entrypoint.d/40-envsubst.sh
COPY --from=builder /app/dist/veterinaria-x-frontend/browser /usr/share/nginx/html

RUN chmod +x /docker-entrypoint.d/40-envsubst.sh

EXPOSE 80
