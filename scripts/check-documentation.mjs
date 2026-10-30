import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import ts from "typescript";

const manifestPath = "documentation/code-map.json";
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const refresh = process.argv.includes("--refresh");
const failures = [];
const sourceRoots = ["app", "components", "lib", "scripts", "migrations", "data", "tests"];
function filesIn(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.posix.join(dir, entry.name);
    return entry.isDirectory() ? filesIn(file) : [file];
  });
}
const sourceFiles = sourceRoots.flatMap(filesIn).filter(file => /\.(?:tsx?|mjs|sql|json|svg|ico|py|ps1)$/.test(file));
const byFile = new Map();
for (const feature of manifest.features) {
  for (const name of ["README.md", "system-design.md", "functions.md", "ui.md", "audit.md"]) {
    if (!fs.existsSync(`documentation/features/${feature.id}/${name}`)) failures.push(`Missing feature document: ${feature.id}/${name}`);
  }
  for (const item of feature.code) {
    if (byFile.has(item.file)) failures.push(`Duplicate canonical code owner: ${item.file}`);
    byFile.set(item.file, feature.id);
    if (!fs.existsSync(item.file)) { failures.push(`Missing source: ${item.file}`); continue; }
    const bytes = fs.readFileSync(item.file);
    const hash = crypto.createHash("sha256").update(bytes.toString("utf8").replaceAll("\r\n", "\n")).digest("hex");
    if (refresh) item.sha256 = hash;
    else if (hash !== item.sha256) failures.push(`Source changed; review docs then refresh mapping: ${item.file}`);
    if (/\.(?:tsx?|mjs)$/.test(item.file)) {
      const ast = ts.createSourceFile(item.file, bytes.toString("utf8"), ts.ScriptTarget.Latest, true);
      const names = new Set();
      function visit(node) {
        if ((ts.isFunctionDeclaration(node) || ts.isVariableDeclaration(node) || ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) && node.name && ts.isIdentifier(node.name)) names.add(node.name.text);
        ts.forEachChild(node, visit);
      }
      visit(ast);
      for (const symbol of item.symbols || []) if (!names.has(symbol)) failures.push(`Missing symbol: ${item.file}#${symbol}`);
    }
  }
}
for (const file of sourceFiles) if (!byFile.has(file)) failures.push(`Source has no canonical feature mapping: ${file}`);
let links = 0;
for (const file of filesIn("documentation").filter(file => file.endsWith(".md"))) {
  for (const match of fs.readFileSync(file, "utf8").matchAll(/\]\(([^)]+)\)/g)) {
    const target = match[1].split("#")[0];
    if (!target || /^[a-z]+:/i.test(target)) continue;
    links++;
    if (!fs.existsSync(path.resolve(path.dirname(file), target))) failures.push(`Broken link: ${file} -> ${target}`);
  }
}
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
if (refresh) fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.info(`Documentation ${refresh ? "mapping refreshed" : "checks passed"}: ${manifest.features.length} features, ${byFile.size} source/config files, ${links} local links.`);
console.info("Structural checks do not replace semantic review or end-to-end audit.");
