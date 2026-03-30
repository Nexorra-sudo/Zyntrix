const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const cors = require('cors');

const host = '0.0.0.0';
const PORT = process.env.PORT || 3000;
const publicDir = __dirname;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8'
};

function getCacheControl(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const base = path.basename(filePath).toLowerCase();

  // These files change between deploys and are loaded by stable URLs.
  if (ext === '.html' || ext === '.js' || ext === '.css' || ext === '.json' || base === 'service-worker.js') {
    return 'no-cache';
  }

  return 'public, max-age=31536000, immutable';
}

function send(res, statusCode, headers, body) {
  res.writeHead(statusCode, headers);
  res.end(body);
}



function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  return normalized === path.sep ? '/index.html' : normalized;
}

function resolveFile(urlPath) {
  const candidate = safePath(urlPath);
  const fullPath = path.join(publicDir, candidate);

  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    return fullPath;
  }

  if (!path.extname(candidate)) {
    const htmlPath = path.join(publicDir, `${candidate}.html`);
    if (fs.existsSync(htmlPath) && fs.statSync(htmlPath).isFile()) {
      return htmlPath;
    }
  }

  return path.join(publicDir, 'index.html');
}

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (!req.url) {
    send(res, 400, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Bad Request');
    return;
  }

  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (requestUrl.pathname === '/health') {
    send(
      res,
      200,
      { 'Content-Type': 'application/json; charset=utf-8' },
      JSON.stringify({ status: 'ok', movieApiBaseUrl })
    );
    return;
  }



  const filePath = resolveFile(requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname);

  fs.readFile(filePath, (error, data) => {
    if (error) {
      send(res, 404, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    send(
      res,
      200,
      {
        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
        'Cache-Control': getCacheControl(filePath)
      },
      data
    );
  });
});

server.listen(PORT, host, () => {
  console.log(`Server running on port ${PORT}`);
});
