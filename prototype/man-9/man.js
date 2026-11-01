// ================= Màn 9 · Về nhà (hết game): an early spring morning, Tò walks home to bà Năm's street using everything he has learned =================
// rooms (x): 1 mưa bóng mây -8..32 · 2 xôi bà Mười 32..56 · 3 kênh 56..80 · 4 lò bánh 80..104 · 5 ngõ đèn lồng 104..128
//            6 cầu thiếu ván 128..152 · 7 cổng Lũ Bụi 152..176 · 8 chong chóng 176..200 · 9 sạp tò he bà Năm 200..226
LV.level = 9;
LV.start = {x:-3.5, y:0};
LV.bounds = [-7.5, 225.5];
LV.cam = [0, 220];
const ROOMS = ['r1','r2','r3','r4','r5','r6','r7','r8','r9'];
LV.sky = ROOMS;
function zoneFor(x){ return x < 32 ? 'r1' : x < 56 ? 'r2' : x < 80 ? 'r3' : x < 104 ? 'r4' : x < 128 ? 'r5' : x < 152 ? 'r6' : x < 176 ? 'r7' : x < 200 ? 'r8' : 'r9'; }
// grey is a misty dawn; the colour that comes back is a clear spring morning
SKY.g.top.set('#8A8F98'); SKY.g.mid.set('#A6A8AC'); SKY.g.bot.set('#BDBAB5');
SKY.c.top.set('#5A9BDA'); SKY.c.mid.set('#B5DDEE'); SKY.c.bot.set('#FFE6C2');
LIGHT.fog.set('#D6E6EA'); LIGHT.sun.set('#FFF2D8');
LV.camY = (x, y)=> y < 4.5 ? 2.8 + Math.max(0, y - 1)*.55 : y + 1.4;
const heldIs = f => held.on && held.form === f;
const kiteOn = ()=>heldIs('dieu');
// a sun shower over the first stretch of street
LV.rain = (x, y)=> x > 5 && x < 29;
LV.wetT = 2.2; LV.nonT = 8;

// ================= ground: the street, two canals, a broken bridge =================
const GAPS = [[136, 146], [184, 195]];
const CANAL = [62, 74];
const LANDS = [[-14, 62], [74, 136], [146, 184], [195, 232]];
for(const [x0, x1] of LANDS){
  for(let a = x0; a < x1; a += 12){ const b = Math.min(x1, a + 12); ZONE = zoneFor(a + .1);
    box(W, a, b, -2, 0, -6, 3, '#C9C3BA', {outline:false, uv:[3.2, 3.2], map:TEX.pave});
    box(W, a, b, -.02, .06, 2.6, 2.9, '#A8998A', {outline:false}); }
  block(x0, x1, -5, 0);
  // the wet stretch is not a safe spot, so going soggy sends him back to the dry end of the street
  if(x0 < 4 && x1 > 30){ plat(x0, 4, 0, false, null, {safe:true}); plat(4, 30, 0); plat(30, x1, 0, false, null, {safe:true}); }
  else plat(x0, x1, 0, false, null, {safe:true});
}
for(const [x0, x1] of GAPS){
  ZONE = zoneFor(x0 + .1);
  box(W, x0, x1, -3, -.7, -6, 3, '#4FB7D2', {outline:false, uv:[7, 7], map:TEX.water});
  hazard(x0, x1, -.6, 'Rơi xuống kênh rồi!');
}
for(const x of [CANAL[0], CANAL[1], 136, 146, 184, 195]){ ZONE = zoneFor(x); box(W, x - .15, x + .15, -3, .06, -.5, 2.9, '#A39788', {ow:.03, uv:[1,2], map:TEX.stone}); }
const canal = channel({x0:CANAL[0], x1:CANAL[1], floor:-1.4, level:-.3, z0:-.5, z1:2.55});
hazard(-20, 240, -6, 'Rơi xuống kênh rồi!');
for(let a = -14; a < 232; a += 12){ ZONE = zoneFor(a + .1);
  box(W, a, a + 12, -1.2, -.28, 3, 14, '#9A948E', {outline:false, uv:[4,4], map:TEX.road});
  box(W, a, a + 12, -.28, 0, 2.95, 3.15, '#B6ABA0', {outline:false, uv:[2,1], map:TEX.stone}); }
function house(x0, x1, h, c, o){
  o = o || {}; ZONE = zoneFor((x0 + x1)/2);
  box(W, x0, x1, -3, h, -4.2, -.5, c, Object.assign({}, WALL, {uv:[6, h + 3, 0, -3]}));
  box(W, x0 - .05, x1 + .05, h, h + .25, -4.4, -.3, '#C98B4A', {ow:.04});
  for(const x of [x0, x1]) box(W, x - .2, x + .2, 0, h, -.5, -.32, '#F4F1EA', {ow:.025});
  if(o.roof) roof(W, x0 - .3, x1 + .3, h + .25, -.15, 3.4, 1.5, o.roof);
  for(let w = x0 + 2.2; w < x1 - 1.4; w += 3.6) win(W, w, h - 3.2, 1.4, 1.8, -.5, '#F4F1EA', ['#2E8C86', '#C23A28', '#8E6CC0'][Math.round(w)%3], o.flower ? {flower:o.flower} : undefined);
}
function wall(x0, x1, top, c, zone){
  ZONE = zone; box(W, x0, x1, -2, top, -.5, 2.6, c, Object.assign({}, WALL, {uv:[2, top]}));
  box(W, x0 - .1, x1 + .1, top, top + .2, -.6, 2.7, '#B8A58E', {ow:.03, uv:[2,1], map:TEX.stone});
  block(x0, x1, -2, top);
}
function tower(x0, x1, top, c, zone){
  ZONE = zone;
  box(W, x0, x1, -2, top, -1.2, 2.6, c, Object.assign({}, WALL, {uv:[6, 9]}));
  box(W, x0 - .1, x1 + .1, top - .05, top + .2, -1.3, 2.7, '#B8A58E', {ow:.03, uv:[2,1], map:TEX.stone});
  for(let y = top - 2.6; y > 0; y -= 3.2) for(let w = x0 + 1.6; w < x1 - 1; w += 3.4) win(W, w, y - 1, 1.3, 1.7, 2.6, '#F4F1EA', ['#2E8C86', '#C23A28'][Math.round(w + y)%2]);
  block(x0, x1, -2, top);
}

