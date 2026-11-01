// ================= Màn 8 · Rước đèn: the full moon of the first lunar month (Tết Nguyên Tiêu), the lantern procession through the old streets =================
// rooms (x): 1 đầu phố, Bống -8..18 · 2 dây đèn qua kênh 18..42 · 3 bếp bánh trôi 42..66 · 4 Lũ Bụi 66..90 · 5 đèn hoa đăng 90..114
//            6 lịch trăng 114..138 · 7 đèn trên dây 138..162 · 8 đoàn rước đèn 162..190 · 9 sân đình 190..216
// new here: fold the page into a star lantern; carry its flame to the lanterns hung along the street; moon steps only hold where a hung lantern shines
LV.level = 8;
LV.start = {x:-3.5, y:0};
LV.bounds = [-7.5, 215.5];
LV.cam = [0, 210];
LV.dark = true;
const ROOMS = ['r1','r2','r3','r4','r5','r6','r7','r8','r9'];
LV.sky = ROOMS;
function zoneFor(x){ return x < 18 ? 'r1' : x < 42 ? 'r2' : x < 66 ? 'r3' : x < 90 ? 'r4' : x < 114 ? 'r5' : x < 138 ? 'r6' : x < 162 ? 'r7' : x < 190 ? 'r8' : 'r9'; }
// the full-moon night: deep blue above, warm violet at the horizon; grey is a flat dull slate
SKY.c.top.set('#1B2550'); SKY.c.mid.set('#3A4C8E'); SKY.c.bot.set('#9A7AB8');
SKY.g.top.set('#5E5F66'); SKY.g.mid.set('#77777C'); SKY.g.bot.set('#8C8A8C');
LIGHT.fog.set('#4A4C86'); LIGHT.sun.set('#C8D0FF'); LIGHT.sunK = [.16, .46]; LIGHT.hemiK = [.15, .52]; LIGHT.fillK = [.05, .16];
NIGHT.top.set('#0F1530'); NIGHT.mid.set('#25356E'); NIGHT.bot.set('#4E4E8E'); NIGHT.fog.set('#2E3466');
NIGHT.k = .85;
toLight.distance = 7.5; toLight.decay = 2;
LV.camY = (x, y)=> y < 4.5 ? 2.8 + Math.max(0, y - 1)*.55 : y + 1.4;
const heldIs = f => held.on && held.form === f;

// ================= ground: the street, a canal, the river inlet =================
const GAPS = [[24, 36]];
const RIVER = [96, 108];
const LANDS = [[-14, 24], [36, 96], [108, 222]];
for(const [x0, x1] of LANDS){
  for(let a = x0; a < x1; a += 12){ const b = Math.min(x1, a + 12); ZONE = zoneFor(a + .1);
    box(W, a, b, -2, 0, -6, 3, '#C9C3BA', {outline:false, uv:[3.2, 3.2], map:TEX.pave});
    box(W, a, b, -.02, .06, 2.6, 2.9, '#A8998A', {outline:false}); }
  plat(x0, x1, 0, false, null, {safe:true}); block(x0, x1, -5, 0);
}
for(const [x0, x1] of GAPS.concat([RIVER])){
  ZONE = zoneFor(x0 + .1);
  for(const x of [x0, x1]) box(W, x - .15, x + .15, -3, .06, -.5, 2.9, '#A39788', {ow:.03, uv:[1,2], map:TEX.stone});
}
ZONE = 'r2'; box(W, 24, 36, -3, -.7, -6, 3, '#4FB7D2', {outline:false, uv:[7, 7], map:TEX.water}); hazard(24, 36, -.6, 'Rơi xuống kênh rồi!');
const river = channel({x0:RIVER[0], x1:RIVER[1], floor:-1.4, level:-.3, z0:-.5, z1:2.55});
hazard(-20, 230, -6, 'Rơi xuống kênh rồi!');
for(let a = -14; a < 222; a += 12){ ZONE = zoneFor(a + .1);
  box(W, a, a + 12, -1.2, -.28, 3, 14, '#9A948E', {outline:false, uv:[4,4], map:TEX.road});
  box(W, a, a + 12, -.28, 0, 2.95, 3.15, '#B6ABA0', {outline:false, uv:[2,1], map:TEX.stone}); }
function house(x0, x1, h, c, o){
  o = o || {}; ZONE = zoneFor((x0 + x1)/2);
  box(W, x0, x1, -3, h, -4.2, -.5, c, Object.assign({}, WALL, {uv:[6, h + 3, 0, -3]}));
  box(W, x0 - .05, x1 + .05, h, h + .25, -4.4, -.3, '#C98B4A', {ow:.04});
  for(const x of [x0, x1]) box(W, x - .2, x + .2, 0, h, -.5, -.32, '#F4F1EA', {ow:.025});
  if(o.roof) roof(W, x0 - .3, x1 + .3, h + .25, -.15, 3.4, 1.5, o.roof);
  for(let w = x0 + 2.2; w < x1 - 1.4; w += 3.6) win(W, w, h - 3.2, 1.4, 1.8, -.5, '#F4F1EA', ['#2E8C86', '#C23A28', '#8E6CC0'][Math.round(w)%3]);
}
// a solid wall across the street, with a ledge on top
function wall(x0, x1, top, c, zone){
  ZONE = zone; box(W, x0, x1, -2, top, -.5, 2.6, c, Object.assign({}, WALL, {uv:[2, top]}));
  box(W, x0 - .1, x1 + .1, top, top + .2, -.6, 2.7, '#B8A58E', {ow:.03, uv:[2,1], map:TEX.stone});
  block(x0, x1, -2, top);
}

