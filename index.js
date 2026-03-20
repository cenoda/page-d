const http = require('http');
const httpProxy = require('http-proxy');
const net = require('net');

const proxy = httpProxy.createProxyServer({});

const server = http.createServer((req, res) => {
  // 1. PAC 파일 요청 (이건 무조건 살려야지!)
  if (req.url === '/proxy.pac') {
    res.writeHead(200, { 'Content-Type': 'application/x-ns-proxy-autoconfig' });
    res.end(`function FindProxyForURL(url, host) { return "HTTPS sdij.onrender.com:443"; }`);
    return;
  }

  // 2. 일반 HTTP 프록시 로직
  proxy.web(req, res, { target: req.url, changeOrigin: true }, (err) => {
    if (res.headersSent) return;
    res.writeHead(500);
    res.end("Proxy Error");
  });
});

// 3. 이게 핵심! HTTPS 터널링(CONNECT) 처리
server.on('connect', (req, cltSocket, head) => {
  const [host, port] = req.url.split(':');
  const srvSocket = net.connect(port || 443, host, () => {
    cltSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    srvSocket.write(head);
    srvSocket.pipe(cltSocket);
    cltSocket.pipe(srvSocket);
  });
  
  srvSocket.on('error', () => cltSocket.end());
  cltSocket.on('error', () => srvSocket.end());
});

server.listen(process.env.PORT || 3000);