// ================= everything Tò has learned: calls that hang in the air, warm air, gusts, lanterns and the steps they light =================
const raos = [], RAO_MAT = {};
function rao(o){
  const r = Object.assign({on:false, t:0, gap:.5, life:3, rest:1.4}, o);
  r.ws = r.words.map(([w, x, y, wd])=>{
    wd = wd || Math.max(1.2, w.length*.34 + .5);
    const g = new THREE.Group(); g.position.set(x, y, .9); g.visible = false; scene.add(g); ZONE = 'keep';
    box(g, -wd/2, wd/2, -.5, 0, -.25, .25, '#F6E7C8', {ow:.04, keep:true});
    const tw = Math.min(2.4, Math.max(2.0, wd*.92));
    const m = new THREE.Mesh(new THREE.PlaneGeometry(tw, tw/4), RAO_MAT[w] || (RAO_MAT[w] = toon('#C23A28', false, {map:textTex(w), alpha:true})));  // repeated words share one texture
    m.position.set(0, -.25, .26); g.add(m);
    const q = {g, x, y, k:0, on:false};
    q.p = plat(x - wd/2, x + wd/2, y, true, ()=>q.on);
    return q;
  });
  r.period = r.gap*r.ws.length + r.life + r.rest;
  raos.push(r); return r;
}
function raoTick(dt){
  for(const r of raos){
    if(r.on){ r.t += dt; if(r.t > r.period) r.t = 0; }
    r.ws.forEach((q, i)=>{
      const a = r.t - i*r.gap, live = r.on && a >= 0 && a < r.life;
      q.on = live; q.k = live ? Math.min(1, a*6) : Math.max(0, q.k - dt*5);
      q.g.visible = q.k > .02;
      const s = live && a > r.life - .5 ? .75 + .25*Math.sin(a*40) : 1;
      q.g.scale.set(q.k*s, q.k, q.k); q.g.position.y = q.y + (1 - q.k)*.4;
    });
  }
}
function raoLine(r){ if(!r.on) return ''; const n = r.ws.filter((q, i)=>r.t >= i*r.gap).length; return r.t < r.gap*r.ws.length + r.life ? r.words.slice(0, n).map(w=>w[0]).join(' ') : ''; }
const drafts = [];
// every air streak shares one shape: a few hundred of them each with its own geometry weighed on phones
const STREAK_G = new THREE.PlaneGeometry(.07, .8), GUST_G = new THREE.PlaneGeometry(1.1, .06);
function draft(x0, x1, y0, y1, on, c){
  const d = {x0, x1, y0, y1, on, k:0, l:lift(x0, x1, y0, y1, on), s:[]};
  d.mat = new THREE.MeshBasicMaterial({color:c || '#FFFFFF', transparent:true, opacity:0, depthWrite:false});
  const n = Math.round((x1 - x0)*(y1 - y0)/3.2);
  for(let i=0;i<n;i++){ const m = new THREE.Mesh(STREAK_G, d.mat); m.position.set(x0 + .2 + Math.random()*(x1 - x0 - .4), y0 + Math.random()*(y1 - y0), .8 + Math.random()*.6); scene.add(m); d.s.push({m, v:4 + Math.random()*3}); }
  drafts.push(d); return d;
}
const gusts = [];
function gust(x0, x1, y0, y1, force, on){
  const g = {x0, x1, y0, y1, force, on, k:0, w:wind(x0, x1, y0, y1, force, ()=>on() && kiteOn() && !P.ground), s:[]};
  g.mat = new THREE.MeshBasicMaterial({color:'#FFFFFF', transparent:true, opacity:0, depthWrite:false});
  for(let i=0;i<40;i++){ const m = new THREE.Mesh(GUST_G, g.mat); m.position.set(x0 + Math.random()*(x1 - x0), .4 + Math.random()*7, .6 + Math.random()*1.2); scene.add(m); g.s.push({m, v:.8 + Math.random()*.5}); }
  gusts.push(g); return g;
}
function airTick(dt){
  for(const d of drafts){ d.k += ((d.on() ? 1 : 0) - d.k)*Math.min(1, dt*4); d.mat.opacity = d.k*.45;
    for(const s of d.s){ s.m.visible = d.k > .02; s.m.position.y += s.v*dt; if(s.m.position.y > d.y1) s.m.position.y = d.y0; } }
  for(const g of gusts){ g.k += ((g.on() ? 1 : 0) - g.k)*Math.min(1, dt*4); g.mat.opacity = g.k*.5;
    for(const s of g.s){ s.m.visible = g.k > .02; s.m.position.x += Math.sign(g.force)*s.v*9*dt; if(s.m.position.x > g.x1) s.m.position.x = g.x0; } }
}
const hangs = [];
function hang(x, y, o){
  o = o || {};
  const h = Object.assign({x, y, r:4.4, lit:false, c:'#E8442E', zone:'h' + hangs.length}, o);
  h.g = new THREE.Group(); h.g.position.set(x, y, .2); scene.add(h.g); ZONE = h.zone;
  blob(h.g, new THREE.Vector3(0, 0, 0), [.38, .38, .46], h.c, {ow:.035});
  for(const a of [0, Math.PI/2]) mesh(h.g, new THREE.TorusGeometry(.385, .02, 4, 20), '#8C3A20', {rot:[0, a, 0], scl:[1, 1.22, 1], outline:false});
  for(const dy of [.42, -.42]) mesh(h.g, new THREE.CylinderGeometry(.16, .16, .1, 10), '#C99A52', {pos:new THREE.Vector3(0, dy, 0), outline:false});
  rod(h.g, new THREE.Vector3(0, .47, 0), new THREE.Vector3(0, o.cord || 1.4, 0), .012, '#2A2530', {outline:false});
  setZone(h.zone, 0);
  h.glow = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), new THREE.MeshBasicMaterial({map:dotTex, color:'#FFC94A', transparent:true, opacity:0, depthWrite:false, blending:THREE.AdditiveBlending}));
  h.glow.position.z = .3; h.g.add(h.glow);
  hangs.push(h); return h;
}
const msteps = [];
function mstep(x, y, w){
  const q = {x, y, w:w || 2.0, solid:false, k:0};
  q.mat = new THREE.MeshBasicMaterial({color:'#FFF2C8', transparent:true, opacity:.12, depthWrite:false});
  q.m = new THREE.Mesh(new THREE.BoxGeometry(q.w, .22, 1.2), q.mat); q.m.position.set(x, y - .11, .4); scene.add(q.m);
  q.edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(q.w, .22, 1.2)), new THREE.LineDashedMaterial({color:'#E0A23A', dashSize:.15, gapSize:.12})); q.edge.computeLineDistances(); q.edge.position.copy(q.m.position); scene.add(q.edge);
  q.p = plat(x - q.w/2, x + q.w/2, y, true, ()=>q.solid);
  msteps.push(q); return q;
}
function stepTick(dt){
  for(const q of msteps){
    let on = false;
    for(const h of hangs) if(h.lit){ const dx = q.x - h.x, dy = q.y - h.y; if(dx*dx + dy*dy < h.r*h.r){ on = true; break; } }
    q.solid = on; q.k += ((on ? 1 : 0) - q.k)*Math.min(1, dt*8); q.mat.opacity = .12 + q.k*.78; q.mat.color.set(on ? '#FFE9A8' : '#C8CCE8');
  }
}
LV.onDen = ()=>{
  let best = null;
  for(const h of hangs){ if(h.lit) continue; const dx = Math.abs(h.x - P.x), dy = h.y - (P.y + 1); if(dx < 2.4 && dy < 3.6 && dy > -2.5 && (!best || dx < Math.abs(best.x - P.x))) best = h; }
  if(!best) return false;
  best.lit = true; colour(best.zone); lastProgT = nowT; say('Thắp đèn!', 1.2); return true;
};

