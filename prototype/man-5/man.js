// ================= Màn 5 · Nước lên (chương 2): the evening after the rain, the river keeps rising; the tide follows the lunar day on the page =================
// rooms (x): 1 bến sông -8..18 · 2 thả thuyền 18..38 · 3 nhà sàn 38..58 · 4 đò chú Chín 58..84 · 5 lục bình 84..108
//            6 mưa rào dưới gầm cầu 108..134 · 7 cửa cống 134..156 · 8 cầu tàu, Lũ Bụi 156..170 · 9 cột mốc nước 170..195
// new here: a stack of lunar days sets a river's water. Rằm and mồng Một bring nước rong (high water), mồng Tám and Hăm Ba nước kém (low water)
// low water shows the stones and the kè; high water floats the boat, the đò and the lục bình
LV.level = 5;
LV.start = {x:-3.5, y:0};
LV.bounds = [-7.5, 191.4];
LV.cam = [0, 186];
const ROOMS = ['r1','r2','r3','r4','r5','r6','r7','r8','r9'];
LV.sky = ROOMS;
function zoneFor(x){ return x < 18 ? 'r1' : x < 38 ? 'r2' : x < 58 ? 'r3' : x < 84 ? 'r4' : x < 108 ? 'r5' : x < 134 ? 'r6' : x < 156 ? 'r7' : x < 170 ? 'r8' : 'r9'; }
// grey is a washed-out river evening; the colour that comes back is a violet dusk with the full moon coming up
SKY.g.top.set('#7C8090'); SKY.g.mid.set('#9A9CA6'); SKY.g.bot.set('#B4B2B0');
SKY.c.top.set('#2F3F80'); SKY.c.mid.set('#B76E9E'); SKY.c.bot.set('#F4B26E');
LIGHT.fog.set('#D9A08C'); LIGHT.sun.set('#FFC08A');
// down in the riverbeds the camera drops with Tò so the water line stays in view
LV.camY = (x, y)=> y < 0 ? 2.8 + y*.6 : 2.8 + Math.max(0, y - 1)*.55;
// only room 6 has rain: a sudden shower over the bridge
LV.rain = (x, y)=> x > 110.8 && x < 137;
LV.wetT = 2.8; LV.nonT = 7;
rain.k = 0;

// ================= ground: banks of pavement, riverbeds between them, the road in front =================
const LANDS = [[-14, 4, 0], [15, 20, 0], [36, 38, 0], [38, 40, 1.6], [54, 58, 3.8], [62, 66, 0], [82, 86, 0], [108, 115, 0], [131, 140, 0], [154, 156, 0], [170, 176, 0]];
for(const [x0, x1, top] of LANDS){
  for(let a = x0; a < x1; a += 12){ const b = Math.min(x1, a + 12); ZONE = zoneFor(a + .1);
    box(W, a, b, -5, top, -6, 3, top > 0 ? '#C2B6A8' : '#D9D0C4', {outline:false, uv:top > 0 ? [2, 1] : [3.2, 3.2], map:top > 0 ? TEX.stone : TEX.pave});
    if(top > 0) box(W, a, b, top - .14, top, -6, 3.04, '#D9D0C4', {ow:.03, uv:[3.2, 3.2], map:TEX.pave});
    box(W, a, b, top - .02, top + .06, 2.6, 2.9, '#B8A58E', {outline:false}); }
  plat(x0, x1, top, false, null, {safe:true});
  block(x0, x1, -5, top);
}
// anything that slips under the banks lands in the mud
hazard(-20, 200, -6, 'Rãnh sâu quá!');
// riverbeds: a muddy floor, a stone kerb in front, the house walls behind run down into them
function river(x0, x1, floor, lo, o){
  o = o || {}; ZONE = zoneFor(x0 + .1);
  const kerb = o.kerb === undefined ? .08 : o.kerb;
  box(W, x0, x1, floor - .6, floor, -6, 3, '#8A7B68', {outline:false, uv:[2,1], map:TEX.stone});
  // o.gap: a stretch at the left end where the kerb stays low, so the water by a landing shows from the street
  const kx = o.gap ? o.gap[0] : x0;
  if(o.gap) box(W, x0, kx, floor, o.gap[1], 2.55, 3.0, '#9C8F80', {ow:.04, uv:[2,1], map:TEX.stone});
  box(W, kx, x1, floor, kerb, 2.55, 3.0, '#9C8F80', {ow:.04, uv:[2,1], map:TEX.stone});
  box(W, x0, x1, floor, .02, -.62, -.5, '#7E756B', {outline:false, uv:[2,1], map:TEX.stone});
  for(let x = x0 + .8; x < x1 - .5; x += 1.5 + trnd()) mesh(W, new THREE.CylinderGeometry(.04, .04, .5 + trnd()*.4, 4), '#6FAE4E', {pos:new THREE.Vector3(x, floor + .3, 2.3), outline:false, shadow:false});
  const c = channel({x0, x1, floor, level:o.level === undefined ? lo : o.level, z0:-.5, z1:2.55, speed:o.speed || 1.25});
  c.lo = lo; c.hi = o.hi; return c;
}
const chA = river(4, 15, -3, -2.8, {hi:-.3, level:-.3});
const chB = river(20, 36, -3, -2.8, {hi:-.3});
const chC = river(40, 54, -3, -2.8, {hi:1.4, kerb:1.6, gap:[44, .7]});
const chD = river(66, 82, -3, -2.6, {hi:-.3});
const chE = river(86, 108, -3, -2.8, {hi:-.3});
const chF = river(115, 131, -3.2, -3.0, {hi:-.3, level:-.3});
const chG = river(140, 154, -2.4, -2.2, {hi:-.3, level:-.3, speed:.9});
const chI = river(176, 192, -3, -2.8, {hi:-.15});
for(const [x0, x1] of [[-14, 18], [18, 38], [38, 58], [58, 84], [84, 108], [108, 134], [134, 156], [156, 170], [170, 196]]){
  ZONE = zoneFor(x0 + .1);
  box(W, x0, x1, -1.2, -.28, 3, 14, '#A9A097', {outline:false, uv:[4,4], map:TEX.road});
  box(W, x0, x1, -.28, 0, 2.95, 3.15, '#C2B6A8', {outline:false, uv:[2,1], map:TEX.stone});
}
for(let x = -12; x < 194; x += 4){ ZONE = zoneFor(x); box(W, x, x+2, -.27, -.26, 7.4, 7.6, '#E9E2D6', {outline:false, shadow:false}); }
// a row of houses behind every bank: walls run from deep below (the riverbeds show them) to the eaves
function house(x0, x1, h, c, o){
  o = o || {}; ZONE = zoneFor((x0 + x1)/2);
  box(W, x0, x1, -5, h, -4.2, -.5, c, Object.assign({}, WALL, {uv:[6, h + 5, 0, -5]}));
  box(W, x0 - .05, x1 + .05, h, h + .25, -4.4, -.3, '#C98B4A', {ow:.04});
  for(const x of [x0, x1]) box(W, x - .2, x + .2, 0, h, -.5, -.32, '#F4F1EA', {ow:.025});
  if(o.roof) roof(W, x0 - .3, x1 + .3, h + .25, -.15, 3.4, 1.5, o.roof);
}
// grey river stones that show at low water, and the water marks they leave on the walls
function stones(list, top, zone){
  ZONE = zone;
  return list.map(x=>{ blob(W, new THREE.Vector3(x, top - .35, 1.0), [.78, 1.2, .42], '#8E8A86', {ow:.035}); blob(W, new THREE.Vector3(x + .3, top - .62, 1.6), [.4, .5, .3], '#7E7A76', {ow:.03}); return plat(x - .7, x + .7, top); });
}
function waterMark(x0, x1, y, zone){ ZONE = zone; box(W, x0, x1, y - .06, y + .06, -.5, -.46, '#6E7C80', {outline:false}); }

// ================= the lunar-day stacks: the page in front sets the river =================
const DAYS = {'1':'new', '15':'full', '16':'full', '17':'full', '18':'full', '30':'new', '7':'half', '8':'half', '9':'half', '22':'half', '23':'half', '24':'half'};
const dayName = n => n === '15' ? 'Rằm' : +n <= 10 ? 'mồng ' + n : 'ngày ' + n;
// the page shows the moon of that day and how high the water stands
const tidePic = (k, moon)=>(x, cw, ch)=>{
  const wy = ch*(.86 - k*.5);
  x.fillStyle = 'rgba(63,120,170,.22)'; x.fillRect(cw*.08, wy, cw*.84, ch*.92 - wy);
  x.strokeStyle = 'rgba(40,80,120,.45)'; x.lineWidth = 4; x.beginPath();
  for(let i=0;i<=8;i++){ const px = cw*(.08 + i*.105); i ? x.quadraticCurveTo(px - cw*.052, wy - ch*.05*(i%2 ? 1 : -1), px, wy) : x.moveTo(px, wy); }
  x.stroke();
  x.strokeStyle = 'rgba(70,60,50,.45)'; x.fillStyle = 'rgba(70,60,50,.32)'; x.lineWidth = 3;
  const mx = cw*.76, my = ch*.2, r = cw*.1;
  x.beginPath(); x.arc(mx, my, r, 0, Math.PI*2); if(moon === 'full') x.fill(); x.stroke();
  if(moon === 'half'){ x.beginPath(); x.arc(mx, my, r, -Math.PI/2, Math.PI/2); x.closePath(); x.fill(); }
};
const stacks = [];
function tideStack(o){
  const w = o.w || 1.6, h = o.h || 2.0;
  const s = sheet({id:o.id, x0:o.x0, x1:o.x0 + w, y0:o.y0, y1:o.y0 + h, z:-.44,
    layers:o.days.map((d, i)=>({n:d, pic:tidePic(o.k ? o.k[i] : (o.want[i] > o.ch.lo + .5 ? 1 : 0), DAYS[d])})),
    onLayer:()=>tideSet(s, true), onRestore:()=>tideSet(s, true)});
  s.ch = o.ch; s.want = o.want; s.onDay = o.onDay; s.said = o.said;
  s.onLocked = ()=>say('Tờ cuối dán chặt rồi. Bấm R để dán lại ngày trước.', 2.6);
  stacks.push(s); tideSet(s, false); return s;
}
function tideSet(s, told){
  const L = Math.min(s.L, s.layers.length - 1), n = s.layers[L].n;
  s.locked = s.L >= s.layers.length - 1;
  if(told) s.ch.want = s.want[L];
  s.solved = s.L > 0;
  if(told){
    const t = s.said && s.said[L];
    say(t || (s.want[L] > s.ch.lo + .5 ? dayName(n) + ': nước rong, nước lên!' : dayName(n) + ': nước kém, nước ròng xuống.'), 2.6);
  }
  if(s.onDay) s.onDay(L, told);
}

