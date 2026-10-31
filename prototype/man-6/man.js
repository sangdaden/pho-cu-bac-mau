// ================= Màn 6 · Gánh hàng rong (hết chương 2): early morning in the lanes behind the market, the street vendors have lost their calls =================
// rooms (x): 1 đầu hẻm, xôi -8..19 · 2 bánh mì 19..40 · 3 chè 40..60 · 4 kem 60..84 · 5 đồng nát 84..107
//            6 hôm nay ai qua 107..128 · 7 loa phường 128..152 · 8 Lũ Bụi 152..172 · 9 tò he 172..196
// new here: peel the page off a vendor's load and the call comes back; each word of a rao hangs in the air for a moment as a step
LV.level = 6;
LV.start = {x:-3.5, y:0};
LV.bounds = [-7.5, 195.5];
LV.cam = [0, 190];
const ROOMS = ['r1','r2','r3','r4','r5','r6','r7','r8','r9'];
LV.sky = ROOMS;
function zoneFor(x){ return x < 19 ? 'r1' : x < 40 ? 'r2' : x < 60 ? 'r3' : x < 84 ? 'r4' : x < 107 ? 'r5' : x < 128 ? 'r6' : x < 152 ? 'r7' : x < 172 ? 'r8' : 'r9'; }
// grey is a dim dawn; the colour that comes back is a bright morning
SKY.g.top.set('#8A8F98'); SKY.g.mid.set('#A6A8AC'); SKY.g.bot.set('#BDBAB5');
SKY.c.top.set('#4F8FD0'); SKY.c.mid.set('#A9D6EA'); SKY.c.bot.set('#FFE2B0');
LIGHT.fog.set('#CFE0E6'); LIGHT.sun.set('#FFF0CF');
LV.camY = (x, y)=> y < 4.5 ? 2.8 + Math.max(0, y - 1)*.55 : y + 1.6;

// ================= ground: the lane, ditches across it, the road in front =================
const GAPS = [[24, 36], [113, 123], [160, 170]];
const LANDS = [[-14, 24, 0], [36, 113, 0], [123, 160, 0], [170, 200, 0]];
for(const [x0, x1] of LANDS){
  for(let a = x0; a < x1; a += 12){ const b = Math.min(x1, a + 12); ZONE = zoneFor(a + .1);
    box(W, a, b, -2, 0, -6, 3, '#C9C3BA', {outline:false, uv:[3.2, 3.2], map:TEX.pave});
    box(W, a, b, -.02, .06, 2.6, 2.9, '#A8998A', {outline:false}); }
  plat(x0, x1, 0, false, null, {safe:true});
}
for(const [x0, x1] of GAPS){
  ZONE = zoneFor(x0 + .1);
  box(W, x0, x1, -3, -.7, -6, 3, '#4FB7D2', {outline:false, uv:[7, 7], map:TEX.water});
  for(const x of [x0, x1]) box(W, x - .15, x + .15, -3, .06, -.5, 2.9, '#A39788', {ow:.03, uv:[1,2], map:TEX.stone});
  hazard(x0, x1, -.6, 'Rơi xuống kênh rồi!');
}
for(let a = -14; a < 200; a += 12){ ZONE = zoneFor(a + .1);
  box(W, a, a + 12, -1.2, -.28, 3, 14, '#9A948E', {outline:false, uv:[4,4], map:TEX.road});
  box(W, a, a + 12, -.28, 0, 2.95, 3.15, '#B6ABA0', {outline:false, uv:[2,1], map:TEX.stone}); }
function house(x0, x1, h, c, o){
  o = o || {}; ZONE = zoneFor((x0 + x1)/2);
  box(W, x0, x1, -3, h, -4.2, -.5, c, Object.assign({}, WALL, {uv:[6, h + 3, 0, -3]}));
  box(W, x0 - .05, x1 + .05, h, h + .25, -4.4, -.3, '#C98B4A', {ow:.04});
  for(const x of [x0, x1]) box(W, x - .2, x + .2, 0, h, -.5, -.32, '#F4F1EA', {ow:.025});
  if(o.roof) roof(W, x0 - .3, x1 + .3, h + .25, -.15, 3.4, 1.5, o.roof);
}
// a solid wall across the lane, with a ledge on top
function wall(x0, x1, top, c, zone){
  ZONE = zone; box(W, x0, x1, -2, top, -.5, 2.6, c, Object.assign({}, WALL, {uv:[2, top]}));
  box(W, x0 - .1, x1 + .1, top, top + .2, -.6, 2.7, '#B8A58E', {ow:.03, uv:[2,1], map:TEX.stone});
  block(x0, x1, -2, top);
}

// ================= the calls: each word of a rao pops out as a sign Tò can stand on, then fades =================
const raos = [];
function rao(o){
  const r = Object.assign({on:false, t:0, gap:.5, life:3, rest:1.4, bounce:0}, o);
  r.ws = r.words.map(([w, x, y, wd])=>{
    wd = wd || Math.max(1.2, w.length*.34 + .5);
    const g = new THREE.Group(); g.position.set(x, y, .9); g.visible = false; scene.add(g); ZONE = 'keep';
    box(g, -wd/2, wd/2, -.5, 0, -.25, .25, r.board || '#F6E7C8', {ow:.04, keep:true});
    const tw = Math.min(2.4, Math.max(2.0, wd*.92));
    const m = new THREE.Mesh(new THREE.PlaneGeometry(tw, tw/4), toon(r.ink || '#C23A28', false, {map:textTex(w), alpha:true}));
    m.position.set(0, -.25, .26); g.add(m);
    const q = {g, x, y, k:0, on:false};
    q.p = plat(x - wd/2, x + wd/2, y, true, ()=>q.on, r.bounce ? {bounce:r.bounce} : null);
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
      q.on = live;
      q.k = live ? Math.min(1, a*6) : Math.max(0, q.k - dt*5);
      q.g.visible = q.k > .02;
      const s = live && a > r.life - .5 ? .75 + .25*Math.sin(a*40) : 1;
      q.g.scale.set(q.k*s, q.k, q.k);
      q.g.position.y = q.y + (1 - q.k)*.4;
    });
  }
}
// what a vendor is calling right now, for the bubble over their head
function raoLine(r){ if(!r.on) return ''; const n = r.ws.filter((q, i)=>r.t >= i*r.gap).length; return r.t < r.gap*r.ws.length + r.life ? r.words.slice(0, n).map(w=>w[0]).join(' ') : ''; }

