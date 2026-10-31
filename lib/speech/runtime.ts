import { readFile } from "node:fs/promises";

export function chooseSpeechBackend(cpuInfo: string) {
  return ["avx2", "fma", "f16c"].every((flag) =>
    new RegExp(`\\b${flag}\\b`, "i").test(cpuInfo),
  )
    ? "avx2"
    : "portable";
}
let selected: Promise<{ binary: string; backend: string }> | undefined;
export function speechRuntime() {
  return (selected ??= (async () => {
    if (process.env.WHISPER_BINARY)
      return { binary: process.env.WHISPER_BINARY, backend: "custom" };
    const flags = await readFile("/proc/cpuinfo", "utf8").catch(() => "");
    const backend = chooseSpeechBackend(flags);
    return { binary: "/usr/local/bin/whisper-cli-" + backend, backend };
  })());
}
