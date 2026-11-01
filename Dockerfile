FROM node:24-alpine AS base
WORKDIR /app
RUN mkdir -p /data/speech-media && chown 1001:1001 /data/speech-media

FROM base AS speech-native
RUN apk add --no-cache cmake make g++ git
RUN git init /tmp/whisper && cd /tmp/whisper && \
    git remote add origin https://github.com/ggml-org/whisper.cpp.git && \
    git fetch --depth 1 origin d1be6fde11ac6e0407606b4e42fe72d34add8037 && \
    git checkout --detach FETCH_HEAD && \
    cmake -B build -DCMAKE_BUILD_TYPE=Release -DBUILD_SHARED_LIBS=OFF \
      -DWHISPER_BUILD_TESTS=OFF -DGGML_NATIVE=OFF -DGGML_OPENMP=OFF \
      -DGGML_AVX=OFF -DGGML_AVX2=OFF -DGGML_FMA=OFF -DGGML_F16C=OFF && \
    cmake --build build --target whisper-cli --parallel 2

FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY packages/backend/package.json packages/backend/package.json
COPY packages/contracts/package.json packages/contracts/package.json
RUN npm ci

FROM speech-native AS speech-native-avx
RUN cd /tmp/whisper && \
    cmake -B build-avx -DCMAKE_BUILD_TYPE=Release -DBUILD_SHARED_LIBS=OFF \
      -DWHISPER_BUILD_TESTS=OFF -DGGML_NATIVE=OFF -DGGML_OPENMP=OFF \
      -DGGML_AVX=ON -DGGML_AVX2=ON -DGGML_FMA=ON -DGGML_F16C=ON \
      -DGGML_AVX512=OFF -DGGML_AVX_VNNI=OFF -DGGML_BMI2=OFF && \
    cmake --build build-avx --target whisper-cli --parallel 2

FROM deps AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY . .
RUN npm run build

FROM base AS worker
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist
COPY --from=builder /app/apps/worker/package.json ./apps/worker/package.json
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/packages/backend/package.json ./packages/backend/package.json
COPY --from=builder /app/packages/contracts/dist ./packages/contracts/dist
COPY --from=builder /app/packages/contracts/package.json ./packages/contracts/package.json
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/data ./data
COPY --from=builder /app/migrations ./migrations
ENV NODE_ENV=production
USER 1001:1001
CMD ["node","apps/worker/dist/main.js"]

FROM worker AS api
ENV API_PORT=4000
EXPOSE 4000
CMD ["node","apps/api/dist/main.js"]

FROM base AS web
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3001 HOSTNAME=0.0.0.0
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
USER 1001:1001
EXPOSE 3001
CMD ["node","apps/web/server.js"]

FROM worker AS speech-worker
USER root
RUN apk add --no-cache ffmpeg libstdc++ time && mkdir -p /models && chown 1001:1001 /models
COPY --from=speech-native /tmp/whisper/build/bin/whisper-cli /usr/local/bin/whisper-cli-portable
COPY --from=speech-native-avx /tmp/whisper/build-avx/bin/whisper-cli /usr/local/bin/whisper-cli-avx2
COPY --from=speech-native /tmp/whisper/LICENSE /usr/local/share/whisper-LICENSE
ENV WORKER_KIND=speech
USER 1001:1001
CMD ["node","apps/worker/dist/main.js"]

FROM worker AS speech-api-worker
USER root
RUN apk add --no-cache ffmpeg
ENV WORKER_KIND=speech
USER 1001:1001
CMD ["node","apps/worker/dist/main.js"]