// ================= vendors =================
// a street vendor: a round body in an áo bà ba, a nón lá or a cap, sitting or standing beside their load
function buildVendor(g, o){
  const SK = o.sk || '#D9A57C', AO = o.ao, QU = o.quan || '#2A2630';
  for(const s of [-1,1]){ blob(g, new THREE.Vector3(s*.3, .75, 0), [.24, .24, .7], QU); blob(g, new THREE.Vector3(s*.3, .1, .12), [.2, .24, .1], '#5E4630'); }
  const body = blob(g, new THREE.Vector3(0, 2.0, 0), [.66, .55, .88], AO);
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
  if(o.hat === 'non'){ mesh(head, new THREE.ConeGeometry(1.0, .62, 20), '#E9D9B0', {pos:new THREE.Vector3(0, 4.05, -.05), rot:[-.15, 0, 0], ow:.035}); }
  else if(o.hat === 'mu'){ blob(head, new THREE.Vector3(0, 3.82, -.04), [.64, .6, .3], o.hatC || '#2F6FB5'); blob(head, new THREE.Vector3(0, 3.72, .5), [.42, .3, .06], o.hatC || '#2F6FB5'); }
  return {head, body, arms, mouth};
}
// a gánh: a bamboo pole and two baskets, set down on the ground
function ganh(x, z, c, zone){
  ZONE = zone;
  for(const dx of [-.9, .9]){ mesh(W, new THREE.CylinderGeometry(.45, .35, .55, 14), '#C99A52', {pos:new THREE.Vector3(x + dx, .28, z), ow:.03});
    for(let i=0;i<3;i++) leaf(W, new THREE.Vector3(x + dx + (i - 1)*.2, .62, z), .16, c[i%c.length], {ow:.02}); }
  rod(W, new THREE.Vector3(x - 1.5, .9, z + .1), new THREE.Vector3(x + 1.5, 1.1, z + .1), .05, '#B88A4A', {outline:false});
}
const vendors = [];
function vendor(o){
  ZONE = o.zone || 'v' + vendors.length;
  const g = new THREE.Group(); g.position.set(o.x, o.y || 0, o.z === undefined ? .3 : o.z); g.rotation.y = o.ry || .25; g.scale.setScalar(S*(o.s || 1)); scene.add(g);
  const v = Object.assign({g, awake:false, line:'', lineT:0}, o); v.R = buildVendor(g, o); v.zone = ZONE;
  vendors.push(v); setZone(ZONE, 0); return v;
}
function wake(v){ v.awake = true; colour(v.zone); if(v.rao) v.rao.on = true; }
function vSay(v, t, d){ v.line = t; v.lineT = d; }

