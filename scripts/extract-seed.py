"""Extract the 100 authored exercises from the supplied HTML into seed JSON."""
import json
import re
import sys
from pathlib import Path

source = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("data/source-exercises.html")
target = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("data/seed-sentences.json")
html = source.read_text(encoding="utf-8")
array = re.search(r"const SENTENCES_DATA\s*=\s*\[([\s\S]*?)\n\s*\];", html)
if not array:
    raise SystemExit("Không tìm thấy SENTENCES_DATA trong HTML nguồn.")

def split_terms(text):
    """Split at commas outside parenthetical Vietnamese explanations."""
    parts, start, depth = [], 0, 0
    for index, char in enumerate(text):
        if char == "(":
            depth += 1
        elif char == ")":
            depth = max(0, depth - 1)
        elif char == "," and depth == 0:
            parts.append(text[start:index].strip())
            start = index + 1
    parts.append(text[start:].strip())
    return [part for part in parts if part]

entries = []
for match in re.finditer(r"\{\s*id:\s*(\d+),([\s\S]*?)\n\s*\}", array.group(1)):
    values = {"id": int(match.group(1))}
    for key, value in re.findall(r'\b(topic|level|vi|ko|vocab|grammar):\s*("(?:\\.|[^"\\])*")', match.group(2)):
        values[key] = json.loads(value)
    required = {"topic", "level", "vi", "ko", "vocab", "grammar"}
    if required - values.keys():
        raise SystemExit(f"Câu {values['id']} thiếu trường: {required - values.keys()}")
    entries.append({
        "sourceId": f"seed-{values['id']}",
        "topic": values["topic"], "level": values["level"],
        "viText": values["vi"], "koSampleAnswer": values["ko"],
        "keyGrammar": split_terms(values["grammar"]),
        "keyVocab": split_terms(values["vocab"]),
        "isAiGenerated": False,
    })

if len(entries) != 100 or {entry["sourceId"] for entry in entries} != {f"seed-{i}" for i in range(1, 101)}:
    raise SystemExit(f"Cần đúng 100 câu có id từ 1 đến 100; tìm thấy {len(entries)}.")
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Wrote {len(entries)} exercises to {target}")
