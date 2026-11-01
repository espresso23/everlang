import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import mongoose from 'mongoose';
import {initializeOrm,closeOrm} from '@everlang/backend/orm';
import {Entities} from '@everlang/backend/entities';
import {connectDb} from '@everlang/backend/db';
import {installProcessErrorHandlers} from '@everlang/backend/process-errors';
installProcessErrorHandlers('orm-import-fixture');
assert.equal(new URL(process.env.DATABASE_URL).pathname,'/everlang_nest_qa_20261101');
assert.equal(new URL(process.env.MONGODB_URI).pathname,'/everlang_nest_qa_20261101');
const ids=[randomUUID(),randomUUID()],legacyId=randomUUID(),email=`${ids[0]}@example.test`,other=`${ids[1]}@example.test`;
const source=await initializeOrm();
try{
  await connectDb();const db=mongoose.connection.db;
  await source.getRepository(Entities.users).insert(ids.map((id,i)=>({id,name:'Import QA',email:i?other:email,email_verified:true})));
  const sentence=await db.collection('sentences').findOne();assert.ok(sentence);
  const report={score:90,accuracyRating:'Excellent',overallComment:'QA',grammarErrors:[],vocabSuggestions:[],advancedRewrites:[1,2,3].map(i=>({style:String(i),text:'한국어',explanation:'QA'}))};
  await db.collection('submissions').insertOne({userId:legacyId,sentenceId:sentence._id,userTranslation:'한국어',submittedAt:new Date(),...report});
  await db.collection('usersentencestates').insertOne({userId:legacyId,sentenceId:sentence._id,favorite:true});
  const run=(target,confirm=true)=>spawnSync(process.execPath,['--import','tsx','scripts/import-records.ts',legacyId,target,...(confirm?['--confirm-owner']:[])],{encoding:'utf8',timeout:30000});
  const denied=run(email,false);assert.equal(denied.status,1);
  const first=run(email);assert.equal(first.status,0,first.stderr);assert.match(first.stdout,/Imported 1 reports/);
  const second=run(email);assert.equal(second.status,0,second.stderr);assert.match(second.stdout,/Imported 0 reports/);
  const stolen=run(other);assert.equal(stolen.status,1);assert.match(stolen.stderr,/process\.(?:uncaught_exception|unhandled_rejection)/);
  assert.equal(await source.getRepository(Entities.submissions).countBy({user_id:ids[0]}),1);
  assert.equal(await source.getRepository(Entities.favorites).countBy({user_id:ids[0]}),1);
  assert.equal(await db.collection('submissions').countDocuments({userId:legacyId}),1);
}finally{
  if(mongoose.connection.db){await mongoose.connection.db.collection('submissions').deleteMany({userId:legacyId});await mongoose.connection.db.collection('usersentencestates').deleteMany({userId:legacyId});}
  await source.getRepository(Entities.legacy_imports).delete({legacy_id:legacyId});
  await source.getRepository(Entities.users).delete(ids);
  await closeOrm();await mongoose.disconnect();
}
console.info(JSON.stringify({result:'PASS',imported:1,reimported:0,ownerGuard:true,mongoOriginalPreserved:true,cleanup:true}));