// ================= room 1 · Đầu hẻm: bà Hai bán xôi asleep by the gate; the gate is a tall wall =================
house(-8, 2, 8.0, '#E8A598', {roof:'#B5513A'}); house(2, 10, 7.2, '#F1DDB0'); house(10, 19, 8.4, '#9FCBC1', {roof:'#B5513A'});
ZONE = 'r1';
box(W, -7.0, -1.6, 0, 3.0, -.5, -.47, '#3B4152', {outline:false});
for(let i=0;i<7;i++) box(W, -6.9, -1.7, .2+i*.4, .26+i*.4, -.47, -.44, '#6E655C', {outline:false});
sign(W, -6.9, -1.7, 3.3, 4.2, -.5, '#C23A28', '#F2C230', 'HẺM CHỢ', 'sáng sớm');
win(W, -4.4, 5.0, 1.5, 2.0, -.5, '#F4F1EA', '#2E8C86', {flower:'#F2C230'}); win(W, -.6, 5.0, 1.5, 2.0, -.5, '#F4F1EA', '#2E8C86');
win(W, 6.0, 4.4, 1.4, 1.8, -.5, '#F4F1EA', '#C23A28'); win(W, 13.0, 4.6, 1.4, 1.8, -.5, '#F4F1EA', '#8E6CC0', {flower:'#F06BAE'});
balcony(W, 11.2, 18.6, 4.4, -.5, .9, '#E9DCC8', '#2A2630');
hoaGiay(W, 1.0, 2.6, 8.0, -.2, 3.0);
stool(-2.8, 1.4, '#C23A28', 0);
wall(17, 19.4, 5.4, '#D9A07A', 'r1');
sign(W, 17.0, 19.4, 3.0, 3.8, 2.62, '#2E8C86', '#F4F1EA', 'CỔNG');
ganh(6.6, 1.2, ['#F4F1EA', '#F2C230'], 'r1');
const vXoi = vendor({x:8.2, z:.9, ao:'#C23A28', hat:'non', hair:'#2A2630', zone:'bahai', ry:-.2});
vXoi.rao = rao({words:[['Xôi', 10.6, 1.4], ['nếp', 12.8, 2.8], ['nóng', 15.0, 4.2], ['đây!', 16.4, 5.4, 1.4]], gap:.5, life:3.0});
// ================= room 2 · Bánh mì: chú Ba's bicycle cart; a canal across the lane =================
house(19, 30, 7.6, '#C7B8E0'); house(30, 40, 8.4, '#E9C46A', {roof:'#B5513A'});
ZONE = 'r2';
win(W, 26.4, 4.4, 1.4, 1.8, -.5, '#F4F1EA', '#2E8C86'); win(W, 33.4, 4.6, 1.4, 1.8, -.5, '#F4F1EA', '#C23A28', {flower:'#F2C230'});
balcony(W, 31.6, 38.6, 4.6, -.5, .9, '#E9DCC8', '#2A2630');
xeDap(21.6, 1.6, .1);
box(W, 20.8, 22.6, 1.1, 2.0, 1.2, 2.0, '#F4F1EA', {ow:.03}); box(W, 20.9, 22.5, 1.2, 1.9, 1.98, 2.02, '#9FCBC1', {outline:false});
for(let i=0;i<4;i++) mesh(W, new THREE.CylinderGeometry(.08, .08, .7, 8), '#D99A52', {pos:new THREE.Vector3(21.2 + i*.35, 1.45, 1.6), rot:[0, 0, Math.PI/2]});
const vMi = vendor({x:23.2, z:.4, ao:'#F4F1EA', hat:'mu', hatC:'#2F6FB5', zone:'chuba', ry:.1});
vMi.rao = rao({words:[['Bánh', 25.2, .8, 2.4], ['mì', 27.6, .8, 2.4], ['nóng', 30.0, .8, 2.4], ['giòn', 32.4, .8, 2.4], ['đây!', 34.8, .8, 2.4]], gap:.4, life:2.8});
// ================= room 3 · Chè: cô Tư's gánh chè under a tall wall =================
house(40, 50, 8.0, '#9FCBC1', {roof:'#B5513A'}); house(50, 60, 7.4, '#F1DDB0');
ZONE = 'r3';
win(W, 44.0, 4.8, 1.4, 1.8, -.5, '#F4F1EA', '#2E8C86', {flower:'#F06BAE'}); win(W, 56.4, 4.2, 1.4, 1.8, -.5, '#F4F1EA', '#C23A28');
wall(49.4, 52, 6.0, '#E8A598', 'r3');
ganh(41.8, 1.2, ['#C23A28', '#F2C230', '#7DBB4B'], 'r3');
for(let i=0;i<3;i++) mesh(W, new THREE.CylinderGeometry(.18, .12, .14, 10), '#F4F1EA', {pos:new THREE.Vector3(40.9 + i*.3, .62, 2.0), ow:.015});
const vChe = vendor({x:42.0, z:.3, ao:'#7DBB4B', hat:'non', hair:'#2A2630', zone:'cotu', ry:.3});
vChe.rao = rao({words:[['Chè', 44.2, 1.4], ['đậu', 46.6, 2.8], ['đỏ,', 44.2, 4.2], ['chè', 46.6, 5.4], ['bưởi!', 48.6, 6.2, 1.5]], gap:.6, life:3.4});
// ================= room 4 · Kem: ông Sáu's ice-cream box; the bell rings out bouncing notes; up onto the roof over the closed gate =================
house(60, 72, 8.0, '#E8A598', {roof:'#B5513A'});
ZONE = 'r4';
win(W, 64.0, 4.6, 1.4, 1.8, -.5, '#F4F1EA', '#2E8C86');
box(W, 72, 80, -2, 9.0, -3.5, 2.6, '#F1DDB0', Object.assign({}, WALL, {uv:[6, 9]}));
box(W, 71.95, 80.05, 8.9, 9.05, -3.6, 2.7, '#B8A58E', {ow:.03, uv:[2,1], map:TEX.stone});
block(72, 80, -2, 9.0);
for(const x of [74.2, 77.6]){ win(W, x, 1.2, 1.3, 1.8, 2.6, '#F4F1EA', '#C23A28'); win(W, x, 4.6, 1.3, 1.6, 2.6, '#F4F1EA', '#2E8C86'); }
for(const [a, b, top] of [[80, 81.4, 6.8], [81.4, 82.8, 4.6], [82.8, 84.2, 2.4]]){ box(W, a, b, -2, top, -.4, 2.4, '#A39788', {ow:.03, uv:[2,1], map:TEX.stone}); block(a, b, -2, top); }
// the water tank on the roof, the hidden one's perch
mesh(W, new THREE.CylinderGeometry(.9, .9, 1.6, 16), '#D8DCE0', {pos:new THREE.Vector3(78.6, 9.8, -1.2), ow:.04});
box(W, 64.6, 66.8, 0, 1.3, .6, 1.8, '#F4F1EA', {ow:.03}); box(W, 64.7, 66.7, 1.3, 1.45, .7, 1.7, '#2F6FB5', {ow:.02});
sign(W, 64.7, 66.7, .4, 1.0, 1.81, '#2F6FB5', '#F4F1EA', 'KEM');
const bell = mesh(W, new THREE.ConeGeometry(.22, .3, 12, 1, true), '#F2C230', {pos:new THREE.Vector3(66.4, 1.75, 1.2), ow:.02});
const vKem = vendor({x:63.6, z:.6, ao:'#2F6FB5', hat:'mu', hatC:'#F4F1EA', zone:'ongsau', ry:.35});
vKem.rao = rao({words:[['Leng', 68.0, .8, 1.8], ['keng!', 70.6, 4.6, 1.8]], gap:.5, life:4.2, bounce:17, board:'#FFF2B0', ink:'#2F6FB5'});
// ================= room 5 · Đồng nát: bà Tám pushes her bicycle up and down the lane; the shop's wall is high =================
house(84, 96, 7.8, '#C7B8E0', {roof:'#B5513A'});
ZONE = 'r5';
win(W, 88.0, 4.4, 1.4, 1.8, -.5, '#F4F1EA', '#8E6CC0'); win(W, 92.4, 4.4, 1.4, 1.8, -.5, '#F4F1EA', '#8E6CC0', {flower:'#F2C230'});
wall(102, 107, 6.8, '#D9A07A', 'r5');
sign(W, 102.4, 106.6, 3.6, 4.6, 2.62, '#5E6670', '#F4F1EA', 'VE CHAI', 'mua bán');
for(let i=0;i<4;i++) crate(102.6 + i*1.2, 3.0, .7, ['#9FCBC1','#E9C46A','#E8A598'][i%3], 0);
const tamG = new THREE.Group(); scene.add(tamG); ZONE = 'r5';
(function(){ for(const dx of [-.7, .7]) mesh(tamG, new THREE.TorusGeometry(.38, .07, 8, 18), '#2A2630', {pos:new THREE.Vector3(dx, .4, 0), outline:false});
  box(tamG, -1.0, 1.0, .8, 1.5, -.5, .5, '#A27650', {ow:.03, uv:[.8,.8], map:TEX.wood});
  for(let i=0;i<4;i++) mesh(tamG, new THREE.CylinderGeometry(.12, .12, .5, 8), ['#7DBB4B','#B8C4C8','#C23A28','#E9C46A'][i], {pos:new THREE.Vector3(-.6 + i*.4, 1.75, 0), ow:.015}); })();
