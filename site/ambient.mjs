// Visual-only office life. These actions never originate from, or imply, a
// JUJU Job. The real work state and source remain exclusively in the live
// snapshot; a disconnected office can still have people taking a break.
export const AMBIENT_INTERVAL_MS = 14_000;

const places = {
  maya:   { idle: [38, 48], work: [29, 48], dx: 14, dy: -9 },
  leo:    { idle: [45, 45], work: [40, 48], dx: -12, dy: 7 },
  dani:   { idle: [55, 45], work: [48, 74], dx: 24, dy: -8 },
  noah:   { idle: [61, 49], work: [61, 73], dx: -22, dy: -9 },
  aria:   { idle: [22, 75], work: [24, 74], dx: 16, dy: 0 },
  erin:   { idle: [89, 62], work: [78, 61], dx: -15, dy: 6 },
  kai:    { idle: [55, 37], work: [62, 39], dx: 14, dy: -9 },
  avery:  { idle: [42, 52], work: [38, 63], dx: 19, dy: -6 },
  sophie: { idle: [85, 34], work: [85, 36], dx: -12, dy: -9 },
  milo:   { idle: [95, 42], work: [93, 37], dx: -15, dy: 4 }
};

const action = (motion, label, icon) => Object.freeze({ motion, label, icon });
const chat = action('chat', 'Quick chat', '💬');
const phone = action('phone', 'Checking phone', '📱');
const stretch = action('stretch', 'Stretch break', '✦');
const walk = action('walk', 'Taking a short walk', '↝');
const coffee = action('coffee', 'Coffee break', '☕');
const think = action('think', 'Looking around', '◌');
const read = action('read', 'Reading a note', '▤');

// Each 14-second beat contains a conversation pair, a phone interaction and
// at least one roaming employee. The patterns shift between beats so the
// floor does not look like a synchronized looping screensaver.
const patterns = {
  maya: [chat, chat, coffee, chat],
  leo: [chat, chat, stretch, chat],
  dani: [stretch, phone, coffee, walk],
  noah: [walk, stretch, phone, walk],
  aria: [read, coffee, stretch, walk],
  erin: [coffee, walk, read, stretch],
  kai: [phone, stretch, walk, coffee],
  avery: [walk, read, coffee, walk],
  sophie: [read, phone, coffee, read],
  milo: [phone, phone, walk, phone]
};

export function ambientBeat(now = Date.now()) {
  return Math.max(0, Math.floor(now / AMBIENT_INTERVAL_MS));
}

export function ambientAction(id, beat = ambientBeat()) {
  const choices = patterns[id] || [think];
  return choices[((Math.trunc(beat) % choices.length) + choices.length) % choices.length];
}

export function scenePosition(id, hasVerifiedWork = false) {
  const location = places[id];
  if (!location) return { x: 50, y: 50, dx: 0, dy: 0 };
  const [x, y] = hasVerifiedWork ? location.work : location.idle;
  return { x, y, dx: location.dx, dy: location.dy };
}

export function isSeatedAtComputer(id, hasVerifiedWork = false) {
  return hasVerifiedWork && (id === 'dani' || id === 'noah');
}

export function isAmbientMotion(motion) {
  return ['chat', 'phone', 'stretch', 'walk', 'coffee', 'think', 'read'].includes(motion);
}
