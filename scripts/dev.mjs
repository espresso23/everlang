import {spawn} from 'node:child_process';
const children=[];
for(const [cmd,args]of [[process.execPath,['apps/api/dist/main.js']],[process.execPath,['apps/worker/dist/main.js']],['npm',['run','dev','-w','@everlang/web']],[process.execPath,['scripts/gateway.mjs']]]){
 const child=spawn(cmd,args,{stdio:'inherit',shell:process.platform==='win32'&&cmd==='npm',env:process.env});children.push(child);
}
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>children.forEach(c=>c.kill(signal)));
