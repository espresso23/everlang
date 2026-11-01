import { randomBytes, scrypt, timingSafeEqual, createHash } from 'node:crypto';
export const randomToken = () => randomBytes(32).toString('base64url');
export const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');
async function key(password: string, salt: string) {
  return new Promise<Buffer>((resolve,reject)=>scrypt(password.normalize('NFKC'),salt,64,{N:16384,r:16,p:1,maxmem:67108864},(error,key)=>error?reject(error):resolve(key)));
}
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${(await key(password, salt)).toString('hex')}`;
}
export async function verifyPassword(password: string, hash: string) {
  if (!/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(hash)) return false;
  const [salt, value] = hash.split(':');
  return timingSafeEqual(await key(password, salt), Buffer.from(value, 'hex'));
}
