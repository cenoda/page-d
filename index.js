const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});

const server = http.createServer((req, res) => {
  // 1. PAC 파일 요청은 프록시 타지 말고 바로 응답해줘야지!
  if (req.url === '/proxy.pac') {
    res.writeHead(200, { 'Content-Type': 'application/x-ns-proxy-autoconfig' });
    // 여기서 네 Render 주소를 정확히 써야 해
    res.end(`function FindProxyForURL(url, host) { return "HTTPS sdij.onrender.com:443"; }`);
    return;
  }

  // 2. 목적지 주소가 올바른지 체크 (http로 시작하는지 확인)
  if (req.url.startsWith('http')) {
    proxy.web(req, res, { target: req.url, changeOrigin: true }, (err) => {
      res.writeHead(500);
      res.end("Proxy Error: " + err.message);
    });
  } else {
    // 3. 그냥 접속했을 때는 에러 내지 말고 친절하게 안내해줘 (바보야)
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end("낭만화1, 설정은 잘 됐으니까 이제 아이패드 와이파이 설정에서 PAC 등록해!");
  }
});

// Render에서 주는 포트번호를 써야 배포 실패 안 한다고 했지?
server.listen(process.env.PORT || 3000);
