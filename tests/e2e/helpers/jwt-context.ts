import type { APIRequestContext, APIResponse } from '@playwright/test';
const installed=new WeakSet<APIRequestContext>();
/** Real JWT test client: credentials and tokens remain in memory, never in storage fixtures. */
export function installJwtContext(client:APIRequestContext,baseURL:string){
 if(installed.has(client))return;installed.add(client);
 const originalGet=client.get.bind(client);const originalPost=client.post.bind(client);const originalState=client.storageState.bind(client);
 let token='';let credentials:{email:string;password:string}|null=null;
 for(const method of ['get','post','put','patch','delete','fetch'] as const){
  const original=client[method].bind(client);
  Object.assign(client,{[method]:async(url:string,options:NonNullable<Parameters<APIRequestContext['post']>[1]>={})=>{
   const target=new URL(url,baseURL);const local=target.origin===new URL(baseURL).origin&&target.pathname.startsWith('/api/');
   const headers={...options.headers};if(local&&token)headers.Authorization=`Bearer ${token}`;
   if(local&&target.pathname.startsWith('/api/auth/')&&method==='post'){
    const csrf=await(await originalGet('/api/auth/csrf')).json();headers['x-csrf-token']=csrf.csrfToken;headers.Origin=baseURL;
   }
   const data=options.data&&typeof options.data==='object'?{...options.data}:options.data;
   if(local&&target.pathname==='/api/auth/sign-up/email'&&data)delete data.callbackURL;
   const response=await original(url,{...options,data,headers}) as APIResponse;
   if(local&&target.pathname==='/api/auth/sign-in/email'&&response.ok()){
    token=(await response.json()).accessToken;credentials=typeof data==='object'&&data&&'email' in data&&'password' in data?{email:String(data.email),password:String(data.password)}:null;
   }
   return response;
  }});
 }
 Object.assign(client,{storageState:async(options?:Parameters<APIRequestContext['storageState']>[0])=>{
  if(credentials){const csrf=await(await originalGet('/api/auth/csrf')).json();const r=await originalPost('/api/auth/sign-in/email',{data:credentials,headers:{Origin:baseURL,'x-csrf-token':csrf.csrfToken}});if(!r.ok())throw new Error('QA fresh browser session failed');token=(await r.json()).accessToken;}
  return originalState(options);
 }});
}
