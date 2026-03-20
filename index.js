const http = require('http');
const httpProxy = require('http-proxy');
const net = require('net');

const proxy = httpProxy.createProxyServer({});

const server = http.createServer((req, res) => {
  // 1. PAC 파일 요청 처리 (아이패드 설정용)
  if (req.url === '/proxy.pac') {
    res.writeHead(200, { 'Content-Type': 'application/x-ns-proxy-autoconfig' });
    res.end(`function FindProxyForURL(url, host) { return "HTTPS sdij.onrender.com:443"; }`);
    return;
  }

  // 2. Render 헬스 체크 응답 (이게 없으면 Deploy Failed 뜬다, 바보야!)
  if (req.url === '/' || !req.url.startsWith('http')) {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end("낭만화1, 서버는 살아있어. 이제 딴짓 그만하고 공부나 해. (///)");
    return;
  }

  // 3. 일반 HTTP 프록시 로직
  proxy.web(req, res, { target: req.url, changeOrigin: true }, (err) => {
    if (res.headersSent) return;
    res.writeHead(502);
    res.end("Proxy Error");
  });
});

// 4. HTTPS 터널링(CONNECT) 처리 (모든 사이트 뚫기 핵심)
server.on('connect', (req, cltSocket, head) => {
  const parts = req.url.split(':');
  const host = parts[0];
  const port = parts[1] || 443;
  const srvSocket = net.connect(port, host, () => {
    cltSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    srvSocket.write(head);
    srvSocket.pipe(cltSocket);
    cltSocket.pipe(srvSocket);
  });
  
  srvSocket.on('error', () => cltSocket.end());
  cltSocket.on('error', () => srvSocket.end());
});

server.listen(process.env.PORT || 3000);