const vNat = vendor({x:88, z:.5, ao:'#8E6CC0', hat:'non', hair:'#7A7480', zone:'batam', ry:.1});
const NAT = [['Ai', 1.6, 1.4], ['đồng', 3.8, 2.8], ['nát', 6.0, 4.2], ['bán', 8.2, 5.6], ['không?', 10.2, 6.0, 1.6]];
vNat.rao = rao({words:NAT.map(w=>[w[0], 88 + w[1], w[2], w[3]]), gap:.55, life:3.2, rest:2.2});
let natX = 88, natDir = 1;
// ================= room 6 · Hôm nay ai qua: a stack of days; each day a different vendor comes down the lane =================
house(107, 118, 8.2, '#F1DDB0', {roof:'#B5513A'}); house(118, 128, 7.4, '#9FCBC1');
ZONE = 'r6';
box(W, 123, 128, -2, 4.0, -.5, 2.6, '#E8A598', Object.assign({}, WALL, {uv:[3, 4]}));
box(W, 122.9, 128.1, 3.9, 4.1, -.6, 2.7, '#B8A58E', {ow:.03, uv:[2,1], map:TEX.stone});
block(123, 128, -2, 4.0);
box(W, 124.0, 125.4, 4.0, 6.4, -.4, 1.2, '#7A4E2D', {ow:.03, uv:[.8,.8], map:TEX.wood}); block(124.0, 125.4, 3.9, 6.4);
win(W, 110.6, 4.6, 1.4, 1.8, -.5, '#F4F1EA', '#2E8C86', {flower:'#F06BAE'});
const day6 = [
  vendor({x:110.6, z:.4, ao:'#F4F1EA', hat:'mu', hatC:'#2F6FB5', zone:'d0'}),
  vendor({x:110.6, z:.4, ao:'#7DBB4B', hat:'non', hair:'#2A2630', zone:'d1'}),
  vendor({x:110.6, z:.4, ao:'#2F6FB5', hat:'mu', hatC:'#F4F1EA', zone:'d2'})];
day6[0].rao = rao({words:[['Bánh', 114.2, .8, 2.4], ['mì', 116.6, .8, 2.4], ['đây!', 119.0, .8, 2.4]], gap:.4, life:2.8});
day6[1].rao = rao({words:[['Chè', 114.4, 1.0], ['đậu', 116.8, 2.0], ['xanh', 119.2, 3.0], ['đây!', 121.6, 3.6]], gap:.55, life:3.4});
day6[2].rao = rao({words:[['Leng', 115.0, .5, 1.8]], gap:.5, life:3.4, bounce:17, board:'#FFF2B0', ink:'#2F6FB5'});
for(const v of day6){ v.awake = true; v.g.visible = false; }
// ================= room 7 · Loa phường: the ward loudspeaker on its pole is switched off; its switch box is out of reach =================
house(128, 140, 8.6, '#D9A07A', {roof:'#B5513A'}); house(140, 152, 7.8, '#E9C46A');
ZONE = 'r7';
box(W, 129.0, 133.4, 3.15, 3.25, -.5, 2.2, '#7FA6B8', {ow:.03});
for(const x of [129.2, 133.2]) box(W, x - .08, x + .08, 0, 3.15, 1.95, 2.1, '#8A7D6F', {ow:.02});
wall(146, 152, 6.4, '#C7B8E0', 'r7');
rod(W, new THREE.Vector3(140.4, 0, -.2), new THREE.Vector3(140.4, 8.4, -.2), .14, '#8A8178', {ow:.03});
const loa = new THREE.Group(); loa.position.set(140.4, 8.0, .1); scene.add(loa); ZONE = 'r7';
for(const s of [-1, 1]) mesh(loa, new THREE.CylinderGeometry(.18, .55, 1.0, 14, 1, true), '#B8C4C8', {pos:new THREE.Vector3(s*.5, 0, 0), rot:[0, 0, s*Math.PI/2 + s*.3], ow:.03}).material.side = THREE.DoubleSide;
box(W, 140.1, 140.7, 2.1, 2.9, -.1, .25, '#5E6670', {ow:.03});
const loaSwitch = mesh(W, new THREE.BoxGeometry(.12, .4, .1), '#C23A28', {pos:new THREE.Vector3(140.4, 2.5, .32), rot:[0, 0, -.6]});
target({x:140.4, y:2.5, r:1.0, onHit:()=>loaOn()});
const loaRao = rao({words:[['Thông', 134.6, 1.2], ['báo!', 136.8, 2.4], ['Sáng', 139.0, 3.6], ['nay', 141.2, 4.8], ['chợ', 143.4, 5.6], ['phiên!', 145.6, 6.0, 1.6]], gap:.45, life:3.6, board:'#E9F2F6', ink:'#2F4F7A'});
let loaK = 0;
// ================= room 8 · Lũ Bụi: dust balls on the bank; across the canal, cô Năm's basket of bánh bò =================
house(152, 162, 8.0, '#E8A598', {roof:'#B5513A'}); house(162, 172, 7.6, '#C7B8E0');
ZONE = 'r8';
win(W, 156.6, 4.4, 1.4, 1.8, -.5, '#F4F1EA', '#2E8C86');
box(W, 152.2, 154.6, 0, 3.0, -2.6, -.5, '#B88A4A', {ow:.03, uv:[1.4, 1.4], map:TEX.wood});
ganh(158.2, 1.4, ['#F4F1EA', '#F06BAE'], 'r8');
const vBo = vendor({x:158.8, z:.2, ao:'#F06BAE', hat:'non', hair:'#2A2630', zone:'conam', ry:.2});
vBo.rao = rao({words:[['Bánh', 161.2, .8, 2.4], ['bò', 163.6, .8, 2.4], ['bánh', 166.0, .8, 2.4], ['da', 168.4, .8, 2.4]], gap:.4, life:2.8});
// ================= room 9 · Tò he: ông Út's stall of grey tò he figures; the big sign over the market gate =================
house(172, 180, 8.4, '#9FCBC1', {roof:'#B5513A'});
ZONE = 'r9';
box(W, 180, 196, -2, 12.0, -6, -4.2, '#D9A07A', Object.assign({}, WALL, {uv:[6, 9]}));
for(const x of [181.0, 193.6]) box(W, x - .4, x + .4, 0, 9.0, -.5, .4, '#C23A28', {ow:.04});
box(W, 180.4, 194.2, 9.0, 9.5, -.6, .5, '#B5513A', {ow:.04});
box(W, 181.4, 184.6, 0, 1.0, .4, 1.8, '#A27650', {ow:.03, uv:[.8,.8], map:TEX.wood});
// the tò he on their bamboo sticks
const toheSticks = [];
for(let i=0;i<7;i++){ ZONE = 'r9'; const x = 181.7 + i*.42; rod(W, new THREE.Vector3(x, 1.0, 1.1), new THREE.Vector3(x, 1.9, 1.1), .02, '#C99A52', {outline:false});
  toheSticks.push(blob(W, new THREE.Vector3(x, 2.05, 1.1), [.16, .14, .2], ['#C23A28','#F2C230','#2E9C93','#F06BAE','#7DBB4B','#E9A23B','#2F6FB5'][i], {ow:.02})); }