// ================= room 1 · Bến sông: the steps of a river landing, high water over the stones =================
house(-8, 1.6, 8.0, '#E8A598', {roof:'#B5513A'});
house(1.6, 9.6, 7.4, '#F1DDB0');
house(9.6, 18, 8.4, '#9FCBC1', {roof:'#B5513A'});
ZONE = 'r1';
box(W, -7.0, -1.6, 0, 3.0, -.5, -.47, '#3B4152', {outline:false});
for(let i=0;i<7;i++) box(W, -6.9, -1.7, .2+i*.4, .26+i*.4, -.47, -.44, '#6E655C', {outline:false});
sign(W, -6.9, -1.7, 3.3, 4.2, -.5, '#2E8C86', '#F4F1EA', 'BẾN SÔNG', 'đò ngang');
win(W, -4.4, 5.0, 1.5, 2.0, -.5, '#F4F1EA', '#2E8C86', {flower:'#F2C230'}); win(W, -1.0, 5.0, 1.5, 2.0, -.5, '#F4F1EA', '#2E8C86');
balcony(W, -6.6, .8, 4.95, -.5, 1.0, '#E9DCC8', '#2E8C86');
hoaGiay(W, -.4, 1.4, 8.0, -.2, 3.0);
crate(-5.2, 1.3, .8, '#E9C46A', 0); stool(-2.4, 1.4, '#C23A28', 0);
win(W, 5.6, 4.6, 1.4, 1.8, -.5, '#F4F1EA', '#C23A28'); win(W, 12.6, 4.8, 1.4, 1.8, -.5, '#F4F1EA', '#8E6CC0', {flower:'#F06BAE'});
balcony(W, 10.6, 17.0, 4.6, -.5, .9, '#E9DCC8', '#2A2630');
// stone steps down into the river, and a mooring post
for(let i=0;i<3;i++) box(W, 4 + i*.4, 4.4 + i*.4, -3, -.4 - i*.6, -.5, 2.55, '#A39788', {ow:.03, uv:[2,1], map:TEX.stone});
mesh(W, new THREE.CylinderGeometry(.16, .2, .6, 10), '#4A433C', {pos:new THREE.Vector3(3.4, .3, 1.9), ow:.02});
const stA = stones([5.4, 8.0, 10.6, 13.2], -2.0, 'r1');
waterMark(4, 15, -.3, 'r1');
// ================= room 2 · Thả thuyền: a wide river; the boat needs high water =================
house(18, 27, 8.2, '#D9A07A', {roof:'#B5513A'});
house(27, 38, 7.6, '#C7B8E0');
ZONE = 'r2';
win(W, 23.2, 4.4, 1.4, 1.8, -.5, '#F4F1EA', '#2E8C86', {flower:'#F06BAE'}); win(W, 30.4, 4.0, 1.4, 1.8, -.5, '#F4F1EA', '#8E6CC0'); win(W, 34.2, 4.0, 1.4, 1.8, -.5, '#F4F1EA', '#8E6CC0');
balcony(W, 29.0, 36.4, 3.8, -.5, .9, '#E9DCC8', '#2A2630');
hoaGiay(W, 26.0, 27.4, 8.2, -.2, 2.8);
for(let i=0;i<3;i++) mesh(W, new THREE.CylinderGeometry(.18, .18, 3.4, 8), '#7A4E2D', {pos:new THREE.Vector3(24 + i*4.5, -1.6, 2.2)});
waterMark(20, 36, -.3, 'r2');
// a mat of grey rong tangled across the middle of the river: no boat gets through it. Strands run down to the mud, the mat rides the water
ZONE = 'r2';
for(let i=0;i<7;i++) rod(W, new THREE.Vector3(27.5 + i*.26, -3, .5 + (i%3)*.6), new THREE.Vector3(27.6 + i*.26 + Math.sin(i*2.1)*.25, -.5, .4 + (i%2)*.8), .05, '#5E8A3E', {outline:false});
const rongG = new THREE.Group(); rongG.position.set(28.2, 0, 0); scene.add(rongG);
for(let i=0;i<11;i++) leaf(rongG, new THREE.Vector3(-.95 + i*.19, .04 + (i%2)*.05, .3 + (i%4)*.5), [.34, .18, .3], i%2 ? '#4E7A3A' : '#6A8F45', {ow:.02});
let rongK = 1, rongGone = false, rongSaid = false;
block(27.3, 29.1, -3.2, 1.0, ()=>!rongGone);
// ================= room 3 · Nhà sàn: a stilt house over the river, its porch high above a stone quay =================
house(38, 44, 8.6, '#E9C46A', {roof:'#B5513A'});
ZONE = 'r3';
box(W, 44, 58, -5, 9.6, -6, -4.2, '#B9A9C9', Object.assign({}, WALL, {uv:[6, 9]}));
sign(W, 38.4, 42.6, 4.6, 5.4, -.5, '#4E9A4A', '#F4F1EA', 'NHÀ SÀN', 'cá linh mùa nước');
// the stilt house: posts down into the riverbed, a plank porch, a bamboo wall and a thatched roof
for(const x of [44.3, 47.6, 50.9, 53.7]) for(const z of [-1.4, 2.2]) rod(W, new THREE.Vector3(x, -3, z), new THREE.Vector3(x, 3.8, z), .12, '#7A5638', {ow:.025});
box(W, 44, 54, 3.6, 3.8, -1.6, 2.4, '#A27650', {ow:.03, uv:[.8,.8], map:TEX.wood});
plat(44, 54, 3.8, true);
box(W, 45.2, 53.4, 3.8, 7.0, -1.6, -1.3, '#D9B98A', {ow:.03, uv:[1.4, 1.4], map:TEX.wood});
box(W, 47.6, 49.0, 3.8, 6.0, -1.32, -1.28, '#3B4152', {outline:false});
win(W, 51.4, 4.8, 1.3, 1.4, -1.3, '#F4F1EA', '#7A4E2D');
roof(W, 44.6, 54.0, 7.0, -1.3, 2.6, 1.8, '#B88A4A');
for(let k=0;k<4;k++) box(W, 45.4 + k*.5, 45.7 + k*.5, 5.2, 6.4, -1.25, -1.2, ['#E8442E','#F2C230','#F4F1EA','#2F6FB5'][k], {ow:.012});
for(const x of [44.4, 46, 52.4, 53.6]) rod(W, new THREE.Vector3(x, 3.8, 2.3), new THREE.Vector3(x, 4.6, 2.3), .05, '#7A5638', {outline:false});
rod(W, new THREE.Vector3(44.2, 4.55, 2.3), new THREE.Vector3(53.8, 4.55, 2.3), .05, '#7A5638', {outline:false});
for(let i=0;i<3;i++) mesh(W, new THREE.CylinderGeometry(.26, .2, .34, 10), '#B5513A', {pos:new THREE.Vector3(52.6 + i*.5, 3.97, .8), ow:.02});
// the quay on the right, up at porch height, and the stone steps down to the next landing
box(W, 54, 58, 3.6, 3.8, -.5, 2.6, '#B8A58E', {ow:.03, uv:[2,1], map:TEX.stone});
for(const [a, b, top] of [[58, 59.3, 2.85], [59.3, 60.6, 1.9], [60.6, 62, .95]]){ box(W, a, b, -5, top, -.5, 2.6, '#A39788', {ow:.03, uv:[2,1], map:TEX.stone}); block(a, b, -5, top); plat(a, b, top); }
waterMark(40, 54, 1.4, 'r3');
// the lờ: a bamboo fish trap lying in the river off the quay, its mouth to the right, tied by a rope to a stake on the quay.
// Cá linh come up the river with nước rong and go back down with nước ròng: that is when they swim into a lờ
// it sits on a bamboo trestle with its mouth at the high-water line: nước ròng leaves it standing out of the water
const LO = {x:41.7, y:1.05, up:0, busy:false, done:false};
const loG = new THREE.Group(); loG.position.set(LO.x, LO.y, 1.6); scene.add(loG); ZONE = 'r3';
for(const x of [40.9, 42.5]) for(const z of [1.15, 2.05]) rod(W, new THREE.Vector3(x, -3, z), new THREE.Vector3(x + (z > 1.5 ? .15 : -.15), .62, z), .05, '#A27650', {outline:false});
box(W, 40.7, 42.7, .55, .62, 1.1, 2.1, '#A27650', {outline:false});
(function(g){
  const body = mesh(g, new THREE.CylinderGeometry(.4, .52, 1.9, 12, 1, true), '#C99A52', {rot:[0, 0, Math.PI/2], ow:.03}); body.material.side = THREE.DoubleSide;
  mesh(g, new THREE.ConeGeometry(.4, .6, 12), '#B88A4A', {pos:new THREE.Vector3(-1.25, 0, 0), rot:[0, 0, Math.PI/2], ow:.03});
  for(const x of [-.6, 0, .6]) mesh(g, new THREE.TorusGeometry(.46 + x*.06, .035, 5, 18), '#7A5638', {pos:new THREE.Vector3(x, 0, 0), rot:[0, Math.PI/2, 0], outline:false});
  const hom = mesh(g, new THREE.ConeGeometry(.5, .7, 12, 1, true), '#E0B878', {pos:new THREE.Vector3(.62, 0, 0), rot:[0, 0, Math.PI/2], outline:false}); hom.material.side = THREE.DoubleSide;
})(loG);
rod(W, new THREE.Vector3(39.75, 1.6, 1.9), new THREE.Vector3(39.75, 2.5, 1.9), .07, '#7A5638', {ow:.02});
const loRope = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({color:'#3B2E2A'}));
scene.add(loRope);
// ================= room 4 · Đò chú Chín: a ferry landing; the đò sits on the mud at low water, its boatman asleep =================
house(58, 66, 9.6, '#9FCBC1', {roof:'#B5513A'});
house(66, 75, 8.2, '#F1DDB0'); house(75, 86, 8.8, '#E8A598', {roof:'#B5513A'});
ZONE = 'r4';
sign(W, 62.2, 65.8, 3.0, 3.8, -.5, '#C23A28', '#F2C230', 'ĐÒ CHÚ CHÍN', 'qua sông');
win(W, 70.4, 4.6, 1.4, 1.8, -.5, '#F4F1EA', '#2E8C86', {flower:'#F2C230'}); win(W, 79.0, 4.8, 1.4, 1.8, -.5, '#F4F1EA', '#C23A28');
balcony(W, 76.4, 84.4, 4.6, -.5, .9, '#E9DCC8', '#2A2630');
mesh(W, new THREE.CylinderGeometry(.16, .2, .6, 10), '#4A433C', {pos:new THREE.Vector3(65.5, .3, 1.9), ow:.02});
// the tall mooring post on the far landing, with a flat top a child could hide a toy on
rod(W, new THREE.Vector3(82.9, 0, 1.4), new THREE.Vector3(82.9, 3.5, 1.4), .2, '#7A5638', {ow:.03});
box(W, 82.4, 83.4, 3.45, 3.6, .9, 1.9, '#A27650', {ow:.025});
plat(82.4, 83.4, 3.6, true);
waterMark(66, 82, -.3, 'r4');
// the đò: a long wooden hull with painted eyes on the bow, a bamboo mui over the middle
const DO = {x:69.0, y:chD.floor + .25, home:69.0};
const doG = new THREE.Group(); scene.add(doG);
ZONE = 'r4';
(function(g){
  const sh = new THREE.Shape(); sh.moveTo(-2.9, .55); sh.quadraticCurveTo(0, .32, 2.9, .75); sh.lineTo(2.2, -.2); sh.lineTo(-2.3, -.2); sh.closePath();
  mesh(g, new THREE.ExtrudeGeometry(sh, {depth:1.8, bevelEnabled:false}), '#7A4E2D', {pos:new THREE.Vector3(0, 0, -.9), ow:.04});
  box(g, -2.6, 2.6, .44, .5, -.8, .8, '#A27650', {outline:false, uv:[.6,.6], map:TEX.wood});
  const mui = mesh(g, new THREE.CylinderGeometry(.85, .85, 2.4, 16, 1, true, 0, Math.PI), '#C99A52', {pos:new THREE.Vector3(-.3, .5, 0), rot:[0, 0, Math.PI/2], scl:[1, 1, 1.05], ow:.035});
  mui.material.side = THREE.DoubleSide;
  for(const s of [-1, 1]){ blob(g, new THREE.Vector3(2.62, .5, s*.84), [.18, .06, .12], '#F4F1EA', {ow:.015}); blob(g, new THREE.Vector3(2.66, .5, s*.88), [.08, .03, .08], '#141019', {small:true}); }
  mesh(g, new THREE.BoxGeometry(.22, .06, 1.9), '#C23A28', {pos:new THREE.Vector3(2.5, .62, 0), outline:false});
  rod(g, new THREE.Vector3(2.0, .5, .5), new THREE.Vector3(3.6, -.6, .9), .05, '#5E4630', {outline:false});
})(doG);
const doDeck = plat(0, 0, 0, true);
const doMui = plat(0, 0, 0, true);
let doFloat = false, chinAwake = false, ferried = false, ferrying = false;
// ================= room 5 · Lục bình: two sandbars in a wide river; stones at low water, water hyacinth floating at high water =================
house(86, 96, 8.0, '#C7B8E0', {roof:'#B5513A'}); house(96, 108, 7.4, '#E9C46A');
ZONE = 'r5';
win(W, 90.2, 4.4, 1.4, 1.8, -.5, '#F4F1EA', '#2E8C86'); win(W, 99.8, 4.0, 1.4, 1.8, -.5, '#F4F1EA', '#C23A28', {flower:'#F06BAE'}); win(W, 104.4, 4.0, 1.4, 1.8, -.5, '#F4F1EA', '#C23A28');
hoaGiay(W, 94.6, 96.0, 8.0, -.2, 2.6);
const stE1 = stones([87.8, 90.4], -2.0, 'r5');
const stE2 = stones([104.0, 106.3], -2.0, 'r5');
// the sandbars: humps of mud with grass and a bamboo post for the page
for(const [a, b] of [[92.0, 94.8], [100.6, 102.8]]){
  ZONE = 'r5';
  box(W, a, b, -3, .4, -.4, 2.4, '#B39A78', {ow:.035, uv:[2,1], map:TEX.stone});
  for(let x = a + .3; x < b; x += .5) tuft(W, x, .4, 1.8 - (x*7)%1, 1.2);
  plat(a, b, .4, false, null, {safe:true});
}
rod(W, new THREE.Vector3(92.3, .4, -.5), new THREE.Vector3(92.3, 3.6, -.5), .08, '#7A5638', {ow:.02});
rod(W, new THREE.Vector3(100.75, .4, -.5), new THREE.Vector3(100.75, 3.6, -.5), .08, '#7A5638', {ow:.02});
box(W, 92.3, 93.9, .6, 3.0, -.56, -.48, '#A27650', {ow:.02});
box(W, 100.75, 102.1, .6, 3.0, -.56, -.48, '#A27650', {ow:.02});
// lục bình beds: rafts of leaves and lilac flowers that ride on the water
const beds = [96.4, 98.9].map(x=>{
  const g = new THREE.Group(); g.position.set(x, 0, 1.0); scene.add(g); ZONE = 'r5';
  for(let i=0;i<7;i++) leaf(g, new THREE.Vector3((i - 3)*.22, .08 + (i%2)*.06, (i%3 - 1)*.5), [.32, .4, .2], i%2 ? '#5FAF55' : '#4E9A4A', {ow:.025});
  for(let i=0;i<3;i++) leaf(g, new THREE.Vector3((i - 1)*.42, .34, -.1 + i*.2), [.12, .12, .16], '#B58AD8', {ow:.02});
  return {g, x, p:plat(x - .75, x + .75, 0)};
});
// ================= room 6 · Mưa rào: a long bridge with no roof, and a kè under it that only low water uncovers =================
house(108, 120, 8.4, '#E8A598', {roof:'#B5513A'}); house(120, 134, 7.8, '#9FCBC1');
ZONE = 'r6';
for(const [a, b, top] of [[109, 110.4, 1.2], [110.4, 111.8, 2.4]]){ box(W, a, b, top - .25, top, .2, 2.2, '#A39788', {ow:.03, uv:[2,1], map:TEX.stone}); plat(a, b, top, true); }
for(const x of [109.2, 110.6]) rod(W, new THREE.Vector3(x, 0, 2.1), new THREE.Vector3(x, x < 110 ? 1.0 : 2.2, 2.1), .08, '#8A7D6F', {outline:false});
box(W, 111.8, 134, 3.15, 3.4, -.3, 2.6, '#B8A58E', {ow:.04, uv:[2,1], map:TEX.stone});
box(W, 111.8, 134, 3.4, 3.95, 2.4, 2.6, '#D9D0C4', {ow:.03});
plat(111.8, 134, 3.4, true);
for(const x of [115, 123, 131]) box(W, x - .5, x + .5, -3.2, 3.15, -.3, .4, '#A39788', {ow:.03, uv:[1,2], map:TEX.stone});
for(let x = 113; x < 134; x += 3.6) box(W, x, x + .14, 3.95, 4.7, 2.42, 2.58, '#D9D0C4', {ow:.02});
rod(W, new THREE.Vector3(111.8, 4.7, 2.5), new THREE.Vector3(134, 4.7, 2.5), .07, '#D9D0C4', {ow:.02});
// the kè: a stone ledge along the river wall, under the bridge
box(W, 115.2, 130.8, -2.2, -1.8, -.5, 1.1, '#A39788', {ow:.03, uv:[3,1], map:TEX.stone});
plat(115.2, 130.8, -1.8);
waterMark(115, 131, -.3, 'r6');
sign(W, 110.0, 113.6, 4.6, 5.4, -.5, '#2F6FB5', '#F4F1EA', 'CẦU MỚI', 'năm 1993');
// ================= room 7 · Cửa cống: a flooded lane behind a shut sluice; the wheel is out of reach =================
house(134, 145, 8.0, '#D9A07A', {roof:'#B5513A'}); house(145, 156, 8.6, '#F1DDB0');
ZONE = 'r7';
// a tea kiosk with a tin roof: dry under it
box(W, 135.8, 140.2, 3.15, 3.25, -.5, 2.2, '#7FA6B8', {ow:.03});
for(const x of [136.0, 140.0]) box(W, x - .08, x + .08, 0, 3.15, 1.95, 2.1, '#8A7D6F', {ow:.02});
plat(135.8, 140.2, 3.2, true);
sign(W, 135.9, 140.1, 2.3, 2.95, -.5, '#F2C230', '#C23A28', 'NƯỚC MÍA');
// the walkway of planks sunk under the flood
box(W, 140.2, 153.8, -1.55, -1.4, .2, 1.6, '#A27650', {ow:.03, uv:[.8,.8], map:TEX.wood});
for(let x = 141; x < 154; x += 2.6) rod(W, new THREE.Vector3(x, -2.4, .9), new THREE.Vector3(x, -1.5, .9), .08, '#5E4630', {outline:false});
plat(140.2, 153.8, -1.4);
// the sluice: a stone frame across the far end, an iron gate and the wheel up on top
box(W, 149.2, 149.6, -2.4, 3.0, -.5, 2.6, '#9C8F80', {ow:.03, uv:[1,2], map:TEX.stone}); box(W, 150.6, 151.0, -2.4, 3.0, -.5, 2.6, '#9C8F80', {ow:.03, uv:[1,2], map:TEX.stone});
box(W, 149.2, 151.0, 3.0, 3.3, -.5, 2.6, '#B8A58E', {ow:.03});
const gate = new THREE.Group(); scene.add(gate); ZONE = 'r7';
box(gate, 149.6, 150.6, -2.4, .6, -.4, -.2, '#5E6670', {ow:.03});
for(let y = -2.0; y < .6; y += .5) box(gate, 149.6, 150.6, y, y + .08, -.2, -.16, '#3B4152', {outline:false});
const wheel = new THREE.Group(); wheel.position.set(150.1, 2.0, .3); scene.add(wheel);
mesh(wheel, new THREE.TorusGeometry(.55, .07, 6, 20), '#C23A28', {});
for(const a of [0, Math.PI/3, Math.PI*2/3]) rod(wheel, new THREE.Vector3(Math.cos(a)*.55, Math.sin(a)*.55, 0), new THREE.Vector3(-Math.cos(a)*.55, -Math.sin(a)*.55, 0), .04, '#C23A28', {outline:false});
rod(W, new THREE.Vector3(150.1, 2.0, .2), new THREE.Vector3(150.1, 3.0, .2), .06, '#5E6670', {outline:false});
const wheelT = target({x:150.1, y:2.0, r:1.05, onHit:()=>hitWheel()});
let gateK = 0;
// the gate is solid until it has risen: before, a paper boat on high water floated straight through it and skipped the plane
block(149.6, 150.6, -3, 3.0, ()=>gateK < .95);
waterMark(140, 154, -.3, 'r7');
// ================= room 8 · Cầu tàu: a wooden pier over the river, a shed, Lũ Bụi patrolling the planks =================
ZONE = 'r8';
box(W, 156, 170, -.3, 0, -.5, 2.6, '#A27650', {ow:.03, uv:[1.2,1.2], map:TEX.wood});
for(let x = 156.6; x < 170; x += 2.2) for(const z of [-.3, 2.3]) rod(W, new THREE.Vector3(x, -3, z), new THREE.Vector3(x, 0, z), .12, '#5E4630', {outline:false});
plat(156, 170, 0, false, null, {safe:true});
ZONE = 'r8'; box(W, 156, 170, -3, -.5, -6, 3, '#4FB7D2', {outline:false, uv:[7, 7], map:TEX.water});
box(W, 156.2, 160.4, 0, 3.4, -2.6, -.5, '#B88A4A', {ow:.03, uv:[1.4, 1.4], map:TEX.wood});
roof(W, 156.0, 160.6, 3.4, -.4, 2.4, 1.0, '#7FA6B8');
for(let i=0;i<3;i++) crate(160.6 + i*1.1, -1.4, .7, ['#7DBB4B','#E9C46A','#9FCBC1'][i], 0);
mesh(W, new THREE.CylinderGeometry(.5, .5, 1.1, 14), '#2F6FB5', {pos:new THREE.Vector3(167.6, .55, -1.2), ow:.03});
house(160.4, 170, 7.0, '#C7B8E0');
// ================= room 9 · Cột mốc nước: a deep basin at the end of the pier; the grey page hangs high on the water gauge =================
house(170, 176, 8.2, '#E9C46A', {roof:'#B5513A'});
ZONE = 'r9';
box(W, 176, 192, -5, 6.0, -6, -4.2, '#B9A9C9', Object.assign({}, WALL, {uv:[6, 9]}));
box(W, 192, 196, -5, 7.4, -4.2, 2.6, '#C2B6A8', Object.assign({}, WALL, {uv:[3, 9]}));
box(W, 191.9, 196.1, 7.4, 7.65, -4.4, 2.8, '#C98B4A', {ow:.04});
block(192, 196, -5, 7.4);
box(W, 183.6, 192, -5, 6.0, -2.2, -.5, '#C2B6A8', Object.assign({}, WALL, {uv:[4, 9]}));
box(W, 183.5, 192, 6.0, 6.25, -2.4, -.3, '#C98B4A', {ow:.04});
// the gauge on the wall: red and white bands, one per metre
for(let i=0;i<8;i++) box(W, 184.8, 185.6, -3 + i*.9, -2.1 + i*.9, -.5, -.4, i%2 ? '#F4F1EA' : '#C23A28', {ow:.015});
box(W, 184.6, 185.8, 4.2, 4.5, -.52, -.38, '#7A4E2D', {ow:.02});
for(const [y, n] of [[-1.2, '1'], [.6, '2'], [2.4, '3']]){ ZONE = 'r9'; box(W, 183.9, 184.6, y, y + .06, -.5, -.42, '#2A2630', {outline:false}); }
sign(W, 177.0, 181.8, 4.4, 5.3, -4.2, '#2E8C86', '#F4F1EA', 'CỘT MỐC NƯỚC', 'đỉnh lũ 1992');
waterMark(176, 192, -.15, 'r9');

