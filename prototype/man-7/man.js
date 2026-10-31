// ================= Màn 7 · Gió mùa (mở chương 3): a windy afternoon on the rooftops of the old quarter, on the way back to bà Năm =================
// rooms (x): 1 sân thượng nhà Tí -8..20 · 2 lò bánh 20..46 · 3 chong chóng 46..76 · 4 máy lạnh 76..100 · 5 ba ống khói 100..118
//            6 lịch gió 118..156 · 7 cửa mái 156..190 · 8 diều mắc dây 190..214 · 9 ông Đức làm diều 214..248
// new here: fold the page into a kite; hold it and a jump becomes a glide, a warm updraft carries Tò up, a gust carries him across
LV.level = 7;
LV.start = {x:-3.5, y:0};
LV.bounds = [-7.5, 247.5];
LV.cam = [0, 242];
const ROOMS = ['r1','r2','r3','r4','r5','r6','r7','r8','r9'];
LV.sky = ROOMS;
function zoneFor(x){ return x < 20 ? 'r1' : x < 46 ? 'r2' : x < 76 ? 'r3' : x < 100 ? 'r4' : x < 118 ? 'r5' : x < 156 ? 'r6' : x < 190 ? 'r7' : x < 214 ? 'r8' : 'r9'; }
// grey is a dull overcast; the colour that comes back is a windy golden afternoon
SKY.g.top.set('#868C96'); SKY.g.mid.set('#A3A6AB'); SKY.g.bot.set('#BAB7B2');
SKY.c.top.set('#3F86CF'); SKY.c.mid.set('#9DD0EA'); SKY.c.bot.set('#FFD79A');
LIGHT.fog.set('#CFE2EA'); LIGHT.sun.set('#FFE9C2');
LV.camY = (x, y)=> y < 4.5 ? 2.8 + Math.max(0, y - 1)*.55 : y + 1.4;
const heldIs = f => held.on && held.form === f;
const kiteOn = ()=>heldIs('dieu');

// ================= the roofs: flat terraces with alleys between them =================
const GAPS = [[13, 20], [62, 73], [140, 156]];
const LANDS = [[-14, 13], [20, 62], [73, 140], [156, 252]];
const FRONT = ['#E8A598', '#F1DDB0', '#9FCBC1', '#E9C46A', '#C7B8E0', '#D9A07A'];
for(const [x0, x1] of LANDS){
  for(let a = x0, i = 0; a < x1; a += 8, i++){ const b = Math.min(x1, a + 8); ZONE = zoneFor(a + .1);
    box(W, a, b, -.35, 0, -6, 2.9, '#C9C3BA', {outline:false, uv:[3.2, 3.2], map:TEX.pave});
    box(W, a, b, -11, -.35, -1, 2.6, FRONT[(i + Math.round(x0))%FRONT.length], Object.assign({}, WALL, {uv:[6, 9, 0, -11]}));
    box(W, a, b, -.02, .45, 2.62, 2.9, '#B8A58E', {ow:.03, uv:[2,1], map:TEX.stone});
    for(let w = a + 2; w < b - 1; w += 4){ win(W, w, -3.6, 1.3, 1.7, 2.6, '#F4F1EA', ['#2E8C86', '#C23A28', '#8E6CC0'][(i + w)%3]); }
  }
  plat(x0, x1, 0, false, null, {safe:true}); block(x0, x1, -11, 0);
}
for(const [x0, x1] of GAPS){
  ZONE = zoneFor(x0 + .1);
  box(W, x0, x1, -12, -1, -6.2, -6, '#6E6A72', {outline:false});
  box(W, x0, x1, -12, -10.6, -6, 3, '#8A847E', {outline:false, uv:[4,4], map:TEX.road});
  wire(new THREE.Vector3(x0, -2.2, .4), new THREE.Vector3(x1, -2.0, .4), .6);
  hazard(x0, x1, -1.2, 'Rơi xuống hẻm rồi!');
}
hazard(-20, 260, -6, 'Rơi xuống hẻm rồi!');
// a tall building Tò can only get on top of by riding warm air
function tower(x0, x1, top, c, zone){
  ZONE = zone;
  box(W, x0, x1, -11, top, -1.2, 2.6, c, Object.assign({}, WALL, {uv:[6, 9, 0, -11]}));
  box(W, x0 - .1, x1 + .1, top - .05, top + .2, -1.3, 2.7, '#B8A58E', {ow:.03, uv:[2,1], map:TEX.stone});
  box(W, x0, x1, top - .3, top, -6, -1.2, '#C9C3BA', {outline:false, uv:[3.2, 3.2], map:TEX.pave});
  for(let y = top - 2.6; y > -1; y -= 3.2) for(let w = x0 + 1.6; w < x1 - 1; w += 3.4) win(W, w, y - 1, 1.3, 1.7, 2.6, '#F4F1EA', ['#2E8C86', '#C23A28'][Math.round(w + y)%2]);
  block(x0, x1, -11, top);
}
function tank(x, y, z, zone){ ZONE = zone;
  mesh(W, new THREE.CylinderGeometry(.85, .85, 1.5, 16), '#D8DCE0', {pos:new THREE.Vector3(x, y + 1.55, z), ow:.04});
  for(const dx of [-.55, .55]) box(W, x + dx - .08, x + dx + .08, y, y + .8, z - .08, z + .08, '#6E655C', {ow:.02}); }
function antenna(x, y, z, h, zone){ ZONE = zone;
  rod(W, new THREE.Vector3(x, y, z), new THREE.Vector3(x, y + h, z), .04, '#8A8178', {outline:false});
  for(let i=0;i<4;i++) rod(W, new THREE.Vector3(x - .7 + i*.1, y + h - .3 - i*.35, z), new THREE.Vector3(x + .7 - i*.1, y + h - .3 - i*.35, z), .025, '#8A8178', {outline:false}); }
function clothes(x0, x1, y, z, zone){ ZONE = zone;
  const pts = wire(new THREE.Vector3(x0, y, z), new THREE.Vector3(x1, y, z), .3);
  for(let i=3;i<pts.length-2;i+=3){ const p = pts[i]; box(W, p.x - .35, p.x + .35, p.y - .9, p.y, p.z - .03, p.z + .03, ['#E8442E','#F4F1EA','#2F6FB5','#F2C230'][i%4], {ow:.015}); } }

