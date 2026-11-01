import fs from 'node:fs';
import {generateKeyPairSync,randomBytes} from 'node:crypto';
const target='.env';
const existing=fs.existsSync(target)?fs.readFileSync(target,'utf8'):fs.readFileSync('.env.example','utf8');
if(/^JWT_PRIVATE_KEY_B64=.+$/m.test(existing)||/^JWT_PUBLIC_KEY_B64=.+$/m.test(existing)||/^CSRF_SECRET=.+$/m.test(existing))throw new Error('Auth keys already configured; refusing to replace existing sessions/keys.');
const keys=generateKeyPairSync('rsa',{modulusLength:3072,privateKeyEncoding:{type:'pkcs8',format:'pem'},publicKeyEncoding:{type:'spki',format:'pem'}});
let output=existing;
for(const[name,value]of Object.entries({JWT_PRIVATE_KEY_B64:Buffer.from(keys.privateKey).toString('base64'),JWT_PUBLIC_KEY_B64:Buffer.from(keys.publicKey).toString('base64'),CSRF_SECRET:randomBytes(32).toString('base64url')})){
 const pattern=new RegExp('^'+name+'=.*$','m');output=pattern.test(output)?output.replace(pattern,name+'='+value):output+'\n'+name+'='+value;
}
fs.writeFileSync(target,output,{mode:0o600});console.info('Auth keys written to ignored .env; existing configured keys are never overwritten.');