// ================= background =================
midRow(-16, 198, zoneFor, {zf:-5.4});
farRow(-24, 214);
clouds(-40, 230); hills(-40, 230);
const POLES = [-8, 17, 37, 62.5, 85, 108.5, 140.5, 156.2, 175];
for(const x of POLES){ ZONE = zoneFor(x); powerPole(x, 3.4); }
for(let i=0;i<POLES.length-1;i++){ ZONE = zoneFor(POLES[i]); poleWires([POLES[i], POLES[i+1]], 3.2); }
tree(W, -11, 3.8, 7.5, {s:1.2, zone:'r1'});
tree(W, 85.0, 3.9, 7.0, {s:1.0, zone:'r5', flower:'#F06BAE'});
tree(W, 172.2, 3.9, 7.6, {s:1.1, zone:'r9'});
// the full moon of the ending: it rises over the river once the last page comes off
ZONE = 'sky';
const moon = new THREE.Mesh(new THREE.CircleGeometry(4.2, 40), new THREE.MeshBasicMaterial({color:'#FFF1C2', transparent:true, opacity:0, depthWrite:false, fog:false}));
moon.position.set(184, 8, -70); scene.add(moon);
const moonGlow = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), new THREE.MeshBasicMaterial({map:dotTex, color:'#FFD98A', transparent:true, opacity:0, depthWrite:false, blending:THREE.AdditiveBlending, fog:false}));
moonGlow.position.set(184, 8, -70.5); scene.add(moonGlow);
let moonK = 0;
// đèn hoa đăng: little lotus lanterns let out on the water at the end
const hoaDang = [];
for(let i=0;i<9;i++){
  const g = new THREE.Group(); g.visible = false; scene.add(g); ZONE = 'keep';
  for(let k=0;k<6;k++) leaf(g, new THREE.Vector3(Math.cos(k*1.05)*.22, .12, Math.sin(k*1.05)*.22), [.16, .16, .2], k%2 ? '#F28AB8' : '#F6B6D2', {ow:.02, keep:true});
  mesh(g, new THREE.CylinderGeometry(.07, .07, .2, 8), '#FFF2B0', {pos:new THREE.Vector3(0, .3, 0), outline:false, keep:true});
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshBasicMaterial({map:dotTex, color:'#FFC94A', transparent:true, opacity:.9, depthWrite:false, blending:THREE.AdditiveBlending}));
  glow.position.set(0, .35, .3); g.add(glow);
  hoaDang.push({g, x:177.5 + i*1.6, z:.2 + (i%3)*.7, ph:i*.9});
}
moteSpan(-10, 30);

