import test from 'node:test';
import assert from 'node:assert/strict';
import { AMBIENT_INTERVAL_MS, ambientAction, ambientBeat, isAmbientMotion, isSeatedAtComputer, scenePosition } from './ambient.mjs';
import { ROLE_IDS } from './projection.mjs';

test('ambient actions are deterministic, visually distinct and never claim a JUJU Job', () => {
  for (const id of ROLE_IDS) {
    for (let beat = 0; beat < 8; beat++) {
      const a = ambientAction(id, beat);
      assert.equal(isAmbientMotion(a.motion), true);
      assert.ok(a.label.length > 3);
      assert.equal('job_id' in a, false);
    }
  }
  assert.equal(ambientAction('maya', 0).motion, 'chat');
  assert.equal(ambientAction('leo', 0).motion, 'chat');
  assert.equal(ambientAction('milo', 0).motion, 'phone');
  assert.equal(ambientAction('noah', 0).motion, 'walk');
});

test('scene positions avoid the workstation until a verified work state exists', () => {
  for (const id of ROLE_IDS) {
    const idle = scenePosition(id, false);
    const work = scenePosition(id, true);
    for (const p of [idle, work]) {
      assert.ok(p.x >= 8 && p.x <= 96);
      assert.ok(p.y >= 18 && p.y <= 82);
      assert.ok(Math.abs(p.dx) <= 26 && Math.abs(p.dy) <= 12);
    }
  }
  assert.notDeepEqual(scenePosition('dani'), scenePosition('dani', true));
  assert.notDeepEqual(scenePosition('noah'), scenePosition('noah', true));
  assert.equal(isSeatedAtComputer('dani', false), false);
  assert.equal(isSeatedAtComputer('dani', true), true);
  assert.equal(isSeatedAtComputer('noah', true), true);
  assert.equal(isSeatedAtComputer('aria', true), false);
});

test('ambient beats progress on a bounded wall-clock interval', () => {
  assert.equal(ambientBeat(0), 0);
  assert.equal(ambientBeat(AMBIENT_INTERVAL_MS - 1), 0);
  assert.equal(ambientBeat(AMBIENT_INTERVAL_MS), 1);
});