// ================= moving air: rising streaks for an updraft, sideways streaks for wind =================
const drafts = [];
function draft(x0, x1, y0, y1, on, c){
  const d = {x0, x1, y0, y1, on, k:0, l:lift(x0, x1, y0, y1, on), s:[]};
  d.mat = new THREE.MeshBasicMaterial({color:c || '#FFFFFF', transparent:true, opacity:0, depthWrite:false});
  const n = Math.round((x1 - x0)*(y1 - y0)/3.2);
  for(let i=0;i<n;i++){ const m = new THREE.Mesh(new THREE.PlaneGeometry(.07, .8), d.mat); m.position.set(x0 + .2 + Math.random()*(x1 - x0 - .4), y0 + Math.random()*(y1 - y0), .8 + Math.random()*.6); scene.add(m); d.s.push({m, v:4 + Math.random()*3}); }
  drafts.push(d); return d;
}
const gusts = [];
function gust(x0, x1, y0, y1, force, on){
  const g = {x0, x1, y0, y1, force, on, k:0, w:wind(x0, x1, y0, y1, force, ()=>on() && kiteOn() && !P.ground), s:[]};
  g.mat = new THREE.MeshBasicMaterial({color:'#FFFFFF', transparent:true, opacity:0, depthWrite:false});
  const n = Math.round((x1 - x0)*Math.min(12, y1 - y0)/4);
  for(let i=0;i<n;i++){ const m = new THREE.Mesh(new THREE.PlaneGeometry(1.1, .06), g.mat); m.position.set(x0 + Math.random()*(x1 - x0), Math.max(y0, -.5) + .4 + Math.random()*Math.min(12, y1 - Math.max(y0, -.5)), .6 + Math.random()*1.2); scene.add(m); g.s.push({m, v:.8 + Math.random()*.5}); }
  gusts.push(g); return g;
}
function airTick(dt){
  for(const d of drafts){
    d.k += ((d.on() ? 1 : 0) - d.k)*Math.min(1, dt*4); d.mat.opacity = d.k*.45;
    for(const s of d.s){ s.m.visible = d.k > .02; s.m.position.y += s.v*dt; if(s.m.position.y > d.y1) s.m.position.y = d.y0; }
  }
  for(const g of gusts){
    g.k += ((g.on() ? 1 : 0) - g.k)*Math.min(1, dt*4); g.mat.opacity = g.k*.5;
    for(const s of g.s){ s.m.visible = g.k > .02; s.m.position.x += Math.sign(g.force)*s.v*9*dt; if(s.m.position.x > g.x1) s.m.position.x = g.x0; if(s.m.position.x < g.x0) s.m.position.x = g.x1; }
  }
}

// ================= people =================
function buildPerson(g, o){
  const SK = o.sk || '#D9A57C', AO = o.ao, QU = o.quan || '#2A2630';
  for(const s of [-1,1]){ blob(g, new THREE.Vector3(s*.3, .75, 0), [.24, .24, .7], QU); blob(g, new THREE.Vector3(s*.3, .1, .12), [.2, .24, .1], '#5E4630'); }
  blob(g, new THREE.Vector3(0, 2.0, 0), [.66, .55, .88], AO);
  blob(g, new THREE.Vector3(0, 1.3, 0), [.58, .48, .34], AO);
  for(let i=0;i<3;i++) blob(g, new THREE.Vector3(.12, 2.35 - i*.3, .52), .045, '#F4F1EA', {small:true});
  const arms = [];
  for(const s of [-1,1]){ const a = new THREE.Group(); a.position.set(s*.62, 2.5, 0); g.add(a);
    blob(a, new THREE.Vector3(s*.1, -.4, .05), [.17, .17, .5], AO, {rot:[0, 0, s*.3]}); blob(a, new THREE.Vector3(s*.2, -.85, .12), .15, SK); arms.push(a); }
  const head = new THREE.Group(); g.add(head);
  blob(head, new THREE.Vector3(0, 3.35, 0), [.6, .58, .6], SK);
  if(o.hair) blob(head, new THREE.Vector3(0, 3.6, -.2), [.62, .5, .45], o.hair);
  eyes(head, 0, 3.42, .52, .18, .21, .2, .23);
  for(const s of [-1,1]) blob(head, new THREE.Vector3(s*.4, 3.2, .44), [.1, .04, .06], '#E79B85', {small:true});
  const mouth = blob(head, new THREE.Vector3(0, 3.12, .55), [.1, .05, .04], '#7A2E2E', {small:true});
  if(o.hat === 'mu'){ blob(head, new THREE.Vector3(0, 3.82, -.04), [.64, .6, .3], o.hatC || '#2F6FB5'); blob(head, new THREE.Vector3(0, 3.72, .5), [.42, .3, .06], o.hatC || '#2F6FB5'); }
  if(o.beard) blob(head, new THREE.Vector3(0, 2.95, .42), [.28, .2, .14], o.hair || '#E8E4DC');
  return {head, arms, mouth};
}
const people = [];
function person(o){
  ZONE = o.zone;
  const g = new THREE.Group(); g.position.set(o.x, o.y || 0, o.z === undefined ? .3 : o.z); g.rotation.y = o.ry || .25; g.scale.setScalar(S*(o.s || 1)); scene.add(g);
  const v = Object.assign({g, awake:false, line:'', lineT:0}, o); v.R = buildPerson(g, o);
  people.push(v); setZone(ZONE, 0); return v;
}
function vSay(v, t, d){ v.line = t; v.lineT = d; }
function wakeUp(v, line, obj, camY){
  play([{dur:.4, start:()=>{ v.awake = true; colour(v.zone); vSay(v, line, 2.8); }}, {dur:2.2, cam:[v.g.position.x + 4, camY || 3.4]}, {dur:0, start:()=>objective(obj)}]);
}
// a paper kite: a diamond with cross sticks and a tail of bows
function kiteMesh(parent, s, c, tail){
  const ks = new THREE.Shape(); ks.moveTo(0, .95*s); ks.lineTo(.68*s, .15*s); ks.lineTo(0, -.85*s); ks.lineTo(-.68*s, .15*s); ks.closePath();
  const k = mesh(parent, new THREE.ShapeGeometry(ks), c, {ow:.04}); k.material.side = THREE.DoubleSide;
  rod(parent, new THREE.Vector3(0, .95*s, .03), new THREE.Vector3(0, -.85*s, .03), .03*s, '#B88A4A', {outline:false});
  rod(parent, new THREE.Vector3(-.68*s, .15*s, .03), new THREE.Vector3(.68*s, .15*s, .03), .03*s, '#B88A4A', {outline:false});
  for(let i=0;i<(tail || 4);i++) blob(parent, new THREE.Vector3(Math.sin(i*1.4)*.14*s, (-1.05 - i*.34)*s, 0), [.11*s, .05*s, .1*s], tail === 0 ? c : '#F2C230', {small:true});
  return k;
}

