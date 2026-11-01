import path from "node:path";
import { mkdir, readFile, writeFile, unlink, access } from "node:fs/promises";
import { validSpeechFileKey } from "./contract";

export function speechMediaPath(key: string) {
  if (!validSpeechFileKey(key)) throw new Error("Invalid private speech key");
  const root = path.resolve(
    /* turbopackIgnore: true */
    process.env.SPEECH_MEDIA_ROOT || ".local/speech-media",
  );
  const resolved = path.resolve(root, key);
  if (!resolved.startsWith(root + path.sep))
    throw new Error("Invalid private speech path");
  return resolved;
}
export async function writeSpeechAudio(key: string, bytes: Buffer) {
  const file = speechMediaPath(key);
  await mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
  await writeFile(file, bytes, { flag: "wx", mode: 0o600 });
}
export async function readSpeechAudio(key: string) {
  // Runtime-only private volume, never a build-time/static asset dependency.
  return readFile(/* turbopackIgnore: true */ speechMediaPath(key));
}
export async function hasSpeechAudio(key: string) {
  try {
    await access(speechMediaPath(key));
    return true;
  } catch {
    return false;
  }
}
export async function removeSpeechAudio(key: string) {
  try {
    await unlink(speechMediaPath(key));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }
}
