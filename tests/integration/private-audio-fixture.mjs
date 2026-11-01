import {initializeOrm,closeOrm} from '@everlang/backend/orm';
import {Entities} from '@everlang/backend/entities';
import {writeSpeechAudio,removeSpeechAudio} from '@everlang/backend/speech/storage';
import {createHash,randomUUID} from 'node:crypto';
if(!new URL(process.env.DATABASE_URL).pathname.endsWith('/everlang_nest_qa_20261101'))throw new Error('This fixture only operates on the isolated migration QA database.');
const[action,userId,id]=process.argv.slice(2);
const key=createHash('sha256').update(userId).digest('hex')+'/'+id+'.wav';
try{
 const source=await initializeOrm();
 if(action==='seed'){
  const wav=Buffer.alloc(364);wav.write('RIFF');wav.writeUInt32LE(356,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(16000,24);wav.writeUInt32LE(32000,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(320,40);
  await writeSpeechAudio(key,wav);
  await source.getRepository(Entities.speech_attempts).insert({id,user_id:userId,request_id:randomUUID(),fingerprint:'qa-fixture',file_key:key,mime:'audio/wav',status:'completed',transcript:''});
 }else if(action==='remove'){await source.getRepository(Entities.speech_attempts).delete({id,user_id:userId});await removeSpeechAudio(key);}
 else throw new Error('Unknown fixture action');
}finally{await closeOrm();}
