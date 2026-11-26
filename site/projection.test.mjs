import test from 'node:test';
import assert from 'node:assert/strict';
import { demoSnapshot } from './data.mjs';
import { escapeHTML, isActive, sanitizeSnapshot, LIVE_STALE_AFTER_MS } from './projection.mjs';

test('all ten distinct office roles are represented in synthetic sample', () => {
  assert.equal(demoSnapshot.staff.length, 10);
  assert.equal(new Set(demoSnapshot.staff.map(s => s.role)).size, 10);
  assert.ok(demoSnapshot.staff.some(s => s.role === 'Content Writer'));
  assert.ok(demoSnapshot.staff.some(s => s.role === 'Social Media Specialist'));
  assert.equal(demoSnapshot.mode, 'demo');
});
test('read-only projection rejects demo content from the live provider', () => {
  assert.throws(() => sanitizeSnapshot(demoSnapshot), /Unrecognized/);
});
test('stale connection cannot leave workers visually running', () => {
  const now = Date.now();
  const projected = sanitizeSnapshot({ ...demoSnapshot, mode: 'live', observed_at: new Date(now - LIVE_STALE_AFTER_MS - 1).toISOString() }, now);
  assert.equal(projected.stale, true);
  assert.ok(projected.staff.every(s => s.state === 'stale'));
  assert.ok(projected.staff.every(s => !isActive(s.state)));
});
test('untrusted labels and links are controlled', () => {
  const payload = { ...demoSnapshot, mode: 'live', observed_at: new Date().toISOString(), staff: [{ ...demoSnapshot.staff[0], evidence_url: 'javascript:alert(1)', task: '<img src=x onerror=alert(1)>' }] };
  const projected = sanitizeSnapshot(payload);
  assert.equal(projected.staff[0].evidence_url, null);
  assert.equal(escapeHTML(projected.staff[0].task), '&lt;img src=x onerror=alert(1)&gt;');
});
