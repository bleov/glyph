FROM oven/bun:1 AS build

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --ignore-scripts

COPY . .

ARG VITE_POCKETBASE_URL=""
ARG VITE_PUBLIC_POSTHOG_KEY=""
ARG VITE_PUBLIC_POSTHOG_HOST=""
ENV VITE_POCKETBASE_URL=${VITE_POCKETBASE_URL}
ENV VITE_PUBLIC_POSTHOG_KEY=${VITE_PUBLIC_POSTHOG_KEY}
ENV VITE_PUBLIC_POSTHOG_HOST=${VITE_PUBLIC_POSTHOG_HOST}

RUN bunx --bun vite build

FROM alpine:3.22

ARG TARGETARCH
ARG POCKETBASE_VERSION=0.41.1

RUN apk add --no-cache ca-certificates unzip \
  && wget -q "https://ganigeorgiev.com/meta/pocketbase/pocketbase/download/v${POCKETBASE_VERSION}/pocketbase_${POCKETBASE_VERSION}_linux_${TARGETARCH}.zip" -O /tmp/pocketbase.zip \
  && unzip -q /tmp/pocketbase.zip pocketbase -d /usr/local/bin \
  && rm /tmp/pocketbase.zip \
  && chmod +x /usr/local/bin/pocketbase

WORKDIR /pb
COPY --from=build /app/dist /pb/pb_static
COPY --from=build /app/pb_hooks /pb/pb_hooks
COPY --from=build /app/bot /pb/bot
RUN ln -s /pb/pb_static /pb/pb_public

VOLUME ["/pb/pb_data"]
EXPOSE 8090

ENTRYPOINT ["pocketbase", "serve", "--http=0.0.0.0:8090"]
