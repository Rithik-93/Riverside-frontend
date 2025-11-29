FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --prefer-offline --no-audit

COPY . .

ARG VITE_API_URL
ARG VITE_WS_URL
ARG VITE_UPLOAD_URL

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL
ENV VITE_UPLOAD_URL=$VITE_UPLOAD_URL

RUN npm run build

FROM nginx:1.25-alpine

RUN apk add --no-cache curl

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

