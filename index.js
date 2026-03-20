const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});

const server = http.createServer((req, res) => {
  // 1. PAC 파일 요청 처리 (아이패드 설정용)
  if (req.url === '/proxy.pac') {
    res.writeHead(200, { 'Content-Type': 'application/x-ns-proxy-autoconfig' });
    // 여기서 네 커스텀 도메인(sdij 포함된 거)을 꼭 써야 해!
    res.end(`function FindProxyForURL(url, host) { return "HTTPS study.sdij.cloud:443"; }`);
    return;
  }

  // 2. 실제 프록시 동작 (모든 트래픽 토스)
  proxy.web(req, res, { target: req.url, changeOrigin: true }, (e) => {
    res.writeHead(500);
    res.end();
  });
});

server.listen(process.env.PORT || 3000);