const vUt = vendor({x:180.6, z:.8, ao:'#E9A23B', hat:'non', hair:'#E9E4DA', zone:'ongut', ry:.3});
vUt.rao = rao({words:[['Tò', 184.6, 1.4], ['he', 186.8, 2.8], ['đây!', 189.0, 4.2], ['Ai mua tò he!', 186.4, 5.6, 5.0]], gap:.6, life:9, rest:1.2, board:'#FFF2B0'});

// ================= background =================
midRow(-16, 200, zoneFor, {zf:-5.4});
farRow(-24, 214);
clouds(-40, 230); hills(-40, 230);
const POLES = [-8, 19.4, 40.2, 60.5, 84.4, 107.4, 128.4, 152.4, 172.4];
for(const x of POLES){ ZONE = zoneFor(x); powerPole(x, 3.4); }
for(let i=0;i<POLES.length-1;i++){ ZONE = zoneFor(POLES[i]); poleWires([POLES[i], POLES[i+1]], 3.2); }
tree(W, -11, 3.8, 7.5, {s:1.2, zone:'r1'});
tree(W, 98.0, 3.9, 7.0, {s:1.0, zone:'r5', flower:'#F06BAE'});
moteSpan(-10, 30);

// ================= sheets =================
const xoiPic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.42)'; x.lineWidth = 4; x.beginPath(); x.arc(cw*.5, ch*.55, cw*.28, 0, Math.PI); x.closePath(); x.stroke(); x.fillStyle = 'rgba(70,60,50,.2)'; x.beginPath(); x.arc(cw*.5, ch*.55, cw*.26, Math.PI, 0); x.fill(); };
const miPic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.42)'; x.lineWidth = 4; x.beginPath(); x.ellipse(cw*.5, ch*.6, cw*.36, ch*.1, -.2, 0, Math.PI*2); x.stroke(); for(let i=0;i<3;i++){ x.beginPath(); x.moveTo(cw*(.32 + i*.14), ch*.56); x.lineTo(cw*(.38 + i*.14), ch*.64); x.stroke(); } };
const chePic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.42)'; x.lineWidth = 4; x.beginPath(); x.moveTo(cw*.25, ch*.45); x.lineTo(cw*.75, ch*.45); x.lineTo(cw*.62, ch*.8); x.lineTo(cw*.38, ch*.8); x.closePath(); x.stroke(); x.beginPath(); x.moveTo(cw*.6, ch*.2); x.lineTo(cw*.5, ch*.5); x.stroke(); };
const kemPic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.42)'; x.lineWidth = 4; x.beginPath(); x.moveTo(cw*.35, ch*.45); x.lineTo(cw*.5, ch*.85); x.lineTo(cw*.65, ch*.45); x.stroke(); x.beginPath(); x.arc(cw*.5, ch*.4, cw*.16, Math.PI, 0); x.stroke(); };
const natPic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.42)'; x.lineWidth = 4; for(const dx of [.3, .7]){ x.beginPath(); x.arc(cw*dx, ch*.72, cw*.13, 0, Math.PI*2); x.stroke(); } x.strokeRect(cw*.25, ch*.36, cw*.5, ch*.22); };
const planePic = (x, cw, ch)=>{ x.fillStyle = 'rgba(70,60,50,.28)'; x.beginPath(); x.moveTo(cw*.85, ch*.4); x.lineTo(cw*.15, ch*.25); x.lineTo(cw*.32, ch*.42); x.lineTo(cw*.15, ch*.62); x.closePath(); x.fill(); };
const fanPic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.4)'; x.lineWidth = 4; for(let i=0;i<5;i++){ const a = -Math.PI*.8 + i*Math.PI*.15; x.beginPath(); x.moveTo(cw*.5, ch*.8); x.lineTo(cw*.5 + Math.cos(a)*cw*.36, ch*.8 + Math.sin(a)*cw*.36); x.stroke(); } };
const tohePic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.42)'; x.lineWidth = 4; x.beginPath(); x.moveTo(cw*.5, ch*.9); x.lineTo(cw*.5, ch*.5); x.stroke(); x.beginPath(); x.arc(cw*.5, ch*.38, cw*.14, 0, Math.PI*2); x.stroke(); x.beginPath(); x.moveTo(cw*.6, ch*.3); x.lineTo(cw*.75, ch*.22); x.stroke(); };
const chopPic = (x, cw, ch)=>{ x.fillStyle = 'rgba(194,58,40,.16)'; x.fillRect(cw*.1, ch*.3, cw*.8, ch*.3); x.strokeStyle = 'rgba(70,60,50,.4)'; x.lineWidth = 4; x.strokeRect(cw*.1, ch*.3, cw*.8, ch*.3); x.fillStyle = 'rgba(70,60,50,.35)'; x.font = `${ch*.14}px "Patrick Hand", cursive`; x.textAlign = 'center'; x.fillText('CHỢ', cw*.5, ch*.5); };
const sheetX = sheet({id:'X', x0:4.4, x1:6.0, y0:.4, y1:2.2, z:-.44, layers:[{n:'19', pic:xoiPic}], onLayer:()=>{ sheetX.solved = true; wakeVendor(vXoi, 'Ơ… tiếng rao của bà về rồi!', 'Đứng lên chữ mà leo qua cổng'); }});
const sheetM2 = sheet({id:'B', x0:19.8, x1:21.4, y0:.4, y1:2.2, z:-.44, layers:[{n:'19', pic:miPic}], onLayer:()=>{ sheetM2.solved = true; wakeVendor(vMi, 'Bánh mì! Chú rao lại được rồi!', 'Chạy theo chữ qua kênh'); }});
const sheetC3 = sheet({id:'C', x0:40.4, x1:41.8, y0:.4, y1:2.2, z:-.44, layers:[{n:'19', pic:chePic}], onLayer:()=>{ sheetC3.solved = true; wakeVendor(vChe, 'Chè đây! Cô cảm ơn con.', 'Nhảy theo chữ leo lên tường'); }});
const sheetK4 = sheet({id:'K', x0:60.6, x1:62.2, y0:.4, y1:2.2, z:-.44, layers:[{n:'19', pic:kemPic}], onLayer:()=>{ sheetK4.solved = true; wakeVendor(vKem, 'Leng keng! Kem đây!', 'Nhún trên tiếng chuông lên mái'); }});
const sheetN5 = sheet({id:'N', x0:84.6, x1:86.2, y0:.4, y1:2.2, z:-.44, layers:[{n:'19', pic:natPic}], onLayer:()=>{ sheetN5.solved = true; wakeVendor(vNat, 'Ai đồng nát… bà rao được rồi!', 'Chờ bà Tám đi tới đúng chỗ, leo theo câu rao'); }});
const sheetD6 = sheet({id:'D', x0:107.8, x1:109.4, y0:.4, y1:2.4, z:-.44, layers:[{n:'20', pic:miPic}, {n:'21', pic:chePic}, {n:'22', pic:kemPic}], onLayer:()=>dayVendor(), onRestore:()=>dayVendor()});
const sheetM7 = sheet({id:'M', x0:129.6, x1:131.2, y0:.4, y1:2.2, z:-.44, carry:true, respawn:true, layers:[{n:'19', pic:planePic}]});
const sheetQ8 = sheet({id:'Q', x0:152.6, x1:154.2, y0:.4, y1:2.2, z:-.44, carry:true, respawn:true, layers:[{n:'19', pic:fanPic}]});
const sheetB8 = sheet({id:'O', x0:156.8, x1:158.0, y0:.4, y1:2.0, z:-.44, layers:[{n:'19'}], onLayer:()=>{ sheetB8.solved = true; wakeVendor(vBo, 'Bánh bò đây! Cảm ơn con nghe.', 'Chạy theo chữ qua kênh'); }});
const sheetU9 = sheet({id:'U', x0:174.6, x1:176.2, y0:.4, y1:2.2, z:-.44, layers:[{n:'19', pic:tohePic}], onLayer:()=>{ sheetU9.solved = true; wakeVendor(vUt, 'Tò he đây! Ơ… con là con tò he của bà Năm!', 'Leo theo câu rao, bóc biển chợ'); }});
const sheetS = sheet({id:'S', x0:185.0, x1:188.0, y0:6.1, y1:8.7, z:-.44, layers:[{n:'19', pic:chopPic}], onLayer:()=>peeledSign()});
sheetM7.solved = sheetQ8.solved = true;