// ================= sheets =================
const boatPic = (x, cw, ch)=>{ x.fillStyle = 'rgba(70,60,50,.3)'; x.beginPath(); x.moveTo(cw*.22, ch*.66); x.lineTo(cw*.78, ch*.66); x.lineTo(cw*.66, ch*.8); x.lineTo(cw*.34, ch*.8); x.closePath(); x.fill(); x.beginPath(); x.moveTo(cw*.4, ch*.66); x.lineTo(cw*.5, ch*.42); x.lineTo(cw*.6, ch*.66); x.fill(); };
const planePic = (x, cw, ch)=>{ x.fillStyle = 'rgba(70,60,50,.28)'; x.beginPath(); x.moveTo(cw*.85, ch*.4); x.lineTo(cw*.15, ch*.25); x.lineTo(cw*.32, ch*.42); x.lineTo(cw*.15, ch*.62); x.closePath(); x.fill(); };
const fanPic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.4)'; x.lineWidth = 4; for(let i=0;i<5;i++){ const a = -Math.PI*.8 + i*Math.PI*.15; x.beginPath(); x.moveTo(cw*.5, ch*.8); x.lineTo(cw*.5 + Math.cos(a)*cw*.36, ch*.8 + Math.sin(a)*cw*.36); x.stroke(); }
  x.beginPath(); x.arc(cw*.5, ch*.8, cw*.36, -Math.PI*.8, -Math.PI*.2); x.stroke(); };