// ================= lanterns hung along the street, and the moon steps their light holds up =================
const hangs = [];
function hang(x, y, o){
  o = o || {};
  const h = Object.assign({x, y, r:4.4, lit:false, c:'#E8442E', zone:'h' + hangs.length}, o);
  h.g = new THREE.Group(); h.g.position.set(x, y, .2); scene.add(h.g); ZONE = h.zone;
  blob(h.g, new THREE.Vector3(0, 0, 0), [.38, .38, .46], h.c, {ow:.035});
  for(const a of [0, Math.PI/2]) mesh(h.g, new THREE.TorusGeometry(.385, .02, 4, 20), '#8C3A20', {rot:[0, a, 0], scl:[1, 1.22, 1], outline:false});
  for(const dy of [.42, -.42]) mesh(h.g, new THREE.CylinderGeometry(.16, .16, .1, 10), '#C99A52', {pos:new THREE.Vector3(0, dy, 0), outline:false});
  rod(h.g, new THREE.Vector3(0, -.48, 0), new THREE.Vector3(0, -.85, 0), .035, '#F2C230', {outline:false});
  if(!o.float) rod(h.g, new THREE.Vector3(0, .47, 0), new THREE.Vector3(0, o.cord || 1.4, 0), .012, '#2A2530', {outline:false});
  setZone(h.zone, 0);
  h.glow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({map:dotTex, color:'#FFC94A', transparent:true, opacity:0, depthWrite:false, blending:THREE.AdditiveBlending}));
  h.glow.position.z = .3; h.g.add(h.glow);
  h.pool = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({map:dotTex, color:'#FFB347', transparent:true, opacity:0, depthWrite:false, blending:THREE.AdditiveBlending}));
  h.pool.scale.setScalar(h.r*2.1); h.pool.position.z = -.9; h.g.add(h.pool);
  hangs.push(h); return h;
}
function lightHang(h){ h.lit = true; colour(h.zone); lastProgT = nowT; if(h.onLit) h.onLit(h); }
// the moon steps: pale paper boards that only hold where light falls on them
const msteps = [];
const MSTEP_ON = new THREE.MeshBasicMaterial({color:'#FFE9A8', transparent:true, opacity:.9});
function mstep(x, y, w, o){
  const q = Object.assign({x, y, w:w || 2.0, solid:false, k:0}, o);
  q.mat = new THREE.MeshBasicMaterial({color:'#FFF2C8', transparent:true, opacity:.12, depthWrite:false});
  q.m = new THREE.Mesh(new THREE.BoxGeometry(q.w, .22, 1.2), q.mat); q.m.position.set(x, y - .11, .4); scene.add(q.m);
  const eg = new THREE.EdgesGeometry(new THREE.BoxGeometry(q.w, .22, 1.2));
  q.edge = new THREE.LineSegments(eg, new THREE.LineDashedMaterial({color:'#FFE27A', dashSize:.15, gapSize:.12, transparent:true, opacity:.6})); q.edge.computeLineDistances(); q.edge.position.copy(q.m.position); scene.add(q.edge);
  q.p = plat(x - q.w/2, x + q.w/2, y, true, ()=>q.solid);
  msteps.push(q); return q;
}
let moonOn = false;
const parade = {on:false, c:170, dir:1, kids:[]};
function lights(){
  const L = [];
  for(const h of hangs) if(h.lit) L.push(h);
  if(parade.on) for(const k of parade.kids) L.push({x:k.g.position.x + .3, y:4.6, r:4.2});
  return L;
}
function stepTick(dt){
  const L = lights();
  for(const q of msteps){
    let on = q.moon && moonOn;
    if(!on) for(const l of L){ const dx = q.x - l.x, dy = q.y - l.y; if(dx*dx + dy*dy < l.r*l.r){ on = true; break; } }
    q.solid = on; q.k += ((on ? 1 : 0) - q.k)*Math.min(1, dt*8);
    q.mat.opacity = .12 + q.k*.78; q.mat.color.set(on ? '#FFE9A8' : '#C8CCE8');
  }
}
LV.onDen = ()=>{
  let best = null;
  for(const h of hangs){ if(h.lit || h.away) continue; const dx = Math.abs(h.x - P.x), dy = h.y - (P.y + 1); if(dx < 2.4 && dy < 3.6 && dy > -2.5 && (!best || dx < Math.abs(best.x - P.x))) best = h; }
  if(!best) return false;
  lightHang(best); say('Thắp đèn!', 1.2); return true;
};
// a page tucked away in the dark: the star lantern's light finds it
const hidden = [];
function hide(s){ s.hid = true; sheetVis(s, false); hidden.push(s); return s; }

// ================= people =================
function buildPerson(g, o){
  const SK = o.sk || '#D9A57C', AO = o.ao, QU = o.quan || '#2A2630';
  for(const s of [-1,1]){ blob(g, new THREE.Vector3(s*.3, .75, 0), [.24, .24, .7], QU); blob(g, new THREE.Vector3(s*.3, .1, .12), [.2, .24, .1], '#5E4630'); }
  blob(g, new THREE.Vector3(0, 2.0, 0), [.66, .55, .88], AO);
  blob(g, new THREE.Vector3(0, 1.3, 0), [.58, .48, .34], AO);
  const arms = [];
  for(const s of [-1,1]){ const a = new THREE.Group(); a.position.set(s*.62, 2.5, 0); g.add(a);
    blob(a, new THREE.Vector3(s*.1, -.4, .05), [.17, .17, .5], AO, {rot:[0, 0, s*.3]}); blob(a, new THREE.Vector3(s*.2, -.85, .12), .15, SK); arms.push(a); }
  const head = new THREE.Group(); g.add(head);
  blob(head, new THREE.Vector3(0, 3.35, 0), [.6, .58, .6], SK);
  if(o.hair) blob(head, new THREE.Vector3(0, 3.6, -.2), [.62, .5, .45], o.hair);
  eyes(head, 0, 3.42, .52, .18, .21, .2, .23);
  for(const s of [-1,1]) blob(head, new THREE.Vector3(s*.4, 3.2, .44), [.1, .04, .06], '#E79B85', {small:true});
  const mouth = blob(head, new THREE.Vector3(0, 3.12, .55), [.1, .05, .04], '#7A2E2E', {small:true});
  return {head, arms, mouth};
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
  play([{dur:.4, start:()=>{ v.awake = true; colour(v.zone); vSay(v, line, 2.8); }}, {dur:2.2, cam:[v.g.position.x + 4, camY || 3.4]}, {dur:0, start:()=>objective(obj)}]);
}
// a star lantern on a long pole, for the children of the procession
function poleStar(parent, c, h){
  rod(parent, new THREE.Vector3(.5, 1.4, .3), new THREE.Vector3(.7, h, .3), .05, '#C99A52', {outline:false});
  const st = new THREE.Shape(); for(let i=0;i<10;i++){ const a = Math.PI/2 + i*Math.PI/5, r = i%2 ? .3 : .72; if(i) st.lineTo(Math.cos(a)*r, Math.sin(a)*r); else st.moveTo(Math.cos(a)*r, Math.sin(a)*r); }
  return mesh(parent, new THREE.ExtrudeGeometry(st, {depth:.24, bevelEnabled:false}), c, {pos:new THREE.Vector3(.7, h + .55, .2), ow:.035});
}