// ================= people =================
function buildPerson(g, o){
  const SK = o.sk || '#D9A57C', AO = o.ao, QU = o.quan || '#2A2630';
  const legs = [];
  for(const s of [-1,1]){ const l = new THREE.Group(); l.position.set(s*.3, 1.35, 0); g.add(l);
    blob(l, new THREE.Vector3(0, -.6, 0), [.24, .24, .7], QU); blob(l, new THREE.Vector3(0, -1.25, .12), [.2, .24, .1], '#5E4630'); legs.push(l); }
  blob(g, new THREE.Vector3(0, 2.0, 0), [.66, .55, .88], AO);
  blob(g, new THREE.Vector3(0, 1.3, 0), [.58, .48, .34], AO);
  const arms = [];
  for(const s of [-1,1]){ const a = new THREE.Group(); a.position.set(s*.62, 2.5, 0); g.add(a);
    blob(a, new THREE.Vector3(s*.1, -.4, .05), [.17, .17, .5], AO, {rot:[0, 0, s*.3]}); blob(a, new THREE.Vector3(s*.2, -.85, .12), .15, SK); blob(a, new THREE.Vector3(-s*.02, -.08, 0), .19, AO, {ow:.03}); arms.push(a); }
  const head = new THREE.Group(); g.add(head);
  blob(head, new THREE.Vector3(0, 3.35, 0), [.6, .58, .6], SK);
  if(o.hair) blob(head, new THREE.Vector3(0, 3.6, -.2), [.62, .5, .45], o.hair);
  eyes(head, 0, 3.42, .52, .18, .21, .2, .23);
  for(const s of [-1,1]) blob(head, new THREE.Vector3(s*.4, 3.2, .44), [.1, .04, .06], '#E79B85', {small:true});
  if(o.hat === 'non') mesh(head, new THREE.ConeGeometry(1.0, .62, 20), '#E9D9B0', {pos:new THREE.Vector3(0, 4.05, -.05), rot:[-.15, 0, 0], ow:.035});
  return {head, arms, legs, neck:2.85};
}
const people = [];
function person(o){
  ZONE = o.zone;
  const g = new THREE.Group(); g.position.set(o.x, o.y || 0, o.z === undefined ? .3 : o.z); g.rotation.y = o.ry || .25; g.scale.setScalar(S*(o.s || 1)); scene.add(g);
  const v = Object.assign({g, awake:false, line:'', lineT:0}, o); v.R = (o.build || buildPerson)(g, o);
  people.push(v); setZone(ZONE, 0); return v;
}
function vSay(v, t, d){ v.line = t; v.lineT = d; }
function wakeUp(v, line, obj, camY){
  play([{dur:.4, start:()=>{ v.awake = true; colour(v.zone); if(v.rao) v.rao.on = true; vSay(v, line, 2.8); }}, {dur:2.2, cam:[v.g.position.x + 4, camY || 3.4]}, {dur:0, start:()=>objective(obj)}]);
}