const doPic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.42)'; x.lineWidth = 4; x.beginPath(); x.moveTo(cw*.08, ch*.6); x.quadraticCurveTo(cw*.5, ch*.75, cw*.92, ch*.5); x.lineTo(cw*.8, ch*.85); x.lineTo(cw*.2, ch*.85); x.closePath(); x.stroke();
  x.beginPath(); x.arc(cw*.45, ch*.62, cw*.2, Math.PI, 0); x.stroke(); };
const gaugePic = (x, cw, ch)=>{ x.fillStyle = 'rgba(194,58,40,.18)'; for(let i=0;i<5;i++) if(i%2 === 0) x.fillRect(cw*.08, ch*(.15 + i*.15), cw*.12, ch*.15);
  x.fillStyle = 'rgba(70,60,50,.3)'; x.beginPath(); x.arc(cw*.66, ch*.32, ch*.16, 0, Math.PI*2); x.fill();
  x.strokeStyle = 'rgba(40,80,120,.45)'; x.lineWidth = 4; for(const y of [.68, .8]){ x.beginPath(); for(let i=0;i<=8;i++){ const px = cw*(.25 + i*.085); i ? x.quadraticCurveTo(px - cw*.04, ch*(y - .04*(i%2 ? 1 : -1)), px, ch*y) : x.moveTo(px, ch*y); } x.stroke(); } };
const sheetT1 = tideStack({id:'A', x0:1.0, y0:.4, ch:chA, days:['18', '8'], want:[chA.hi, chA.lo], onDay:(L, told)=>{ if(told && L === 1 && !lowA){ lowA = true; colour('r1', .6); objective('Nhảy qua mấy hòn đá vừa lộ ra'); } }});
const sheetK2 = sheet({id:'K', x0:15.6, x1:17.2, y0:.4, y1:2.2, z:-.44, carry:true, respawn:true, layers:[{n:'18', pic:boatPic}]});
const sheetT2 = tideStack({id:'B', x0:17.8, y0:.4, ch:chB, days:['23', '1'], want:[chB.lo, chB.hi]});
const sheetK3 = sheet({id:'L', x0:36.1, x1:37.0, y0:.4, y1:2.2, z:-.44, carry:true, respawn:true, layers:[{n:'18', pic:boatPic}]});
const sheetT3 = tideStack({id:'C', x0:38.4, y0:2.1, w:1.0, ch:chC, days:['9', '16'], want:[chC.lo, chC.hi], said:[0, 'Ngày 16: nước rong, lên tới chân nhà sàn!']});
const sheetT4 = tideStack({id:'D', x0:62.6, y0:.4, ch:chD, days:['23', '1'], want:[chD.lo, chD.hi]});
const sheetDo = sheet({id:'O', x0:DO.x - 1.4, x1:DO.x + .2, y0:0, y1:1.5, z:1.02, layers:[{n:'18', pic:doPic}], onLayer:()=>peeledDo()});
const sheetT5a = tideStack({id:'E', x0:92.6, y0:.8, w:1.1, ch:chE, days:['22', '17'], want:[chE.lo, chE.hi], said:[0, 'Ngày 17: nước rong, lục bình nổi lên!']});
const sheetT5b = tideStack({id:'F', x0:100.9, y0:.8, w:1.0, ch:chE, days:['17', '23'], want:[chE.hi, chE.lo]});
const sheetT6 = tideStack({id:'G', x0:112.6, y0:.4, ch:chF, days:['30', '7'], want:[chF.hi, chF.lo], said:[0, 'Mồng 7: nước kém, lộ bờ kè dưới gầm cầu!']});
const sheetM7 = sheet({id:'M', x0:136.6, x1:138.2, y0:.4, y1:2.2, z:-.44, carry:true, respawn:true, layers:[{n:'18', pic:planePic}]});
const sheetQ8 = sheet({id:'Q', x0:157.0, x1:158.6, y0:.4, y1:2.2, z:-.44, carry:true, respawn:true, layers:[{n:'18', pic:fanPic}]});
const sheetK9 = sheet({id:'N', x0:170.6, x1:172.2, y0:.4, y1:2.2, z:-.44, carry:true, respawn:true, layers:[{n:'18', pic:boatPic}]});
const sheetT9 = tideStack({id:'H', x0:173.4, y0:.4, ch:chI, days:['24', '16', '15'], want:[chI.lo, -1.2, chI.hi], k:[0, .55, 1],
  said:[0, 'Ngày 16: nước lên, mà chưa tới.', 'Rằm: con nước lớn nhất tháng!']});
const sheetS = sheet({id:'S', x0:186.4, x1:189.4, y0:.9, y1:3.9, z:-.44, layers:[{n:'15', pic:gaugePic}], onLayer:()=>peeledGauge()});
sheetK2.solved = sheetK3.solved = sheetM7.solved = sheetQ8.solved = sheetK9.solved = true;
// the page on the mui rides up and down with the đò
function placeDoSheet(){
  const s = sheetDo, y0 = DO.y + .75;
  if(Math.abs(s.y0 - y0) < .002) return;
  s.y0 = y0; s.y1 = y0 + 1.5; s.frame.position.y = y0 + .75; s.back.position.y = y0 + .75; updSheet(s);
}
placeDoSheet();

// ================= characters =================
// chú Chín: a lean old ferryman squatting at the stern, nón lá, a khăn rằn round his neck, a blue áo bà ba
function buildChin(g){
  const AO = '#2E6E8E', QU = '#2A2630', SK = '#B9805A';
  for(const s of [-1,1]){
    blob(g, new THREE.Vector3(s*.3, .95, .3), [.22, .48, .2], QU);
    blob(g, new THREE.Vector3(s*.32, .45, .72), [.19, .19, .4], QU);
    blob(g, new THREE.Vector3(s*.32, .08, .82), [.18, .26, .08], SK);
  }
  const body = blob(g, new THREE.Vector3(0, 1.7, 0), [.62, .54, .76], AO);
  for(let i=0;i<3;i++) blob(g, new THREE.Vector3(.08, 1.9 - i*.26, .53), .045, '#F1EEE8', {small:true});
  // the khăn rằn: black and white checks round the neck
  blob(g, new THREE.Vector3(0, 2.32, .05), [.5, .46, .16], '#2A2630');
  for(let i=0;i<5;i++) blob(g, new THREE.Vector3(-.32 + i*.16, 2.33, .44), .04, '#F1EEE8', {small:true});
  const arms = [];
  for(const s of [-1,1]){ const a = new THREE.Group(); a.position.set(s*.6, 2.12, .05); g.add(a);
    blob(a, new THREE.Vector3(s*.1, -.32, .1), [.17, .17, .46], AO, {rot:[-.5, 0, s*.3]}); blob(a, new THREE.Vector3(s*.16, -.6, .5), .15, SK); arms.push(a); }
  const head = new THREE.Group(); g.add(head);
  blob(head, new THREE.Vector3(0, 3.0, 0), [.58, .56, .6], SK);
  eyes(head, 0, 3.08, .5, .17, .2, .3, .22);
  blob(head, new THREE.Vector3(0, 2.8, .55), [.24, .06, .06], '#3B3236', {small:true});
  blob(head, new THREE.Vector3(0, 2.92, .6), [.1, .09, .09], '#A86E4C', {ow:.025});
  // the nón lá, tipped back a little
  const non = mesh(head, new THREE.ConeGeometry(1.0, .62, 20), '#E9D9B0', {pos:new THREE.Vector3(0, 3.75, -.05), rot:[-.18, 0, 0], ow:.035});
  for(let i=0;i<2;i++) mesh(head, new THREE.TorusGeometry(.35 + i*.32, .02, 4, 24), '#C9B994', {pos:new THREE.Vector3(0, 3.82 - i*.2, -.06 + i*.03), rot:[Math.PI/2 - .18, 0, 0], outline:false});
  return {head, body, arms, non};
}
ZONE = 'chin';
const chin = new THREE.Group(); chin.rotation.y = -.5; chin.scale.setScalar(S*1.0); scene.add(chin); const chinR = buildChin(chin);
rod(chin, new THREE.Vector3(.9, 2.0, .6), new THREE.Vector3(2.6, -1.2, 1.2), .07, '#7A5638', {ow:.02});
// the hidden old tò he: a little toad on top of the far mooring post, chú Chín's
ZONE = 'keep';
const toad = new THREE.Group(); scene.add(toad); toad.scale.setScalar(.42);
(function(){ const C = '#6E8B3D';
  blob(toad, new THREE.Vector3(0, .55, 0), [.8, .7, .5], C, {keep:true});
  blob(toad, new THREE.Vector3(.35, .78, 0), [.5, .5, .38], C, {keep:true});
  for(const z of [-.24, .24]){ blob(toad, new THREE.Vector3(.48, 1.05, z), [.18, .18, .18], '#FFFFFF', {keep:true}); blob(toad, new THREE.Vector3(.6, 1.06, z*1.05), [.08, .08, .08], '#141019', {small:true, keep:true}); }
  for(const [x, z] of [[-.4, -.42], [-.4, .42], [.3, -.38], [.3, .38]]) blob(toad, new THREE.Vector3(x, .15, z), [.22, .2, .1], C, {keep:true});
  for(let i=0;i<4;i++) blob(toad, new THREE.Vector3(-.3 + i*.2, .92, -.2 + (i%2)*.4), .06, '#C9B23A', {small:true, keep:true});
  mesh(toad, new THREE.TorusGeometry(.14, .03, 4, 12), '#C23A28', {pos:new THREE.Vector3(.86, .75, 0), rot:[0, Math.PI/2, 0], keep:true});
})();
toad.position.set(82.9, 3.6, 1.4);
relic(toad, 82.9, 3.6, 'Con cóc nhỏ của chú Chín');
firefly(8.0, -1.0, ()=>chA.level < -1.8);
firefly(39.0, 2.7, ()=>LO.done);
firefly(68.2, -1.2, ()=>!doFloat);
firefly(120.4, 4.5);
firefly(166.0, 3.2);
for(const z of ROOMS.concat(['chin','sky'])) setZone(z, 0);
bui({x:162.4, top:0, s:.55, a:161.4, b:164.0, fan:true}); bui({x:164.6, top:0, s:.48, a:163.4, b:166.0, fan:true});
bui({x:166.8, top:0, s:.6, a:165.6, b:168.2, fan:true}); bui({x:163.6, top:0, s:.4, a:162.2, b:165.2, fan:true});