// ================= room 1 · Đầu phố: bé Bống with an unlit star; the street is closed by a wall =================
house(-8, 2, 7.6, '#E8A598', {roof:'#B5513A'}); house(2, 10, 7.0, '#F1DDB0'); house(10, 18, 8.0, '#9FCBC1', {roof:'#B5513A'});
ZONE = 'r1';
sign(W, -6.4, -1.8, 3.2, 4.1, -.5, '#C23A28', '#F2C230', 'RẰM THÁNG GIÊNG', 'rước đèn');
balcony(W, 11.0, 17.4, 4.4, -.5, .9, '#E9DCC8', '#2A2630');
const bong = person({x:1.0, z:.7, zone:'bong', build:g=>{ const R = buildBong(g); R.boat.visible = false; R.mouth = R.head; return R; }, s:1.25, ry:.35});
const bongStar = new THREE.Group(); bongStar.position.set(1.7, 0, .9); scene.add(bongStar); ZONE = 'bong'; poleStar(bongStar, '#E8442E', 1.6);
const H1 = hang(10.0, 3.4, {cord:4.4});
mstep(8.6, 1.5); mstep(11.0, 2.9); mstep(13.2, 4.3);
wall(14.6, 18, 5.6, '#D9A07A', 'r1');
// the kite must not glide from this wall over the whole canal and skip the three lanterns on the wire
LV.noGlide = x=>x > 18 && x < 37;
// ================= room 2 · Dây đèn qua kênh: three lanterns on a wire over the canal; light them one by one =================
house(18, 30, 7.8, '#C7B8E0'); house(30, 42, 8.2, '#E9C46A', {roof:'#B5513A'});
ZONE = 'r2'; wire(new THREE.Vector3(20, 4.9, .2), new THREE.Vector3(38, 4.9, .2), .5);
const H2 = [hang(23.0, 3.4, {c:'#F2C230', cord:1.4}), hang(27.4, 3.4, {c:'#E8442E', cord:1.4}), hang(31.8, 3.4, {c:'#F06BAE', cord:1.4})];
mstep(26.0, 1.0); mstep(29.6, 1.0); mstep(33.2, 1.0);
// ================= room 3 · Bếp bánh trôi: the mooncake oven; its heat carries a kite up to a moon step =================
house(42, 52, 7.6, '#F1DDB0', {roof:'#B5513A'});
ZONE = 'r3';
box(W, 43.2, 49.0, 0, 3.0, -2.6, -.46, '#E9A23B', Object.assign({}, WALL, {uv:[3, 3]}));
roof(W, 42.8, 49.4, 3.0, -.3, 2.6, 1.0, '#B5513A');
sign(W, 45.6, 48.8, 1.9, 2.7, -.44, '#C23A28', '#F4F1EA', 'BÁNH TRÔI', 'bánh chay');
box(W, 50, 53, 0, .5, -1.2, .4, '#8A8178', {ow:.03, uv:[1,1], map:TEX.stone});
for(let i=0;i<5;i++) box(W, 50.2 + i*.55, 50.5 + i*.55, .5, .56, -1.1, .3, '#3B3540', {outline:false});
const vBanh = person({x:47.6, z:.7, ao:'#F4F1EA', hair:'#2A2630', zone:'cohoa', ry:.15});
const ovenAir = lift(50, 53, 0, 8.0, ()=>vBanh.awake);
const ovenStreaks = [];
const ovenMat = new THREE.MeshBasicMaterial({color:'#FFE0B0', transparent:true, opacity:0, depthWrite:false});
for(let i=0;i<14;i++){ const m = new THREE.Mesh(new THREE.PlaneGeometry(.07, .8), ovenMat); m.position.set(50.2 + Math.random()*2.6, Math.random()*8, .9 + Math.random()*.5); scene.add(m); ovenStreaks.push({m, v:4 + Math.random()*3}); }
const H3 = hang(55.4, 2.8, {c:'#2E9C93', cord:6.0});
mstep(55.4, 6.4, 2.4);
house(58, 66, 9.6, '#C7B8E0');
wall(58, 66, 8.8, '#C7B8E0', 'r3');
// ================= room 4 · Lũ Bụi: the dust gang crowd the lantern stand =================
house(66, 78, 7.4, '#9FCBC1', {roof:'#B5513A'}); house(78, 90, 8.0, '#E8A598');
ZONE = 'r4';
rod(W, new THREE.Vector3(79.6, 0, -.3), new THREE.Vector3(79.6, 4.6, -.3), .06, '#8A8178', {outline:false});
box(W, 79.0, 80.6, 4.4, 4.6, -.5, -.1, '#8A8178', {ow:.02});
const H4 = hang(79.6, 2.8, {c:'#F2C230', cord:1.6});
mstep(78.4, 1.6); mstep(80.4, 3.2); mstep(82.4, 4.8);
wall(84, 90, 6.6, '#D9A07A', 'r4');
// ================= room 5 · Đèn hoa đăng: light the floating lantern, it drifts to the far bank; then sail across =================
house(90, 96, 7.2, '#F1DDB0'); house(108, 114, 7.6, '#C7B8E0');
ZONE = 'r5';
box(W, 90.6, 94.4, 0, 2.6, -1.4, -.46, '#E9C46A', Object.assign({}, WALL, {uv:[2, 2.6]}));
const vSen = person({x:93.6, z:.8, ao:'#7DBB4B', hair:'#E8E4DC', zone:'basen', ry:.3});
const H5 = hang(97.2, .45, {c:'#F06BAE', r:4.4, float:true, zone:'hoadang'});
(function(){ ZONE = 'hoadang'; for(let i=0;i<8;i++){ const a = i/8*Math.PI*2; blob(H5.g, new THREE.Vector3(Math.cos(a)*.5, -.42, Math.sin(a)*.5), [.22, .08, .14], '#F06BAE', {ow:.02, rot:[0, -a, .4]}); } })();
mstep(106.6, 2.4, 1.8);
wall(108, 114, 5.0, '#E8A598', 'r5');
// ================= room 6 · Lịch trăng: the moon shows only on the full-moon page =================
house(114, 126, 7.8, '#E9C46A', {roof:'#B5513A'}); house(126, 138, 8.6, '#9FCBC1');
ZONE = 'r6';
box(W, 114.4, 118.6, 0, 3.0, -1.4, -.46, '#F1DDB0', Object.assign({}, WALL, {uv:[2, 3]}));
for(const [x, y] of [[121.0, 1.6], [123.6, 3.2], [126.2, 4.8], [128.8, 6.4]]) mstep(x, y, 2.0, {moon:true});
wall(131, 138, 8.0, '#C7B8E0', 'r6');
const moonCloud = [];
// ================= room 7 · Đèn trên dây: a lantern hangs high on a wire; knock its h7hook and it slides down to be lit =================
house(138, 150, 7.4, '#F1DDB0', {roof:'#B5513A'}); house(150, 162, 8.2, '#E8A598');
ZONE = 'r7';
box(W, 138.4, 142.4, 0, 2.6, -1.4, -.46, '#9FCBC1', Object.assign({}, WALL, {uv:[2, 2.6]}));
wire(new THREE.Vector3(145.0, 4.0, .1), new THREE.Vector3(156.0, 7.4, .1), .2);
rod(W, new THREE.Vector3(145.0, 0, -.3), new THREE.Vector3(145.0, 4.2, -.3), .06, '#8A8178', {outline:false});
const h7hook = new THREE.Group(); h7hook.position.set(146.6, 2.0, -.2); scene.add(h7hook); ZONE = 'r7';
box(h7hook, -.25, .25, -.25, .25, -.1, .1, '#C23A28', {ow:.03});
const H7 = hang(152.6, 5.4, {c:'#E8442E', cord:.9});
const H7UP = [152.6, 5.4], H7DOWN = [147.6, 2.6];
let h7 = 0, h7want = 0;
H7.away = true;
target({x:146.6, y:2.0, r:.9, onHit:()=>{ h7want = 1; colour('r7'); say('Trúng móc! Đèn trượt xuống rồi!', 2); }});
H7.onLit = ()=>{ h7want = 0; objective('Leo theo bậc trăng lên tường'); };
mstep(150.6, 2.4); mstep(152.8, 4.2); mstep(155.0, 6.0);
wall(157, 162, 8.4, '#E9C46A', 'r7');
// ================= room 8 · Đoàn rước đèn: the children's procession walks to and fro; their poles light the steps as they pass =================
house(162, 176, 7.6, '#C7B8E0', {roof:'#B5513A'}); house(176, 190, 8.4, '#F1DDB0');
ZONE = 'r8';
box(W, 162.6, 166.4, 0, 2.6, -1.4, -.46, '#3B4152', Object.assign({}, WALL, {uv:[2, 2.6]}));
const drum = mesh(W, new THREE.CylinderGeometry(.6, .6, .7, 16), '#C23A28', {pos:new THREE.Vector3(166.0, .35, 1.6), ow:.03});
for(let i=0;i<4;i++){
  const k = person({x:168 + i*2, z:1.1, ao:['#F2C230','#2E9C93','#F06BAE','#2F6FB5'][i], quan:'#3B4152', hair:'#2A2630', zone:'kids', s:.6, ry:.4});
  ZONE = 'kids'; k.star = poleStar(k.g, ['#E8442E','#F2C230','#E8442E','#F06BAE'][i], 6.2); k.g.visible = false; parade.kids.push(k);
}
for(const [x, y] of [[168.4, 1.8], [171.0, 3.4], [173.6, 5.0], [176.2, 6.6], [178.8, 8.0]]) mstep(x, y, 2.0);
wall(181, 190, 9.6, '#E8A598', 'r8');
// ================= room 9 · Sân đình: chú Tư hangs the giant star lantern; climb by two hung lanterns =================
ZONE = 'r9';
box(W, 190, 216, -2, 6.4, -6.6, -4.4, '#C98B4A', Object.assign({}, WALL, {uv:[8, 6]}));
roof(W, 189.6, 216.4, 6.4, -4.2, 4.6, 2.2, '#B5513A');
for(const x of [192, 198, 204, 210, 215.6]) mesh(W, new THREE.CylinderGeometry(.25, .25, 6.4, 12), '#8C3A20', {pos:new THREE.Vector3(x, 3.2, -4.0), ow:.03});
sign(W, 199.0, 205.0, 5.0, 6.0, -4.3, '#C23A28', '#F2C230', 'ĐÌNH LÀNG', 'rằm tháng Giêng');
box(W, 190.4, 194.6, 0, 2.6, -1.4, -.46, '#E9C46A', Object.assign({}, WALL, {uv:[2, 2.6]}));
const vTu = person({x:194.6, z:.9, zone:'chutu', build:g=>{ const R = buildTu(g); R.mouth = R.belly; return R; }, s:1.05, ry:.3});
const H9 = [hang(196.6, 3.0, {c:'#F2C230', cord:3.0}), hang(201.2, 6.6, {c:'#E8442E', cord:1.6})];
mstep(197.8, 1.6); mstep(199.8, 3.4); mstep(201.8, 5.2); mstep(203.6, 7.0);
// the bamboo scaffold under the giant star
for(const x of [205.2, 209.8]) rod(W, new THREE.Vector3(x, 0, -.6), new THREE.Vector3(x, 9.4, -.6), .08, '#C99A52', {outline:false});
box(W, 205.0, 210.2, 9.2, 9.4, -1.0, .9, '#C99A52', {ow:.03, uv:[.8,.8], map:TEX.wood});
plat(205.0, 210.2, 9.4, true);
const bigStar = new THREE.Group(); bigStar.position.set(207.3, 11.0, -.75); scene.add(bigStar); ZONE = 'bigstar';
(function(){ const st = new THREE.Shape(); for(let i=0;i<10;i++){ const a = Math.PI/2 + i*Math.PI/5, r = i%2 ? 1.2 : 2.7; if(i) st.lineTo(Math.cos(a)*r, Math.sin(a)*r); else st.moveTo(Math.cos(a)*r, Math.sin(a)*r); }
  mesh(bigStar, new THREE.ExtrudeGeometry(st, {depth:.3, bevelEnabled:false}), '#E8442E', {pos:new THREE.Vector3(0, 0, -.3), ow:.05});
  for(let i=0;i<5;i++){ const a = -Math.PI/2 + (i - 2)*.25; rod(bigStar, new THREE.Vector3(Math.cos(a)*1.0, Math.sin(a)*1.0, 0), new THREE.Vector3(Math.cos(a)*2.0, Math.sin(a)*2.0 - 1.4, 0), .04, '#F2C230', {outline:false}); } })();
