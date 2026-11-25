import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = resolve(dirname(fileURLToPath(import.meta.url)), 'site');
// The local preview runner supplies these CLI flags; deployment keeps using
// the explicit HOST and PORT environment variables.
const cliValue = (flag) => {
  const index = process.argv.indexOf(flag);
  return index < 0 ? undefined : process.argv[index + 1];
};
const HOST = process.env.HOST || cliValue('--host') || '127.0.0.1';
const PORT = Number.parseInt(process.env.PORT || cliValue('--port') || '4381', 10);
const PUBLIC_BASE_PATH = (process.env.PUBLIC_BASE_PATH || '').replace(/\/$/, '');
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
  if (PUBLIC_BASE_PATH && !/^\/[a-zA-Z0-9/_-]+$/.test(PUBLIC_BASE_PATH)) { res.writeHead(500).end('Invalid public base path'); return; }
  if (PUBLIC_BASE_PATH && pathname === PUBLIC_BASE_PATH) { res.writeHead(308,{Location:PUBLIC_BASE_PATH + '/'}).end(); return; }
  if (PUBLIC_BASE_PATH) {
    if (!pathname.startsWith(PUBLIC_BASE_PATH + '/')) { res.writeHead(404).end(); return; }
    pathname = pathname.slice(PUBLIC_BASE_PATH.length);
  }
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