// ================= room 1 · Mưa bóng mây: sun and rain at once over the first stretch of street =================
house(-8, 4, 7.6, '#E8A598', {roof:'#B5513A'}); house(4, 16, 7.0, '#F1DDB0', {flower:'#F06BAE'}); house(16, 32, 8.0, '#9FCBC1', {roof:'#B5513A'});
ZONE = 'r1';
box(W, -2.0, 2.4, 0, 2.6, -1.4, -.46, '#C7B8E0', Object.assign({}, WALL, {uv:[2, 2.6]}));
sign(W, -6.6, -2.4, 3.2, 4.1, -.5, '#2E8C86', '#F4F1EA', 'PHỐ CŨ', 'đầu xuân');
for(const x of [6, 14, 22]) plant(W, x, -.28, 3.6, 1.1, ['hoa', 'chuoi', 'p'][x%3]);
const cloudG = new THREE.Group(); scene.add(cloudG); cloudG.position.set(17, 11, -1); ZONE = 'keep';
for(let k=0;k<6;k++) blob(cloudG, new THREE.Vector3((k - 2.5)*2.6, Math.sin(k*1.3)*.5, 0), [2.2, 1.3, 1.4], '#9AA0AA', {outline:false, shadow:false, keep:true});
const vHai = person({x:-4.2, z:.7, ao:'#2E8C86', hair:'#2A2630', zone:'cohai', build:g=>{ const R = buildHai(g); return R; }, s:1.0, ry:.35});
// ================= room 2 · Xôi bà Mười: her call is the stair over the gate =================
house(32, 44, 7.8, '#C7B8E0'); house(44, 56, 8.2, '#E9C46A', {roof:'#B5513A'});
ZONE = 'r2';
box(W, 36.6, 41.0, 0, 2.6, -1.4, -.46, '#F1DDB0', Object.assign({}, WALL, {uv:[2, 2.6]}));
const vXoi = person({x:42.2, z:.9, ao:'#C23A28', hat:'non', hair:'#2A2630', zone:'baxoi', ry:-.2});
vXoi.rao = rao({words:[['Xôi', 44.6, 1.4], ['nếp', 46.8, 2.8], ['nóng', 49.0, 4.2], ['đây!', 50.4, 5.4, 1.4]], gap:.5, life:3.2});
wall(51, 53.4, 5.4, '#D9A07A', 'r2');
// from the tops of this wall and the room-5 wall a kite glided over the canal (room 3) and the whole bridge (room 6)
LV.noGlide = x=>(x > 53.4 && x < 76) || (x > 128 && x < 150);
// ================= room 3 · Kênh: a paper boat over the canal =================
house(56, 68, 7.4, '#9FCBC1', {roof:'#B5513A'}); house(68, 80, 8.0, '#E8A598');
ZONE = 'r3';
box(W, 56.6, 60.8, 0, 2.6, -1.4, -.46, '#E9C46A', Object.assign({}, WALL, {uv:[2, 2.6]}));
// ================= room 4 · Lò bánh: warm air up to the roof of the tall house =================
house(80, 92, 7.6, '#F1DDB0');
ZONE = 'r4';
box(W, 80.6, 86.4, 0, 3.0, -2.6, -.46, '#E9A23B', Object.assign({}, WALL, {uv:[3, 3]}));
roof(W, 80.2, 86.8, 3.0, -.3, 2.6, 1.0, '#B5513A');
sign(W, 83.4, 86.2, 1.9, 2.7, -.44, '#C23A28', '#F4F1EA', 'LÒ BÁNH', 'mì nóng');
box(W, 88, 91, 0, .5, -1.2, .4, '#8A8178', {ow:.03, uv:[1,1], map:TEX.stone});
for(let i=0;i<5;i++) box(W, 88.2 + i*.55, 88.5 + i*.55, .5, .56, -1.1, .3, '#3B3540', {outline:false});
const vMai = person({x:85.6, z:.8, ao:'#F4F1EA', hair:'#2A2630', zone:'comai', ry:.15});
draft(88, 91, 0, 9.4, ()=>vMai.awake);
tower(92, 104, 7.2, '#C7B8E0', 'r4');
box(W, 99.4, 100.8, 7.2, 9.4, -1.6, -.5, '#B5513A', {ow:.04, uv:[1,2], map:TEX.stone}); box(W, 99.2, 101.0, 9.4, 9.6, -1.7, -.4, '#8A7D6F', {ow:.03});
plat(99.3, 100.9, 9.6, true);
// ================= room 5 · Ngõ đèn lồng: a lantern alley; paper steps hold only in a hung lantern's light =================
house(104, 116, 7.8, '#E9C46A', {roof:'#B5513A'}); house(116, 128, 8.4, '#C7B8E0');
ZONE = 'r5';
box(W, 104.8, 108.4, 0, 2.6, -1.4, -.46, '#F1DDB0', Object.assign({}, WALL, {uv:[2, 2.6]}));
const vDen = person({x:107.6, z:.9, ao:'#8E6CC0', hair:'#E8E4DC', zone:'baden', ry:.25});
const H5 = [hang(110.0, 3.0, {c:'#F2C230', cord:3.6}), hang(116.6, 6.6, {c:'#E8442E', cord:1.4})];
mstep(111.4, 1.6); mstep(113.6, 3.2); mstep(116.0, 4.8); mstep(118.4, 6.0);
wall(120, 128, 7.6, '#E8A598', 'r5');
// ================= room 6 · Cầu thiếu ván: the bridge has lost a plank; paste a page in its place =================
house(128, 140, 7.4, '#F1DDB0', {roof:'#B5513A'}); house(140, 152, 8.0, '#9FCBC1');
ZONE = 'r6';
box(W, 128.8, 132.4, 0, 2.6, -1.4, -.46, '#C7B8E0', Object.assign({}, WALL, {uv:[2, 2.6]}));
for(const [a, b] of [[136, 137.8], [144.2, 146]]){ ZONE = 'r6'; box(W, a, b, -.3, 0, -.4, 2.2, '#A27650', {ow:.03, uv:[.8,.8], map:TEX.wood}); plat(a, b, 0, true); }
for(const x of [136.2, 145.8]) rod(W, new THREE.Vector3(x, -1.4, -.3), new THREE.Vector3(x, 1.4, -.3), .07, '#7A4E2D', {outline:false});
let plankOn = false;
plat(137.8, 144.2, 0, true, ()=>plankOn);
const gapSlot = slot({x0:137.8, x1:144.2, y0:-.3, y1:.05, z:.9, onPaste:()=>{ plankOn = true; colour('r6'); say('Dán tờ lịch làm ván cầu!', 2); objective('Qua cầu'); }});
// ================= room 7 · Cổng Lũ Bụi: the dust gang guards a locked gate; knock its latch with a plane =================
house(152, 164, 7.8, '#E8A598', {roof:'#B5513A'}); house(164, 176, 8.2, '#E9C46A');
ZONE = 'r7';
box(W, 152.8, 156.4, 0, 2.6, -1.4, -.46, '#9FCBC1', Object.assign({}, WALL, {uv:[2, 2.6]}));
let gateOpen = false, gateK = 0;
block(170, 171.4, -2, 7, ()=>!gateOpen);
const gate = new THREE.Group(); gate.position.set(170, 0, .2); scene.add(gate); ZONE = 'r7';
box(gate, 0, 1.4, 0, 7, -.6, .6, '#7A4E2D', {ow:.04, uv:[.8,.8], map:TEX.wood});
box(gate, -.1, 1.5, 6.8, 7.2, -.7, .7, '#B5513A', {ow:.03});
const latch = new THREE.Group(); latch.position.set(169.6, 2.0, .9); scene.add(latch); ZONE = 'r7'; box(latch, -.25, .25, -.25, .25, -.1, .1, '#C23A28', {ow:.03});
target({x:169.6, y:2.0, r:.9, onHit:()=>{ play([{dur:2.0, cam:[170, 3.6], start:()=>{ gateOpen = true; colour('r7'); say('Trúng then! Cổng mở rồi!', 2); }}, {dur:0, start:()=>objective('Qua cổng, về phía sông')}]); }});
// ================= room 8 · Chong chóng: gusts in breaths carry a kite over the last canal =================
house(176, 188, 7.6, '#C7B8E0'); house(188, 200, 8.0, '#F1DDB0', {roof:'#B5513A'});
ZONE = 'r8';
box(W, 176.8, 180.4, 0, 2.6, -1.4, -.46, '#E9C46A', Object.assign({}, WALL, {uv:[2, 2.6]}));
const wheels = [];
for(let i=0;i<5;i++){ ZONE = 'r8'; const x = 181.0 + i*.7, y = 2.2 + (i%2)*.5;
  rod(W, new THREE.Vector3(x, .9, .6), new THREE.Vector3(x, y, .6), .025, '#C99A52', {outline:false});
  const w = new THREE.Group(); w.position.set(x, y, .7); scene.add(w);
  for(let k=0;k<4;k++){ const b = mesh(w, new THREE.ConeGeometry(.22, .5, 3), ['#E8442E','#F2C230','#2E9C93','#F06BAE'][(k + i)%4], {ow:.015}); b.rotation.z = k*Math.PI/2; b.position.set(Math.cos(k*Math.PI/2 + Math.PI/2)*.22, Math.sin(k*Math.PI/2 + Math.PI/2)*.22, 0); }
  wheels.push(w); }