setZone('bigstar', 0);
const bigGlow = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial({map:dotTex, color:'#FFC94A', transparent:true, opacity:0, depthWrite:false, blending:THREE.AdditiveBlending}));
bigGlow.position.set(207.3, 11.0, -.4); scene.add(bigGlow);

// ================= background: lanterns over the street, back rows, the full moon =================
for(const [a, b] of [[-7.5, 8], [36.6, 52], [66.6, 84], [114.6, 130], [138.6, 156], [162.6, 180]]){ ZONE = zoneFor((a+b)/2); lanternString(a, b, 7.6, 1.2, .8); }
midRow(-16, 220, zoneFor, {zf:-5.4});
farRow(-24, 232);
const moon = new THREE.Mesh(new THREE.CircleGeometry(5, 40), new THREE.MeshBasicMaterial({color:'#FFF2C8', fog:false}));
moon.position.set(110, 34, -90); scene.add(moon);
const moonGlow = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshBasicMaterial({map:dotTex, color:'#FFE9A8', transparent:true, opacity:.35, depthWrite:false, blending:THREE.AdditiveBlending, fog:false}));
moonGlow.position.set(110, 34, -91); scene.add(moonGlow);
const cloud = new THREE.Group(); scene.add(cloud); cloud.position.set(110, 34, -88);
for(let k=0;k<5;k++) blob(cloud, new THREE.Vector3((k - 2)*2.6, Math.sin(k*1.3)*1.2, 0), [3.2, 2.0, 1], '#5E5F78', {nofog:true, outline:false, shadow:false, keep:true});
clouds(-40, 240); hills(-40, 240);
const POLES = [-8, 18.6, 42.4, 66.4, 90.4, 114.4, 138.4, 162.4, 190.4];
for(const x of POLES){ ZONE = zoneFor(x); powerPole(x, 3.4); }
for(let i=0;i<POLES.length-1;i++){ ZONE = zoneFor(POLES[i]); poleWires([POLES[i], POLES[i+1]], 3.2); }
moteSpan(-10, 30);

