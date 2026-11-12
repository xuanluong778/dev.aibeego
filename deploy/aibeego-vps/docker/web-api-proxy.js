const http = require('http');

// Server-side code was built with http://localhost:8080. Forward that to the API.
const server = http.createServer((req, res) => {
  const headers = { ...req.headers, host: 'api:4000' };
  const upstream = http.request(
    {
      hostname: 'api',
      port: 4000,
      path: req.url,
      method: req.method,
      headers,
    },
    (up) => {
      res.writeHead(up.statusCode || 502, up.headers);
      up.pipe(res);
    },
  );
  upstream.on('error', () => {
    if (!res.headersSent) res.writeHead(502);
    res.end();
  });
  req.pipe(upstream);
});

server.listen(8080, '127.0.0.1');
