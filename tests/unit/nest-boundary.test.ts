import { afterEach, expect, it, vi } from 'vitest';
import type { Response } from 'express';
import { HttpException } from '@nestjs/common';
import { respondError } from '../../apps/api/src/http-boundary';
import { requestContext } from '@everlang/backend/logger';
afterEach(()=>vi.restoreAllMocks());
function response(){const value={status:vi.fn(),json:vi.fn(),getHeader:()=>undefined};value.status.mockReturnValue(value);return value;}
it('normalizes unexpected errors without exposing server details',()=>{
 const out=vi.spyOn(console,'error').mockImplementation(()=>{}),res=response();
 requestContext.run({requestId:'boundary-test-id'},()=>respondError(new Error('private server detail'),res as unknown as Response));
 expect(res.status).toHaveBeenCalledWith(500);expect(res.json).toHaveBeenCalledWith({statusCode:500,code:'HTTP_500',error:'Lỗi nội bộ máy chủ.',requestId:'boundary-test-id'});
 expect(JSON.parse(out.mock.calls[0][0])).toMatchObject({event:'http.request.exception',requestId:'boundary-test-id',statusCode:500});
});
it('preserves the explicit grading retry contract and rejects invalid status values',()=>{
 vi.spyOn(console,'warn').mockImplementation(()=>{});vi.spyOn(console,'error').mockImplementation(()=>{});
 const res=response();respondError(new HttpException({error:'Retry required',code:'GRADING_PREVIOUS_FAILED',submissionId:'submission',retryable:true},409),res as unknown as Response);
 expect(res.status).toHaveBeenCalledWith(409);expect(res.json.mock.calls[0][0]).toMatchObject({code:'GRADING_PREVIOUS_FAILED',submissionId:'submission',retryable:true});
 const unknown=response();respondError({status:200,message:'untrusted'},unknown as unknown as Response);expect(unknown.status).toHaveBeenCalledWith(500);
});
