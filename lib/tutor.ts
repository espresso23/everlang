export async function embed(text: string) {
  if (!process.env.OPENROUTER_API_KEY)
    throw new Error("OPENROUTER_API_KEY chưa cấu hình");
  const r = await fetch("https://openrouter.ai/api/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/text-embedding-3-small",
      input: text,
      dimensions: 1536,
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!r.ok) throw new Error("Dịch vụ embedding không khả dụng");
  const p = await r.json();
  const v = p.data?.[0]?.embedding;
  if (
    !Array.isArray(v) ||
    v.length !== 1536 ||
    !v.every((n) => typeof n === "number" && Number.isFinite(n))
  )
    throw new Error("Embedding không hợp lệ");
  return `[${v.join(",")}]`;
}
