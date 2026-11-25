import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = resolve(dirname(fileURLToPath(import.meta.url)), 'site');
const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number.parseInt(process.env.PORT || '4381', 10);
const TYPES = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8', '.png':'image/png', '.svg':'image/svg+xml', '.ico':'image/x-icon', '.json':'application/json; charset=utf-8' };

export function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'");
  if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch { res.writeHead(400).end(); return; }
  if (pathname === '/healthz') { res.writeHead(200,{'Content-Type':'text/plain; charset=utf-8'}).end('ok\n'); return; }
  if (pathname.startsWith('/api/office/')) {
    // Deliberately not a stub that manufactures live status. In production,
    // NPM routes this path to an authenticated private read-only adapter.
    res.writeHead(501, { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store' }).end('{"error":"private office adapter not configured"}');
    return;
  }
  if (pathname === '/') pathname = '/index.html';
  const absolute = resolve(BASE, '.' + normalize(pathname));
  if (absolute !== BASE && !absolute.startsWith(BASE + sep)) { res.writeHead(403).end(); return; }
  if (!existsSync(absolute) || !statSync(absolute).isFile()) { res.writeHead(404).end(); return; }
  const headers = { 'Content-Type': TYPES[extname(absolute)] || 'application/octet-stream', 'Cache-Control': absolute.endsWith('index.html') ? 'no-cache' : 'public, max-age=3600' };
  res.writeHead(200, headers);
  if (req.method === 'HEAD') res.end(); else createReadStream(absolute).pipe(res);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  createServer(handler).listen(PORT, HOST, () => console.log(`JUJU Office static server listening at http://${HOST}:${PORT} (DEMO by default)`));
}
