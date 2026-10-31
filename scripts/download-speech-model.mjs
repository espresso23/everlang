import { mkdir, rename, unlink, open } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] || "/models");
const target = path.join(root, "ggml-base.bin");
const expected =
  "60ed5bc3dd14eea856493d334349b405782ddcaf0028d4b5df4088345fba2efe";
async function checksum(file) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest("hex");
}
await mkdir(root, { recursive: true });
if ((await checksum(target).catch(() => "")) === expected) {
  console.info("Whisper base model already verified; no download.");
} else {
  const temporary = path.join(root, "base-" + randomUUID() + ".part");
  let file;
  try {
    const response = await fetch(
      "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin",
      { signal: AbortSignal.timeout(600000) },
    );
    if (!response.ok || !response.body)
      throw new Error("Model download unavailable");
    file = await open(temporary, "wx", 0o644);
    let total = 0;
    for await (const chunk of response.body) {
      total += chunk.length;
      if (total > 147951465) throw new Error("Model file exceeds pinned size");
      await file.writeFile(chunk);
    }
    await file.close();
    file = undefined;
    if ((await checksum(temporary)) !== expected)
      throw new Error("Model checksum mismatch");
    await rename(temporary, target);
    console.info("Whisper base multilingual downloaded and SHA256 verified.");
  } catch {
    await file?.close().catch(() => {});
    await unlink(temporary).catch(() => {});
    console.error(
      "Model setup failed. Check network, disk space, and upstream availability; no unverified model accepted.",
    );
    process.exitCode = 1;
  }
}
