// Visual-only scene behavior. Coordinates are foot/chair anchors on the exact
// 1672 × 941 empty-office painting; no avatar moves through furniture.
// Only the two designated floor walkers use standing artwork. All other
// virtual staff are seated even without a source-backed assignment.
export const AMBIENT_INTERVAL_MS = 12_000;

const places = Object.freeze({
  // Meeting table: the chair positions are behind the table edge.
  maya:   { seat:[27,44] },
  leo:    { seat:[39,45] },
  // Front workstation chairs; the seated figures face the code monitors.
  dani:   { seat:[47,80] },
  noah:   { seat:[61,76] },
  // Creative, QA, server-room and content workstation chairs.
  aria:   { seat:[21,82] },
  erin:   { seat:[75,61] },
  kai:    { seat:[60,38] },
  sophie: { seat:[88,36] },
  // These two can move through small clear-floor areas, never over the desks.
  avery:  { seat:[35,49], roam:[[49,45],[50,46],[51,45]] },
  milo:   { seat:[81,35], roam:[[91,41],[92,41],[91,40]] }
});

const action = (motion,label,icon) => Object.freeze({motion,label,icon});
const chat = action('chat','Catching up with a colleague','💬');
const phone = action('phone','Checking a message','📱');
const stretch = action('stretch','Taking a short stretch','✦');
const walk = action('walk','Walking through the office','↝');
const coffee = action('coffee','Coffee break','☕');
const think = action('think','Thinking quietly','◌');
const read = action('read','Reading a note','▤');
const plan = action('plan','Sketching ideas on a notepad','✎');
const camera = action('camera','Checking the camera','📷');
const wave = action('wave','Greeting a teammate','👋');
const whiteboard = action('whiteboard','Reviewing the whiteboard','▦');
const relax = action('relax','Taking a breather','✧');

// Seated role-play is understated: no speech bubbles or wild body transforms.
// Avery and Milo carry the movement, in different phases of the cycle.
const patterns = Object.freeze({
  maya:   [read,plan,chat,whiteboard,plan,coffee,read,think],
  leo:    [plan,read,chat,think,read,stretch,plan,coffee],
  dani:   [read,plan,think,read,stretch,plan,read,coffee],
  noah:   [plan,read,think,plan,read,coffee,plan,stretch],
  aria:   [plan,read,plan,think,plan,coffee,read,relax],
  erin:   [read,plan,read,think,plan,stretch,read,coffee],
  kai:    [plan,read,think,plan,read,coffee,read,stretch],
  sophie: [plan,read,plan,coffee,read,think,plan,read],
  avery:  [walk,read,walk,plan,walk,phone,walk,wave],
  milo:   [camera,walk,phone,walk,camera,walk,coffee,walk]
});

export function ambientBeat(now=Date.now()) {
  return Math.max(0,Math.floor(now/AMBIENT_INTERVAL_MS));
}
export function ambientAction(id,beat=ambientBeat()) {
  const pool=patterns[id]||[think];
  return pool[((Math.trunc(beat)%pool.length)+pool.length)%pool.length];
}
export function isSeatedAtComputer(id,hasVerifiedWork=false) {
  return hasVerifiedWork || !places[id]?.roam;
}
export function scenePosition(id,hasVerifiedWork=false,beat=ambientBeat()) {
  const loc=places[id];
  if(!loc)return {x:50,y:50,dx:0,dy:0,mx:0,my:0};
  const path=!hasVerifiedWork&&loc.roam;
  const [x,y]=path ? path[0] : loc.seat;
  if(!path||ambientAction(id,beat).motion!=='walk')return {x,y,dx:0,dy:0,mx:0,my:0};
  return {x,y,dx:path[1][0]-x,dy:path[1][1]-y,mx:path[2][0]-x,my:path[2][1]-y};
}
export function isAmbientMotion(motion) {
  return ['chat','phone','stretch','walk','coffee','think','read','plan','camera','wave','whiteboard','relax'].includes(motion);
}
export function sceneRoute(id){return places[id]?.roam?.map(pair=>[...pair])??[];}
export function sceneSeat(id){return places[id]?.seat ? [...places[id].seat] : null;}
