import { Catch, ExceptionFilter, ArgumentsHost, HttpException, Injectable, NestInterceptor, ExecutionContext, CallHandler, StreamableFile } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { map } from 'rxjs/operators';
import { HttpError, HttpResult, BinaryResult } from '@everlang/backend/http';
import { log, logError, requestContext, correlationId } from '@everlang/backend/logger';

export function requestLogging(req: Request,res: Response,next: NextFunction) {
  const context={requestId:correlationId(req.get('x-request-id'))};
  res.setHeader('x-request-id',context.requestId);
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  const start=performance.now();
  res.on('finish',()=>requestContext.run(context,()=>log(res.statusCode>=500?'error':res.statusCode>=400?'warn':'info','http.request.completed',{method:req.method,route:req.path,statusCode:res.statusCode,durationMs:Math.round((performance.now()-start)*100)/100})));
  requestContext.run(context,next);
}
export function respondError(error:unknown,res:Response) {
    const candidate=error instanceof HttpError?error.status:error instanceof ZodError||error instanceof SyntaxError?400:error instanceof HttpException?error.getStatus():typeof (error as {status?:unknown})?.status==='number'?(error as {status:number}).status:500;
    const status=Number.isInteger(candidate)&&candidate>=400&&candidate<=599?candidate:500;
    const detail=error instanceof HttpException?error.getResponse():null;
    const object=detail&&typeof detail==='object'?detail as Record<string,unknown>:{};
    const message=error instanceof HttpError?error.message:typeof object.error==='string'?object.error:status===400?'Dữ liệu không hợp lệ.':status===413?'Dữ liệu gửi lên quá lớn.':status>=500?'Lỗi nội bộ máy chủ.':typeof object.message==='string'?object.message:'Yêu cầu không hợp lệ.';
    const requestId=requestContext.getStore()?.requestId||String(res.getHeader('x-request-id')||correlationId());
    const code=error instanceof HttpError&&error.code?error.code:typeof object.code==='string'?object.code:`HTTP_${status}`;
    if(status>=500)logError('http.request.exception',error,{statusCode:status,code});else log('warn','http.request.rejected',{statusCode:status,code});
    res.status(status).json({statusCode:status,code,error:message,requestId,...(typeof object.submissionId==='string'?{submissionId:object.submissionId}:{}),...(object.retryable===true?{retryable:true}:{})});
}
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
 catch(error:unknown,host:ArgumentsHost){respondError(error,host.switchToHttp().getResponse<Response>());}
}
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext,next: CallHandler) {
    const res=context.switchToHttp().getResponse<Response>();
    return next.handle().pipe(map(result=>{
      if(result instanceof HttpResult){if(result.status>=400)throw new HttpException(result.body as object,result.status);res.status(result.status);for(const [k,v]of Object.entries(result.headers))res.setHeader(k,v);return result.body;}
      if(result instanceof BinaryResult){for(const[k,v]of Object.entries(result.options.headers))res.setHeader(k,v);return new StreamableFile(Buffer.from(result.bytes));}
      return result;
    }));
  }
}