// ================= sheets =================
const starPic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.42)'; x.lineWidth = 4; x.beginPath(); for(let i=0;i<10;i++){ const a = -Math.PI/2 + i*Math.PI/5, r = (i%2 ? .12 : .3)*cw, px = cw*.5 + Math.cos(a)*r, py = ch*.45 + Math.sin(a)*r; if(i) x.lineTo(px, py); else x.moveTo(px, py); } x.closePath(); x.stroke(); x.beginPath(); x.moveTo(cw*.5, ch*.6); x.lineTo(cw*.52, ch*.95); x.stroke(); };
const cakePic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.42)'; x.lineWidth = 4; x.strokeRect(cw*.25, ch*.4, cw*.5, cw*.5); x.beginPath(); x.arc(cw*.5, ch*.4 + cw*.25, cw*.14, 0, Math.PI*2); x.stroke(); };
const fanPic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.4)'; x.lineWidth = 4; for(let i=0;i<5;i++){ const a = -Math.PI*.8 + i*Math.PI*.15; x.beginPath(); x.moveTo(cw*.5, ch*.8); x.lineTo(cw*.5 + Math.cos(a)*cw*.36, ch*.8 + Math.sin(a)*cw*.36); x.stroke(); } };
const lotusPic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.42)'; x.lineWidth = 4; for(const a of [-.6, 0, .6]){ x.beginPath(); x.ellipse(cw*.5 + Math.sin(a)*cw*.16, ch*.55, cw*.1, ch*.16, a, 0, Math.PI*2); x.stroke(); } x.beginPath(); x.moveTo(cw*.15, ch*.75); x.quadraticCurveTo(cw*.5, ch*.85, cw*.85, ch*.75); x.stroke(); };
const moonPic = k => (x, cw, ch)=>{ x.fillStyle = 'rgba(70,60,50,.3)'; x.beginPath(); x.arc(cw*.5, ch*.6, cw*.24, 0, Math.PI*2); x.fill();
  if(k < 1){ x.fillStyle = '#B7B3AE'; x.beginPath(); x.arc(cw*.5 + cw*.24*(k === 0 ? .7 : 0), ch*.6, cw*.24*(k === 0 ? 1 : 1.02), 0, Math.PI*2); x.fill(); } };
const planePic = (x, cw, ch)=>{ x.fillStyle = 'rgba(70,60,50,.28)'; x.beginPath(); x.moveTo(cw*.85, ch*.4); x.lineTo(cw*.15, ch*.25); x.lineTo(cw*.32, ch*.42); x.lineTo(cw*.15, ch*.62); x.closePath(); x.fill(); };
const drumPic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.42)'; x.lineWidth = 4; x.beginPath(); x.ellipse(cw*.5, ch*.45, cw*.3, ch*.08, 0, 0, Math.PI*2); x.stroke(); x.strokeRect(cw*.2, ch*.45, cw*.6, ch*.3); };
function page(id, x0, y0, pic, fn){
  const s = sheet({id, x0, x1:x0 + 1.2, y0, y1:y0 + 1.6, z:-.44, carry:true, respawn:true, layers:[{n:'15', pic}]});
  s.onLayer = ()=>{ s.solved = true; if(!s.woke){ s.woke = true; if(fn) fn(); } };
  return s;
}
const sheetT1 = page('T', 3.6, .4, starPic, ()=>{
  learned.unshift('den'); colour('r1');
  play([{dur:.4, start:()=>{ bong.awake = true; colour('bong'); vSay(bong, 'Gấp đèn ông sao như hồi Trung thu đó! Thắp cái đèn treo kia kìa!', 3.2); }}, {dur:2.4, cam:[7, 3.4]},
        {dur:0, start:()=>objective('Gấp đèn, thắp đèn treo, leo bậc trăng')}]);
});
const sheetO3 = page('O', 44.2, .4, cakePic, ()=>wakeUp(vBanh, 'Bếp bánh trôi đỏ lửa rồi! Hơi nóng bốc lên đó con.', 'Thắp đèn treo, rồi gấp diều bay theo hơi lò'));
const sheetQ4 = page('Q', 67.4, .4, fanPic, ()=>{ colour('r3'); objective('Gấp quạt, đuổi Lũ Bụi khỏi cột đèn'); });
const sheetP5 = page('P', 91.4, .4, lotusPic, ()=>wakeUp(vSen, 'Thả đèn hoa đăng đi con. Đèn trôi tới đâu sáng tới đó.', 'Thắp đèn hoa đăng, rồi gấp thuyền qua sông'));
const sheetM6 = sheet({id:'L', x0:115.4, x1:116.6, y0:.4, y1:2.4, z:-.44,
  layers:[{n:'14', pic:moonPic(0)}, {n:'Rằm', pic:moonPic(1)}, {n:'1', pic:moonPic(.5)}], onLayer:()=>moonDay(), onRestore:()=>moonDay()});