// ================= fish =================
// room 2: a grey cá rô, the one fish that can eat through the rong once it is in colour again
const caRo = riverFish({c:chB, kind:'ro', s:1.3, a:20.8, b:26.4, x:24.6, z:1.4, seed:11, name:'Cá rô', onFree:()=>{
  caRo.goal = 26.95; caRo.nibble = true; colour('r2', .4); objective('Cá rô đang rỉa đám rong…'); }});
// room 3: a school of cá linh that only comes with the high water
const linh = [];
for(let i=0;i<5;i++) linh.push(riverFish({c:chC, kind:'linh', s:.78, z:1.0 + (i%3)*.45, x:55, seed:31 + i*7, noVot:true, zone:'calinh', drive:linhDrive}));
let school = 'away', schoolSeen = false;
function linhDrive(f, dt, t, wantY){
  const i = linh.indexOf(f), high = chC.level > .4;
  if(school === 'away' && high){ school = 'in'; for(const q of linh){ q.x = 54.5 + linh.indexOf(q)*.5; q.y = chC.level - .1; } }
  if(school === 'in' && chC.want === chC.lo){ school = 'out'; for(const q of linh) q.inLo = false; }
  f.g.visible = school !== 'away';
  if(f.inLo){ f.tx = loG.position.x - .1 + ((i*.37 + t*.4)%1)*1.15; f.sp = 2; f.z = 1.6; return loG.position.y - .08 + (i%2)*.12; }
  if(school === 'in'){ f.tx = 47.5 + Math.sin(t*.22 + i*1.1)*5.2; f.sp = 1.6; }
  else if(school === 'out'){
    // the water drains away down the river and the school goes with it: through the lờ's mouth if it is lying in the water
    f.tx = 39.6; f.sp = 3.2;
    if(LO.up < .1 && f.x < LO.x + .8){ f.inLo = true; }
    else if(f.x < 40.4){ f.g.visible = false; f.out = true; if(linh.every(q=>q.out || q.inLo)){ school = linh.some(q=>q.inLo) ? 'trap' : 'away'; if(school === 'trap' && P.x > 34 && P.x < 58) say('Nước ròng… cá linh lọt vào lờ rồi!', 2.4); for(const q of linh) q.out = false; } }
  }
  else if(school === 'free'){ f.tx = 46.5 + Math.sin(t*.3 + i*1.3)*5.5; f.sp = 1.8; }
  else if(school === 'trap' && !f.inLo) f.g.visible = false;
  return wantY;
}
function pullLo(){
  LO.busy = true; sfx('use');
  const n = linh.filter(f=>f.inLo).length;
  const steps = [{dur:1.1, cam:[40.6, 2.2], tick:(t)=>{ LO.up = Math.min(1, t/1.1); }}];
  if(n){
    steps.push({dur:2.0, cam:[40.6, 2.2], start:()=>{ say('Lờ đầy cá linh! Bóc lớp xám ra nào…', 2); colour('calinh'); buzz(30); }});
    // Tò tips the lờ: the cá linh, in colour now, leap one after another back to the river
    steps.push({dur:2.4, cam:[43, 2.0], start:()=>{ say('Cá linh mùa nước về rồi!', 2); school = 'free'; LO.done = true; colour('r3', .6);
        for(const f of linh){ f.inLo = false; f.caught = true; f.g.visible = true; } },
      tick:(t)=>{ for(const f of linh){ const i = linh.indexOf(f), k = Math.max(0, Math.min(1, (t - i*.3)/.9));
          const x0 = loG.position.x + .9, y0 = loG.position.y, x1 = 43.2 + i*1.7, y1 = chC.level - .1;
          f.x = x0 + (x1 - x0)*k; f.y = y0 + (y1 - y0)*k + Math.sin(k*Math.PI)*1.6; f.dir = 1;
          if(k >= 1 && f.caught){ f.caught = false; f.tx = f.x; sfx('splash'); } } },
      end:()=>{ for(const f of linh) f.caught = false; }});
  } else {
    steps.push({dur:2.6, start:()=>say(school === 'in' ? 'Lờ trống. Nước rong cá còn bơi lên. Nước ròng cá mới theo nước về sông.'
      : schoolSeen ? 'Lờ trống. Cá theo nước ròng đi mất rồi. Thả lờ nằm dưới nước mà chờ.' : 'Lờ trống trơn. Sông cạn, chưa có con cá nào.', 2.6)});
  }
  steps.push({dur:1.0, tick:(t)=>{ LO.up = 1 - Math.min(1, t/1.0); }, end:()=>{ LO.up = 0; LO.busy = false; }});
  play(steps);
}
LV.act = ()=>{
  if(P.x > 39.5 && P.x < 40.7 && Math.abs(P.y - 1.6) < .2 && !LO.busy && !LO.done){ pullLo(); return true; }
  return false;
};
LV.prompt = ()=> P.x > 39.5 && P.x < 40.7 && Math.abs(P.y - 1.6) < .2 && !LO.done && !held.on ? 'E để kéo dây lờ lên' : '';

// ================= bubbles =================
const dist = o => Math.abs(P.x - o.position.x) + Math.abs(P.y - o.position.y)*.5;
const lines = {};
function npcSay(k, t, d){ lines[k] = {t, d}; }
function npcTalk(obj, k, dy, idle){ talker(obj, dy, ()=>{ const l = lines[k]; if(l && l.d > 0) return l.t; return idle ? idle() : ''; }); }
npcTalk(chin, 'chin', 2.4, ()=>{
  if(toSayT > 0 || busy() || P.won || dist(chin) > 6) return '';
  if(!chinAwake) return Math.sin(nowT*.8) > 0 ? '…nước lên thì chở…' : '…nước ròng thì chờ…';
  if(!doFloat) return 'Đợi con nước lớn, chú chở qua.';
  if(!ferried) return 'Lên đò đi con!';
  return '';
});
talker(chin, 2.3, ()=> !chinAwake && dist(chin) > 6 ? 'z z z' : '', 'zzz');

