"use client";
import { useEffect, useSyncExternalStore, type ReactNode } from 'react';
type User = {id:string;name:string;email:string;image?:string|null;emailVerified:boolean;admin:boolean};
type Snapshot = {data:{user:User}|null;isPending:boolean;error:Error|null};
let snapshot:Snapshot={data:null,isPending:true,error:null};
const serverSnapshot:Snapshot={data:null,isPending:true,error:null};
let accessToken:string|null=null;
let initialized=false;
let refreshing:Promise<void>|null=null;
const listeners=new Set<()=>void>();
let channel:BroadcastChannel|null=null;
function update(next:Snapshot){snapshot=next;for(const listener of listeners)listener();}
function signedOut(){accessToken=null;update({data:null,isPending:false,error:null});}
async function csrf(){const r=await fetch('/api/auth/csrf',{credentials:'same-origin',cache:'no-store'});if(!r.ok)throw new Error('Chưa kết nối được dịch vụ đăng nhập.');return (await r.json()).csrfToken as string;}
async function authRequest(path:string,body:unknown={}){
 const headers=new Headers({'Content-Type':'application/json','x-csrf-token':await csrf(),'x-request-id':crypto.randomUUID()});
 if(accessToken)headers.set('Authorization',`Bearer ${accessToken}`);
 return fetch('/api/auth/'+path,{method:'POST',credentials:'same-origin',headers,body:JSON.stringify(body)});
}
async function refresh(){
 if(refreshing)return refreshing;
 const run=async()=>{
  const r=await authRequest('refresh');const b=await r.json();
  if(!r.ok){if(r.status===401){signedOut();return;}throw new Error(b.error||'Chưa kết nối được dịch vụ đăng nhập.');}
  accessToken=b.accessToken;update({data:{user:b.user},isPending:false,error:null});
 };
 refreshing=(async()=>{if(typeof navigator!=='undefined'&&navigator.locks)await navigator.locks.request('everlang-auth-refresh',run);else await run();})().finally(()=>{refreshing=null});
 return refreshing;
}
async function bootstrap(){
 if(initialized){if(refreshing)await refreshing;return;}
 initialized=true;
 try{await refresh();}catch(e){update({...snapshot,isPending:false,error:e instanceof Error?e:new Error('Không kết nối được.')});}
}
export function AuthProvider({children}:{children:ReactNode}){
 useEffect(()=>{
  channel=new BroadcastChannel('everlang-auth');channel.onmessage=e=>{if(e.data==='logout')signedOut();};
  void bootstrap();return()=>{channel?.close();channel=null};
 },[]);
 return children;
}
export function useAuth(){
 const value=useSyncExternalStore(listener=>{listeners.add(listener);return()=>listeners.delete(listener)},()=>snapshot,()=>serverSnapshot);
 return {...value,refetch:async(_options?:unknown)=>{
  if(!accessToken){await refresh();return;}
  const r=await apiFetch('/api/auth/me');if(!r.ok)throw new Error('Không tải được tài khoản.');update({data:await r.json(),isPending:false,error:null});
 }};
}
export async function apiFetch(input:RequestInfo|URL,init:RequestInit={}){
 await bootstrap();
 const send=()=>{const headers=new Headers(init.headers);if(accessToken)headers.set('Authorization',`Bearer ${accessToken}`);if(!headers.has('x-request-id'))headers.set('x-request-id',crypto.randomUUID());return fetch(input,{...init,headers,credentials:'same-origin'});};
 let response=await send();
 if(response.status===401){
  const b=await response.clone().json().catch(()=>({}));
  if(b.code==='ACCESS_TOKEN_EXPIRED'){await refresh();if(accessToken)response=await send();}
  else if(b.code==='SESSION_REVOKED'){signedOut();channel?.postMessage('logout');}
 }
 return response;
}
async function execute(path:string,body:unknown={}){
 try{await bootstrap();let r=await authRequest(path,body);let b=await r.json();
  if(r.status===401&&b.code==='ACCESS_TOKEN_EXPIRED'){await refresh();if(accessToken){r=await authRequest(path,body);b=await r.json();}}
  if(!r.ok)return {error:{message:b.error||'Không thể thực hiện.',code:b.code}};
  if(b.accessToken){accessToken=b.accessToken;update({data:{user:b.user},isPending:false,error:null});}
  return {data:b,error:null};
 }catch(e){return {error:{message:e instanceof Error?e.message:'Không kết nối được.'}};}
}
export const auth={
 signUp:{email:({email,password,name}:{email:string;password:string;name:string;callbackURL?:string})=>execute('sign-up/email',{email,password,name})},
 signIn:{email:(b:{email:string;password:string})=>execute('sign-in/email',b),social:async({callbackURL='/',provider:_provider}: {provider:string;callbackURL?:string;errorCallbackURL?:string})=>{
  const result=await execute('google/start',{callbackURL,link:false});if(result.data?.url)window.location.assign(result.data.url);return result;
 }},
 linkSocial:async({callbackURL='/profile',provider:_provider}:{provider:string;callbackURL?:string;errorCallbackURL?:string})=>{const result=await execute('google/start',{callbackURL,link:true});if(result.data?.url)window.location.assign(result.data.url);return result;},
 requestPasswordReset:({email}:{email:string;redirectTo?:string})=>execute('request-password-reset',{email}),
 resetPassword:(b:{newPassword:string;token:string})=>execute('reset-password',b),
 changePassword:async({currentPassword,newPassword}:{currentPassword:string;newPassword:string;revokeOtherSessions?:boolean})=>{const r=await execute('change-password',{currentPassword,newPassword});if(!r.error){signedOut();channel?.postMessage('logout');}return r;},
 signOut:async()=>{const result=await execute('logout');if(!result.error){signedOut();channel?.postMessage('logout');}return result;},
};