let gustT = 0, windOn = false;
const gustOn = ()=>windOn && gustT % 5.2 < 2.6;
gust(178, 197, -3, 14, 7.5, gustOn);
// ================= room 9 · Sạp tò he bà Năm: home =================
house(200, 210, 7.8, '#E8A598', {roof:'#B5513A'});
ZONE = 'r9';
box(W, 210, 222, -2, 9.0, -1.6, -.46, '#F1DDB0', Object.assign({}, WALL, {uv:[6, 9]}));
box(W, 209.9, 222.1, 9.0, 9.25, -1.8, -.3, '#C98B4A', {ow:.04});
roof(W, 209.6, 222.4, 9.25, -.4, 3.0, 1.4, '#B5513A');
for(const x of [214.0, 219.4]) win(W, x, 1.0, 1.6, 2.2, -.46, '#F4F1EA', '#2E8C86', {flower:'#F06BAE'});
box(W, 211, 219, 3.85, 4.0, -.6, 1.8, '#C23A28', {ow:.03});
for(let i=0;i<8;i++) box(W, 211 + i, 212 + i, 3.55, 3.85, 1.6, 1.8, i%2 ? '#F4F1EA' : '#C23A28', {ow:.015});
plat(211, 219, 4.0, true);
sign(W, 219.6, 221.8, 4.6, 6.0, -.44, '#C23A28', '#F2C230', 'TÒ HE', 'bà Năm');
const steamer = mesh(W, new THREE.CylinderGeometry(.7, .6, .9, 14), '#B8C4C8', {pos:new THREE.Vector3(209.2, .45, .5), ow:.03});
const vSang = person({x:201.8, z:1.0, ao:'#F2C230', quan:'#3B4152', hair:'#2A2630', zone:'cusang', s:.68, ry:.4});
const vNam = person({x:206.4, z:.4, zone:'banam', build:g=>buildBa(g), s:1.05, ry:.45});
draft(208, 210.4, 0, 7.2, ()=>vSang.awake, '#F4F1EA');

// ================= background =================
midRow(-16, 230, zoneFor, {zf:-5.4});
farRow(-24, 240);
clouds(-40, 250); hills(-40, 250);
const POLES = [-8, 32.4, 56.4, 80.4, 104.4, 128.4, 152.4, 176.4, 200.4];
for(const x of POLES){ ZONE = zoneFor(x); powerPole(x, 3.4); }
for(let i=0;i<POLES.length-1;i++){ ZONE = zoneFor(POLES[i]); poleWires([POLES[i], POLES[i+1]], 3.2); }
tree(W, -11, 3.8, 7.5, {s:1.2, zone:'r1', flower:'#F06BAE'});
tree(W, 226, 3.8, 7.5, {s:1.2, zone:'r9', flower:'#F06BAE'});
moteSpan(-10, 30);