// ================= room 1 · Sân thượng nhà Tí: Cu Tí's kite is torn; he shows Tò how to fold one =================
ZONE = 'r1';
tank(-5.5, 0, -3.2, 'r1'); antenna(10.5, 0, -3.6, 4.2, 'r1');
clothes(-7.5, 4.5, 3.4, -2.2, 'r1');
plant(W, 8.4, 0, -1.6, .9, 'hoa'); plant(W, 11.6, 0, -1.4, .8);
box(W, 5.2, 9.0, 0, 2.6, -1.4, -.46, '#9FCBC1', Object.assign({}, WALL, {uv:[2, 2.6]}));
box(W, 5.1, 9.1, 2.6, 2.8, -1.5, -.4, '#B8A58E', {ow:.03, uv:[2,1], map:TEX.stone});
const vTi = person({x:1.6, z:.5, ao:'#2F6FB5', quan:'#3B4152', hair:'#2A2630', zone:'cuti', s:.7, ry:.35});
const tornKite = new THREE.Group(); tornKite.position.set(2.4, .25, 1.2); tornKite.rotation.set(-1.2, 0, .5); scene.add(tornKite); ZONE = 'cuti'; kiteMesh(tornKite, .7, '#E8442E', 3);
// ================= room 2 · Lò bánh: the bakery's chimney has stopped breathing =================
ZONE = 'r2';
box(W, 21.0, 26.4, 0, 3.0, -2.6, -.46, '#E9C46A', Object.assign({}, WALL, {uv:[3, 3]}));
roof(W, 20.6, 26.8, 3.0, -.3, 2.6, 1.0, '#B5513A');
sign(W, 21.6, 25.8, 1.8, 2.6, -.44, '#C23A28', '#F4F1EA', 'LÒ BÁNH', 'bánh mì nóng');
box(W, 27.6, 30.4, 0, .7, -1.2, .4, '#8A8178', {ow:.03, uv:[1,1], map:TEX.stone});
for(let i=0;i<5;i++) box(W, 27.8 + i*.55, 28.1 + i*.55, .7, .76, -1.1, .3, '#3B3540', {outline:false});
box(W, 28.4, 29.6, .7, 8.6, -2.4, -1.4, '#A39788', {ow:.04, uv:[1,3], map:TEX.stone});
const vMai = person({x:25.2, z:.6, ao:'#F4F1EA', hat:'mu', hatC:'#F4F1EA', hair:'#2A2630', zone:'comai', ry:.1});
tower(32, 46, 6.6, '#C7B8E0', 'r2');
// the old chimney on top: the hidden tò he sits on its cap
box(W, 39.9, 41.3, 6.6, 9.0, -1.6, -.5, '#B5513A', {ow:.04, uv:[1,2], map:TEX.stone}); box(W, 39.7, 41.5, 9.0, 9.2, -1.7, -.4, '#8A7D6F', {ow:.03});
plat(39.8, 41.4, 9.2, true);
antenna(35, 6.6, -3.4, 3.6, 'r2'); tank(43.6, 6.6, -3.4, 'r2');
const bakery = draft(27.5, 30.5, 0, 9.6, ()=>vMai.awake);
// ================= room 3 · Chong chóng: bé Na's pinwheels; the gusts come back in breaths =================
ZONE = 'r3';
clothes(47, 58, 3.6, -2.4, 'r3'); tank(55.4, 0, -3.4, 'r3');
box(W, 47.9, 49.7, 0, 2.4, -1.0, -.46, '#7A4E2D', {ow:.03, uv:[.8,.8], map:TEX.wood});
const wheels = [];
for(let i=0;i<6;i++){ ZONE = 'r3'; const x = 51.2 + i*.8, y = 2.2 + (i%2)*.5;
  rod(W, new THREE.Vector3(x, .9, .6), new THREE.Vector3(x, y, .6), .025, '#C99A52', {outline:false});
  const w = new THREE.Group(); w.position.set(x, y, .7); scene.add(w);
  for(let k=0;k<4;k++){ const b = mesh(w, new THREE.ConeGeometry(.22, .5, 3), ['#E8442E','#F2C230','#2E9C93','#F06BAE'][(k + i)%4], {ow:.015}); b.rotation.z = k*Math.PI/2; b.position.set(Math.cos(k*Math.PI/2 + Math.PI/2)*.22, Math.sin(k*Math.PI/2 + Math.PI/2)*.22, 0); }
  wheels.push(w); }
const vNa = person({x:53.8, z:1.0, ao:'#F06BAE', quan:'#3B4152', hair:'#2A2630', zone:'bena', s:.66, ry:-.2});
for(const x of [57.5, 61.4]){ ZONE = 'r3'; rod(W, new THREE.Vector3(x, 0, -.8), new THREE.Vector3(x, 5.2, -.8), .05, '#8A8178', {outline:false}); }
const flags = [];
for(let i=0;i<5;i++){ ZONE = 'r3'; const f = new THREE.Group(); f.position.set(57.5 + i*.8, 5.0 - Math.sin(i/4*Math.PI)*.35, -.8); scene.add(f);
  const m = mesh(f, new THREE.ConeGeometry(.28, .6, 3), ['#E8442E','#F2C230','#2F6FB5','#2E9C93','#F06BAE'][i], {ow:.015}); m.rotation.z = Math.PI; m.position.y = -.3; flags.push(f); }