// ================= characters' extras =================
ZONE = 'keep';
const bird = new THREE.Group(); scene.add(bird); bird.scale.setScalar(.42);
(function(){ const C = '#B5713A';
  blob(bird, new THREE.Vector3(0, .6, 0), [.6, .45, .5], C, {keep:true});
  blob(bird, new THREE.Vector3(.42, .95, 0), [.32, .3, .32], C, {keep:true});
  mesh(bird, new THREE.ConeGeometry(.08, .22, 6), '#F2C230', {pos:new THREE.Vector3(.75, .95, 0), rot:[0, 0, -Math.PI/2], keep:true});
  for(const z of [-.18, .18]){ blob(bird, new THREE.Vector3(.58, 1.04, z), [.08, .08, .08], '#FFFFFF', {keep:true}); blob(bird, new THREE.Vector3(.64, 1.05, z*1.05), [.04, .04, .04], '#141019', {small:true, keep:true}); }
  mesh(bird, new THREE.ConeGeometry(.2, .5, 6), '#7A4E2D', {pos:new THREE.Vector3(-.6, .7, 0), rot:[0, 0, Math.PI/2 + .4], keep:true});
})();
bird.position.set(78.6, 10.6, -1.2);
relic(bird, 78.6, 10.6, 'Con chim sẻ của bà Tám');
firefly(12.0, 4.0);
firefly(30.4, 2.8);
firefly(69.4, 7.6);
firefly(104.0, 8.4);
firefly(143.4, 7.4);
for(const z of ROOMS.concat(['sky'])) setZone(z, 0);
bui({x:155.0, top:0, s:.5, a:154.6, b:157.2, fan:true}); bui({x:156.4, top:0, s:.42, a:155.4, b:158.0, fan:true}); bui({x:157.6, top:0, s:.55, a:156.4, b:159.2, fan:true});

// sleep-talk: each grey sleeper mutters a line about the day they forgot (Đợt 3)
vXoi.mo = ["…xôi nếp… gói lá chuối…", "…sáng nay… ai ăn xôi gấc…", "…con bé nhà ai… quên lấy tiền thối…"];
vMi.mo = ["…bánh mì… lò than còn đỏ…", "…ba chục năm… đạp xe qua hẻm này…", "…ai… ai gọi bánh mì đó…"];
vChe.mo = ["…chè bưởi… cùi giòn…", "…mùa này… đậu đỏ đắt quá…", "…bát chè… cho thằng Cu nhà bên…"];
vKem.mo = ["…leng keng… leng keng…", "…kem que… năm trăm một que…", "…bọn nhỏ… chạy theo xe kem…"];
vNat.mo = ["…ai đồng nát… sắt vụn…", "…lịch cũ… bán cân được không…", "…giấy cũ… còn giữ làm gì…"];
vBo.mo = ["…bánh bò… bánh da lợn…", "…hấp từ bốn giờ sáng…", "…mẹ dạy… phải để bột nghỉ…"];
vUt.mo = ["…tò he… tò he đây…", "…nặn con trâu… con gà…", "…cô Năm… cô ấy nặn đẹp hơn tôi…"];

// ================= bubbles =================
for(const v of vendors) talker(v.g, 2.6, ()=>{
  if(!v.g.visible || P.won && !v.line) return '';
  if(v.lineT > 0) return v.line;
  if(!v.awake) return Math.abs(P.x - v.g.position.x) < 6 ? (v.mo ? v.mo[Math.floor(nowT/3.4 + v.g.position.x) % v.mo.length] : '…') : '';
  return Math.abs(P.x - v.g.position.x) < 9 && v.rao ? raoLine(v.rao) : '';
});