sheetM6.onLocked = ()=>say('Tờ cuối dán chặt rồi. Bấm R để dán lại ngày trước.', 2.4);
const sheetA7 = page('A', 139.6, .4, planePic, ()=>{ colour('r6'); objective('Gấp máy bay, phóng trúng móc đèn'); });
const sheetK8 = hide(page('K', 163.4, .4, drumPic, ()=>{
  play([{dur:.4, start:()=>{ parade.on = true; for(const k of parade.kids){ k.g.visible = true; k.awake = true; } colour('kids'); colour('r8'); say('Tùng tùng tùng! Đoàn rước đèn đi rồi!', 2.4); }},
        {dur:2.6, cam:[172, 5.2, 22]}, {dur:0, start:()=>objective('Đi theo đèn của đoàn rước, leo lên tường')}]);
}));
const sheetU9 = page('U', 191.8, .4, starPic, ()=>wakeUp(vTu, 'A, Tò! Chú treo đèn mà chưa ai thắp. Con thắp giùm chú.', 'Thắp hai đèn treo, leo lên bóc tờ lịch trên ông sao', 4.4));
const sheetF = sheet({id:'F', x0:206.0, x1:208.6, y0:9.8, y1:12.0, z:-.44, layers:[{n:'15', pic:starPic}], onLayer:()=>peeledStar()});

// ================= the hidden tò he and the fireflies =================
ZONE = 'keep';
const rabbit = new THREE.Group(); scene.add(rabbit); rabbit.scale.setScalar(.45);
(function(){ const C = '#F4F1EA';
  blob(rabbit, new THREE.Vector3(0, .55, 0), [.5, .45, .45], C, {keep:true});
  blob(rabbit, new THREE.Vector3(.45, 1.0, 0), [.32, .3, .3], C, {keep:true});
  for(const z of [-.12, .12]){ blob(rabbit, new THREE.Vector3(.4, 1.55, z), [.08, .3, .08], C, {keep:true}); blob(rabbit, new THREE.Vector3(.68, 1.06, z*1.4), [.07, .07, .07], '#141019', {small:true, keep:true}); }
  blob(rabbit, new THREE.Vector3(.76, .96, 0), [.05, .04, .05], '#F06BAE', {small:true, keep:true});
})();
rabbit.position.set(31.4, 4.0, .3);
relic(rabbit, 31.4, 4.0, 'Con thỏ ngọc của bé Bống');
firefly(11.6, 5.0);
firefly(29.6, 3.0);
firefly(51.6, 7.6);
firefly(102.0, 1.8);
firefly(176.2, 8.8);
for(const z of ROOMS.concat(['sky'])) setZone(z, 0);
bui({x:75.0, top:0, s:.5, a:74.0, b:78.4, fan:true}); bui({x:76.6, top:0, s:.44, a:75.0, b:79.0, fan:true}); bui({x:78.2, top:0, s:.55, a:76.0, b:79.4, fan:true});

// ================= bubbles =================
// sleep-talk: each grey sleeper mutters a line about the day they forgot
bong.mo = ["…đèn ông sao… năm cánh…", "…Tò ơi… rước đèn đi…", "…tùng dinh dinh… cắc tùng…"];
vBanh.mo = ["…bánh trôi… bánh chay…", "…Rằm tháng Giêng… lên chùa…", "…nặn viên tròn… cho đều tay…"];
vSen.mo = ["…hoa sen… cắm lên ban thờ…", "…năm nay… sen nở muộn…"];
vTu.mo = ["…cầu dao… một, ba, hai…", "…đình làng… mất điện rồi…", "…ông sao… ai dán vậy…"];
for(const v of people) talker(v.g, 2.6*(v.s || 1)*.9, ()=>{
  if(!v.g.visible || P.won && !v.line) return '';
  if(v.lineT > 0) return v.line;
  return !v.awake && Math.abs(P.x - v.g.position.x) < 6 ? (v.mo ? v.mo[Math.floor(nowT/3.4 + v.g.position.x) % v.mo.length] : '…') : '';
});

// ================= story beats =================
let met2 = false, met3 = false, met4 = false, met5 = false, met6 = false, met7 = false, met8 = false, met9 = false, dustGone = false;
function moonDay(){
  const L = Math.min(sheetM6.L, 2);
  moonOn = L === 1;
  say(['Đêm 14: mây che trăng.', 'Rằm! Trăng tròn sáng vằng vặc!', 'Mồng Một: chẳng có trăng.'][L], 2.6);
  sheetM6.locked = sheetM6.L >= 2; sheetM6.solved = L === 1;
  if(L === 1){ colour('r6'); objective('Leo theo bậc trăng lên tường'); }
  else objective(L === 0 ? 'Đổi ngày cho trăng hiện ra' : 'Tối quá. Bấm R dán lại ngày trước');
}
LV.onFan = n=>{ if(!dustGone && buis.every(b=>b.gone)){ dustGone = true; colour('r4'); objective('Gấp đèn, thắp đèn trên cột, leo bậc trăng'); } };
function peeledStar(){
  sheetF.solved = true; objective('Phố cũ sáng đèn rồi!');
  finish([
    {dur:2.6, cam:[207.3, 11.0, 16], start:()=>{ colour('bigstar'); say('Ông sao to nhất phố!', 2); }},
    {dur:4.2, cam:[150, 6, 50], start:()=>{ bars(true); caption('Đèn nào cũng sáng. Cả phố cũ cùng rước đèn đêm Rằm.'); for(const z of ROOMS) colour(z); for(const h of hangs){ if(!h.lit) lightHang(h); } for(const v of people){ v.awake = true; colour(v.zone); } }, end:()=>caption('')},
    {dur:3.0, cam:[196, 3.2, 13], start:()=>vSay(vTu, 'Ông sao này bà Năm dán cho đình năm 1990 đó con.', 3)},
    {dur:4.8, cam:[196, 3.2, 13], start:()=>memo(drawStarMemory), end:memoOff},
    {dur:3.0, cam:[196, 3.2, 13], start:()=>vSay(vTu, 'Sáng mai về nhà bà Năm đi. Phố của bà ở ngay đầu đình.', 3)},
    {dur:.6, end:()=>bars(false)}]);
}
function drawStarMemory(x, W, H){
  x.fillStyle = '#F6EBD9'; x.fillRect(20, 20, W-40, H-40); x.strokeStyle = '#141019'; x.lineWidth = 3; x.strokeRect(20, 20, W-40, H-40);
  x.fillStyle = '#3B2E2A'; x.font = '28px "Patrick Hand", cursive'; x.textAlign = 'center';
  x.fillText('Rằm tháng Giêng năm 1990, sân đình', W/2, 62);
  x.strokeStyle = '#7A4E2D'; x.lineWidth = 4; x.beginPath();
  for(let i=0;i<10;i++){ const a = -Math.PI/2 + i*Math.PI/5, r = i%2 ? 30 : 70, px = 300 + Math.cos(a)*r, py = 160 + Math.sin(a)*r; if(i) x.lineTo(px, py); else x.moveTo(px, py); }
  x.closePath(); x.stroke();
  x.beginPath(); x.arc(150, 180, 22, 0, Math.PI*2); x.stroke(); x.beginPath(); x.moveTo(150, 202); x.lineTo(150, 262); x.moveTo(150, 220); x.lineTo(240, 180); x.stroke();
  x.fillStyle = '#3B2E2A'; x.font = '24px "Patrick Hand", cursive'; x.fillText('“Bà Năm dán ông sao bằng giấy lịch cũ, cả xóm rước đèn theo.”', W/2, 306);
}