let gustT = 0;
const gustOn = ()=>vNa.awake && gustT % 5.2 < 2.6;
gust(57, 76, -3, 16, 7.5, gustOn);
// ================= room 4 · Máy lạnh: Lũ Bụi sit on the warm vent =================
ZONE = 'r4';
box(W, 77, 83, 0, 3.2, -2.6, -.46, '#F1DDB0', Object.assign({}, WALL, {uv:[3, 3]}));
box(W, 76.9, 83.1, 3.2, 3.4, -2.7, -.4, '#B8A58E', {ow:.03, uv:[2,1], map:TEX.stone});
box(W, 88, 91, 0, .9, -.6, 1.6, '#D8DCE0', {ow:.04});
for(let i=0;i<5;i++) box(W, 88.2 + i*.55, 88.5 + i*.55, .9, .95, -.5, 1.5, '#5E6670', {outline:false});
block(88, 91, -2, .9);
const fanBlade = new THREE.Group(); fanBlade.position.set(89.5, .45, 1.62); scene.add(fanBlade); ZONE = 'r4';
for(let k=0;k<3;k++){ const b = box(fanBlade, -.06, .06, 0, .38, -.02, .02, '#8A8178', {outline:false}); b.rotation.z = k*Math.PI*2/3; }
tower(92, 100, 5.5, '#E8A598', 'r4');
tank(97.6, 5.5, -3.4, 'r4');
const vent = draft(88, 91, .9, 10.5, ()=>ventClear);
let ventClear = false;
// ================= room 5 · Ba ống khói: the chimneys of the noodle shop breathe in turn =================
ZONE = 'r5';
for(const [x, h] of [[105.2, 2.2], [112.8, 4.6]]){ box(W, x - .7, x + .7, 0, h, -2.4, -1.2, '#B5513A', {ow:.04, uv:[1,2], map:TEX.stone}); box(W, x - .85, x + .85, h, h + .2, -2.5, -1.1, '#8A7D6F', {ow:.03}); }
box(W, 107.2, 110.4, 6.2, 6.4, -.8, .9, '#E9DCC8', {ow:.03}); for(let i=0;i<5;i++) box(W, 107.4 + i*.7, 107.5 + i*.7, 6.4, 7.2, .7, .8, '#2A2630', {outline:false});
rod(W, new THREE.Vector3(107.2, 7.2, .75), new THREE.Vector3(110.4, 7.2, .75), .03, '#2A2630', {outline:false});
for(const x of [107.4, 110.2]) rod(W, new THREE.Vector3(x, 0, -.4), new THREE.Vector3(x, 6.2, -.4), .06, '#8A8178', {outline:false});
plat(107.2, 110.4, 6.4, true);
sign(W, 101.0, 104.0, 2.6, 3.4, -.44, '#2E8C86', '#F4F1EA', 'PHỞ', 'gia truyền');
box(W, 100.6, 104.4, 0, 3.6, -1.6, -.46, '#F1DDB0', Object.assign({}, WALL, {uv:[2, 3.6]}));
const vSau = person({x:103.4, z:.7, ao:'#7DBB4B', hair:'#E8E4DC', zone:'chusau', ry:-.25});
let puffT = 0;
const smokeA = draft(104, 106.5, 0, 8.2, ()=>vSau.awake, '#EDEAE6');
const smokeB = draft(111.5, 114, 4.2, 15.6, ()=>vSau.awake && puffT % 4.8 < 2.4, '#EDEAE6');
tower(118, 134, 13, '#9FCBC1', 'r5');
antenna(124, 13, -3.4, 3.2, 'r5'); tank(130.4, 13, -3.4, 'r5'); clothes(119, 128, 15.6, -2.6, 'r5');
// ================= room 6 · Lịch gió: the wind follows the month on ông Hai's wall calendar =================
ZONE = 'r6';
box(W, 134.6, 139.6, 0, 3.4, -1.4, -.46, '#E9C46A', Object.assign({}, WALL, {uv:[2.4, 3.4]}));
box(W, 134.5, 139.7, 3.4, 3.6, -1.5, -.4, '#B8A58E', {ow:.03, uv:[2,1], map:TEX.stone});
const windBac = gust(134, 157, -3, 30, -5.5, ()=>sheetG.L === 0);
const windNom = gust(134, 160, -3, 30, 7.5, ()=>sheetG.L === 1);
const sock = new THREE.Group(); sock.position.set(139.4, 4.6, -.6); scene.add(sock); ZONE = 'r6';
rod(W, new THREE.Vector3(139.4, 3.6, -.6), new THREE.Vector3(139.4, 4.8, -.6), .04, '#8A8178', {outline:false});
for(let i=0;i<4;i++){ const m = mesh(sock, new THREE.CylinderGeometry(.24 - i*.04, .2 - i*.04, .34, 10, 1, true), i%2 ? '#F4F1EA' : '#E8442E', {ow:.015}); m.material.side = THREE.DoubleSide; m.rotation.z = Math.PI/2; m.position.x = .2 + i*.34; }
// ================= room 7 · Cửa mái: the skylight over the attic kitchen is latched shut =================
ZONE = 'r7';
box(W, 157.0, 161.0, 0, 2.6, -1.4, -.46, '#C7B8E0', Object.assign({}, WALL, {uv:[2, 2.6]}));
box(W, 156.9, 161.1, 2.6, 2.8, -1.5, -.4, '#B8A58E', {ow:.03, uv:[2,1], map:TEX.stone});
box(W, 165.6, 169.4, 0, 3.0, -2.2, -.46, '#F1DDB0', Object.assign({}, WALL, {uv:[2, 3]}));
roof(W, 165.3, 169.7, 3.0, -.3, 2.2, .8, '#B5513A');
const latch = new THREE.Group(); latch.position.set(168.6, 2.1, -.36); scene.add(latch); ZONE = 'r7'; box(latch, -.25, .25, -.25, .25, -.1, .1, '#C23A28', {ow:.03});
box(W, 170, 173, 0, .3, -1.0, 1.4, '#7A4E2D', {ow:.03, uv:[.8,.8], map:TEX.wood});
const hatch = new THREE.Group(); hatch.position.set(170, .3, .2); scene.add(hatch); ZONE = 'r7';
box(hatch, 0, 3, 0, .12, -1.2, 1.2, '#A27650', {ow:.03, uv:[.8,.8], map:TEX.wood});
let hatchK = 0, hatchOpen = false;
const attic = draft(170, 173, 0, 12.2, ()=>hatchOpen, '#FFE9C2');
target({x:168.6, y:2.1, r:.9, onHit:()=>hatchHit()});
tower(174, 190, 10, '#E9C46A', 'r7');
antenna(181, 10, -3.4, 3.6, 'r7'); tank(186.6, 10, -3.4, 'r7');
// ================= room 8 · Diều mắc dây: the children's kites hang tangled on the wires =================
ZONE = 'r8';
box(W, 190.6, 193.8, 0, 2.6, -1.6, -.46, '#C99A52', {ow:.03, uv:[.8,.8], map:TEX.wood});
for(const x of [190.6, 213.4]){ ZONE = 'r8'; rod(W, new THREE.Vector3(x, 0, -1.4), new THREE.Vector3(x, 6.4, -1.4), .07, '#8A8178', {outline:false}); }
wire(new THREE.Vector3(190.6, 6.2, -1.4), new THREE.Vector3(213.4, 6.2, -1.4), 2.4);
const KITES = [[195.4, 2.2, '#E8442E'], [199.0, 4.4, '#F2C230'], [202.6, 6.6, '#2E9C93'], [206.2, 8.8, '#F06BAE'], [209.8, 11.0, '#2F6FB5']];
let kitesUp = false;
const kites = KITES.map(([x, y, c], i)=>{
  const g = new THREE.Group(); g.position.set(x, 4.2, -1.0); g.rotation.z = .9; scene.add(g); ZONE = 'r8';
  kiteMesh(g, 1.15, c, 4);
  const k = {g, x, y, k:0, ph:i*1.3};
  k.p = plat(x - 1.3, x + 1.3, y, true, ()=>k.k > .95);
  return k;
});
// ================= room 9 · Ông Đức làm diều: the highest roof, the big diều sáo on its pole =================
tower(214, 252, 12.4, '#E8A598', 'r9');
ZONE = 'r9';
box(W, 216, 221.6, 12.4, 15.0, -2.4, -.46, '#9FCBC1', Object.assign({}, WALL, {uv:[3, 2.6]}));
roof(W, 215.7, 221.9, 15.0, -.3, 2.4, .9, '#B5513A');
for(let i=0;i<3;i++){ const g = new THREE.Group(); g.position.set(217.6 + i*1.5, 14.0, -.4); g.rotation.z = (i - 1)*.2; scene.add(g); ZONE = 'r9'; kiteMesh(g, .55, ['#F2C230','#E8442E','#2E9C93'][i], 2); }
mesh(W, new THREE.CylinderGeometry(.7, .5, .6, 12), '#5E5A63', {pos:new THREE.Vector3(226, 12.7, .4), ow:.03});
for(let i=0;i<4;i++) leaf(W, new THREE.Vector3(225.6 + i*.3, 13.05, .5), .14, '#E8442E', {ow:.015});
const vDuc = person({x:222.6, y:12.4, z:.8, ao:'#7A4E2D', hair:'#E8E4DC', beard:true, zone:'ongduc', ry:.3});
const brazier = draft(224.5, 227.5, 12.4, 21, ()=>vDuc.awake, '#FFE0B0');
rod(W, new THREE.Vector3(233.6, 12.4, -.9), new THREE.Vector3(233.6, 23.5, -.9), .1, '#C99A52', {outline:false});
box(W, 228.4, 233.4, 18.0, 18.2, -1.0, .9, '#C99A52', {ow:.03, uv:[.8,.8], map:TEX.wood});
for(const x of [228.6, 233.2]) rod(W, new THREE.Vector3(x, 18.0, .8), new THREE.Vector3(233.6, 15.4, -.8), .04, '#B88A4A', {outline:false});
plat(228.4, 233.4, 18.2, true);
const bigKite = new THREE.Group(); bigKite.position.set(230.2, 19.8, -.7); scene.add(bigKite); ZONE = 'bigkite';
kiteMesh(bigKite, 2.4, '#E8442E', 0);
mesh(bigKite, new THREE.CylinderGeometry(.22, .22, .8, 10), '#C99A52', {pos:new THREE.Vector3(0, 2.6, .05), rot:[0, 0, Math.PI/2]});
setZone('bigkite', 0);
clothes(236, 246, 15.0, -2.6, 'r9'); antenna(242, 12.4, -3.4, 4.4, 'r9');