// ================= story beats =================
let metMi = false, metChe = false, metKem = false, metNat = false, metDay = false, metLoa = false, metBui = false, metUt = false, pierClear = false;
function wakeVendor(v, line, obj){
  play([{dur:.4, start:()=>{ wake(v); vSay(v, line, 2.6); }}, {dur:2.4, cam:[v.g.position.x + 4, 3.4]}, {dur:0, start:()=>objective(obj)}]);
}
function dayVendor(){
  const L = Math.min(sheetD6.L, 2);
  day6.forEach((v, i)=>{ v.g.visible = i === L; v.rao.on = i === L; v.rao.t = 0; });
  colour('d' + L);
  if(sheetD6.L > 0) say(['Ngày 20: chú bánh mì đi qua.', 'Ngày 21: cô bán chè đi qua!', 'Ngày 22: ông bán kem đi qua.'][L], 2.4);
  sheetD6.locked = sheetD6.L >= 2; sheetD6.solved = L === 1;
}
sheetD6.onLocked = ()=>say('Tờ cuối dán chặt rồi. Bấm R để dán lại ngày trước.', 2.4);
function loaOn(){
  loaRao.on = true; loaK = .001;
  play([{dur:2.6, cam:[140, 5], start:()=>say('Trúng rồi! Loa phường kêu lại!', 2.2)}, {dur:0, start:()=>{ colour('r7'); objective('Leo theo tiếng loa lên mái'); }}]);
}
LV.onFan = n=>{ if(!pierClear && buis.every(b=>b.gone)){ pierClear = true; objective('Bóc tờ lịch trên thúng bánh bò'); } };
function peeledSign(){
  sheetS.solved = true; objective('Chợ có màu rồi!');
  finish([
    {dur:2.6, cam:[186.5, 7, 16], start:()=>say('Biển chợ đây rồi!', 2)},
    {dur:4.2, cam:[150, 5, 44], start:()=>{ bars(true); caption('Cả chợ cùng rao. Tiếng rao nào cũng đủ chữ.'); for(const z of ROOMS) colour(z); for(const v of vendors) if(v.rao && v.g.visible){ v.awake = true; v.rao.on = true; colour(v.zone); } }, end:()=>caption('')},
    {dur:3.0, cam:[181.5, 2.6, 13], start:()=>{ vSay(vUt, 'Con là tò he ông nặn cho bà Năm năm đó.', 3); }},
    {dur:4.8, cam:[181.5, 2.6, 13], start:()=>memo(drawUtMemory), end:memoOff},
    {dur:3.0, cam:[181.5, 2.6, 13], start:()=>vSay(vUt, 'Về đi con. Bà Năm đang chờ ở phố cũ.', 3)},
    {dur:.6, end:()=>bars(false)}]);
}
function drawUtMemory(x, W, H){
  x.fillStyle = '#F6EBD9'; x.fillRect(20, 20, W-40, H-40); x.strokeStyle = '#141019'; x.lineWidth = 3; x.strokeRect(20, 20, W-40, H-40);
  x.fillStyle = '#3B2E2A'; x.font = '28px "Patrick Hand", cursive'; x.textAlign = 'center';
  x.fillText('Sáng mồng Một Tết năm 1979, chợ bên sông', W/2, 62);
  x.strokeStyle = '#7A4E2D'; x.lineWidth = 4; x.strokeRect(110, 200, 260, 40);
  for(let i=0;i<6;i++){ const cx = 140 + i*40; x.beginPath(); x.moveTo(cx, 200); x.lineTo(cx, 140); x.stroke(); x.beginPath(); x.arc(cx, 128, 12, 0, Math.PI*2); x.stroke(); }
  x.beginPath(); x.arc(400, 150, 26, 0, Math.PI*2); x.stroke(); x.beginPath(); x.moveTo(400, 176); x.lineTo(400, 250); x.stroke();
  x.fillStyle = '#3B2E2A'; x.font = '24px "Patrick Hand", cursive'; x.fillText('“Bà Năm học nặn tò he ở sạp ông Út, con đầu tiên là Tò.”', W/2, 306);
}