// ================= per-frame level logic =================
LV.update = (dt, t)=>{
  LV.lantern = heldIs('den') ? 2.2 : 0;
  stepTick(dt);
  for(const h of hangs){
    h.k = (h.k || 0) + ((h.lit ? 1 : 0) - (h.k || 0))*Math.min(1, dt*4);
    h.glow.material.opacity = h.k*(.75 + Math.sin(t*5 + h.x)*.1); h.glow.scale.setScalar(2.2);
    h.pool.material.opacity = h.k*.16;
    h.g.position.set(h.x, h.y, .2); h.g.rotation.z = Math.sin(t*1.4 + h.x)*.05;
  }
  for(const s of hidden) if(s.hid && heldIs('den') && Math.abs(P.x - (s.x0 + s.x1)/2) < 3.2 && Math.abs(P.y + 1 - (s.y0 + s.y1)/2) < 3){ s.hid = false; sheetVis(s, true); updSheet(s); say('Soi đèn thấy tờ lịch giấu trong góc!', 2.2); }
  // the oven breathes once it is lit
  ovenMat.opacity = vBanh.awake ? .4 : 0;
  for(const s of ovenStreaks){ s.m.visible = vBanh.awake; s.m.position.y += s.v*dt; if(s.m.position.y > 8) s.m.position.y = 0; }
  // the floating lantern drifts across the river once lit
  if(H5.lit && H5.x < 106.4) H5.x = Math.min(106.4, H5.x + dt*1.1);
  H5.y = river.level + .75 + Math.sin(t*2)*.04;
  // the lantern on the wire slides down when its h7hook is knocked, and back up once lit
  h7 += Math.sign(h7want - h7)*Math.min(Math.abs(h7want - h7), dt*1.2);
  H7.x = H7UP[0] + (H7DOWN[0] - H7UP[0])*h7; H7.y = H7UP[1] + (H7DOWN[1] - H7UP[1])*h7; H7.away = h7 < .98 || H7.lit;
  h7hook.rotation.z = h7want ? -1.2 : 0;
  // the procession walks to and fro
  if(parade.on){
    parade.c += parade.dir*dt*1.3; if(parade.c > 176){ parade.c = 176; parade.dir = -1; } if(parade.c < 168){ parade.c = 168; parade.dir = 1; }
    parade.kids.forEach((k, i)=>{ k.g.position.x = parade.c + (i - 1.5)*2.0; k.g.position.y = Math.abs(Math.sin(t*6 + i))*.08; k.g.rotation.y = parade.dir > 0 ? .5 : -.5; });
  }
  drum.rotation.y = parade.on ? Math.sin(t*10)*.1 : 0;
  // the moon: behind a cloud on the 14th, full on the Rằm, gone on the 1st
  const mk = sheetM6.L === 1 ? 1 : 0;
  moon.material.opacity = 1; moon.visible = sheetM6.L !== 2; moonGlow.material.opacity = .15 + mk*.45;
  cloud.position.x += ((sheetM6.L === 1 ? 124 : 110) - cloud.position.x)*Math.min(1, dt*2);
  bigGlow.material.opacity = sheetF.done ? .7 : 0;
  for(const v of people){
    if(v.lineT > 0) v.lineT -= dt;
    v.R.head.rotation.x = v.awake ? Math.sin(t*1.3 + v.x)*.05 : .35 + Math.sin(t*1.2 + v.x)*.04;
    if(v.R.arms && v.R.arms[1]) v.R.arms[1].rotation.z = v.awake ? -1.0 + Math.sin(t*2 + v.x)*.2 : 0;
  }
  // room beats, in the order Tò meets them
  if(!met2 && P.x > 18.4 && P.y < 1){ met2 = true; colour('r1'); say('Dây đèn qua kênh chưa ai thắp…', 2.4); objective('Thắp từng đèn treo, đi trên bậc trăng qua kênh'); }
  if(!met3 && P.x > 42.4 && P.y < 1){ met3 = true; colour('r2'); say('Bếp bánh trôi nguội ngắt.', 2.4); objective('Bóc tờ lịch trên bếp bánh trôi'); }
  if(!met4 && P.x > 66.4 && P.y < 1){ met4 = true; colour('r3'); say('Lũ Bụi bu quanh cột đèn!', 2.4); objective('Gấp quạt, đuổi Lũ Bụi khỏi cột đèn'); }
  if(!met5 && P.x > 90.4 && P.y < 1){ met5 = true; colour('r4'); say('Bờ sông tối om. Bà Sen ngồi bên rổ đèn hoa đăng.', 2.6); objective('Bóc tờ lịch trên vách nhà bà Sen'); }
  if(!met6 && P.x > 114.4 && P.y < 1){ met6 = true; colour('r5'); moonDay(); }
  if(!met7 && P.x > 138.4 && P.y < 1){ met7 = true; colour('r6'); say('Cái đèn treo trên dây cao quá.', 2.4); objective('Bóc tờ lịch, gấp máy bay'); }
  if(!met8 && P.x > 162.4 && P.y < 1){ met8 = true; colour('r7'); say('Góc này tối quá, chẳng thấy gì…', 2.4); objective('Gấp đèn, soi tìm tờ lịch giấu'); }
  if(!met9 && P.x > 190.4 && P.y < 1){ met9 = true; colour('r8'); say('Sân đình! Chú Tư ngủ gật dưới ông sao.', 2.4); objective('Bóc tờ lịch ở sân đình'); }
};
LV.hint = ()=>{
  const den = heldIs('den'), fold = held.on ? 'Bấm Q cho tới khi gấp thành ' : 'Lấy tờ lịch, gấp ';
  if(P.x < 18) return !bong.awake ? 'Bóc tờ lịch trên tường nhà Bống.' : !H1.lit ? (den ? 'Đứng dưới đèn treo, bấm E để thắp.' : fold + 'đèn.') : 'Bậc trăng chỉ cứng chỗ có đèn treo soi tới. Leo lên tường.';
  if(P.x < 37) return den ? 'Thắp từng đèn trên dây. Đứng trên bậc vừa sáng rồi thắp đèn kế tiếp.' : fold + 'đèn.';
  if(P.x < 58) return !vBanh.awake ? 'Bóc tờ lịch trên bếp bánh trôi.' : !H3.lit ? (den ? 'Thắp đèn treo cạnh lò cho bậc trăng sáng.' : fold + 'đèn, thắp đèn treo cạnh lò.') : heldIs('dieu') ? 'Cầm diều đứng trên miệng lò, bay lên bậc trăng rồi nhảy lên tường.' : fold + 'diều.';
  if(P.x < 84) return !dustGone ? (heldIs('quat') ? 'Quay mặt về phía Lũ Bụi, bấm E để quạt.' : fold + 'quạt.') : !H4.lit ? (den ? 'Đứng dưới đèn trên cột, bấm E để thắp.' : fold + 'đèn.') : 'Leo theo bậc trăng lên tường.';
  if(P.x < 108) return !vSen.awake ? 'Bóc tờ lịch trên vách nhà bà Sen.' : !H5.lit ? (den ? 'Đứng sát mép sông, bấm E thắp đèn hoa đăng.' : fold + 'đèn.') : boat.on ? 'Đi trên thuyền sang bờ bên kia, nhảy lên bậc trăng.' : heldIs('thuyen') ? 'Đứng sát mép nước, bấm E thả thuyền rồi nhảy lên.' : fold + 'thuyền.';
  if(P.x < 138) return sheetM6.L === 1 ? 'Trăng Rằm soi sáng bậc. Leo lên tường.' : sheetM6.L === 0 ? 'Mây che trăng. Bóc tờ lịch cho tới đêm Rằm.' : 'Không có trăng. Bấm R dán lại ngày trước.';
  if(P.x < 162) return H7.lit ? 'Leo theo bậc trăng lên tường.' : h7 > .98 ? (den ? 'Đứng dưới đèn, bấm E để thắp.' : fold + 'đèn.') : heldIs('maybay') ? 'Đứng cách cột vài bước, quay sang phải, bấm E phóng vào móc đỏ.' : fold + 'máy bay.';
  if(P.x < 190) return sheetK8.hid ? (den ? 'Soi đèn vào góc tường tối.' : fold + 'đèn để soi.') : !parade.on ? 'Bóc tờ lịch trên trống.' : 'Đèn của đoàn rước soi tới đâu, bậc cứng tới đó. Chờ đoàn đi gần rồi leo.';
  if(!vTu.awake) return 'Bóc tờ lịch ở sân đình.';
  return den ? 'Thắp đèn dưới thấp, leo lên rồi thắp đèn trên cao. Lên giàn tre bóc tờ lịch trên ông sao.' : fold + 'đèn.';
};
LV.winText = ()=>({
  h:'Màn 8 xong!',
  p:'Đèn nào cũng sáng. Cả phố cũ rước đèn đêm Rằm.',
  memory:(fliesGot === 5
    ? '<b>Ký ức mở khoá.</b> Rằm tháng Giêng năm 1990, bà Năm dán ông sao to nhất cho sân đình bằng giấy lịch cũ. Cả xóm rước đèn theo bà.'
    : 'Còn ' + (5 - fliesGot) + ' con đom đóm ở Màn 8 chưa tìm thấy.')
    + (relicGot ? '<br><b>Tìm được con thỏ ngọc của bé Bống.</b>' : '<br>Có một con tò he cũ treo trên dây đèn qua kênh.'),
  next:'Màn 9 · Về nhà: đầu xuân, phố của bà Năm'
});