// ================= story beats =================
let metFish = false, lowA = false, metB = false, metC = false, metPorch = false, metDo = false, metE = false, metRain = false, lowF = false, metG = false, metPier = false, metGauge = false, pierClear = false, gateOpen = false;
function peeledDo(){
  sheetDo.solved = true; chinAwake = true; colour('chin');
  play([{dur:2.4, cam:[DO.x + 1, DO.y + 1.8], start:()=>npcSay('chin', 'Hử? Ai bóc tờ lịch trên mui vậy?', 2.4)},
    {dur:2.6, start:()=>npcSay('chin', doFloat ? 'Nước lớn rồi! Lên đò, chú chở qua.' : 'Nước ròng, đò mắc cạn rồi con ơi.', 2.6)},
    {dur:0, start:()=>objective(doFloat ? 'Lên đò chú Chín' : 'Đổi ngày ở bến cho nước lớn')}]);
}
function ferry(){
  ferrying = true; const from = DO.x, to = 79.0;
  play([{dur:1.8, start:()=>npcSay('chin', 'Ngồi cho vững nghe con!', 1.8)},
    {dur:5.0, cam:[74, 2.2], tick:(t)=>{ const k = Math.min(1, t/5), e = k*k*(3 - 2*k), nx = from + (to - from)*e, d = nx - DO.x; DO.x = nx; if(P.on === doDeck || P.on === doMui) P.x += d; }},
    {dur:2.4, start:()=>{ ferried = true; ferrying = false; colour('r4'); npcSay('chin', 'Tới rồi. Hồi lụt năm đó chú chở cả xóm…', 2.4); }},
    {dur:0, start:()=>objective('Qua bãi lục bình')}]);
}
function hitWheel(){
  gateOpen = true; chG.want = chG.lo;
  play([{dur:2.8, cam:[148, .6], start:()=>say('Trúng rồi! Cửa cống mở, nước rút ra sông!', 2.4)}, {dur:0, start:()=>{ colour('r7'); objective('Đi qua lối gỗ'); }}]);
}
LV.onFan = n=>{ if(!pierClear && buis.every(b=>b.gone)){ pierClear = true; colour('r8'); objective('Ra cuối cầu tàu'); } };
function peeledGauge(){
  sheetS.solved = true; objective('Nước đã về đúng ngày!');
  finish([
    {dur:2.6, cam:[186, 2.6, 16], start:()=>say('Tờ cuối cùng rồi…', 2)},
    {dur:4.2, cam:[180, 5, 34], start:()=>{ bars(true); caption('Trăng Rằm lên. Con sông lại chảy theo ngày của nó.'); for(const z of ROOMS) colour(z); moonK = .001; for(const h of hoaDang) h.g.visible = true; }, end:()=>caption('')},
    {dur:3.0, cam:[DO.x, 2.0, 14], start:()=>{ colour('chin'); npcSay('chin', 'Nước về đúng con nước rồi. Cảm ơn con.', 2.8); }},
    {dur:4.8, cam:[DO.x, 2.0, 14], start:()=>memo(drawChinMemory), end:memoOff},
    {dur:3.0, cam:[DO.x, 2.0, 14], start:()=>npcSay('chin', 'Nước lên thì chở, nước ròng thì chờ. Ngày nào cũng có con nước của nó.', 3)},
    {dur:.6, end:()=>bars(false)}]);
}
function drawChinMemory(x, W, H){
  x.fillStyle = '#F6EBD9'; x.fillRect(20, 20, W-40, H-40); x.strokeStyle = '#141019'; x.lineWidth = 3; x.strokeRect(20, 20, W-40, H-40);
  x.fillStyle = '#3B2E2A'; x.font = '28px "Patrick Hand", cursive'; x.textAlign = 'center';
  x.fillText('Mùa lụt năm 1992, bến sông', W/2, 62);
  x.strokeStyle = 'rgba(40,80,120,.5)'; x.lineWidth = 3;
  for(const y of [232, 252]){ x.beginPath(); for(let i=0;i<=10;i++){ const px = 50 + i*38; i ? x.quadraticCurveTo(px - 19, y - 8*(i%2 ? 1 : -1), px, y) : x.moveTo(px, y); } x.stroke(); }
  x.strokeStyle = '#7A4E2D'; x.lineWidth = 4; x.beginPath(); x.moveTo(110, 205); x.quadraticCurveTo(240, 225, 370, 195); x.lineTo(340, 228); x.lineTo(140, 228); x.closePath(); x.stroke();
  x.beginPath(); x.arc(225, 205, 46, Math.PI, 0); x.stroke();
  for(let i=0;i<5;i++){ x.beginPath(); x.arc(150 + i*42, 175 - (i%2)*6, 9, 0, Math.PI*2); x.stroke(); }
  x.fillStyle = '#3B2E2A'; x.font = '24px "Patrick Hand", cursive'; x.fillText('“Chú Chín chở cả xóm qua sông, mấy chục chuyến một đêm.”', W/2, 306);
}

// ================= per-frame level logic =================
LV.update = (dt, t)=>{
  for(const k in lines) if(lines[k].d > 0) lines[k].d -= dt;
  // the shower over the bridge: only while Tò is near it
  const inRain = P.x > 104 && P.x < 139;
  rain.k += ((inRain && !P.won ? 1 : 0) - rain.k)*Math.min(1, dt*1.6);
  wetEl.style.display = P.x > 100 && P.x < 142 ? '' : 'none';
  // stones, the lục bình and the đò follow the water
  for(const m of beds){ const y = chE.level + .12; m.p.top = y; m.g.position.y = y + Math.sin(t*1.8 + m.x)*.03; m.g.rotation.z = Math.sin(t*1.3 + m.x)*.04; }
  doFloat = chD.level > chD.floor + .8;
  DO.y += ((doFloat ? chD.level : chD.floor + .25) - DO.y)*Math.min(1, dt*3);
  doG.position.set(DO.x, DO.y + (doFloat ? Math.sin(t*1.6)*.04 : 0), .1); doG.rotation.z = doFloat ? Math.sin(t*1.2)*.025 : .05;
  doDeck.x0 = DO.x - 2.6; doDeck.x1 = DO.x + 2.6; doDeck.top = DO.y + .5;
  doMui.x0 = DO.x - 1.5; doMui.x1 = DO.x + .9; doMui.top = DO.y + 1.4;
  chin.position.set(DO.x + 1.9, DO.y + .5, .3);
  chinR.head.rotation.x = chinAwake ? Math.sin(t*1.3)*.04 : .35 + Math.sin(t*1.2)*.04;
  if(!sheetDo.done) placeDoSheet();
  if(chinAwake && doFloat && !ferried && !ferrying && (P.on === doDeck || P.on === doMui) && !busy()) ferry();
  if(chinAwake && doFloat && !ferried && !ferrying && OBJ === 'Đổi ngày ở bến cho nước lớn'){ npcSay('chin', 'Nước lớn rồi! Lên đò đi con.', 2.4); objective('Lên đò chú Chín'); }
  // the rong rides the water; the cá rô in colour eats it away
  rongG.position.y = chB.level; rongG.scale.set(1, Math.max(.05, rongK), Math.max(.05, rongK)); rongG.visible = rongK > .02;
  if(caRo.atGoal && caRo.nibble && rongK > 0){ rongK = Math.max(0, rongK - dt/3.2);
    if(rongK === 0){ rongGone = true; caRo.nibble = false; caRo.goal = undefined; caRo.b = 34.8; colour('r2', .6); say('Cá rô rỉa sạch đám rong rồi! Thuyền qua được.', 2.6); objective('Gấp thuyền, đi thuyền qua sông'); } }
  if(!rongGone && boat.on && boat.c === chB && P.on === boat.plat && P.x > 26.2){ if(!rongSaid){ rongSaid = true; say('Rong quấn kín, thuyền không qua được!', 2.2); } } else if(P.x < 25) rongSaid = false;
  if(!metFish && chB.level > -1.2 && P.x > 15 && P.x < 36 && !busy()){ metFish = true;
    play([{dur:2.6, cam:[27, .8], start:()=>say('Giữa sông có đám rong xám quấn kín…', 2.4)},
      {dur:2.8, cam:[24, .6], start:()=>say('Có con cá rô xám lờ đờ… Gấp cái vợt vớt nó lên thử!', 2.8)},
      {dur:0, start:()=>{ if(!learned.includes('vot')) learned.unshift('vot'); say('Tò biết gấp vợt rồi! Bấm Q.', 2.4); objective('Gấp vợt, đứng yên sát mép nước chờ cá lại gần'); }}]); }
  // the lờ: lying on the riverbed, or hauled up by its rope to hang beside the quay
  const ue = LO.up*LO.up*(3 - 2*LO.up);
  loG.position.set(LO.x + (40.9 - LO.x)*ue, LO.y + (2.6 - LO.y)*ue, 1.6); loG.rotation.z = ue*.35;
  { const a = loRope.geometry.attributes.position; a.setXYZ(0, 39.75, 2.45, 1.9); a.setXYZ(1, loG.position.x - .95, loG.position.y + .1, 1.6); a.needsUpdate = true; }
  if(school !== 'away' && !schoolSeen && P.x > 34 && P.x < 58){ schoolSeen = true; if(!busy()) say('Cá linh theo nước rong về! Dưới bến có cái lờ…', 2.6); }
  // the sluice gate lifts once the wheel is hit
  if(gateOpen && gateK < 1) gateK = Math.min(1, gateK + dt*.6);
  gate.position.y = gateK*2.4; wheel.rotation.z = -gateK*6;
  if(moonK > 0) moonK = Math.min(1, moonK + dt*.3);
  moon.material.opacity = moonK; moonGlow.material.opacity = moonK*.5; moon.position.y = 4 + moonK*8; moonGlow.position.y = moon.position.y;
  for(const h of hoaDang) if(h.g.visible){ h.x += dt*.25; if(h.x > 191) h.x = 177; h.g.position.set(h.x, chI.level + .05 + Math.sin(t*1.5 + h.ph)*.04, h.z); }
  LV.lantern = moonK*.6;
  // room beats, in the order Tò meets them
  if(!metB && P.x > 15.2 && P.y > -.5){ metB = true; colour('r1'); say('Sông rộng quá, đá chìm hết rồi.', 2.4); objective('Gấp thuyền, chờ nước lớn rồi qua sông'); }
  if(!metC && P.x > 36.2 && P.y > -.5){ metC = true; colour('r2'); say('Nhà sàn cao quá… nước lớn thì thuyền lên cao.', 2.6); objective('Cho nước lên, đi thuyền tới hiên nhà sàn'); }
  if(!metPorch && P.x > 44 && P.y > 3.5){ metPorch = true; colour('r3'); say('Lên được hiên nhà sàn rồi!', 2); objective('Xuống bến đò'); }
  if(!metDo && P.x > 62.2 && P.y < .5){ metDo = true; say('Có chiếc đò mắc cạn, ông lái ngủ quên trên mui.', 2.6); objective('Bóc tờ lịch trên mui đò'); }
  if(!metE && P.x > 86.2 && P.y > -.5){ metE = true; say('Lục bình nổi khi nước lớn, đá lộ ra khi nước ròng.', 2.8); objective('Đổi ngày ở cồn cát để qua sông'); }
  if(!metRain && P.x > 108.5){ metRain = true; colour('r5'); say('Mưa rào! Tò là bột gạo, ướt là nhũn…', 2.6); objective('Qua sông mà đừng để ướt nhũn'); }
  if(!lowF && chF.want === chF.lo){ lowF = true; objective('Đi dưới gầm cầu cho khỏi ướt'); }
  if(!metG && P.x > 134.5 && P.y > -.5){ metG = true; colour('r6'); say('Hẻm ngập nước, cửa cống đóng chặt.', 2.4); objective('Phóng máy bay trúng bánh xe cửa cống'); }
  if(!metPier && P.x > 156.5){ metPier = true; say('Lũ Bụi trên cầu tàu!', 2); objective('Gấp quạt, quạt Lũ Bụi bay đi'); }
  if(!metGauge && P.x > 170.2){ metGauge = true; colour('r8'); say('Cột mốc nước… tờ lịch xám dán trên cao.', 2.6); objective('Đổi ngày tới Rằm, đi thuyền lên bóc tờ lịch'); }
};
const heldIs = f => held.on && held.form === f;
const boatHint = (c, need)=> boat.on && boat.c === c ? (c.level > c.floor + .45 ? need : 'Thuyền nằm trên bùn. Bóc lịch cho nước lớn.')
  : held.on ? (held.form === 'thuyen' ? 'Đứng sát mép nước, bấm E để thả thuyền.' : 'Bấm Q cho tới khi gấp thành thuyền.') : 'Lấy tờ lịch trên tường để gấp thuyền.';