// ================= background =================
midRow(-16, 252, zoneFor, {zf:-9.5, h:5.2});
farRow(-24, 262);
clouds(-40, 280); hills(-40, 280);
moteSpan(-10, 30);

// ================= sheets: each page also folds into a kite =================
const kitePic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.42)'; x.lineWidth = 4; x.beginPath(); x.moveTo(cw*.5, ch*.18); x.lineTo(cw*.8, ch*.45); x.lineTo(cw*.5, ch*.78); x.lineTo(cw*.2, ch*.45); x.closePath(); x.stroke(); x.beginPath(); x.moveTo(cw*.5, ch*.78); x.quadraticCurveTo(cw*.6, ch*.88, cw*.45, ch*.98); x.stroke(); };
const breadPic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.42)'; x.lineWidth = 4; x.beginPath(); x.ellipse(cw*.5, ch*.6, cw*.36, ch*.1, -.2, 0, Math.PI*2); x.stroke(); for(let i=0;i<3;i++){ x.beginPath(); x.moveTo(cw*(.4 + i*.1), ch*.42); x.quadraticCurveTo(cw*(.45 + i*.1), ch*.32, cw*(.4 + i*.1), ch*.22); x.stroke(); } };
const wheelPic = (x, cw, ch)=>{ x.fillStyle = 'rgba(70,60,50,.26)'; for(let k=0;k<4;k++){ x.save(); x.translate(cw*.5, ch*.48); x.rotate(k*Math.PI/2); x.beginPath(); x.moveTo(0, 0); x.lineTo(cw*.3, -ch*.05); x.lineTo(cw*.08, -ch*.18); x.closePath(); x.fill(); x.restore(); } };
const fanPic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.4)'; x.lineWidth = 4; for(let i=0;i<5;i++){ const a = -Math.PI*.8 + i*Math.PI*.15; x.beginPath(); x.moveTo(cw*.5, ch*.8); x.lineTo(cw*.5 + Math.cos(a)*cw*.36, ch*.8 + Math.sin(a)*cw*.36); x.stroke(); } };
const smokePic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.4)'; x.lineWidth = 4; x.strokeRect(cw*.38, ch*.55, cw*.24, ch*.35); for(let i=0;i<3;i++){ x.beginPath(); x.arc(cw*(.45 + i*.08), ch*(.42 - i*.12), cw*.08, 0, Math.PI*2); x.stroke(); } };
const arrowPic = d => (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.45)'; x.lineWidth = 5; for(const yy of [.52, .68]){ x.beginPath(); x.moveTo(cw*.2, ch*yy); x.lineTo(cw*.8, ch*yy); x.stroke();
  if(d){ const tip = d > 0 ? .8 : .2; x.beginPath(); x.moveTo(cw*(tip - d*.14), ch*(yy - .06)); x.lineTo(cw*tip, ch*yy); x.lineTo(cw*(tip - d*.14), ch*(yy + .06)); x.stroke(); } } };
