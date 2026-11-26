// Visual-only life, never an authoritative JUJU Job. Every coordinate is a
// character foot anchor in the original 1672 × 941 floor artwork.
export const AMBIENT_INTERVAL_MS = 12_000;

// Walk routes are deliberately short and restricted to clear floor aisles;
// avatars may not freely drift through desks, planters or glass partitions.
const places = Object.freeze({
  maya:   { idle:[45,46], work:[46,47], walk:[[45,46],[46,48],[47,49]] },
  leo:    { idle:[50,49], work:[48,52], walk:[[50,49],[51,51],[52,50]] },
  dani:   { idle:[54,81], work:[48,77], walk:[[54,81],[55,78],[56,79]] },
  noah:   { idle:[65,69], work:[61,74], walk:[[65,69],[66,68],[65,66]] },
  aria:   { idle:[31,77], work:[31,72], walk:[[31,77],[32,74],[33,72]] },
  erin:   { idle:[76,70], work:[78,65], walk:[[76,70],[77,72],[75,73]] },
  kai:    { idle:[56,40], work:[56,42], walk:[[56,40],[55,43],[53,45]] },
  avery:  { idle:[36,61], work:[37,62], walk:[[36,61],[38,60],[39,58]] },
  sophie: { idle:[80,39], work:[82,39], walk:[[80,39],[79,41],[78,40]] },
  milo:   { idle:[93,37], work:[93,38], walk:[[93,37],[91,39],[90,38]] }
});

const action = (motion,label,icon) => Object.freeze({motion,label,icon});
const chat = action('chat','Catching up with a colleague','💬');
const phone = action('phone','Checking a message','📱');
const stretch = action('stretch','Stretching between tasks','✦');
const walk = action('walk','Walking through the office','↝');
const coffee = action('coffee','Coffee break','☕');
const think = action('think','Thinking quietly','◌');
const read = action('read','Reading a note','▤');
const plan = action('plan','Sketching ideas on a notepad','✎');
const camera = action('camera','Checking the camera','📷');
const wave = action('wave','Greeting a teammate','👋');
const whiteboard = action('whiteboard','Looking over the whiteboard','▦');
const relax = action('relax','Taking a breather','✧');

// Eight distinct beats prevent all ten characters gesturing in sync. Maya
// and Leo have paired conversations at a fixed safe distance.
const patterns = Object.freeze({
  maya:   [chat,whiteboard,plan,chat,wave,coffee,think,chat],
  leo:    [chat,plan,wave,chat,read,stretch,chat,coffee],
  dani:   [read,stretch,walk,coffee,phone,plan,read,relax],
  noah:   [phone,walk,read,stretch,coffee,wave,walk,think],
  aria:   [plan,read,stretch,walk,plan,coffee,wave,read],
  erin:   [read,coffee,walk,plan,stretch,read,phone,wave],
  kai:    [phone,read,stretch,walk,coffee,think,wave,phone],
  avery:  [read,plan,walk,stretch,whiteboard,read,coffee,wave],
  sophie: [plan,read,phone,coffee,stretch,plan,walk,wave],
  milo:   [camera,phone,walk,read,camera,wave,phone,coffee]
});

export function ambientBeat(now=Date.now()) {
  return Math.max(0,Math.floor(now/AMBIENT_INTERVAL_MS));
}
export function ambientAction(id,beat=ambientBeat()) {
  const pool=patterns[id]||[think];
  return pool[((Math.trunc(beat)%pool.length)+pool.length)%pool.length];
}
export function scenePosition(id,hasVerifiedWork=false,beat=ambientBeat()) {
  const loc=places[id];
  if(!loc)return {x:50,y:50,dx:0,dy:0,mx:0,my:0};
  const [x,y]=hasVerifiedWork?loc.work:loc.idle;
  if(hasVerifiedWork||ambientAction(id,beat).motion!=='walk')return {x,y,dx:0,dy:0,mx:0,my:0};
  const end=loc.walk[1],middle=loc.walk[2];
  return {x,y,dx:end[0]-x,dy:end[1]-y,mx:middle[0]-x,my:middle[1]-y};
}
export function isSeatedAtComputer(id,hasVerifiedWork=false) {
  return hasVerifiedWork&&(id==='dani'||id==='noah');
}
export function isAmbientMotion(motion) {
  return ['chat','phone','stretch','walk','coffee','think','read','plan','camera','wave','whiteboard','relax'].includes(motion);
}
export function sceneRoute(id){return places[id]?.walk.map(pair=>[...pair])??[];}