LV.hint = ()=>{
  if(P.x < 15) return sheetT1.L === 0 ? 'Ngày 18 nước rong, đá chìm hết. Bóc tờ lịch ở bến xem ngày khác.' : 'Nước ròng rồi. Nhảy từ hòn đá này sang hòn đá kia.';
  if(P.x < 36){
    if(sheetT2.L === 0) return 'Hăm Ba nước kém, sông cạn trơ bùn. Bóc lịch cho tới ngày nước rong.';
    if(!rongGone){
      if(caRo.freed) return 'Cá rô đang rỉa rong. Chờ một chút.';
      if(boat.on && P.on === boat.plat) return 'Rong quấn kín giữa sông. Quay lại bờ, vớt con cá rô xám trước.';
      if(heldIs('vot')) return 'Đứng sát mép nước rồi đứng yên. Cá sợ tiếng chân, đứng yên thì nó tò mò bơi lại. Tới gần thì bấm E.';
      return held.on ? 'Bấm Q cho tới khi gấp thành vợt.' : 'Lấy tờ lịch trên tường, gấp cái vợt.';
    }
    return boatHint(chB, 'Bước lên thuyền, đi sang phải là thuyền trôi theo.');
  }
  if(P.x < 41 && P.y > 1.4 && P.y < 2 && school !== 'away' && !LO.done){
    if(school === 'in') return 'Cá linh theo nước rong vào, theo nước ròng ra. Muốn cá lọt lờ thì cho nước ròng: bấm R dán lại ngày cũ.';
    if(school === 'trap') return 'Cá lọt lờ rồi! Đứng sát mép bến, bấm E kéo dây lờ lên.';
  }
  if(P.x < 54 && P.y < 3.5) return sheetT3.L === 0 ? 'Đứng trên bậc đá, bóc tờ lịch cho nước lên.' : boatHint(chC, 'Nước lớn nâng thuyền lên cao. Đi thuyền tới dưới hiên rồi nhảy lên.');
  if(P.x < 82){
    if(!chinAwake) return 'Nhảy xuống đò, bóc tờ lịch trên mui.';
    if(!doFloat) return 'Leo lên bến, bóc tờ lịch trên tường cho nước lớn.';
    return 'Bước lên đò, chú Chín chở qua.';
  }
  if(P.x < 108){
    if(P.x < 92) return chE.want === chE.lo ? 'Nhảy qua đá ra cồn cát.' : 'Nước lớn, đá chìm. Ra cồn cát bấm R dán lại ngày cũ.';
    if(P.x < 100) return chE.want === chE.hi ? 'Lục bình nổi rồi, nhảy qua.' : 'Bóc tờ lịch trên cột cho nước lên, lục bình nổi.';
    return chE.want === chE.lo ? 'Đá lộ rồi, nhảy qua.' : 'Cồn này cũng có lịch. Ngày nào nước ròng?';
  }
  if(P.x < 134) return chF.want === chF.hi ? (P.y > 3 ? 'Trên cầu không có mái, đi lâu sẽ ướt nhũn.' : 'Dưới gầm cầu khô ráo. Nước ròng thì có bờ kè. Bóc tờ lịch ở chân cầu.') : 'Xuống bờ kè dưới gầm cầu mà đi.';
  if(P.x < 154) return gateOpen ? 'Đi qua lối gỗ.' : held.on ? (held.form === 'maybay' ? 'Đứng dưới mái quán, quay sang phải, bấm E phóng vào bánh xe đỏ.' : 'Bấm Q cho tới khi gấp thành máy bay.') : 'Lấy tờ lịch dưới mái quán, gấp máy bay.';
  if(P.x < 170 && !pierClear) return heldIs('quat') ? 'Quay mặt về phía Lũ Bụi, bấm E để quạt.' : held.on ? 'Bấm Q cho tới khi gấp thành quạt.' : 'Lấy tờ lịch trên vách chòi, gấp quạt.';
  if(!sheetS.done){
    if(sheetT9.L < 2) return 'Tờ lịch xám dán cao trên cột mốc. Ngày nào nước lớn nhất tháng?';
    return boatHint(chI, 'Đi thuyền sát cột mốc, nắm mép tờ lịch, đi lùi để bóc.');
  }
  return '';
};
LV.winText = ()=>({
  h:'Nước về đúng ngày!',
  p:'Trăng Rằm lên trên sông. Đò chú Chín lại đưa khách qua bến.',
  memory:(fliesGot === 5
    ? '<b>Ký ức mở khoá.</b> Mùa lụt năm 1992, chú Chín chèo đò chở cả xóm qua sông, mấy chục chuyến một đêm. Bà Năm nặn tặng chú con cóc nhỏ: “Cóc kêu thì trời mưa, chú chở thì xóm yên.”'
    : 'Còn ' + (5 - fliesGot) + ' con đom đóm ở Màn 5 chưa tìm thấy.')
    + (LO.done ? '<br><b>Cá linh mùa nước đã về sông.</b>' : '<br>Dưới bến nhà sàn có cái lờ tre, cá linh về theo con nước.')
    + (relicGot ? '<br><b>Tìm được con cóc nhỏ của chú Chín.</b>' : '<br>Có một con tò he cũ giấu trên cột buộc đò.'),
  next:'Màn 6 · Gánh hàng rong: sáng mai, hẻm sau chợ'
});

// ================= intro: the river after the rain =================
LV.intro = {end:12, sheetsAt:9,
  caps:[[0.5, 4.0, 'Mưa tạnh rồi, mà nước sông cứ lên mãi.'],
        [4.3, 8.0, 'Những tờ lịch bay xuống sông. Giờ con nước chạy theo ngày trên tờ lịch.'],
        [8.3, 11.6, 'Rằm, mồng Một thì nước rong. Mồng Tám, Hăm Ba thì nước kém.']],
  run(it, dt, t){
    for(const z of ROOMS.concat(['chin','sky'])) setZone(z, 0);
    const camX = it < 4 ? 40 - it*4 : it < 8 ? 180 - (it - 4)*4 : Math.max(-2, 12 - (it - 8)*4);
    const camY = it >= 4 && it < 8 ? 4 : 2.0;
    camLook.lerp(tmpV.set(camX, camY, -1), Math.min(1, dt*2));
    camPos.lerp(tmpV.set(camX - 2.5, camY + 2.6, it >= 4 && it < 8 ? 24 : 17), Math.min(1, dt*2));
    camera.position.copy(camPos); camera.lookAt(camLook);
    sun.position.set(camLook.x - 8, 18, 12); sun.target.position.set(camLook.x, 0, 0);
    toInner.rotation.y = .9;
  },
  done(){
    learned.push('thuyen', 'maybay', 'quat', 'non');
    say('Nước lên ngập cả bến…', 2.4);
    objective('Bóc tờ lịch ở bến xem ngày nào nước ròng');
  }};
startGame();
