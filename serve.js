const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 4173);
const ROOT = path.resolve(__dirname, 'site');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav'
};

function resolvePath(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split('?')[0]).replace(/^\/+/, '');
  const basePath = cleanPath === '' ? 'index.html' : cleanPath;
  const candidate = path.resolve(ROOT, basePath);
  if (!candidate.startsWith(ROOT)) return null;
  return candidate;
}

function tryReadFile(paths, callback) {
  if (paths.length === 0) {
    callback(new Error('Not found'));
    return;
  }

  const current = paths[0];
  fs.readFile(current, (err, data) => {
    if (!err) {
      callback(null, { filePath: current, data });
      return;
    }
    tryReadFile(paths.slice(1), callback);
  });
}

const server = http.createServer((req, res) => {
  const filePath = resolvePath(req.url || '/');
  if (!filePath) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (statErr, stats) => {
    const candidates = [];
    if (!statErr && stats.isDirectory()) {
      candidates.push(path.join(filePath, 'index.html'));
    } else {
      candidates.push(filePath);
      candidates.push(`${filePath}.html`);
      candidates.push(path.join(filePath, 'index.html'));
    }

    tryReadFile(candidates, (readErr, result) => {
      if (readErr || !result) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not found');
        return;
      }

      const ext = path.extname(result.filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });
      res.end(result.data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Sana replica is running on http://localhost:${PORT}`);
});
