"use client";
import Image from "next/image";
import { useState } from "react";

/** Provider image stays unoptimized: private profile URLs never pass through our image proxy. */
export function UserAvatar({ name, image, large = false }: {
  name: string; image?: string | null; large?: boolean;
}) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const safeImage = image?.startsWith("https://") ? image : null;
  const initials = name.trim().split(/\s+/u).filter(Boolean).slice(-2)
    .map(part => Array.from(part)[0]).join("").toLocaleUpperCase() || "E";
  return <span className={`user-avatar${large ? " user-avatar-large" : ""}`}>
    {safeImage && failedImage !== safeImage
      ? <Image src={safeImage} alt={`Ảnh đại diện của ${name}`} width={large ? 72 : 32}
          height={large ? 72 : 32} unoptimized referrerPolicy="no-referrer"
          onError={() => setFailedImage(safeImage)} />
      : <span role="img" aria-label={`Ảnh đại diện của ${name}`}>{initials}</span>}
  </span>;
}
