"use client";
import { useEffect, useState } from 'react';
import { apiFetch, useAuth } from '@/lib/auth';
export function PrivateAudio({id}:{id:string}){
 const {data}=useAuth();const userId=data?.user.id;const[url,setUrl]=useState('');const[error,setError]=useState('');
 useEffect(()=>{
  let live=true,objectUrl='';const controller=new AbortController();
  if(!userId)return;
  void apiFetch('/api/speech/audio?id='+encodeURIComponent(id),{signal:controller.signal}).then(async r=>{if(!r.ok)throw new Error('Chưa tải được bản ghi.');objectUrl=URL.createObjectURL(await r.blob());if(live)setUrl(objectUrl);else URL.revokeObjectURL(objectUrl)}).catch(e=>{if(live&&!controller.signal.aborted)setError(e.message)});
  return()=>{live=false;controller.abort();if(objectUrl)URL.revokeObjectURL(objectUrl)};
 },[id,userId]);
 if(!data?.user)return null;
 return error?<p role="alert">{error}</p>:url?<audio className="speech-player" controls src={url}/>:<p role="status">Đang tải bản ghi…</p>;
}