const planePic = (x, cw, ch)=>{ x.fillStyle = 'rgba(70,60,50,.28)'; x.beginPath(); x.moveTo(cw*.85, ch*.4); x.lineTo(cw*.15, ch*.25); x.lineTo(cw*.32, ch*.42); x.lineTo(cw*.15, ch*.62); x.closePath(); x.fill(); };
// a carried page: peeling it the first time wakes the room; it grows back so a kite can always be folded again
function page(id, x0, y0, pic, fn){
  const s = sheet({id, x0, x1:x0 + 1.2, y0, y1:y0 + 1.6, z:-.44, carry:true, respawn:true, layers:[{n:'15', pic}]});
  s.onLayer = ()=>{ s.solved = true; if(!s.woke){ s.woke = true; if(fn) fn(); } };
  return s;
}
const sheetT1 = page('T', 6.0, .4, kitePic, ()=>{
  learned.unshift('dieu'); colour('r1');
  play([{dur:.4, start:()=>{ vTi.awake = true; colour('cuti'); vSay(vTi, 'Gấp diều đi! Bấm Q, Tí chỉ cho.', 3); }}, {dur:2.4, cam:[6, 3.2]},
        {dur:0, start:()=>objective('Gấp diều, nhảy qua khe giữa hai mái')}]);
});
const sheetB2 = page('B', 22.4, .4, breadPic, ()=>wakeUp(vMai, 'Lò nóng lại rồi! Hơi ấm bốc lên kìa.', 'Cầm diều đứng trên miệng lò, bay lên mái'));
const sheetC3 = page('C', 48.2, .4, wheelPic, ()=>wakeUp(vNa, 'Chong chóng quay rồi! Gió về từng cơn!', 'Chờ cơn gió, cầm diều nhảy qua hẻm'));
const sheetQ4 = page('Q', 79.0, .4, fanPic, ()=>{ colour('r4'); objective('Gấp quạt, quạt Lũ Bụi khỏi cục máy lạnh'); });
const sheetP5 = page('P', 101.2, .4, smokePic, ()=>wakeUp(vSau, 'Bếp phở đỏ lửa rồi! Ống khói thở lại!', 'Bay theo khói, chờ ống khói cao phả hơi', 4.4));
const sheetG = sheet({id:'G', x0:135.0, x1:136.2, y0:.4, y1:2.4, z:-.44,
  layers:[{n:'Chạp', pic:arrowPic(-1)}, {n:'Ba', pic:arrowPic(1)}, {n:'Bảy', pic:arrowPic(0)}], onLayer:()=>monthWind(), onRestore:()=>monthWind()});
sheetG.onLocked = ()=>say('Tờ cuối dán chặt rồi. Bấm R để dán lại tháng trước.', 2.4);
const sheetW6 = page('W', 137.4, .4, kitePic);
const sheetM7 = page('M', 158.0, .4, planePic, ()=>{ colour('r6'); objective('Gấp máy bay, phóng trúng then cửa mái'); });
const sheetK8 = page('K', 191.6, .4, kitePic, ()=>kitesRise());
const sheetD9 = page('D', 216.6, 12.8, kitePic, ()=>wakeUp(vDuc, 'Ơ, con tò he của bà Năm! Ông nhóm lò cho con bay.', 'Bay theo hơi lò, bóc tờ lịch trên diều sáo', 15.6));
const sheetS = sheet({id:'S', x0:229.0, x1:231.4, y0:18.6, y1:20.8, z:-.44, layers:[{n:'15', pic:kitePic}], onLayer:()=>peeledKite()});
sheetW6.solved = true;

// ================= the hidden tò he and the fireflies =================
ZONE = 'keep';
const dfly = new THREE.Group(); scene.add(dfly); dfly.scale.setScalar(.5);
(function(){ const C = '#2E9C93';
  blob(dfly, new THREE.Vector3(0, .5, 0), [.18, .18, .9], C, {keep:true, rot:[0, Math.PI/2, 0]});
  blob(dfly, new THREE.Vector3(.95, .55, 0), [.26, .24, .24], C, {keep:true});
  for(const z of [-.14, .14]){ blob(dfly, new THREE.Vector3(1.1, .66, z), [.09, .09, .09], '#FFFFFF', {keep:true}); blob(dfly, new THREE.Vector3(1.16, .67, z*1.05), [.045, .045, .045], '#141019', {small:true, keep:true}); }
  for(const dx of [.2, .55]) for(const s of [-1, 1]) blob(dfly, new THREE.Vector3(dx, .62, s*.6), [.12, .03, .5], '#F4F1EA', {keep:true});
})();
dfly.position.set(40.6, 9.2, -1.0);
relic(dfly, 40.6, 9.2, 'Con chuồn chuồn của ông Đức');
firefly(16.6, 3.6);
firefly(29.0, 10.4);
firefly(68.0, 4.2);
firefly(112.8, 15.8);
firefly(206.2, 10.6);
for(const z of ROOMS.concat(['sky'])) setZone(z, 0);
bui({x:86.0, top:0, s:.5, a:85.0, b:87.2, fan:true}); bui({x:87.2, top:0, s:.44, a:86.2, b:87.6, fan:true});

// ================= bubbles =================
// sleep-talk: each grey sleeper mutters a line about the day they forgot
vTi.mo = ["…diều sáo… bay cao…", "…mẹ ơi… cho con ra đê…", "…dây diều… đứt mất rồi…"];
vMai.mo = ["…bánh trôi… còn nóng…", "…gió bấc… lạnh tay quá…", "…phơi miến… sợ mưa…"];
vNa.mo = ["…chong chóng… quay đi…", "…gió ơi… thổi mạnh lên…"];
vSau.mo = ["…lò bánh… đỏ lửa…", "…hơi nóng… bốc lên mái…", "…ai thả diều… trên mái nhà tôi…"];
vDuc.mo = ["…khung tre… phải vót mỏng…", "…dán diều… bằng hồ nếp…", "…Năm ơi… gió lên rồi…"];
for(const v of people) talker(v.g, 2.6*(v.s || 1), ()=>{
  if(P.won && !v.line) return '';
  if(v.lineT > 0) return v.line;
  return !v.awake && Math.abs(P.x - v.g.position.x) < 6 ? (v.mo ? v.mo[Math.floor(nowT/3.4 + v.g.position.x) % v.mo.length] : '…') : '';
});

// ================= story beats =================
let met2 = false, met3 = false, met4 = false, met5 = false, met6 = false, met7 = false, met8 = false, met9 = false;
function monthWind(){
  const L = Math.min(sheetG.L, 2);
  colour('r5');
  say(['Tháng Chạp: gió bấc thổi ngược!', 'Tháng Ba: gió nồm thổi xuôi về phố!', 'Tháng Bảy: lặng gió.'][L], 2.6);
  sheetG.locked = sheetG.L >= 2; sheetG.solved = L === 1;
  if(L === 1){ colour('r6'); objective('Cầm diều, theo gió nồm bay qua hẻm'); }
  else objective(L === 0 ? 'Đổi tháng cho gió thổi xuôi' : 'Lặng gió quá. Bấm R dán lại tháng trước');
}
function hatchHit(){
  play([{dur:2.4, cam:[171.5, 4], start:()=>{ hatchOpen = true; colour('r7'); say('Trúng then! Cửa mái bật mở, hơi bếp bốc lên!', 2.4); }},
        {dur:0, start:()=>objective('Lấy tờ lịch gấp diều, bay theo hơi bếp')}]);
}
LV.onFan = n=>{ if(!ventClear && buis.every(b=>b.gone)){ ventClear = true; colour('r4');
  play([{dur:2.0, cam:[90, 4.4], start:()=>say('Máy lạnh phả hơi nóng lên rồi!', 2)}, {dur:0, start:()=>objective('Gấp diều, bay theo hơi máy lạnh lên mái')}]); } };
