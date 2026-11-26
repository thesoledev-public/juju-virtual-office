import test from 'node:test';
import assert from 'node:assert/strict';
import { AMBIENT_INTERVAL_MS, ambientAction, ambientBeat, isAmbientMotion, isSeatedAtComputer, scenePosition, sceneRoute, sceneSeat } from './ambient.mjs';
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
  assert.equal(ambientAction('maya', 2).motion, 'chat');
  assert.equal(ambientAction('leo', 2).motion, 'chat');
  assert.equal(ambientAction('milo', 0).motion, 'camera');
  assert.equal(ambientAction('avery', 0).motion, 'walk');
});

test('eight workers stay seated even when idle and all ten have a grounded chair location', () => {
  const roaming = new Set(['avery','milo']);
  for (const id of ROLE_IDS) {
    const idle = scenePosition(id, false);
    const work = scenePosition(id, true);
    for (const p of [idle, work]) {
      assert.ok(p.x >= 8 && p.x <= 96);
      assert.ok(p.y >= 18 && p.y <= 82);
      assert.ok(Math.abs(p.dx) <= 2 && Math.abs(p.dy) <= 2);
    }
    assert.equal(isSeatedAtComputer(id, false), !roaming.has(id), id);
    assert.equal(isSeatedAtComputer(id, true), true, id);
    assert.deepEqual([work.x,work.y],sceneSeat(id),id);
  }
  assert.deepEqual(scenePosition('dani'), scenePosition('dani', true));
  assert.equal(isSeatedAtComputer('dani', true), true);
  assert.equal(isSeatedAtComputer('noah', true), true);
  assert.equal(isSeatedAtComputer('aria', false), true);
});

test('only two bag-free staff members roam, inside small clear-floor polygons', () => {
  for (const id of ROLE_IDS) {
    const path=sceneRoute(id);
    if (!['avery','milo'].includes(id)) {
      assert.deepEqual(path,[],id);
      for(let beat=0;beat<8;beat++)assert.notEqual(ambientAction(id,beat).motion,'walk',id);
      continue;
    }
    assert.equal(path.length,3,id);
    for (const [x,y] of path) {
      assert.ok(x >= 49 && x <= 92);
      assert.ok(y >= 40 && y <= 46);
    }
    for (let beat=0;beat<16;beat++) {
      const spot=scenePosition(id,false,beat);
      if (ambientAction(id,beat).motion !== 'walk') {
        assert.equal(spot.dx,0);
        assert.equal(spot.dy,0);
      } else {
        assert.deepEqual([spot.x+spot.dx,spot.y+spot.dy],path[1]);
        assert.deepEqual([spot.x+spot.mx,spot.y+spot.my],path[2]);
      }
    }
  }
});

test('ambient beats progress on a bounded wall-clock interval', () => {
  assert.equal(ambientBeat(0), 0);
  assert.equal(ambientBeat(AMBIENT_INTERVAL_MS - 1), 0);
  assert.equal(ambientBeat(AMBIENT_INTERVAL_MS), 1);
});
