import {query,pool} from '@everlang/backend/sql';
import {writeSpeechAudio,removeSpeechAudio} from '@everlang/backend/speech/storage';
import {createHash,randomUUID} from 'node:crypto';
if(!new URL(process.env.DATABASE_URL).pathname.endsWith('/everlang_nest_qa_20261101'))throw new Error('This fixture only operates on the isolated migration QA database.');
const[action,userId,id]=process.argv.slice(2);
const key=createHash('sha256').update(userId).digest('hex')+'/'+id+'.wav';
try{
 if(action==='seed'){
  const wav=Buffer.alloc(364);wav.write('RIFF');wav.writeUInt32LE(356,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(16000,24);wav.writeUInt32LE(32000,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(320,40);
  await writeSpeechAudio(key,wav);
  await query("INSERT INTO speech_attempts(id,user_id,request_id,fingerprint,file_key,mime,status,transcript) VALUES($1,$2,$3,'qa-fixture',$4,'audio/wav','completed','')",[id,userId,randomUUID(),key]);
 }else if(action==='remove'){await query('DELETE FROM speech_attempts WHERE id=$1 AND user_id=$2',[id,userId]);await removeSpeechAudio(key);}
 else throw new Error('Unknown fixture action');
}finally{await pool.end();}