function kitesRise(){
  play([{dur:.3, start:()=>{ kitesUp = true; colour('r8'); say('Diều gỡ ra rồi! Bay lên thành bậc!', 2.4); }}, {dur:2.6, cam:[203, 7, 22]},
        {dur:0, start:()=>objective('Nhảy theo những con diều lên mái cao')}]);
}
function peeledKite(){
  sheetS.solved = true; objective('Mái phố có màu rồi!');
  finish([
    {dur:2.6, cam:[230.2, 19.6, 16], start:()=>{ colour('bigkite'); say('Diều sáo của ông Đức!', 2); }},
    {dur:4.2, cam:[200, 12, 46], start:()=>{ bars(true); caption('Gió về trên mái phố. Diều nào cũng bay đủ màu.'); for(const z of ROOMS) colour(z); for(const v of people){ v.awake = true; colour(v.zone); } }, end:()=>caption('')},
    {dur:3.0, cam:[223, 15, 13], start:()=>vSay(vDuc, 'Mùa gió năm đó, bà Năm ngồi đây dán diều với ông.', 3)},
    {dur:4.8, cam:[223, 15, 13], start:()=>memo(drawDucMemory), end:memoOff},
    {dur:3.0, cam:[223, 15, 13], start:()=>vSay(vDuc, 'Rằm tháng Giêng này phố cũ rước đèn. Về đi con.', 3)},
    {dur:.6, end:()=>bars(false)}]);
}
function drawDucMemory(x, W, H){
  x.fillStyle = '#F6EBD9'; x.fillRect(20, 20, W-40, H-40); x.strokeStyle = '#141019'; x.lineWidth = 3; x.strokeRect(20, 20, W-40, H-40);
  x.fillStyle = '#3B2E2A'; x.font = '28px "Patrick Hand", cursive'; x.textAlign = 'center';
  x.fillText('Mùa gió năm 1985, sân thượng phố cũ', W/2, 62);
  x.strokeStyle = '#7A4E2D'; x.lineWidth = 4;
  x.beginPath(); x.moveTo(300, 90); x.lineTo(350, 140); x.lineTo(300, 200); x.lineTo(250, 140); x.closePath(); x.stroke();
  x.beginPath(); x.moveTo(300, 90); x.lineTo(300, 200); x.moveTo(250, 140); x.lineTo(350, 140); x.stroke();
  x.beginPath(); x.moveTo(300, 200); x.quadraticCurveTo(330, 230, 290, 260); x.stroke();
  x.beginPath(); x.moveTo(300, 200); x.lineTo(160, 250); x.stroke();
  x.beginPath(); x.arc(150, 190, 22, 0, Math.PI*2); x.stroke(); x.beginPath(); x.moveTo(150, 212); x.lineTo(150, 270); x.stroke();
  x.fillStyle = '#3B2E2A'; x.font = '24px "Patrick Hand", cursive'; x.fillText('“Bà Năm dán đuôi diều bằng giấy lịch cũ, diều nào cũng bay cao.”', W/2, 306);
}

