import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { verifiedAccount } from './helpers/account';
import fs from 'node:fs';
const routes=JSON.parse(fs.readFileSync('documentation/features/backend-nestjs-migration/routes.json','utf8')) as {method:string;path:string;public:boolean}[];

test('every private native domain route rejects anonymous requests',async({request})=>{
 for(const route of routes){if(route.public)continue;const r=await request.fetch(route.path,{method:route.method,headers:{'Content-Type':'application/json'},data:['GET','HEAD'].includes(route.method)?undefined:{}});expect(r.status(),`${route.method} ${route.path}`).toBe(401);}
});

test('HTTP submission propagates trace to native worker and preserves failed retry contract',async({playwright,request,baseURL})=>{
 test.skip(process.env.E2E_AUTH_TESTS!=='1'||process.env.E2E_NO_AI_KEY!=='1','Candidate worker must have no AI key; no provider call.');test.setTimeout(60000);
 const client=await playwright.request.newContext({baseURL});
 await verifiedAccount(client,request,baseURL!,`trace-${randomUUID()}@example.test`,randomUUID()+'Aa1!');
 const sentence=(await(await client.get('/api/sentences?limit=1')).json()).items[0];
 const trace='nest-pipeline-correlation';
 const data={sentenceId:sentence._id,userTranslation:'지속적으로 공부합니다',requestId:randomUUID(),forceRegrade:false};
 const queued=await client.post('/api/submissions/grade',{headers:{'x-request-id':trace},data});expect(queued.status()).toBe(202);expect(queued.headers()['x-request-id']).toBe(trace);
 const jobId=(await queued.json()).jobId;
 await expect.poll(async()=>{const b=await(await client.get('/api/jobs?id='+jobId)).json();return b.status},{timeout:40000,intervals:[500,1000,2000]}).toBe('failed');
 const cached=await client.post('/api/submissions/grade',{data});expect(cached.status()).toBe(409);expect(await cached.json()).toMatchObject({code:'GRADING_PREVIOUS_FAILED',retryable:true,submissionId:jobId});
 await client.dispose();
});

test('native JWT: CSRF, RBAC, rotation, replay, logout and error correlation', async ({playwright,request,browser,baseURL})=>{
 test.skip(process.env.E2E_AUTH_TESTS!=='1','Uses disposable accounts and local Mailpit.');
 const client=await playwright.request.newContext({baseURL});
 const email=`nest-${randomUUID()}@example.test`,password=randomUUID()+'Aa1!';
 await verifiedAccount(client,request,baseURL!,email,password);
 const logged=await(await client.post('/api/auth/sign-in/email',{data:{email,password}})).json();
 const token=logged.accessToken;
 const claims=JSON.parse(Buffer.from(token.split('.')[1],'base64url').toString());
 expect(JSON.parse(Buffer.from(token.split('.')[0],'base64url').toString()).alg).toBe('RS256');
 expect(claims.exp-claims.iat).toBe(900);
 const state=await client.storageState();
 const raw=await playwright.request.newContext({baseURL,storageState:state});
 const login=await raw.post('/api/auth/sign-in/email',{data:{email,password}});
 expect(login.status()).toBe(403);
 const csrf=await(await raw.get('/api/auth/csrf')).json();
 const headers={Origin:baseURL!,'x-csrf-token':csrf.csrfToken};
 const current=await raw.post('/api/auth/sign-in/email',{headers,data:{email,password}});
 expect(current.status()).toBe(200);
 const currentToken=(await current.json()).accessToken;
 const cookies=(await raw.storageState()).cookies;
 const cookie=cookies.find(c=>c.name.endsWith('everlang_refresh'))!;
 expect(cookie.httpOnly).toBe(true);expect(cookie.sameSite).toBe('Lax');expect(cookie.path).toBe('/api/auth');
 expect(cookie.value).toMatch(/^[\w-]{43}$/);
 expect((await raw.get('/api/profile',{headers:{Authorization:`Bearer ${currentToken}`}})).status()).toBe(200);
 expect((await raw.get('/api/admin/content',{headers:{Authorization:`Bearer ${currentToken}`}})).status()).toBe(403);
 expect((await raw.get('/api/profile',{headers:{Authorization:'Bearer invalid'}})).status()).toBe(401);
 const oldState=await raw.storageState();
 const rotated=await raw.post('/api/auth/refresh',{headers});expect(rotated.status()).toBe(200);
 const nextToken=(await rotated.json()).accessToken;
 expect((await raw.storageState()).cookies.find(c=>c.name===cookie.name)!.value).not.toBe(cookie.value);
 const replay=await playwright.request.newContext({baseURL,storageState:oldState});
 const reused=await replay.post('/api/auth/refresh',{headers});expect(reused.status()).toBe(401);expect((await reused.json()).code).toBe('REFRESH_REUSED');
 expect((await raw.get('/api/profile',{headers:{Authorization:`Bearer ${nextToken}`}})).status()).toBe(401);
 const fresh=await raw.post('/api/auth/sign-in/email',{headers,data:{email,password}});const freshToken=(await fresh.json()).accessToken;
 expect((await raw.post('/api/auth/logout',{headers:{...headers,Authorization:`Bearer ${freshToken}`}})).status()).toBe(200);
 expect((await raw.get('/api/profile',{headers:{Authorization:`Bearer ${freshToken}`}})).status()).toBe(401);
 const denied=await request.get('/api/profile',{headers:{'x-request-id':'nest-auth-correlation'}});
 expect(denied.status()).toBe(401);expect(denied.headers()['x-request-id']).toBe('nest-auth-correlation');
 expect(await denied.json()).toMatchObject({requestId:'nest-auth-correlation',code:'ACCESS_TOKEN_REQUIRED'});
 const malformed=await request.post('/api/auth/sign-in/email',{headers:{'Content-Type':'application/json'},data:'{'});
 expect(malformed.status()).toBe(400);expect((await malformed.json()).requestId).toBeTruthy();
 const callback=await request.get('/api/auth/callback/google',{maxRedirects:0});expect(callback.status()).toBe(302);expect(callback.headers().location).toBe('/sign-in?error=google_login_failed');
 const context=await browser.newContext({storageState:await client.storageState()});
 const first=await context.newPage(),second=await context.newPage();
 await Promise.all([first.goto(baseURL+'/profile'),second.goto(baseURL+'/profile')]);
 await expect(first.locator('.profile-email')).toHaveText(email);await expect(second.locator('.profile-email')).toHaveText(email);
 await context.close();
 await Promise.all([client.dispose(),raw.dispose(),replay.dispose()]);
});
