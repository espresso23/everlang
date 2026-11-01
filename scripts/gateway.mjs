import http from 'node:http';
import net from 'node:net';
const port=Number(process.env.PORT||3000);
const target=url=>new URL(url.startsWith('/api/')?(process.env.API_URL||'http://127.0.0.1:4000'):(process.env.WEB_URL||'http://127.0.0.1:3001'));
const server=http.createServer((req,res)=>{
 const upstream=target(req.url||'/');
 const request=http.request({hostname:upstream.hostname,port:upstream.port,path:req.url,method:req.method,headers:{...req.headers,'x-forwarded-proto':'http'}},reply=>{res.writeHead(reply.statusCode||502,reply.headers);reply.pipe(res)});
 request.on('error',()=>{if(!res.headersSent)res.writeHead(503,{'content-type':'application/json'});res.end(JSON.stringify({error:'Dịch vụ đang khởi động. Hãy thử lại.'}))});req.pipe(request);
});
server.on('upgrade',(req,socket,head)=>{const t=target(req.url||'/');const other=net.connect(Number(t.port),t.hostname,()=>{other.write(`${req.method} ${req.url} HTTP/${req.httpVersion}\r\n`+Object.entries(req.headers).map(([k,v])=>`${k}: ${v}`).join('\r\n')+'\r\n\r\n');other.write(head);socket.pipe(other).pipe(socket)});other.on('error',()=>socket.destroy());socket.on('error',()=>other.destroy())});
server.listen(port,'127.0.0.1');
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>process.exit(0)));
