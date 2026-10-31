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
RUN npm ci

FROM speech-native AS speech-native-avx
RUN cd /tmp/whisper && \
    cmake -B build-avx -DCMAKE_BUILD_TYPE=Release -DBUILD_SHARED_LIBS=OFF \
      -DWHISPER_BUILD_TESTS=OFF -DGGML_NATIVE=OFF -DGGML_OPENMP=OFF \
      -DGGML_AVX=ON -DGGML_AVX2=ON -DGGML_FMA=ON -DGGML_F16C=ON \
      -DGGML_AVX512=OFF -DGGML_AVX_VNNI=OFF -DGGML_BMI2=OFF && \
    cmake --build build-avx --target whisper-cli --parallel 2

FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM deps AS worker
COPY . .
CMD ["npm", "run", "worker"]

FROM worker AS speech-worker
RUN apk add --no-cache ffmpeg libstdc++ time && mkdir -p /models && chown 1001:1001 /models
COPY --from=speech-native /tmp/whisper/build/bin/whisper-cli /usr/local/bin/whisper-cli-portable
COPY --from=speech-native-avx /tmp/whisper/build-avx/bin/whisper-cli /usr/local/bin/whisper-cli-avx2
COPY --from=speech-native /tmp/whisper/LICENSE /usr/local/share/whisper-LICENSE
USER 1001:1001
CMD ["node", "--import", "tsx", "scripts/speech-worker.ts"]

FROM base AS runner
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]

# Free-tier API worker: no native ASR engine or model volume required.
FROM worker AS speech-api-worker
USER root
RUN apk add --no-cache ffmpeg
USER 1001
CMD ["node", "--import", "tsx", "scripts/speech-worker.ts"]
