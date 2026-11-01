import fs from 'node:fs';
import assert from 'node:assert/strict';
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>['node_modules','dist','.next'].includes(e.name)?[]:e.isDirectory()?files(`${dir}/${e.name}`):[`${dir}/${e.name}`]);}
for(const old of ['app/api','apps/web/app/api','lib/auth.ts','lib/api.ts','scripts/worker.ts','scripts/speech-worker.ts'])assert.ok(!fs.existsSync(old),`Legacy runtime exists: ${old}`);
const lock=JSON.parse(fs.readFileSync('package-lock.json','utf8'));
for(const name of Object.keys(lock.packages))assert.ok(!/node_modules\/(?:better-auth|@better-auth\/|drizzle-orm|drizzle-kit)(?:\/|$)/.test(name),`Legacy dependency: ${name}`);
for(const file of [...files('apps'),...files('packages')].filter(f=>/\.[cm]?[jt]sx?$/.test(f))){
 const source=fs.readFileSync(file,'utf8');
 assert.ok(!/from\s+['"](?:better-auth|drizzle-orm|next\/server)/.test(source),`Legacy backend import: ${file}`);
 if(file.startsWith('apps/web/'))assert.ok(!/(?:from\s+|import\s*\()['"](?:@everlang\/backend|@nestjs\/|pg['"/]|mongoose['"/]|bullmq['"/]|ioredis['"/])/.test(source),`Server dependency in web: ${file}`);
}
console.info('PASS: native Nest backend; no old routes, Better Auth/Drizzle dependencies or server imports in web.');
