const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const host = '0.0.0.0';
const port = Number(process.env.PORT || 3000);
const publicDir = path.join(__dirname, 'www');
const movieApiBaseUrl = (process.env.MOVIE_API_BASE_URL || 'https://darkvibe314-silent-movies-api.hf.space').replace(/\/+$/, '');

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

function send(res, statusCode, headers, body) {
  res.writeHead(statusCode, headers);
  res.end(body);
}

async function proxyMovieRequest(res, targetUrl) {
  try {
    const upstream = await fetch(targetUrl, {
      headers: { 'Accept': 'application/json' }
    });

    const body = await upstream.text();

    send(
      res,
      upstream.status,
      {
        'Content-Type': upstream.headers.get('content-type') || 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
      },
      body
    );
  } catch (error) {
    send(
      res,
      502,
      { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
      JSON.stringify({
        error: 'Movie upstream unavailable',
        message: error.message,
        upstream: movieApiBaseUrl
      })
    );
  }
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

  if (requestUrl.pathname === '/api/movie-search') {
    const query = requestUrl.searchParams.get('query') || 'popular';
    const targetUrl = `${movieApiBaseUrl}/api/search?query=${encodeURIComponent(query)}`;
    proxyMovieRequest(res, targetUrl);
    return;
  }

  if (requestUrl.pathname === '/api/movie-download') {
    const movieId = requestUrl.searchParams.get('movie_id');
    if (!movieId) {
      send(
        res,
        400,
        { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
        JSON.stringify({ error: 'movie_id is required' })
      );
      return;
    }

    const targetUrl = `${movieApiBaseUrl}/api/download?movie_id=${encodeURIComponent(movieId)}`;
    proxyMovieRequest(res, targetUrl);
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
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable'
      },
      data
    );
  });
});

server.listen(port, host, () => {
  console.log(`ZYNREST listening on http://${host}:${port}`);
});