// ================= sheets: every page can be folded into whatever the room needs =================
const pagePic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.42)'; x.lineWidth = 4; x.beginPath(); x.arc(cw*.5, ch*.55, cw*.22, 0, Math.PI*2); x.stroke(); };
const xoiPic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.42)'; x.lineWidth = 4; x.beginPath(); x.arc(cw*.5, ch*.55, cw*.28, 0, Math.PI); x.closePath(); x.stroke(); };
const homePic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.45)'; x.lineWidth = 5; x.beginPath(); x.moveTo(cw*.2, ch*.55); x.lineTo(cw*.5, ch*.3); x.lineTo(cw*.8, ch*.55); x.stroke(); x.strokeRect(cw*.28, ch*.55, cw*.44, ch*.3); };
function page(id, x0, pic, fn){
  const s = sheet({id, x0, x1:x0 + 1.2, y0:.4, y1:2.0, z:-.44, carry:true, respawn:true, layers:[{n:'1', pic:pic || pagePic}]});
  s.onLayer = ()=>{ s.solved = true; if(!s.woke){ s.woke = true; if(fn) fn(); } };
  return s;
}
const sheet1 = page('A', -1.4, null, ()=>{ play([{dur:.4, start:()=>{ vHai.awake = true; colour('cohai'); vSay(vHai, 'Tò về rồi! Trời mưa bóng mây, đội nón mà đi con.', 3); }}, {dur:2.2, cam:[2, 3.4]}, {dur:0, start:()=>objective('Gấp nón, đi qua cơn mưa')}]); });
const sheet2 = page('B', 37.6, xoiPic, ()=>wakeUp(vXoi, 'Xôi đây! Tò đó hả? Leo theo tiếng rao mà qua cổng!', 'Đứng lên chữ mà leo qua cổng'));
const sheet3 = page('C', 57.6, null, ()=>{ colour('r2'); objective('Gấp thuyền qua kênh'); });
const sheet4 = page('D', 81.4, null, ()=>wakeUp(vMai, 'Lò nóng rồi! Cầm diều đứng trên miệng lò đi con.', 'Gấp diều, bay theo hơi lò lên mái'));
const sheet5 = page('E', 105.4, null, ()=>wakeUp(vDen, 'Ngõ đèn tối quá. Con thắp giùm bà mấy ngọn đèn.', 'Gấp đèn, thắp đèn treo, leo bậc giấy'));
const sheet6 = page('F', 129.6, null, ()=>{ colour('r5'); objective('Mở tờ lịch ra, dán vào chỗ ván cầu bị thiếu'); });
const sheet7 = page('G', 153.6, null, ()=>{ colour('r6'); objective('Gấp quạt đuổi Lũ Bụi, rồi phóng máy bay trúng then cổng'); });
const sheet8 = page('H', 177.6, null, ()=>{ windOn = true; colour('r7'); colour('r8'); objective('Chờ cơn gió, cầm diều nhảy qua kênh'); });
const sheet9 = page('I', 201.2 - 2.4, homePic, ()=>wakeUp(vSang, 'Tò! Bà Năm ngủ quên từ hôm Tò đi. Nồi hấp bột còn ấm đó!', 'Cầm diều bay theo hơi nồi, lên mái hiên nhà bà', 4.4));
const sheetZ = sheet({id:'Z', x0:213.6, x1:216.4, y0:4.4, y1:6.6, z:-.44, layers:[{n:'1', pic:homePic}], onLayer:()=>home()});

// ================= the hidden tò he and the fireflies =================
ZONE = 'keep';
const cat = new THREE.Group(); scene.add(cat); cat.scale.setScalar(.5);
(function(){ const C = '#E9A23B';
  blob(cat, new THREE.Vector3(0, .5, 0), [.55, .45, .42], C, {keep:true});
  blob(cat, new THREE.Vector3(.5, .95, 0), [.34, .32, .32], C, {keep:true});
  for(const z of [-.16, .16]){ mesh(cat, new THREE.ConeGeometry(.1, .22, 4), C, {pos:new THREE.Vector3(.5, 1.32, z), keep:true}); blob(cat, new THREE.Vector3(.8, 1.0, z), [.07, .07, .07], '#141019', {small:true, keep:true}); }
  blob(cat, new THREE.Vector3(-.55, .8, 0), [.08, .4, .08], C, {keep:true, rot:[0, 0, .5]});
})();
cat.position.set(100.1, 9.6, -1.0);
relic(cat, 100.1, 9.6, 'Con mèo mướp của bà Năm');
firefly(17.0, 3.0);
firefly(49.0, 6.2);
firefly(68.0, 1.8);
firefly(89.5, 9.8);
firefly(189.0, 3.6);
for(const z of ROOMS.concat(['sky'])) setZone(z, 0);
bui({x:159.0, top:0, s:.5, a:158.0, b:163.0, fan:true}); bui({x:161.0, top:0, s:.44, a:159.0, b:164.0, fan:true}); bui({x:163.0, top:0, s:.55, a:160.0, b:164.6, fan:true});

// ================= bubbles =================
// sleep-talk: each grey sleeper mutters a line about the day they forgot
vHai.mo = ["…chè… chè đậu xanh…", "…Tò… Tò đi đâu rồi…", "…mưa bóng mây… đội nón vào…"];
vXoi.mo = ["…xôi đỗ… xôi lạc…", "…ngày nào cũng một gánh…"];
vMai.mo = ["…diều… gió lò…", "…mái nhà… nóng hổi…"];
vDen.mo = ["…đèn kéo quân… quay quay…", "…giấy bóng kính… đỏ, xanh…"];
vSang.mo = ["…bà Năm… nặn con gà…", "…tò he… cho cháu một con…"];
vNam.mo = ["…mười bốn… tháng Tám…", "…chẳng ai nhớ nữa…", "…Tò… con đâu rồi…"];
for(const v of people) talker(v.g, 2.6*(v.s || 1), ()=>{
  if(P.won && !v.line) return '';
  if(v.lineT > 0) return v.line;
  if(!v.awake) return Math.abs(P.x - v.g.position.x) < 6 ? (v.mo ? v.mo[Math.floor(nowT/3.4 + v.g.position.x) % v.mo.length] : '…') : '';
  return v.rao && Math.abs(P.x - v.g.position.x) < 9 ? raoLine(v.rao) : '';
});