// ================= per-frame level logic =================
LV.update = (dt, t)=>{
  gustT += dt; puffT += dt;
  airTick(dt);
  for(const v of people){
    if(v.lineT > 0) v.lineT -= dt;
    v.R.head.rotation.x = v.awake ? Math.sin(t*1.3 + v.x)*.05 : .35 + Math.sin(t*1.2 + v.x)*.04;
    v.R.mouth.scale.y = v.lineT > 0 ? .6 + Math.abs(Math.sin(t*14))*1.6 : 1;
    v.R.arms[1].rotation.z = v.awake ? -1.6 + Math.sin(t*2 + v.x)*.25 : 0;
  }
  const g3 = gustOn();
  for(const [i, w] of wheels.entries()) w.rotation.z -= dt*(vNa.awake ? (g3 ? 14 : 3) : 0) * (1 + i*.05);
  for(const [i, f] of flags.entries()) f.rotation.z = g3 ? -1.3 + Math.sin(t*12 + i)*.15 : -.1 + Math.sin(t*2 + i)*.05;
  fanBlade.rotation.z -= dt*(ventClear ? 16 : 0);
  sock.rotation.y = sheetG.L === 0 ? Math.PI : 0; sock.rotation.z = sheetG.L === 2 ? -1.2 : Math.sin(t*9)*.08;
  if(hatchOpen && hatchK < 1) hatchK = Math.min(1, hatchK + dt*2);
  hatch.rotation.z = hatchK*1.9; latch.rotation.z = hatchK*.9;
  tornKite.rotation.z = .5 + (vTi.awake ? Math.sin(t*3)*.1 : 0);
  for(const k of kites){
    k.k = kitesUp ? Math.min(1, k.k + dt*.8) : 0;
    const e = k.k*k.k*(3 - 2*k.k), y = 4.2 + (k.y - .3 - 4.2)*e + (k.k > .95 ? Math.sin(t*1.6 + k.ph)*.12 : 0);
    k.g.position.y = y; k.g.position.z = -1.0 + e*1.6; k.g.rotation.z = .9*(1 - e) + Math.sin(t*1.6 + k.ph)*.05*e;
    k.p.top = y + .3;
  }
  bigKite.rotation.z = Math.sin(t*1.1)*.04;
  // room beats, in the order Tò meets them
  if(!met2 && P.x > 20.4 && P.y < 1){ met2 = true; colour('r1'); say('Lò bánh nguội ngắt, ống khói chẳng thở.', 2.4); objective('Bóc tờ lịch trên cửa lò bánh'); }
  if(!met3 && P.x > 46.4 && P.y < 1){ met3 = true; colour('r2'); say('Hẻm rộng quá! Chong chóng đứng im…', 2.4); objective('Bóc tờ lịch trên giá chong chóng'); }
  if(!met4 && P.x > 76.4 && P.y < 1){ met4 = true; colour('r3'); say('Lũ Bụi ngồi chặn cục máy lạnh!', 2.4); objective('Bóc tờ lịch trên tường, gấp quạt'); }
  if(!met5 && P.x > 100.4 && P.y < 1){ met5 = true; colour('r4'); say('Quán phở tắt bếp, ba ống khói lạnh tanh.', 2.4); objective('Bóc tờ lịch ở quán phở'); }
  if(!met6 && P.x > 134.4 && P.y < 1){ met6 = true; colour('r5'); monthWind(); }
  if(!met7 && P.x > 156.4 && P.y < 1){ met7 = true; colour('r6'); say('Cửa mái gác bếp bị cài then cao quá.', 2.4); objective('Bóc tờ lịch, gấp máy bay'); }
  if(!met8 && P.x > 190.4 && P.y < 1){ met8 = true; colour('r7'); say('Diều của lũ trẻ mắc hết lên dây!', 2.4); objective('Bóc tờ lịch trên thùng diều'); }
  if(!met9 && P.x > 214.4 && P.y > 12){ met9 = true; colour('r8'); say('Ông làm diều ngồi ngủ bên lò than.', 2.4); objective('Bóc tờ lịch trên vách nhà ông Đức'); }
};
LV.hint = ()=>{
  if(P.x < 20) return !vTi.awake ? 'Bóc tờ lịch trên bể nước.' : kiteOn() ? 'Chạy tới mép mái, nhảy lên. Cầm diều thì lượn được xa.' : held.on ? 'Bấm Q gấp thành diều.' : 'Lấy tờ lịch trên bể nước, gấp diều.';
  if(P.x < 46) return !vMai.awake ? 'Bóc tờ lịch trên cửa lò bánh.' : kiteOn() ? 'Cầm diều đứng trên miệng lò, hơi nóng đưa lên. Lên cao thì sang phải.' : 'Lấy tờ lịch trên cửa lò, gấp diều.';
  if(P.x < 76) return !vNa.awake ? 'Bóc tờ lịch trên giá chong chóng.' : kiteOn() ? 'Chờ cờ bay phần phật, chạy nhảy qua hẻm. Gió đẩy diều đi xa.' : 'Lấy tờ lịch gấp diều. Không có diều thì gió chẳng đẩy được.';
  if(P.x < 100){
    if(!ventClear) return heldIs('quat') ? 'Quay mặt về phía Lũ Bụi, bấm E để quạt.' : held.on ? 'Bấm Q cho tới khi gấp thành quạt.' : 'Lấy tờ lịch trên tường, gấp quạt.';
    return kiteOn() ? 'Đứng trên cục máy lạnh, hơi nóng đưa diều lên. Sang phải lên mái.' : 'Bấm Q cho tới khi gấp thành diều.';
  }
  if(P.x < 118) return !vSau.awake ? 'Bóc tờ lịch ở quán phở.' : kiteOn() ? 'Khói ống thấp đưa lên ban công. Chờ ống cao phả khói thì bay sang.' : 'Lấy tờ lịch ở quán phở gấp diều.';
  if(P.x < 156) return sheetG.L === 1 ? (kiteOn() ? 'Gió nồm thổi xuôi. Cầm diều nhảy qua hẻm.' : 'Lấy tờ lịch bên phải, gấp diều.') : sheetG.L === 0 ? 'Gió bấc thổi ngược. Bóc tờ lịch tháng cho gió đổi chiều.' : 'Lặng gió rồi. Bấm R dán lại tháng trước.';
  if(P.x < 190) return !hatchOpen ? (heldIs('maybay') ? 'Đứng cách cửa mái vài bước, quay sang phải, bấm E phóng vào then đỏ.' : held.on ? 'Bấm Q cho tới khi gấp thành máy bay.' : 'Lấy tờ lịch gấp máy bay.') : kiteOn() ? 'Cầm diều đứng trên cửa mái, bay lên rồi sang phải.' : 'Lấy tờ lịch lần nữa, gấp diều.';
  if(P.x < 214) return !kitesUp ? 'Bóc tờ lịch trên thùng diều.' : 'Nhảy từ con diều này sang con diều kia, lên mái cao.';
  if(!vDuc.awake) return 'Bóc tờ lịch trên vách nhà ông Đức.';
  return kiteOn() ? 'Đứng trên lò than, bay lên rồi đáp xuống giá tre. Nắm mép tờ lịch trên diều sáo mà bóc.' : 'Lấy tờ lịch trên vách, gấp diều.';
};
LV.winText = ()=>({
  h:'Màn 7 xong!',
  p:'Gió về trên mái phố. Diều của lũ trẻ lại bay đủ màu.',
  memory:(fliesGot === 5
    ? '<b>Ký ức mở khoá.</b> Mùa gió năm 1985, ông Đức dạy bà Năm làm diều sáo cho lũ trẻ trong phố. Bà dán đuôi diều bằng giấy lịch cũ.'
    : 'Còn ' + (5 - fliesGot) + ' con đom đóm ở Màn 7 chưa tìm thấy.')
    + (relicGot ? '<br><b>Tìm được con chuồn chuồn của ông Đức.</b>' : '<br>Có một con tò he cũ giấu trên nắp ống khói cũ.'),
  next:'Màn 8 · Rước đèn: đêm Rằm trên phố cũ'
});

// ================= intro: wind over the rooftops =================
LV.intro = {end:12, sheetsAt:9,
  caps:[[0.5, 4.0, 'Chương 3. Tò về lại phố cũ, băng qua những mái nhà.'],
        [4.3, 8.0, 'Tờ lịch dán lên ống khói, lên chong chóng, gió trên mái ngừng thổi.'],
        [8.3, 11.6, 'Bóc tờ lịch ra, gấp thành diều. Gió về là bay.']],
  run(it, dt, t){
    for(const z of ROOMS.concat(['sky'])) setZone(z, 0);
    const camX = it < 4 ? 48 - it*4 : it < 8 ? 226 - (it - 4)*4 : Math.max(-2, 12 - (it - 8)*4);
    const camY = it >= 4 && it < 8 ? 15 : 2.6;
    camLook.lerp(tmpV.set(camX, camY, -1), Math.min(1, dt*2));
    camPos.lerp(tmpV.set(camX - 2.5, camY + 2.6, it >= 4 && it < 8 ? 26 : 17), Math.min(1, dt*2));
    camera.position.copy(camPos); camera.lookAt(camLook);
    sun.position.set(camLook.x - 8, 18 + camLook.y, 12); sun.target.position.set(camLook.x, camLook.y, 0);
    toInner.rotation.y = .9;
  },
  done(){
    if(!learned.length) learned.push('thuyen', 'maybay', 'quat', 'non');
    say('Mái phố lặng gió…', 2.2);
    objective('Bóc tờ lịch trên bể nước nhà Tí');
  }};
startGame();
