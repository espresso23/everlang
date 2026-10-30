import { afterEach, expect, it, vi } from "vitest";
import { gradeTranslation } from "../../lib/ai";
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();});
it('rejects punctuation-only corrections while retaining actual Korean errors',async()=>{
 vi.stubEnv('OPENROUTER_API_KEY','local-test-key');
 const fetchMock=vi.fn().mockResolvedValue(new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({score:95,accuracyRating:'Redo',overallComment:'Đúng nghĩa',grammarErrors:[{error:'해방시키는 것이다',correction:'해방시키는 것이다.',explanation:'Thêm dấu chấm'},{error:'사람가',correction:'사람이',explanation:'Tiểu từ chủ ngữ'}],vocabSuggestions:[{original:'không có trong bài',suggested:'해방',reason:'Invalid quote'}],advancedRewrites:[{style:'A',text:'사람이 해방된다.',explanation:'A'},{style:'B',text:'사람이 해방된다.',explanation:'B'},{style:'C',text:'사람이 해방된다.',explanation:'C'}]})}}]}),{status:200,headers:{'Content-Type':'application/json'}}));
 vi.stubGlobal('fetch',fetchMock);
 const r=await gradeTranslation({viText:'Giải phóng con người',level:'TOPIK 5',koSampleAnswer:'사람이 해방된다.',userTranslation:'사람가 해방시키는 것이다'});
 expect(r.grammarErrors).toHaveLength(1);expect(r.grammarErrors[0].error).toBe('사람가');expect(r.vocabSuggestions).toEqual([]);expect(r.accuracyRating).toBe('Excellent');
 const body=JSON.parse(fetchMock.mock.calls[0][1].body);expect(body.messages[0].content).toContain('Bỏ qua hoàn toàn');
});
