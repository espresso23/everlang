import {test,expect} from '@playwright/test';
import {randomUUID} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {verifiedAccount} from './helpers/account';
test('private audio uses Bearer ownership and blob playback clears on logout',async({playwright,request,browser,baseURL})=>{
 test.skip(process.env.E2E_NATIVE_MEDIA!=='1','Explicit isolated Docker migration QA only.');
 const a=await playwright.request.newContext({baseURL}),b=await playwright.request.newContext({baseURL});
 const password=randomUUID()+'Aa1!';
 await verifiedAccount(a,request,baseURL!,`audio-${randomUUID()}@example.test`,password);
 await verifiedAccount(b,request,baseURL!,`other-${randomUUID()}@example.test`,password);
 const user=(await(await a.get('/api/auth/me')).json()).user,id=randomUUID();
 execFileSync('docker',['compose','-f','docker-compose.yml','-f','tests/integration/compose.nest-qa.yml','cp','tests/integration/private-audio-fixture.mjs','nest-qa-api:/app/private-audio-fixture.mjs'],{stdio:'pipe'});
 // /app is the package resolution root; use it directly for the fixture command.
 const fixture=(action:string)=>execFileSync('docker',['compose','-f','docker-compose.yml','-f','tests/integration/compose.nest-qa.yml','exec','-T','nest-qa-api','node','/app/private-audio-fixture.mjs',action,user.id,id],{stdio:'pipe'});
 try{
  fixture('seed');const own=await a.get('/api/speech/audio?id='+id);expect(own.status()).toBe(200);expect(own.headers()['content-type']).toContain('audio/wav');expect((await own.body()).length).toBe(364);
  expect((await b.get('/api/speech/audio?id='+id)).status()).toBe(404);expect((await request.get('/api/speech/audio?id='+id)).status()).toBe(401);
  const context=await browser.newContext({storageState:await a.storageState()});const page=await context.newPage();await page.goto(baseURL+'/speech');
  const audio=page.locator('audio[src^="blob:"]');await expect(audio).toHaveCount(1);
  await page.evaluate(()=>{const c=new BroadcastChannel('everlang-auth');c.postMessage('logout');c.close()});
  await expect(audio).toHaveCount(0);await context.close();
 }finally{fixture('remove');await a.dispose();await b.dispose();}
});
