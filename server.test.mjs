import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { handler } from './server.mjs';

test('static server serves the scene and does not fake live API', async () => {
  const server = createServer(handler);
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const port = server.address().port;
  try {
    const html = await fetch(`http://127.0.0.1:${port}/`);
    assert.equal(html.status,200);
    assert.match(await html.text(), /JUJU OFFICE/);
    const live = await fetch(`http://127.0.0.1:${port}/api/office/v1/snapshot`);
    assert.equal(live.status,501);
    assert.match(await live.text(), /not configured/);
    const health = await fetch(`http://127.0.0.1:${port}/healthz`);
    assert.equal(health.status,200);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