// ================= story beats =================
let met = [false, false, false, false, false, false, false, false, false], dustGone = false;
LV.onFan = n=>{ if(!dustGone && buis.every(b=>b.gone)){ dustGone = true; colour('r7'); objective('Gấp máy bay, phóng trúng then cổng'); } };
function home(){
  sheetZ.solved = true; objective('Về nhà rồi!');
  finish([
    {dur:2.4, cam:[210, 3.6, 15], start:()=>{ vNam.awake = true; colour('banam'); vSay(vNam, 'Tò… Tò đó hả con?', 2.4); }},
    {dur:3.0, cam:[208, 3.0, 12], start:()=>vSay(vNam, 'Bà ngủ một giấc dài quá. Con đi bóc lịch cả phố cho bà hả?', 3)},
    {dur:4.6, cam:[110, 8, 70], start:()=>{ bars(true); caption('Cả phố cũ có màu. Ngày nào cũng có người để ý tới.'); for(const z of ROOMS) colour(z); for(const v of people){ v.awake = true; colour(v.zone); if(v.rao) v.rao.on = true; } for(const h of hangs) h.lit = true; colour('tray0'); colour('tray1'); colour('tray2'); }, end:()=>caption('')},
    // the people Tò woke on the way, back at their own corners of the street
    {dur:3.0, cam:[30, 4.2, 24], start:()=>caption('Cô Hai lại bán chè đầu hẻm. Bé Bống thả thuyền giấy dưới rãnh nước.')},
    {dur:3.0, cam:[75, 4.6, 24], start:()=>caption('Ông Bảy ngồi sửa ô, chú Chín chèo đò qua sông theo con nước.')},
    {dur:3.0, cam:[120, 5.2, 24], start:()=>caption('Chú Tư lên dây cót đồng hồ tháp. Ông Đức thả diều sáo trên mái phố.')},
    {dur:2.6, cam:[170, 4.6, 24], start:()=>caption('Gánh hàng rong lại rao từ sáng sớm. Không còn ngày nào bị quên.')},
    {dur:.4, start:()=>caption('')},
    {dur:5.0, cam:[208, 3.0, 12], start:()=>memo(drawHomeMemory), end:memoOff},
    {dur:3.4, cam:[208, 3.0, 12], start:()=>vSay(vNam, 'Từ nay bà để dành giấy lịch cũ, cho con gấp diều, gấp đèn.', 3.2)},
    {dur:4.0, cam:[208, 6, 22], start:()=>caption('Phố Cũ Bạc Màu · Hết')},
    {dur:3.0, cam:[204, 7, 26], start:()=>caption('Ý tưởng và chỉ đạo: Sang · Mark học AI')},
    {dur:3.0, cam:[200, 8, 30], start:()=>caption('Làm cùng Claude · Nhạc và tiếng động tổng hợp ngay trong game')},
    {dur:3.2, cam:[196, 9, 34], start:()=>caption('Cảm ơn bạn đã giúp phố cũ có màu lại.')},
    {dur:.6, end:()=>{ caption(''); bars(false); }}]);
}
function drawHomeMemory(x, W, H){
  x.fillStyle = '#F6EBD9'; x.fillRect(20, 20, W-40, H-40); x.strokeStyle = '#141019'; x.lineWidth = 3; x.strokeRect(20, 20, W-40, H-40);
  x.fillStyle = '#3B2E2A'; x.font = '28px "Patrick Hand", cursive'; x.textAlign = 'center';
  x.fillText('Bốn mươi năm ở đầu phố', W/2, 62);
  x.strokeStyle = '#7A4E2D'; x.lineWidth = 4;
  x.strokeRect(90, 210, 300, 30);
  for(let i=0;i<7;i++){ const cx = 120 + i*40; x.beginPath(); x.moveTo(cx, 210); x.lineTo(cx, 160); x.stroke(); x.beginPath(); x.arc(cx, 148, 11, 0, Math.PI*2); x.stroke(); }
  x.beginPath(); x.arc(240, 105, 24, 0, Math.PI*2); x.stroke();
  x.fillStyle = '#3B2E2A'; x.font = '24px "Patrick Hand", cursive';
  x.fillText('“Mỗi con tò he bà nặn là một ngày bà nhớ.', W/2, 280); x.fillText('Con là ngày bà nhớ nhất.”', W/2, 310);
}