// ================= intro: the full moon over the dark streets =================
LV.intro = {end:12, sheetsAt:9,
  caps:[[0.5, 4.0, 'Rằm tháng Giêng. Phố cũ chờ rước đèn mà đèn chẳng sáng.'],
        [4.3, 8.0, 'Tờ lịch dán kín đèn treo, bậc trăng mờ trong bóng tối.'],
        [8.3, 11.6, 'Gấp tờ lịch thành đèn ông sao, thắp từng ngọn một.']],
  run(it, dt, t){
    for(const z of ROOMS.concat(['sky'])) setZone(z, 0);
    const camX = it < 4 ? 40 - it*4 : it < 8 ? 200 - (it - 4)*4 : Math.max(-2, 12 - (it - 8)*4);
    const camY = it >= 4 && it < 8 ? 6 : 2.6;
    camLook.lerp(tmpV.set(camX, camY, -1), Math.min(1, dt*2));
    camPos.lerp(tmpV.set(camX - 2.5, camY + 2.6, it >= 4 && it < 8 ? 24 : 17), Math.min(1, dt*2));
    camera.position.copy(camPos); camera.lookAt(camLook);
    sun.position.set(camLook.x - 8, 18, 12); sun.target.position.set(camLook.x, 0, 0);
    toInner.rotation.y = .9;
  },
  done(){
    if(!learned.length) learned.push('dieu', 'thuyen', 'maybay', 'quat', 'non');
    say('Phố tối om…', 2.2);
    objective('Bóc tờ lịch trên tường nhà Bống');
  }};
startGame();
