import { afterEach, expect, it, vi } from 'vitest';
import { generateKeyPairSync } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import {createOrmMock} from '../helpers/orm-mock';
const state=vi.hoisted(()=>({read:vi.fn()}));
vi.mock('@everlang/backend/orm',()=>({ormDataSource:createOrmMock(state.read)}));
vi.mock('@everlang/backend/rate-limit',()=>({rateLimit:vi.fn().mockResolvedValue(true)}));
vi.mock('@everlang/backend/redis',()=>({rateLimit:vi.fn().mockResolvedValue(true)}));
import { AuthService } from '../../apps/api/src/auth/auth.service';

afterEach(()=>{vi.unstubAllEnvs();vi.clearAllMocks()});
it('enforces signature algorithm, issuer, audience, expiry and server session authority',async()=>{
 const keys=generateKeyPairSync('rsa',{modulusLength:2048,publicKeyEncoding:{type:'spki',format:'pem'},privateKeyEncoding:{type:'pkcs8',format:'pem'}});
 vi.stubEnv('JWT_PRIVATE_KEY_B64',Buffer.from(keys.privateKey).toString('base64'));vi.stubEnv('JWT_PUBLIC_KEY_B64',Buffer.from(keys.publicKey).toString('base64'));vi.stubEnv('CSRF_SECRET','test-only-secret');vi.stubEnv('ADMIN_EMAILS','');
 const auth=new AuthService(),jwt=new JwtService();
 const sign=(extra:Record<string,unknown>={},options={})=>jwt.signAsync({sub:'user',sid:'session',roles:['admin'],...extra},{privateKey:keys.privateKey,algorithm:'RS256',issuer:'everlang',audience:'everlang-web',expiresIn:900,...options});
 const req=(token:string)=>({get:()=>`Bearer ${token}`} as unknown as Request);
 state.read.mockResolvedValue([{id:'user',email:'learner@example.test',name:'Learner',email_verified:true}]);
 expect(await auth.authenticate(req(await sign()))).toMatchObject({id:'user',admin:false});
 await expect(auth.authenticate(req(await sign({}, {expiresIn:-1})))).rejects.toMatchObject({code:'ACCESS_TOKEN_EXPIRED'});
 await expect(auth.authenticate(req(await sign({}, {audience:'other'})))).rejects.toMatchObject({code:'ACCESS_TOKEN_INVALID'});
 await expect(auth.authenticate(req(await sign({}, {issuer:'other'})))).rejects.toMatchObject({code:'ACCESS_TOKEN_INVALID'});
 const hs=await jwt.signAsync({sub:'user',sid:'session'},{secret:'not-an-rsa-key',algorithm:'HS256'});
 await expect(auth.authenticate(req(hs))).rejects.toMatchObject({code:'ACCESS_TOKEN_INVALID'});
 state.read.mockResolvedValue([]);await expect(auth.authenticate(req(await sign()))).rejects.toMatchObject({code:'SESSION_REVOKED'});
});
