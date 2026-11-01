"use client";
import type { KnowledgeContent } from "@everlang/contracts/knowledge-contract";
/** Same reading body in learner Reader and admin preview; only learner supplies personal actions. */
export function KnowledgeSections({ content, onRemember, onSpeak }: { content: Pick<KnowledgeContent, "sections" | "examples">; onRemember?: (id: string) => void; onSpeak?: (text: string) => void }) {
  return <>{content.sections.map(s => <section id={s.id} key={s.id} tabIndex={-1}><h2>{s.heading}</h2><p className="learning-text">{s.text}</p>{onRemember && <button className="text-button" onClick={() => onRemember(s.id)}>Ghi nhớ vị trí này</button>}</section>)}<section><h2>Ví dụ trong ngữ cảnh</h2>{content.examples.map((x, i) => <div className="knowledge-example" key={i}><p className="learning-text" lang="ko">{x.ko}</p><p>{x.vi}</p>{onSpeak && <button className="soft-button" onClick={() => onSpeak(x.ko)}>Nghe câu · TTS</button>}</div>)}</section></>;
}