// ================= per-frame level logic =================
LV.update = (dt, t)=>{
  gustT += dt;
  raoTick(dt); airTick(dt); stepTick(dt);
  LV.lantern = heldIs('den') && P.x > 100 && P.x < 130 ? 1.6 : 0;
  rain.k = P.x < 36 && !P.won ? Math.min(1, rain.k + dt) : Math.max(0, rain.k - dt*.6);
  if(P.x > 36 && rain.wet <= 0) wetEl.style.display = 'none';
  cloudG.position.x = 17 + Math.sin(t*.3)*1.5;
  for(const h of hangs){ h.k = (h.k || 0) + ((h.lit ? 1 : 0) - (h.k || 0))*Math.min(1, dt*4); h.glow.material.opacity = h.k*(.75 + Math.sin(t*5 + h.x)*.1); h.g.rotation.z = Math.sin(t*1.4 + h.x)*.05; }
  for(const v of people){
    if(v.lineT > 0) v.lineT -= dt;
    const wk = wakeK(v, v.awake, dt); nod(v.R.head, Math.sin(t*1.3 + v.x)*.05*wk + (.35 + Math.sin(t*1.2 + v.x)*.04)*(1 - wk), v.R.neck || 0);
    if(v.R.arms && v.R.arms[1]) v.R.arms[1].rotation.z = v.awake ? -1.0 + Math.sin(t*2 + v.x)*.2 : 0;
  }
  const g8 = gustOn();
  for(const [i, w] of wheels.entries()) w.rotation.z -= dt*(windOn ? (g8 ? 14 : 3) : 0)*(1 + i*.05);
  if(gateOpen && gateK < 1) gateK = Math.min(1, gateK + dt*1.5);
  gate.position.y = gateK*6.6; latch.visible = !gateOpen;
  steamer.rotation.y = vSang.awake ? Math.sin(t*8)*.03 : 0;
  // room beats, in the order Tò meets them
  const beats = [[32.4, 'r1', 'Bà Mười bán xôi ngủ gật trước cổng.', 'Bóc tờ lịch trên vách sau gánh xôi'],
    [56.4, 'r2', 'Con kênh nhỏ chắn ngang phố.', 'Bóc tờ lịch, gấp thuyền'],
    [80.4, 'r3', 'Lò bánh mì nguội, nhà bên cao quá.', 'Bóc tờ lịch trên cửa lò'],
    [104.4, 'r4', 'Ngõ đèn lồng chưa ai thắp đèn.', 'Bóc tờ lịch ở sạp đèn'],
    [128.4, 'r5', 'Cây cầu gỗ thiếu mất một tấm ván!', 'Bóc tờ lịch trên tường'],
    [152.4, 'r6', 'Lũ Bụi canh trước cổng đóng then.', 'Bóc tờ lịch, gấp quạt'],
    [176.4, 'r7', 'Chong chóng đứng im, kênh rộng quá.', 'Bóc tờ lịch ở sạp chong chóng'],
    [200.4, 'r8', 'Sạp tò he của bà Năm! Bà ngủ ngồi trên ghế…', 'Bóc tờ lịch trước sạp']];
  beats.forEach(([x, z, line, obj], i)=>{ if(!met[i] && P.x > x && P.y < 1){ met[i] = true; colour(z); say(line, 2.6); objective(obj); } });
};
LV.hint = ()=>{
  const f = n=>held.on ? 'Bấm Q cho tới khi gấp thành ' + n + '.' : 'Lấy tờ lịch, gấp ' + n + '.';
  if(P.x < 32) return heldIs('non') ? 'Đội nón đi một mạch qua cơn mưa.' : f('nón');
  if(P.x < 56) return !vXoi.awake ? 'Bóc tờ lịch trên vách sau gánh xôi.' : 'Bà rao thì nhảy lên chữ đầu tiên, leo qua cổng.';
  if(P.x < 80) return boat.on ? 'Đi trên thuyền sang bờ bên kia.' : heldIs('thuyen') ? 'Đứng sát mép nước, bấm E thả thuyền rồi nhảy lên.' : f('thuyền');
  if(P.x < 104) return !vMai.awake ? 'Bóc tờ lịch trên cửa lò.' : kiteOn() ? 'Đứng trên miệng lò, bay lên rồi sang phải lên mái.' : f('diều');
  if(P.x < 128) return !vDen.awake ? 'Bóc tờ lịch ở sạp đèn.' : heldIs('den') ? 'Thắp đèn dưới thấp, leo lên bậc thứ hai, đứng sát mép phải rồi bấm E thắp đèn trên cao.' : f('đèn');
  if(P.x < 146) return plankOn ? 'Qua cầu.' : held.on && !held.form ? 'Đứng ở đầu cầu, bấm E dán tờ lịch vào chỗ thiếu ván.' : held.on ? 'Bấm Q cho tới khi mở ra thành tờ lịch.' : 'Lấy tờ lịch trên tường.';
  if(P.x < 176) return !dustGone ? (heldIs('quat') ? 'Quay mặt về phía Lũ Bụi, bấm E để quạt.' : f('quạt')) : gateOpen ? 'Qua cổng.' : heldIs('maybay') ? 'Đứng cách cổng vài bước, bấm E phóng vào then đỏ.' : f('máy bay');
  if(P.x < 200) return !windOn ? 'Bóc tờ lịch ở sạp chong chóng.' : kiteOn() ? 'Chờ chong chóng quay tít, chạy nhảy qua kênh.' : f('diều');
  if(!vSang.awake) return 'Bóc tờ lịch trước sạp tò he.';
  return kiteOn() ? 'Đứng trên nồi hấp, bay lên rồi đáp xuống mái hiên. Bóc tờ lịch trên tường nhà bà.' : f('diều');
};
LV.winText = ()=>({
  h:'Hết game! Tò về nhà rồi.',
  p:'Cả phố cũ có màu. Bà Năm lại ngồi nặn tò he ở đầu phố.',
  memory:(fliesGot === 5
    ? '<b>Ký ức mở khoá.</b> Mấy chục năm ở đầu phố, mỗi con tò he bà Năm nặn là một ngày bà nhớ. Tò là ngày bà nhớ nhất.'
    : 'Còn ' + (5 - fliesGot) + ' con đom đóm ở Màn 9 chưa tìm thấy.')
    + (relicGot ? '<br><b>Tìm được con mèo mướp của bà Năm.</b>' : '<br>Có một con tò he cũ trên nắp ống khói nhà cao.'),
  next:'Cảm ơn bạn đã chơi Phố Cũ Bạc Màu.'
});

// ================= intro: spring morning, the way home =================
LV.intro = {end:12, sheetsAt:9,
  caps:[[0.5, 4.0, 'Đầu xuân. Con phố của bà Năm ở ngay cuối đường.'],
        [4.3, 8.0, 'Tờ lịch dán kín từ đầu phố tới sạp tò he.'],
        [8.3, 11.6, 'Tò đã biết gấp đủ thứ. Về nhà thôi.']],
  run(it, dt, t){
    for(const z of ROOMS.concat(['sky'])) setZone(z, 0);
    const camX = it < 4 ? 40 - it*4 : it < 8 ? 212 - (it - 4)*4 : Math.max(-2, 12 - (it - 8)*4);
    const camY = it >= 4 && it < 8 ? 4 : 2.6;
    camLook.lerp(tmpV.set(camX, camY, -1), Math.min(1, dt*2));
    camPos.lerp(tmpV.set(camX - 2.5, camY + 2.6, it >= 4 && it < 8 ? 22 : 17), Math.min(1, dt*2));
    camera.position.copy(camPos); camera.lookAt(camLook);
    sun.position.set(camLook.x - 8, 18, 12); sun.target.position.set(camLook.x, 0, 0);
    toInner.rotation.y = .9;
  },
  done(){
    if(!learned.length) learned.push('non', 'thuyen', 'dieu', 'den', 'maybay', 'quat');
    say('Sắp về tới nhà rồi…', 2.2);
    objective('Bóc tờ lịch trên tường đầu phố');
  }};
startGame();