// ================= per-frame level logic =================
LV.update = (dt, t)=>{
  raoTick(dt);
  for(const v of vendors){
    if(v.lineT > 0) v.lineT -= dt;
    v.R.head.rotation.x = v.awake ? Math.sin(t*1.3 + v.x)*.05 : .35 + Math.sin(t*1.2 + v.x)*.04;
    const talking = v.awake && v.rao && raoLine(v.rao);
    v.R.mouth.scale.y = talking ? .6 + Math.abs(Math.sin(t*14))*1.6 : 1;
    v.R.arms[1].rotation.z = talking ? -.6 - Math.sin(t*6)*.2 : 0;
  }
  // bà Tám walks her bicycle up and down; her call starts wherever she is
  if(vNat.awake){
    if(vNat.rao.t > vNat.rao.gap*NAT.length + vNat.rao.life){ natX += natDir*dt*1.1; if(natX > 94){ natX = 94; natDir = -1; } if(natX < 86.4){ natX = 86.4; natDir = 1; } }
    if(vNat.rao.t < .05) vNat.rao.ws.forEach((q, i)=>{ q.x = natX + NAT[i][1]; const w = (q.p.x1 - q.p.x0)/2; q.p.x0 = q.x - w; q.p.x1 = q.x + w; q.g.position.x = q.x; });
  }
  vNat.g.position.x = natX; vNat.g.rotation.y = natDir > 0 ? .5 : -.5; tamG.position.set(natX + natDir*1.6, 0, 1.2);
  bell.rotation.z = vKem.awake ? Math.sin(t*12)*.4 : 0;
  if(loaK > 0 && loaK < 1) loaK = Math.min(1, loaK + dt);
  loaSwitch.rotation.z = -.6 + loaK*1.2; loa.rotation.z = loaRao.on ? Math.sin(t*20)*.02 : 0;
  for(const s of toheSticks) s.rotation.y = vUt.awake ? t*.6 : 0;
  // room beats, in the order Tò meets them
  if(!metMi && P.x > 19.6){ metMi = true; colour('r1'); say('Chú bánh mì ngủ gật bên xe đạp.', 2.4); objective('Bóc tờ lịch trên tủ bánh mì'); }
  if(!metChe && P.x > 40.2){ metChe = true; colour('r2'); say('Bức tường cao quá… cô bán chè im lặng.', 2.4); objective('Bóc tờ lịch trên gánh chè'); }
  if(!metKem && P.x > 60.2 && P.y < 3){ metKem = true; colour('r3'); say('Cái chuông kem chẳng kêu tiếng nào.', 2.4); objective('Bóc tờ lịch ở xe kem'); }
  if(!metNat && P.x > 84.4 && P.y < 1){ metNat = true; colour('r4'); say('Bà đồng nát đẩy xe mà chẳng rao.', 2.4); objective('Bóc tờ lịch ở đầu hẻm'); }
  if(!metDay && P.x > 107.2 && P.y < 1){ metDay = true; colour('r5'); dayVendor(); say('Hôm nay ai đi qua hẻm này nhỉ?', 2.4); objective('Đổi ngày cho đúng người đi qua'); }
  if(!metLoa && P.x > 128.4 && P.y < 4.5){ metLoa = true; colour('r6'); say('Loa phường tắt rồi. Công tắc cao quá.', 2.4); objective('Phóng máy bay trúng công tắc loa'); }
  if(!metBui && P.x > 152.4 && P.y < 1){ metBui = true; colour('r7'); say('Lũ Bụi chắn trước gánh bánh bò!', 2.4); objective('Gấp quạt, quạt Lũ Bụi bay đi'); }
  if(!metUt && P.x > 172.4){ metUt = true; colour('r8'); say('Sạp tò he! Mấy con tò he xám ngắt…', 2.6); objective('Bóc tờ lịch ở sạp tò he'); }
};
const heldIs = f => held.on && held.form === f;
LV.hint = ()=>{
  if(P.x < 19.4) return !vXoi.awake ? 'Bóc tờ lịch trên thúng xôi của bà Hai.' : 'Mỗi chữ của câu rao thành một bậc. Bà rao thì nhảy lên chữ đầu tiên.';
  if(P.x < 36) return !vMi.awake ? 'Bóc tờ lịch trên tủ bánh mì.' : 'Chờ chú rao, chạy theo chữ qua kênh. Chữ tắt nhanh lắm.';
  if(P.x < 52) return !vChe.awake ? 'Bóc tờ lịch trên cột sau gánh chè.' : 'Chè, đậu, đỏ, chè, bưởi: nhảy qua lại leo lên tường.';
  if(P.x < 84 && P.y < 8) return !vKem.awake ? 'Bóc tờ lịch ở góc tường bên xe kem.' : 'Nhảy lên tiếng Leng là nhún lên cao, rồi tiếng keng, lên mái.';
  if(P.x < 102) return !vNat.awake ? 'Bóc tờ lịch ở đầu hẻm.' : 'Câu rao bắt đầu ngay chỗ bà Tám. Chờ bà đi về bên phải rồi mới leo.';
  if(P.x < 123) return sheetD6.L === 1 ? 'Cô bán chè rao thành bậc thang qua kênh. Leo lên bờ cao.' : 'Mỗi ngày một người đi qua. Ai rao thành bậc thang leo lên được?';
  if(P.x < 146) return loaRao.on ? 'Leo theo tiếng loa lên mái bên phải.' : held.on ? (held.form === 'maybay' ? 'Đứng dưới mái tôn, quay sang phải, bấm E phóng vào công tắc đỏ trên cột loa.' : 'Bấm Q cho tới khi gấp thành máy bay.') : 'Lấy tờ lịch dưới mái tôn, gấp máy bay.';
  if(P.x < 170){
    if(!pierClear) return heldIs('quat') ? 'Quay mặt về phía Lũ Bụi, bấm E để quạt.' : held.on ? 'Bấm Q cho tới khi gấp thành quạt.' : 'Lấy tờ lịch trên vách chòi gỗ, gấp quạt.';
    return !vBo.awake ? 'Bóc tờ lịch trên tường sau gánh bánh bò.' : 'Chờ cô rao, chạy theo chữ qua kênh.';
  }
  if(!vUt.awake) return 'Bóc tờ lịch ở sạp tò he.';
  return 'Leo theo câu rao của ông Út. Đứng trên chữ dài, nắm mép biển chợ mà bóc.';
};
LV.winText = ()=>({
  h:'Hết chương 2!',
  p:'Tiếng rao về đủ chữ. Chợ bên sông lại có màu, có tiếng.',
  memory:(fliesGot === 5
    ? '<b>Ký ức mở khoá.</b> Mồng Một Tết năm 1979, bà Năm học nặn tò he ở sạp ông Út. Con đầu tiên bà nặn là một chú gà trống đỏ, bà đặt tên là Tò.'
    : 'Còn ' + (5 - fliesGot) + ' con đom đóm ở Màn 6 chưa tìm thấy.')
    + (relicGot ? '<br><b>Tìm được con chim sẻ của bà Tám.</b>' : '<br>Có một con tò he cũ giấu trên bồn nước trên mái.'),
  next:'Chương 3 · Màn 7 Gió mùa: chiều lộng gió trên mái phố'
});

// ================= intro: dawn in the market lanes =================
LV.intro = {end:12, sheetsAt:9,
  caps:[[0.5, 4.0, 'Sáng sớm, hẻm sau chợ. Gánh hàng rong đi qua mà chẳng ai rao.'],
        [4.3, 8.0, 'Tờ lịch dán lên gánh, lên xe, tiếng rao rơi mất chữ.'],
        [8.3, 11.6, 'Bóc tờ lịch ra, tiếng rao về, chữ nào cũng thành một bậc.']],
  run(it, dt, t){
    for(const z of ROOMS.concat(['sky'])) setZone(z, 0);
    const camX = it < 4 ? 40 - it*4 : it < 8 ? 184 - (it - 4)*4 : Math.max(-2, 12 - (it - 8)*4);
    const camY = it >= 4 && it < 8 ? 5 : 2.6;
    camLook.lerp(tmpV.set(camX, camY, -1), Math.min(1, dt*2));
    camPos.lerp(tmpV.set(camX - 2.5, camY + 2.6, it >= 4 && it < 8 ? 24 : 17), Math.min(1, dt*2));
    camera.position.copy(camPos); camera.lookAt(camLook);
    sun.position.set(camLook.x - 8, 18, 12); sun.target.position.set(camLook.x, 0, 0);
    toInner.rotation.y = .9;
  },
  done(){
    learned.push('thuyen', 'maybay', 'quat', 'non');
    say('Hẻm chợ im phăng phắc…', 2.2);
    objective('Bóc tờ lịch trên thúng xôi của bà Hai');
  }};
startGame();
