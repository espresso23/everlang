import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
export const mediaConfigured = () =>
  Boolean(
    process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY,
  );
function storage() {
  return new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  });
}
export async function saveAudio(key: string, bytes: Buffer) {
  await storage().send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: bytes,
      ContentType: "audio/webm",
    }),
  );
}
export async function audioUrl(key: string) {
  return getSignedUrl(
    storage(),
    new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }),
    { expiresIn: 300 },
  );
}
