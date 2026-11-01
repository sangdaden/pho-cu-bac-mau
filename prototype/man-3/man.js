// ================= Màn 3 · Tháp đồng hồ: night of the 14th, the dark street to the clock tower, up inside it to the stopped clock =================
// rooms (x): 1 phố đèn tắt -8..14 · 2 đèn kéo quân 14..30 · 3 quạt giấy 30..46 · 4 tiệm sửa quạt 46..60 · 5 bánh răng thiếu 60..76
//            6 ba ô cửa 76..96 (tầng 4.6) · 7 leo tháp 96..113 · 8 mặt đồng hồ 113..124 (tầng 14.8) · 9 vặn cót 124..134
// then the ending at bà Năm's stall, back at the left end of the street
LV.level = 3;
LV.start = {x:1.5, y:0};
LV.bounds = [-7.5, 133.6];
LV.cam = [0, 128];
LV.dark = true;
LV.sky = ['r1','r2','r3','r4','r5','r6','r7','r8','r9','r9'];
const ROOMS = ['r1','r2','r3','r4','r5','r6','r7','r8','r9'];
function zoneFor(x){ return x < 14 ? 'r1' : x < 30 ? 'r2' : x < 46 ? 'r3' : x < 60 ? 'r4' : x < 76 ? 'r5' : x < 96 ? 'r6' : x < 113 ? 'r7' : x < 124 ? 'r8' : 'r9'; }
// a moonlit night: deep blue above, violet at the horizon; grey is a flat dull slate
SKY.c.top.set('#1B2550'); SKY.c.mid.set('#3A4C8E'); SKY.c.bot.set('#8A78B8');
SKY.g.top.set('#5E5F66'); SKY.g.mid.set('#77777C'); SKY.g.bot.set('#8C8A8C');
LIGHT.fog.set('#4A4C86'); LIGHT.sun.set('#B8C4FF'); LIGHT.sunK = [.16, .42]; LIGHT.hemiK = [.15, .5]; LIGHT.fillK = [.05, .16];
NIGHT.top.set('#0F1530'); NIGHT.mid.set('#25356E'); NIGHT.bot.set('#4E4E8E'); NIGHT.fog.set('#2E3466');
NIGHT.k = .9;
toLight.distance = 7.5; toLight.decay = 2;
// inside the tower the camera rises with the floors so the clock face stays in view
LV.camY = (x, y)=> y < 4.5 ? 2.8 + Math.max(0, y - 1)*.55 : 4.8 + (y - 4.6)*.95 + (x > 112.5 && y > 13 ? 2.2 : 0);
TEX.tin = canvasTex(128, 64, (x,w,h)=>{
  x.fillStyle = '#F2F2F2'; x.fillRect(0,0,w,h);
  for(let i=0;i<16;i++){ const g = x.createLinearGradient(i*8,0,i*8+8,0); g.addColorStop(0,'rgba(0,0,0,.16)'); g.addColorStop(.5,'rgba(255,255,255,.12)'); g.addColorStop(1,'rgba(0,0,0,.16)'); x.fillStyle = g; x.fillRect(i*8,0,8,h); }
  speckle(x, w, h, 400, .06);
});
TEX.brick = canvasTex(128, 128, (x,w,h)=>{
  x.fillStyle = '#9A9A9A'; x.fillRect(0,0,w,h);
  for(let r=0;r<8;r++) for(let c=-1;c<5;c++){ const v = 200 + Math.floor(trnd()*45); x.fillStyle = `rgb(${v},${v},${v})`; x.fillRect(c*32 + (r%2)*16 + 1, r*16 + 1, 30, 14); }
  speckle(x, w, h, 700, .08);
});

// warm window light that comes on with its room's colour
const winGlow = [];
function litWin(x, y, w, h, z, zone){
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({color:'#FFC872', transparent:true, opacity:0, depthWrite:false}));
  m.position.set(x, y, z); scene.add(m); winGlow.push({m, z:zone});
}

// ================= ground: the street, then the tower's floors =================
for(let a = -14; a < 60; a += 12){ const b = Math.min(60, a + 12); ZONE = zoneFor(a + .1);
  box(W, a, b, -2, 0, -6, 3, '#D9D0C4', {outline:false, uv:[3.2, 3.2], map:TEX.pave});
  box(W, a, b, -.02, .06, 2.6, 2.9, '#B8A58E', {outline:false});
  box(W, a, b, -1.2, -.28, 3, 14, '#A9A097', {outline:false, uv:[4,4], map:TEX.road});
  box(W, a, b, -.28, 0, 2.95, 3.15, '#C2B6A8', {outline:false, uv:[2,1], map:TEX.stone}); }
for(let x = -12; x < 58; x += 4){ ZONE = zoneFor(x); box(W, x, x+2, -.27, -.26, 7.4, 7.6, '#E9E2D6', {outline:false, shadow:false}); }
plat(-14, 60, 0, false, null, {safe:true});
function house(x0, x1, h, c, o){
  o = o || {}; ZONE = zoneFor((x0 + x1)/2);
  box(W, x0, x1, -1, h, -4.2, -.5, c, Object.assign({}, WALL, {uv:[6, h + 1, 0, -1]}));
  box(W, x0 - .05, x1 + .05, h, h + .25, -4.4, -.3, '#C98B4A', {ow:.04});
  for(const x of [x0, x1]) box(W, x - .2, x + .2, 0, h, -.5, -.32, '#F4F1EA', {ow:.025});
  if(o.roof) roof(W, x0 - .3, x1 + .3, h + .25, -.15, 3.4, 1.5, o.roof);
}

// ================= room 1 · Phố đèn tắt: bà Năm's stall at the left, the dark street, a locked gate =================
house(-8, 2.2, 8.3, '#E8A598', {roof:'#B5513A'});
house(2.2, 8.4, 9.6, '#F1DDB0');
house(8.4, 14, 7.8, '#9FCBC1', {roof:'#B5513A'});
ZONE = 'r1';
// bà Năm's stall, the same one as at the start of the game
box(W, -6.6, 1.2, 0, 3.2, -.5, -.47, '#4A3A30', {outline:false});
for(const y of [1.1, 2.1]) box(W, -6, .6, y, y+.08, -.47, -.2, '#A27650', {outline:false});
for(let i=0;i<14;i++){ const y = i<7 ? 1.18 : 2.18, x = -5.7 + (i%7)*.9; mesh(W, new THREE.CylinderGeometry(.16,.18,.36,10), ['#E8442E','#F2C230','#2E9C93','#E9E2D6','#4C7FB8'][i%5], {pos:new THREE.Vector3(x, y+.18, -.33), ow:.02}); }
box(W, -6.8, 1.4, 3.25, 3.5, -.5, -.1, '#7A4E2D', {ow:.025});
sign(W, -5.0, .2, 3.6, 4.55, -.5, '#C23A28', '#F2C230', 'TÒ HE', 'bà Năm · số 14');
(function(){
  const x = -4.6, z = .5;
  rod(W, new THREE.Vector3(x, 0, z), new THREE.Vector3(x, 1.5, z), .06, '#C99A52');
  mesh(W, new THREE.CylinderGeometry(.3,.24,.65,12), '#D9B26A', {pos:new THREE.Vector3(x, 1.65, z)});
  for(let i=0;i<9;i++){ const a = i/9*Math.PI*2, tip = new THREE.Vector3(x + Math.cos(a)*.6, 2.1 + (i%3)*.2, z + Math.sin(a)*.45);
    rod(W, new THREE.Vector3(x, 1.65, z), tip, .015, '#C99A52', {outline:false});
    leaf(W, tip, [.12,.1,.15], ['#C23A28','#E8A41A','#2E9C93','#E8442E','#7DBB4B'][i%5], {ow:.02}); }
})();
win(W, -4.2, 4.95, 1.5, 2.2, -.5, '#F4F1EA', '#2E8C86', {ledge:false, grille:false}); litWin(-4.2, 6.05, 1.5, 2.2, -.43, 'r1');
win(W, -.4, 4.95, 1.5, 2.2, -.5, '#F4F1EA', '#2E8C86', {ledge:false, grille:false}); litWin(-.4, 6.05, 1.5, 2.2, -.43, 'r1');
balcony(W, -6.8, 1.6, 4.95, -.5, 1.15, '#E9DCC8', '#2E8C86');
hoaGiay(W, .2, 2.0, 8.3, -.2, 3.2);
sign(W, -7.8, -2.4, 9.0, 9.9, 1.0, '#C23A28', '#F2C230', 'Vui Tết Trung thu');
win(W, 4.0, 5.4, 1.4, 1.8, -.5, '#F4F1EA', '#C23A28', {flower:'#F2C230'}); litWin(4.0, 6.3, 1.4, 1.8, -.43, 'r1');
win(W, 6.8, 5.4, 1.4, 1.8, -.5, '#F4F1EA', '#C23A28'); litWin(6.8, 6.3, 1.4, 1.8, -.43, 'r1');
balcony(W, 3, 8, 5.2, -.5, .9, '#E9DCC8', '#2A2630');
box(W, 3.2, 7.8, 0, 3.0, -.5, -.47, '#3B4152', {outline:false});
for(let i=0;i<7;i++) box(W, 3.3, 7.7, .2+i*.4, .26+i*.4, -.47, -.44, '#6E655C', {outline:false});
sign(W, 3.3, 7.7, 3.1, 3.8, -.5, '#2F6FB5', '#F4F1EA', 'ĐÈN LỒNG');
for(let i=0;i<5;i++) lantern(3.8 + i*1.0, 4.5, -.1, LANT[i], i%2 ? 'sao' : 'tron');
// the lane gate: two wooden leaves across the alley, a lock box on the wall beside them where sheet C sits
win(W, 10.6, 4.8, 1.5, 1.8, -.5, '#F4F1EA', '#4E9A4A'); litWin(10.6, 5.7, 1.5, 1.8, -.43, 'r1');
box(W, 9.6, 12.6, 0, 3.0, -.5, -.42, '#4A3A30', {outline:false});
box(W, 12.5, 13.3, 0, 5.4, -.6, -.2, '#7A4E2D', {ow:.03});
box(W, 12.5, 13.3, 5.4, 5.8, -.6, 2.9, '#7A4E2D', {ow:.03});
box(W, 12.5, 13.3, 0, 5.4, 2.6, 2.95, '#7A4E2D', {ow:.03});
const gate = new THREE.Group(); gate.position.set(12.9, 0, -.2); scene.add(gate);
ZONE = 'r1';
for(let i=0;i<5;i++) box(gate, -.12, .12, .1, 5.2, .05 + i*.56, .5 + i*.56, '#A27650', {ow:.02, uv:[.6,.6], map:TEX.wood});
box(gate, -.16, .16, 1.4, 1.6, 0, 2.8, '#5E4630', {outline:false}); box(gate, -.16, .16, 3.8, 4.0, 0, 2.8, '#5E4630', {outline:false});
let gateOpen = 0;
const gateBlock = block(12.6, 13.2, -1, 7, ()=>gateOpen < .5);
crate(5.4, 1.4, .9, '#E9C46A', 0); crate(6.6, 1.3, .8, '#9FCBC1', .62);
block(4.85, 7.15, -1, 1.2);

// ================= room 2 · Đèn kéo quân: a revolving lantern throws the shadows of its horses on a high wall =================
house(14, 22, 8.6, '#D9A07A', {roof:'#B5513A'});
house(22, 30, 9.4, '#C7B8E0');
ZONE = 'r2';
win(W, 16.2, 5.0, 1.4, 1.8, -.5, '#F4F1EA', '#2E8C86', {flower:'#F06BAE'}); litWin(16.2, 5.9, 1.4, 1.8, -.43, 'r2');
// the wall to climb: a courtyard wall with a tiled coping
box(W, 26.4, 30, -1, 4.6, -.5, 2.9, '#E9DCC8', Object.assign({}, WALL, {uv:[6, 9]}));
box(W, 26.3, 30.1, 4.6, 4.85, -.6, 3.0, '#B5513A', {ow:.03, uv:[2,2], map:TEX.tile});
block(26.4, 30, -1, 4.6);
win(W, 24.4, 6.4, 1.5, 1.8, -.5, '#F4F1EA', '#8E6CC0'); litWin(24.4, 7.3, 1.5, 1.8, -.43, 'r2');
hoaGiay(W, 28.4, 29.8, 9.4, -.2, 2.4);
// the lantern on its stand
const kq = new THREE.Group(); kq.position.set(16.4, 0, .6); scene.add(kq);
rod(kq, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1.0, 0), .07, '#5E4630');
mesh(kq, new THREE.CylinderGeometry(.5, .6, .12, 16), '#5E4630', {pos:new THREE.Vector3(0, .06, 0)});
const drum = new THREE.Group(); drum.position.y = 1.9; kq.add(drum);
mesh(drum, new THREE.CylinderGeometry(.85, .85, 1.6, 6, 1, true), '#E8442E', {ow:.035}).material.side = THREE.DoubleSide;
for(const y of [-.8, .8]) mesh(drum, new THREE.CylinderGeometry(.9, .9, .1, 6), '#C99A52', {pos:new THREE.Vector3(0, y, 0), ow:.02});
for(let i=0;i<6;i++){ const a = i/6*Math.PI*2; blob(drum, new THREE.Vector3(Math.cos(a)*.9, 0, Math.sin(a)*.9), [.18, .26, .1], '#F2C230', {ow:.02, rot:[0, -a, 0]}); }
mesh(kq, new THREE.ConeGeometry(.95, .5, 6), '#C23A28', {pos:new THREE.Vector3(0, 2.95, 0), ow:.03});
const kqGlow = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshBasicMaterial({map:dotTex, color:'#FFB74A', transparent:true, opacity:0, depthWrite:false, blending:THREE.AdditiveBlending}));
kqGlow.position.set(16.4, 1.9, 1.2); scene.add(kqGlow);
const kqLight = new THREE.PointLight('#FFB060', 0, 14, 1.2); kqLight.position.set(16.4, 2.2, 1.6); scene.add(kqLight);
// horse shadows on the wall; each has a step on its back that turns solid when the lantern stops
const horseTex = canvasTex(128, 128, (x,w,h)=>{
  x.clearRect(0,0,w,h); x.fillStyle = '#FFFFFF';
  x.beginPath(); x.ellipse(64, 70, 38, 18, 0, 0, Math.PI*2); x.fill();
  x.beginPath(); x.moveTo(92, 62); x.lineTo(112, 30); x.lineTo(122, 34); x.lineTo(104, 70); x.fill();
  x.beginPath(); x.ellipse(116, 30, 12, 7, -.4, 0, Math.PI*2); x.fill();
  for(const [a, b] of [[36, 96], [50, 100], [78, 98], [90, 94]]){ x.fillRect(a, 80, 7, b - 70); }
  x.beginPath(); x.moveTo(28, 64); x.quadraticCurveTo(8, 70, 12, 96); x.lineTo(20, 94); x.quadraticCurveTo(18, 76, 32, 72); x.fill();
  x.fillRect(30, 38, 70, 12);
});
const H_STEP = [1.3, 2.6, 3.9];
const steps = [19.6, 22.0, 24.4].map((x, i)=>{
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), new THREE.MeshBasicMaterial({map:horseTex, color:'#141019', transparent:true, opacity:0, depthWrite:false}));
  m.position.set(x + .7, 0, -.44); scene.add(m);
  const slab = new THREE.Mesh(new THREE.BoxGeometry(1.7, .22, 1.2), new THREE.MeshBasicMaterial({color:'#2A2440', transparent:true, opacity:0}));
  slab.position.set(x + .8, 0, .1); scene.add(slab);
  const p = plat(x, x + 1.6, 0, true, ()=>kqOn && !kqSpin);
  return {x, m, slab, p, y:H_STEP[i]};
});
let kqOn = false, kqSpin = false, kqPhase = 1, kqT = 0, kqSolved = false;

// ================= room 3 · Quạt giấy: the square at the foot of the tower, Lũ Bụi crowding the way to chú Tư's shop =================
house(30, 38, 8.0, '#F1E0C5', {roof:'#B5513A'});
house(38, 46, 8.8, '#E9C46A');
ZONE = 'r3';
win(W, 34.6, 5.0, 1.5, 1.9, -.5, '#F4F1EA', '#2F6FB5', {flower:'#F2C230'}); litWin(34.6, 5.95, 1.5, 1.9, -.43, 'r3');
balcony(W, 33.4, 37.6, 2.4, -.5, 1.0, '#E9DCC8', '#2E8C86', {pots:false});
plat(33.4, 37.6, 2.4, true);
win(W, 41.8, 4.6, 1.5, 1.9, -.5, '#F4F1EA', '#C23A28'); litWin(41.8, 5.55, 1.5, 1.9, -.43, 'r3');
box(W, 39.6, 44.6, 0, 2.9, -.5, -.47, '#3B4152', {outline:false});
sign(W, 39.6, 44.6, 3.0, 3.8, -.5, '#E9C46A', '#3B2E2A', 'NƯỚC MÍA');
plant(W, 45.2, 0, -.1, .8, 'chuoi'); plant(W, 38.6, 0, -.2, .7, 'hoa');
stool(43, 1.4, '#D8382A', -.02); stool(44.2, 1.1, '#2F6FB5', -.02);

// ================= room 4 · Tiệm sửa quạt: chú Tư asleep among fans, three breakers on the wall =================
ZONE = 'r4';
// the tower's base: brick walls rising out of view, the shop is cut into its foot
box(W, 46, 60, -1, 9.6, -4.2, -.5, '#D9A07A', {ow:.05, uv:[3, 3], map:TEX.brick});
box(W, 45.8, 60.2, 9.6, 10.0, -4.4, -.2, '#B5513A', {ow:.04});
box(W, 46.6, 59.2, 0, 3.6, -.5, -.47, '#3A2F2A', {outline:false});
box(W, 46.4, 59.4, 3.6, 3.85, -.5, .9, '#7A4E2D', {ow:.025});
sign(W, 48.6, 54.6, 4.2, 5.2, -.5, '#2F6FB5', '#F4F1EA', 'SỬA QUẠT', 'chú Tư');
win(W, 57.0, 5.8, 1.4, 1.8, -.5, '#F4F1EA', '#2E8C86'); litWin(57.0, 6.7, 1.4, 1.8, -.43, 'r4');
// shelves of fans at the back
for(const y of [1.3, 2.5]) box(W, 46.8, 49.6, y, y + .08, -.47, -.1, '#A27650', {outline:false});
for(let i=0;i<6;i++){ const x = 47.2 + (i%3)*.9, y = i < 3 ? 1.38 : 2.58;
  mesh(W, new THREE.TorusGeometry(.32, .03, 6, 18), ['#4A7BC8','#E8442E','#2E8C86'][i%3], {pos:new THREE.Vector3(x, y + .4, -.25), outline:false});
  blob(W, new THREE.Vector3(x, y + .4, -.28), [.1, .06, .1], '#3D6CB8', {small:true}); }
// the work bench and the stool chú Tư dozes on
box(W, 50.2, 52.6, .9, 1.0, -.3, .4, '#A27650', {ow:.02, uv:[.6,.6], map:TEX.wood});
for(const x of [50.3, 52.5]) box(W, x - .05, x + .05, 0, .9, -.2, .3, '#7A4E2D', {outline:false});
// the breaker panel
box(W, 53.0, 57.8, .6, 2.5, -.47, -.4, '#6E655C', {ow:.02});
for(const x of [53.8, 55.4, 57.0]){ box(W, x - .45, x + .45, .9, 2.0, -.4, -.3, '#9FAFA8', {ow:.02}); }
// the ceiling fan
const cfan = new THREE.Group(); cfan.position.set(53, 3.5, .3); scene.add(cfan);
rod(cfan, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, .35, 0), .04, '#3B4152', {outline:false});
blob(cfan, new THREE.Vector3(0, 0, 0), [.22, .22, .14], '#3B4152', {ow:.02});
const cblades = new THREE.Group(); cfan.add(cblades);
for(let i=0;i<3;i++){ const g = new THREE.Group(); g.rotation.y = i/3*Math.PI*2; cblades.add(g); mesh(g, new THREE.BoxGeometry(1.4, .04, .32), '#9DC3F0', {pos:new THREE.Vector3(.8, 0, 0), ow:.015}); }
// the door into the tower: a heavy plank door at the right of the shop
box(W, 59.2, 60, 0, 4.2, -.5, 2.6, '#5E4630', {ow:.03});
const tdoor = new THREE.Group(); tdoor.position.set(59.6, 0, 1.0); scene.add(tdoor);
box(tdoor, -.18, .18, 0, 3.6, -1.4, 1.4, '#A27650', {ow:.03, uv:[.6,.6], map:TEX.wood});
let tdoorUp = 0;
block(59.3, 59.9, -1, 7, ()=>tdoorUp < .5);

// ================= the tower: one cutaway of brick walls and wooden floors, with the clock behind its face at the top =================
ZONE = 'r5';
for(const [x0, x1] of [[60, 76], [76, 96], [96, 113], [113, 124], [124, 134.5]]){
  ZONE = zoneFor(x0 + .1);
  box(W, x0, x1, -1, 26, -4.2, -1.2, '#B9805E', {ow:.05, uv:[3, 3], map:TEX.brick});
}
ZONE = 'r5';
box(W, 59.8, 60.2, -1, 26, -4.4, -.6, '#8C5A3E', {ow:.04});
box(W, 134.4, 136, -1, 26, -4.4, 3, '#8C5A3E', {ow:.04});
// solid masonry under the raised floors, and the tower's footing below the street
function masonry(x0, x1, y1){ ZONE = zoneFor((x0 + x1)/2); box(W, x0, x1, -12, y1, -1.2, 2.8, '#9C6A4E', {ow:.04, uv:[3, 3], map:TEX.brick}); }
masonry(60, 74.6, -1); masonry(74.6, 96, 4.1); masonry(96, 113, 4.1); masonry(113.4, 134.4, 14.3);
// floors seen in section: thick slabs with beams
function floorSlab(x0, x1, y){ ZONE = zoneFor((x0 + x1)/2);
  box(W, x0, x1, y - .5, y, -1.2, 2.8, '#A27650', {ow:.04, uv:[1.2, 1.2], map:TEX.wood});
  for(let x = x0 + .6; x < x1 - .2; x += 2.4) box(W, x, x + .3, y - .9, y - .5, -1.2, 2.6, '#7A4E2D', {ow:.02}); }
box(W, 60, 76, -1, 0, -1.2, 2.9, '#8E857B', {outline:false, uv:[2,1], map:TEX.stone});
plat(60, 72, 0, false, null, {safe:true});
// room 5 · Bánh răng: the gear train on the wall, the hoist on the right, the crank chú Tư turns
ZONE = 'r5';
win(W, 63.4, 6.0, 1.3, 2.4, -1.2, '#E9DCC8', '#5E4630', {ledge:false, grille:false});
function gearGeo(r, teeth){
  const sh = new THREE.Shape(), n = teeth*2;
  for(let i=0;i<=n;i++){ const a = i/n*Math.PI*2, rr = i%2 ? r : r*.82; i ? sh.lineTo(Math.cos(a)*rr, Math.sin(a)*rr) : sh.moveTo(Math.cos(a)*rr, Math.sin(a)*rr); }
  const hole = new THREE.Path(); hole.absarc(0, 0, r*.22, 0, Math.PI*2, true); sh.holes.push(hole);
  return new THREE.ExtrudeGeometry(sh, {depth:.25, bevelEnabled:false});
}
const gears = [];
function gear(x, y, r, teeth, c, sp){ const g = new THREE.Group(); g.position.set(x, y, -1.05); scene.add(g); const m = mesh(g, gearGeo(r, teeth), c, {ow:.03}); g.userData.sp = sp; gears.push(g); return g; }
gear(63.0, 3.3, 1.5, 12, '#B87333', 1);
gear(65.8, 4.9, 1.0, 8, '#C99A52', -1.5);
const gMid = gear(67.85, 3.5, 1.05, 8, '#B87333', 1.43);
gMid.visible = false;
// the chipped gear (shown on 1999 and when no gear is in place) and the whole one (1985)
const gBroken = new THREE.Group(); gBroken.position.set(67.85, 3.5, -1.05); scene.add(gBroken);
(function(){ const sh = new THREE.Shape(); for(let i=0;i<=10;i++){ const a = -.6 + i/10*4.3, rr = i%2 ? 1.05 : .86; i ? sh.lineTo(Math.cos(a)*rr, Math.sin(a)*rr) : sh.moveTo(Math.cos(a)*rr, Math.sin(a)*rr); } sh.lineTo(0, 0); sh.closePath();
  mesh(gBroken, new THREE.ExtrudeGeometry(sh, {depth:.25, bevelEnabled:false}), '#8E7A66', {ow:.03}); })();
gear(70.2, 5.0, 1.3, 10, '#C99A52', -1.15);
for(const [x, y] of [[63.0, 3.3], [65.8, 4.9], [67.85, 3.5], [70.2, 5.0]]) mesh(W, new THREE.CylinderGeometry(.14, .14, .5, 10), '#3B4152', {pos:new THREE.Vector3(x, y, -1.0), rot:[Math.PI/2, 0, 0], outline:false});
// the drawer under the gears: a shelf slides out when the machine runs, with chú Tư's old dragon in it
const drawer = new THREE.Group(); drawer.position.set(69.6, 2.95, -1.0); scene.add(drawer);
box(drawer, -1.0, 1.0, -.15, 0, -.2, .9, '#7A4E2D', {ow:.025, uv:[.6,.6], map:TEX.wood});
box(drawer, -1.0, 1.0, -.15, .35, .8, .9, '#A27650', {ow:.02});
let drawerOut = 0;
const shelf = plat(68.6, 70.6, 3.0, true, ()=>drawerOut > .9);
const dragon = new THREE.Group(); dragon.position.set(69.6, 3.0, .1); scene.add(dragon);
(function(g){
  rod(g, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, .5, 0), .02, '#C99A52', {outline:false});
  for(let i=0;i<5;i++) blob(g, new THREE.Vector3(-.3 + i*.14, .62 + Math.sin(i*1.4)*.08, 0), .09 - i*.006, i%2 ? '#2E9C93' : '#4E9A4A', {ow:.015});
  blob(g, new THREE.Vector3(.36, .72, 0), [.14, .11, .11], '#4E9A4A', {ow:.02});
  mesh(g, new THREE.ConeGeometry(.04, .14, 5), '#F2C230', {pos:new THREE.Vector3(.36, .86, 0), outline:false});
  for(const s of [-1, 1]) blob(g, new THREE.Vector3(.44, .76, s*.06), .025, '#141019', {small:true});
  blob(g, new THREE.Vector3(-.4, .66, 0), [.08, .05, .04], '#E8442E', {ow:.012});
})(dragon);
dragon.visible = false;
relic(dragon, 69.6, 3.0, 'Con rồng nhỏ của chú Tư');
// the hoist: a wooden cage on a rope that climbs to the next floor while the gears turn
const hoist = new THREE.Group(); hoist.position.set(73.3, 0, .3); scene.add(hoist);
box(hoist, -1.3, 1.3, -.12, 0, -.9, 1.6, '#A27650', {ow:.03, uv:[.6,.6], map:TEX.wood});
for(const x of [-1.25, 1.25]) for(const z of [-.85, 1.55]) rod(hoist, new THREE.Vector3(x, 0, z), new THREE.Vector3(x, 1.1, z), .04, '#7A4E2D', {outline:false});
box(hoist, -1.3, 1.3, 1.05, 1.12, 1.5, 1.6, '#7A4E2D', {outline:false});
const hoistRope = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 1, 6), WIRE_M); scene.add(hoistRope);
let hoistY = 0, machine = false;
const hoistP = plat(72.0, 74.6, 0, true);
box(W, 71.6, 75.0, 25.4, 25.8, -1.2, .8, '#5E4630', {ow:.02});
// a pendulum swinging behind the hoist shaft
const pend = new THREE.Group(); pend.position.set(66.2, 12.6, -1.15); scene.add(pend);
rod(pend, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -6.2, 0), .05, '#C99A52', {outline:false});
mesh(pend, new THREE.CylinderGeometry(.62, .62, .12, 20), '#C99A52', {pos:new THREE.Vector3(0, -6.6, 0), rot:[Math.PI/2, 0, 0], ow:.03});

// ================= room 6 · Ba ô cửa: three heavy doors; the right day on each stack brings someone to hold it =================
block(74.6, 96, -1, 4.6);
floorSlab(74.6, 96, 4.6);
plat(74.6, 96, 4.6, false, null, {safe:true});
ZONE = 'r6';
const doors = [81.2, 86.7, 92.2].map(x=>{
  box(W, x - .5, x + .5, 4.6, 9.6, -1.2, -1.0, '#5E4630', {ow:.025});
  box(W, x - .3, x + .3, 9.0, 9.6, -1.2, 2.6, '#5E4630', {ow:.03});
  const g = new THREE.Group(); g.position.set(x, 4.6, .6); scene.add(g);
  box(g, -.22, .22, 0, 4.4, -1.6, 1.9, '#7A4E2D', {ow:.03, uv:[.6,.6], map:TEX.wood});
  for(const y of [.8, 2.2, 3.6]) box(g, -.26, .26, y, y + .18, -1.6, 1.9, '#3B4152', {outline:false});
  mesh(g, new THREE.TorusGeometry(.18, .04, 6, 14), '#C99A52', {pos:new THREE.Vector3(-.26, 2.0, .2), rot:[0, Math.PI/2, 0], outline:false});
  const d = {x, g, up:0, open:false};
  d.b = block(x - .25, x + .25, 4.6, 12, ()=>d.up < .6);
  return d;
});
// a crossbeam with a crate under it: a firefly waits up high
box(W, 74.8, 79.0, 10.2, 10.5, -1.2, 1.6, '#5E4630', {ow:.025});
crate(76.1, .2, 1.4, '#C99A52', 4.6); block(75.3, 76.9, 4.6, 5.6);
win(W, 78.0, 9.6, 1.2, 1.8, -1.2, '#E9DCC8', '#5E4630', {ledge:false, grille:false});
win(W, 94.4, 9.6, 1.2, 1.8, -1.2, '#E9DCC8', '#5E4630', {ledge:false, grille:false});
for(const x of [78.0, 94.4]) litWin(x, 10.5, 1.2, 1.8, -1.1, 'r6');

// ================= room 7 · Leo tháp: a half-peeled ledge, a gust through a hole, a pulley hit with a plane, the right day for the stairs =================
floorSlab(96, 113, 4.6);
block(96, 113, -1, 4.6);
plat(96, 113, 4.6, false, null, {safe:true});
ZONE = 'r7';
// the winding stair, broken: a few treads stuck to the wall going nowhere
for(let i=0;i<6;i++) box(W, 97 + i*2.6, 98.2 + i*2.6, 6.2 + i*1.3, 6.4 + i*1.3, -1.2, -.6, '#7A4E2D', {ow:.02});
// the corridor high up and the hole the wind comes through
floorSlab(99.6, 108, 8.4);
plat(99.6, 108, 8.4, true, null, {safe:true});
box(W, 102.1, 103.3, 8.7, 9.9, -1.21, -1.15, '#1A1A2A', {outline:false});
const windSlot = slot({x0:102.1, x1:103.3, y0:8.7, y1:9.9, z:-1.12, onPaste:()=>pastedWind()});
const gust = wind(102, 108.4, 8.3, 11.5, -8.5, ()=>!windSlot.filled);
const streaks = []; for(let i=0;i<14;i++){ const m = new THREE.Mesh(new THREE.PlaneGeometry(.9, .04), new THREE.MeshBasicMaterial({color:'#E6EEFF', transparent:true, opacity:.6, depthWrite:false})); scene.add(m); streaks.push({m, ph:Math.random(), y:8.8 + Math.random()*2.4}); }
// the pulley and its basket
ZONE = 'r7';
const pulley = new THREE.Group(); pulley.position.set(111.4, 10.3, .2); scene.add(pulley);
mesh(pulley, new THREE.TorusGeometry(.42, .1, 8, 18), '#C99A52', {ow:.025});
for(let i=0;i<4;i++) rod(pulley, new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(i*Math.PI/2)*.4, Math.sin(i*Math.PI/2)*.4, 0), .03, '#7A4E2D', {outline:false});
box(W, 111.2, 111.6, 10.6, 16.0, -1.2, -.9, '#5E4630', {ow:.02});
const basket = new THREE.Group(); scene.add(basket);
box(basket, -1.0, 1.0, -.12, 0, -.7, 1.3, '#A27650', {ow:.03, uv:[.6,.6], map:TEX.wood});
box(basket, -1.0, 1.0, 0, .55, 1.2, 1.3, '#C99A52', {ow:.02});
box(basket, -1.0, 1.0, 0, .55, -.7, -.6, '#C99A52', {outline:false});
const basketRope = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 1, 6), WIRE_M); scene.add(basketRope);
let basketY = 15.4, basketWant = 15.4, pulleyHit = false, onBasketT = 0;
const basketP = plat(108.2, 110.2, 0, true, ()=>pulleyHit);
// the ledge by the pulley and the stack whose right day lays the last steps
floorSlab(110.2, 113.4, 11.8);
plat(110.2, 113.4, 11.8, true, null, {safe:true});
const stairs = new THREE.Group(); scene.add(stairs);
for(let i=0;i<3;i++) box(stairs, 111.6 + i*.55, 113.4, 12.2 + i*.55 - .2, 12.2 + i*.55, -.6, 1.6, '#A27650', {ow:.02, uv:[.6,.6], map:TEX.wood});
stairs.visible = false;
let stairsK = 0;
const stairP = plat(111.9, 113.4, 13.3, true, ()=>stairsK > .9);

// ================= room 8 · Mặt đồng hồ, room 9 · Vặn cót: the top floor behind the clock face =================
block(113.4, 134.4, -1, 14.8);
floorSlab(113.4, 134.4, 14.8);
plat(113.4, 134.4, 14.8, false, null, {safe:true});
ZONE = 'r8';
// the face seen from inside: a big disc in the wall, numerals, the hands stopped
const FACE = {x:119, y:19.0, r:3.4};
mesh(W, new THREE.CylinderGeometry(FACE.r + .35, FACE.r + .35, .3, 40), '#C99A52', {pos:new THREE.Vector3(FACE.x, FACE.y, -1.15), rot:[Math.PI/2, 0, 0], ow:.05});
const faceTex = canvasTex(256, 256, (x,w,h)=>{
  x.fillStyle = '#F6EFD8'; x.fillRect(0,0,w,h); x.fillStyle = '#2A2230'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = 'bold 30px "Oswald", serif';
  const R = ['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'];
  for(let i=0;i<12;i++){ const a = i/12*Math.PI*2 - Math.PI/2; x.fillText(R[i], 128 + Math.cos(a)*98, 128 + Math.sin(a)*98); }
  for(let i=0;i<60;i++){ const a = i/60*Math.PI*2; x.fillRect(128 + Math.cos(a)*118 - 1, 128 + Math.sin(a)*118 - 1, i%5 ? 2 : 4, i%5 ? 2 : 4); }
});
const face = new THREE.Mesh(new THREE.CircleGeometry(FACE.r, 40), toon('#FFFFFF', false, {map:faceTex}));
face.position.set(FACE.x, FACE.y, -.98); scene.add(face);
const hands = new THREE.Group(); hands.position.set(FACE.x, FACE.y, -.9); scene.add(hands);
const hourH = new THREE.Group(), minH = new THREE.Group(); hands.add(hourH); hands.add(minH);
box(hourH, -.09, .09, -.2, 1.9, 0, .06, '#2A2230', {outline:false});
box(minH, -.06, .06, -.3, 2.9, .07, .12, '#2A2230', {outline:false});
blob(hands, new THREE.Vector3(0, 0, .14), .16, '#C99A52', {ow:.02});
hourH.rotation.z = -Math.PI*2*(4.5/12); minH.rotation.z = -Math.PI;  // stopped at half past four, giờ Thân
// the giant wall calendar beside the face: 14 now, Rằm when the clock runs again
const calTex = [0, 1].map(k=>canvasTex(160, 200, (x,w,h)=>{
  x.fillStyle = '#F4EEE2'; x.fillRect(0,0,w,h); x.fillStyle = k ? '#C23A28' : '#8E8A86'; x.fillRect(0,0,w,40);
  x.fillStyle = '#FFFFFF'; x.font = '24px "Patrick Hand", sans-serif'; x.textAlign = 'center'; x.fillText('THÁNG TÁM', w/2, 28);
  x.fillStyle = k ? '#C23A28' : '#4A453F'; x.font = 'bold 104px "Oswald", sans-serif'; x.fillText(k ? '15' : '14', w/2, 150);
  x.font = '26px "Patrick Hand", sans-serif'; x.fillText(k ? 'Rằm Trung thu' : 'âm lịch', w/2, 186);
}, true));
box(W, 124.6, 128.4, 16.0, 20.8, -1.2, -1.1, '#7A4E2D', {ow:.03});
const cal = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 4.3), toon('#FFFFFF', false, {map:calTex[0]}));
cal.position.set(126.5, 18.4, -1.04); scene.add(cal);
const calFlip = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 4.3), new THREE.MeshBasicMaterial({map:calTex[0], side:THREE.DoubleSide, transparent:true}));
calFlip.geometry.translate(0, 2.15, 0); calFlip.position.set(126.5, 16.25, -1.0); calFlip.visible = false; scene.add(calFlip);
// room 9: the winding crank, a big wheel with a handle and a ratchet
ZONE = 'r9';
const crank = new THREE.Group(); crank.position.set(130.2, 17.0, -.4); scene.add(crank);
mesh(crank, new THREE.TorusGeometry(1.5, .14, 8, 28), '#B87333', {ow:.03});
for(let i=0;i<6;i++) rod(crank, new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(i*Math.PI/3)*1.45, Math.sin(i*Math.PI/3)*1.45, 0), .07, '#B87333', {outline:false});
rod(crank, new THREE.Vector3(1.45, 0, 0), new THREE.Vector3(1.45, 0, .8), .09, '#7A4E2D');
blob(crank, new THREE.Vector3(0, 0, .1), .3, '#C99A52', {ow:.02});
box(W, 129.9, 130.5, 14.8, 17.0, -1.2, -.6, '#5E4630', {ow:.025});
rod(W, new THREE.Vector3(130.2, 17.0, -.9), new THREE.Vector3(FACE.x + 1, FACE.y - 1, -1.0), .06, '#3B4152', {outline:false});
for(let i=0;i<3;i++) litWin(116 + i*7, 23.4, 1.0, 1.4, -1.1, i < 1 ? 'r8' : 'r9');
win(W, 132.6, 19.6, 1.0, 1.8, -1.2, '#E9DCC8', '#5E4630', {ledge:false, grille:false}); litWin(132.6, 20.5, 1.0, 1.8, -1.1, 'r9');

// ================= around and behind: lanterns over the street, back rows, the tower's outside, the moon =================
for(const [x,z,k] of [[-9.5,4.2,'p'],[-6.5,3.7,'s'],[9.5,4.3,'s'],[17,4.1,'c'],[21.5,4.4,'p'],[31.5,4.2,'s'],[36,4.0,'c'],[47.5,4.4,'p'],[52,4.0,'s']]){
  ZONE = zoneFor(x);
  if(k==='s') stool(x, z, ['#D8382A','#2F6FB5','#D8382A','#E9A23B'][Math.floor(trnd()*4)]);
  else if(k==='c') crate(x, z, .9+trnd()*.3, ['#E9C46A','#9FCBC1','#E8A598'][Math.floor(trnd()*3)]);
  else plant(W, x, -.28, z, 1+trnd()*.4, ['hoa','chuoi','p'][Math.floor(trnd()*3)]);
}
ZONE = 'r1'; xeDap(-1.6, 4.6, .2);
ZONE = 'r3'; xeMay(40.5, 4.6, '#2F6FB5', -.15);
tree(W, -11.5, 3.8, 7.5, {s:1.2, zone:'r1'});
tree(W, 31, -4.8, 9, {s:1.05, zone:'r3', flower:'#F06BAE'});
const POLES = [-8, 11, 27, 44];
for(const x of POLES){ ZONE = zoneFor(x); powerPole(x, 3.4); }
for(let i=0;i<POLES.length-1;i++){ ZONE = zoneFor(POLES[i]); poleWires([POLES[i], POLES[i+1]], 3.2); }
for(const [a, b, y, z, sag] of [[-7.5, 8, 7.9, 1.2, .9], [8.8, 25.4, 7.4, 1.0, .8], [26.6, 45.4, 7.6, 1.4, .9]]){ ZONE = zoneFor((a+b)/2); lanternString(a, b, y, z, sag); }
for(const [a, b, y] of [[61, 75, 10.4], [77, 95, 13.2], [114, 133, 24.2]]){ ZONE = zoneFor((a+b)/2); lanternString(a, b, y, -.4, .7); }
midRow(-16, 60, zoneFor, {zf:-5.4});
farRow(-24, 150);
ZONE = 'sky';
// the tower's outside, seen over the roofs from the street
box(W, 58, 64, 9.6, 30, -10, -5, '#C98B6A', {ow:.06, shadow:false, uv:[3, 3], map:TEX.brick});
mesh(W, new THREE.ConeGeometry(4.6, 5, 4), '#B5513A', {pos:new THREE.Vector3(61, 32.4, -7.5), rot:[0, Math.PI/4, 0], ow:.06, shadow:false});
mesh(W, new THREE.CylinderGeometry(2.0, 2.0, .2, 28), '#F4F1EA', {pos:new THREE.Vector3(61, 25, -4.9), rot:[Math.PI/2, 0, 0], ow:.05, shadow:false});
const outFace = new THREE.Mesh(new THREE.CircleGeometry(1.8, 28), toon('#FFFFFF', false, {map:TEX.clock})); outFace.position.set(61, 25, -4.78); W.add(outFace);
const moon = new THREE.Mesh(new THREE.CircleGeometry(5, 40), new THREE.MeshBasicMaterial({color:'#FFF2C8', fog:false}));
moon.position.set(40, 38, -90); scene.add(moon);
const moonGlow = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshBasicMaterial({map:dotTex, color:'#FFE9A8', transparent:true, opacity:.35, depthWrite:false, blending:THREE.AdditiveBlending, fog:false}));
moonGlow.position.set(40, 38, -91); scene.add(moonGlow);
clouds(-40, 170); hills(-40, 170);
moteSpan(-10, 30);

// ================= sheets =================
const lockPic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.4)'; x.lineWidth = 6; x.strokeRect(cw*.35, ch*.5, cw*.3, ch*.3); x.beginPath(); x.arc(cw*.5, ch*.5, cw*.1, Math.PI, 0); x.stroke(); };
const sheetC = sheet({id:'C', x0:10.0, x1:12.2, y0:.4, y1:2.7, z:-.4, layers:[{n:'14', pic:lockPic}], onLayer:()=>peeledGate()});
const sheetK = sheet({id:'K', x0:15.5, x1:17.3, y0:1.1, y1:2.7, z:1.5, onLayer:()=>peeledLantern()});
const fanPic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.4)'; x.lineWidth = 4; for(let i=0;i<7;i++){ const a = -1.2 + i*.4; x.beginPath(); x.moveTo(cw*.5, ch*.9); x.lineTo(cw*.5 + Math.sin(a)*ch*.5, ch*.9 - Math.cos(a)*ch*.5); x.stroke(); } };
const sheetQ = sheet({id:'Q', x0:31.2, x1:33.2, y0:.3, y1:2.5, z:-.44, carry:true, respawn:true, layers:[{n:'14', pic:fanPic}], onLayer:()=>peeledFan()});
const sheetBL = sheet({id:'L', x0:50.4, x1:51.9, y0:1.15, y1:2.85, z:-.44, layers:[{n:'14'}], onLayer:()=>peeledBloc()});
const breakers = [53.8, 55.4, 57.0].map((x, i)=>sheet({id:'D' + (i + 1), x0:x - .45, x1:x + .35, y0:.9, y1:2.0, z:-.28, layers:[{n:String(i + 1)}], onLayer:()=>peeledBreaker(i)}));
const gearPic = (whole)=>(x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.42)'; x.lineWidth = 5; const cx = cw*.5, cy = ch*.6, r = ch*.22;
  x.beginPath(); const n = 16; for(let i=0;i<=n;i++){ if(!whole && i > 10) break; const a = i/n*Math.PI*2, rr = i%2 ? r : r*.8; i ? x.lineTo(cx + Math.cos(a)*rr, cy + Math.sin(a)*rr) : x.moveTo(cx + Math.cos(a)*rr, cy + Math.sin(a)*rr); } x.stroke();
  x.beginPath(); x.arc(cx, cy, r*.25, 0, Math.PI*2); x.stroke(); };
const sheetG = sheet({id:'G', x0:66.8, x1:69.6, y0:.3, y1:2.6, z:-1.0, layers:[{n:'14'}, {n:'1999', pic:gearPic(false)}, {n:'1985', pic:gearPic(true)}], onLayer:i=>peeledGear(i), onRestore:L=>restoredGear(L)});
// three stacks, one per door; the right day brings its person
const chePic = (x, cw, ch)=>{ x.fillStyle = 'rgba(70,60,50,.3)'; x.beginPath(); x.ellipse(cw*.5, ch*.66, cw*.24, ch*.08, 0, 0, Math.PI*2); x.fill(); x.beginPath(); x.moveTo(cw*.28, ch*.66); x.quadraticCurveTo(cw*.5, ch*.95, cw*.72, ch*.66); x.fill();
  x.strokeStyle = 'rgba(70,60,50,.35)'; x.lineWidth = 3; x.beginPath(); x.moveTo(cw*.62, ch*.5); x.lineTo(cw*.72, ch*.72); x.stroke(); };
const rainPic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.3)'; x.lineWidth = 2; for(let i=0;i<14;i++){ const a = (i*37)%100/100, b = (i*61)%100/100; x.beginPath(); x.moveTo(cw*(.1 + a*.8), ch*(.3 + b*.5)); x.lineTo(cw*(.07 + a*.8), ch*(.38 + b*.5)); x.stroke(); } };
const boatPic = (x, cw, ch)=>{ x.fillStyle = 'rgba(70,60,50,.3)'; x.beginPath(); x.moveTo(cw*.22, ch*.66); x.lineTo(cw*.78, ch*.66); x.lineTo(cw*.66, ch*.8); x.lineTo(cw*.34, ch*.8); x.closePath(); x.fill(); x.beginPath(); x.moveTo(cw*.4, ch*.66); x.lineTo(cw*.5, ch*.42); x.lineTo(cw*.6, ch*.66); x.fill(); };
const kitePic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.35)'; x.lineWidth = 3; x.beginPath(); x.moveTo(cw*.5, ch*.32); x.lineTo(cw*.68, ch*.55); x.lineTo(cw*.5, ch*.8); x.lineTo(cw*.32, ch*.55); x.closePath(); x.stroke(); };
const DOORS = [
  {who:'hai', layers:[{n:'14'}, {n:'1990', pic:rainPic}, {n:'1979', pic:chePic}], ok:2, x0:77.6, line:'Hôm nay quán chè mở hàng!'},
  {who:'bong', layers:[{n:'13', pic:kitePic}, {n:'14', pic:boatPic}, {n:'12', pic:rainPic}], ok:1, x0:83.1, line:'Bống giữ cửa cho Tò!'},
  {who:'tu', layers:[{n:'14'}, {n:'1999', pic:gearPic(false)}, {n:'1985', pic:gearPic(true)}], ok:2, x0:88.6, line:'Năm đó chú mười tuổi…'}];
const doorSheets = DOORS.map((d, i)=>sheet({id:'O' + i, x0:d.x0, x1:d.x0 + 2.2, y0:4.9, y1:7.2, z:-1.0, layers:d.layers, onLayer:()=>doorCheck(i), onRestore:()=>doorCheck(i)}));
const sheetV = sheet({id:'V', x0:97.2, x1:99.2, y0:5.2, y1:8.3, z:-1.0, dir:'y', layers:[{n:'14'}]});
const sheetW1 = sheet({id:'W', x0:99.9, x1:101.7, y0:8.7, y1:10.6, z:-1.0, carry:true, respawn:true});
const sheetW2 = sheet({id:'X', x0:104.8, x1:106.6, y0:8.7, y1:10.6, z:-1.0, carry:true, respawn:true, onLayer:()=>{ if(!metW2){ metW2 = true; say('Ròng rọc ở xa quá… gấp máy bay?', 2.4); } }});
const stairPic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.42)'; x.lineWidth = 6; x.beginPath(); x.moveTo(cw*.15, ch*.9); for(let i=0;i<4;i++){ x.lineTo(cw*(.15 + i*.2), ch*(.9 - (i + 1)*.17)); x.lineTo(cw*(.35 + i*.2), ch*(.9 - (i + 1)*.17)); } x.stroke(); };
const brokenPic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.42)'; x.lineWidth = 6; x.beginPath(); x.moveTo(cw*.15, ch*.9); x.lineTo(cw*.15, ch*.73); x.lineTo(cw*.35, ch*.73); x.moveTo(cw*.75, ch*.22); x.lineTo(cw*.95, ch*.22); x.stroke(); };
const sheetT = sheet({id:'T', x0:110.4, x1:112.4, y0:12.1, y1:14.2, z:-1.0, layers:[{n:'14', pic:brokenPic}, {n:'8', pic:stairPic}, {n:'1'}], onLayer:i=>peeledStairs(i), onRestore:L=>restoredStairs(L)});
const sheetF = sheet({id:'F', x0:115.6, x1:122.4, y0:15.1, y1:22.6, z:-.8, locked:true, onLocked:()=>triedFace(), onLayer:()=>peeledFace()});
const sheetCr = sheet({id:'R', x0:126.0, x1:131.6, y0:14.9, y1:16.9, z:.3, ghost:true, locked:true, onLocked:()=>say('Mặt đồng hồ còn bị che. Vặn cót cũng chẳng thấy kim chạy.', 2.6), onLayer:()=>wound()});

// ================= characters =================
// Tò holds Bống's star lantern on a stick: the only warm light at the start
const starH = new THREE.Group(); starH.position.set(.2, .5, .1); heldG.add(starH);
ZONE = '0';
(function(){ const m = mesh(starH, STAR_GEO, '#E8442E', {ow:.04}); m.scale.setScalar(.7); m.position.y = 1.6;
  rod(starH, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1.3, 0), .03, '#C99A52', {outline:false}); })();
const starGlow = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), new THREE.MeshBasicMaterial({map:dotTex, color:'#FFC870', transparent:true, opacity:.55, depthWrite:false, blending:THREE.AdditiveBlending}));
scene.add(starGlow);
ZONE = 'ba';
const ba = new THREE.Group(); ba.position.set(-2.4, 0, .3); ba.rotation.y = .5; ba.scale.setScalar(S*1.05); scene.add(ba); const baR = buildBa(ba);
ZONE = 'tu';
const tu = new THREE.Group(); tu.position.set(50.9, 0, .55); tu.rotation.y = .3; tu.scale.setScalar(S*1.05); scene.add(tu); const tuR = buildTu(tu);
ZONE = 'hai';
const hai = new THREE.Group(); hai.position.set(80.2, 4.6, .9); hai.rotation.y = .35; hai.scale.setScalar(S*1.05); scene.add(hai); const haiR = buildHai(hai);
ZONE = 'bong';
const bong = new THREE.Group(); bong.position.set(85.8, 4.6, .9); bong.rotation.y = .35; bong.scale.setScalar(S*1.25); scene.add(bong); const bongR = buildBong(bong);
ZONE = 'me';
const me = new THREE.Group(); me.position.set(30, 0, .6); me.scale.setScalar(S); scene.add(me); const meR = buildMe(me);
hai.visible = bong.visible = me.visible = false; bongR.boat.visible = false;
for(const z of ['tray0','tray1','tray2']) setZone(z, 0);
bui({x:39.4, top:0, s:.5, a:38.4, b:41.2, fan:true}); bui({x:41.8, top:0, s:.42, a:40.6, b:43.4, fan:true});
bui({x:43.6, top:0, s:.55, a:42.4, b:44.8, fan:true}); bui({x:40.6, top:0, s:.36, a:39.0, b:42.6, fan:true});
firefly(6.0, 4.4);
firefly(35.4, 4.5, ()=>true);
firefly(76.1, 10.9);
firefly(105.2, 12.0, ()=>windSlot.filled);
firefly(112.8, 17.9);
for(const z of ROOMS.concat(['tu','hai','bong','me','ba','sky'])) setZone(z, 0);

// ================= bubbles =================
const dist = o => Math.abs(P.x - o.position.x) + Math.abs(P.y - o.position.y)*.5;
const lines = {};
function npcSay(k, t, d){ lines[k] = {t, d}; }
function npcTalk(obj, k, dy, idle){ talker(obj, dy, ()=>{ const l = lines[k]; if(l && l.d > 0) return l.t; return idle ? idle() : ''; }); }
npcTalk(tu, 'tu', 2.7, ()=>{
  if(toSayT > 0 || busy() || P.won || dist(tu) > 5) return '';
  if(!tuAwake) return Math.sin(nowT*.8) > 0 ? '…một… ba… hai…' : '…cầu dao…';
  if(tuAt === 1) return machine ? '' : 'Bánh răng mẻ rồi. Năm tám lăm nó còn lành…';
  return '';
});
talker(tu, 2.6, ()=> !tuAwake && dist(tu) > 5 ? 'z z z' : '', 'zzz');
npcTalk(ba, 'ba', 2.2, ()=> !ending && dist(ba) < 5 && toSayT <= 0 ? (Math.sin(nowT*.7) > 0 ? '…chẳng ai nhớ nữa…' : 'z z z') : '');
npcTalk(hai, 'hai', 2.7); npcTalk(bong, 'bong', 2.1); npcTalk(me, 'me', 2.5);

// ================= story beats =================
let metGate = false, metWall = false, metBui = false, metShop = false, metGear = false, metDoors = false, metClimb = false, metWind = false, metW2 = false, metTop = false;
let tuAwake = false, tuAt = 0, faceTries = 0, faceSoft = false, ending = false, buiGone = false;
function peeledGate(){
  sheetC.solved = true; say('Chốt cổng bật ra!', 1.6); gateOpen = .001;
  play([{dur:2.6, cam:[16, 2.4], start:()=>colour('r1')}, {dur:0, start:()=>objective('Qua bức tường cao')}]);
}
function peeledLantern(){
  kqOn = true; kqSpin = true;
  play([{dur:.6, start:()=>say('Đèn kéo quân! Bóng ngựa chạy trên tường.', 2.4)},
    {dur:3.0, cam:[22.5, 3.2]},
    {dur:0, start:()=>{ objective('Dừng đèn cho bóng thành bậc'); say('Bấm E cạnh đèn để dừng. Dừng đúng lúc…', 2.8); }}]);
}
LV.use = ()=>{
  if(kqOn && Math.abs(P.x - 16.4) < 2.2 && P.y < 1){ kqSpin = !kqSpin; kqT = 0; say(kqSpin ? 'Quay!' : 'Dừng!', .9); return; }
  if(held.on) return;
};
function peeledFan(){
  if(learned.includes('quat')) return;
  play([{dur:.8, start:()=>say('Mặt sau có hình vẽ…', 1.4)},
    {dur:4.4, start:()=>memo(drawFanFold), end:memoOff},
    {dur:0, start:()=>{ learned.push('quat'); held.form = null; say('Tò biết gấp quạt rồi! Bấm Q.', 2.6); objective('Gấp quạt, phẩy Lũ Bụi bay đi'); }}]);
}
LV.onFan = n=>{
  if(!buiGone && buis.every(b=>b.gone)){ buiGone = true;
    play([{dur:1.2}, {dur:2.4, cam:[49, 2.2]}, {dur:0, start:()=>{ colour('r3'); say('Sạch bụi rồi. Tiệm sửa quạt của chú Tư!', 2.4); objective('Vào tiệm sửa quạt'); }}]); }
};
function peeledBloc(){
  play([{dur:.8, start:()=>say('Lịch bloc của chú Tư… mặt sau có chữ.', 1.8)},
    {dur:4.2, start:()=>memo(pageBack(['Cầu dao: MỘT, rồi BA,', 'rồi mới tới HAI.', 'Sai là cháy quạt!'], '14')), end:memoOff},
    {dur:0, start:()=>objective('Bóc ba cầu dao: một, ba, hai')}]);
}
const ORDER = [0, 2, 1]; let brStep = 0, brBad = false;
function peeledBreaker(i){
  if(brBad) return;
  if(ORDER[brStep] === i){ brStep++; say(['Một!', 'Ba!', 'Hai!'][brStep - 1], 1);
    if(brStep === 3){ for(const b of breakers) b.solved = true; fanOn(); } }
  else { brBad = true; say('Xẹt! Sai thứ tự rồi… cầu dao nhảy lại.', 2.4); later(1.4, ()=>{ for(const b of breakers) resetSheet(b); brStep = 0; brBad = false; }); }
}
let cfanK = 0;
function fanOn(){
  play([{dur:2.4, cam:[53, 2.4], start:()=>{ cfanK = .001; say('Quạt trần quay rồi!', 1.6); }},
    {dur:1.6, start:()=>{ colour('r4'); colour('tu'); tuAwake = true; }},
    {dur:2.6, start:()=>npcSay('tu', 'Ơ… tò he? Của bà Năm hả con?', 2.6)},
    {dur:4.6, start:()=>memo(drawTuMemory), end:memoOff},
    {dur:3.2, start:()=>npcSay('tu', 'Bà dặn chú giữ giờ cho cả phố. Năm nay chú quên lên dây cót…', 3.2)},
    {dur:2.6, start:()=>npcSay('tu', 'Đi! Lên tháp với chú.', 2.4)},
    {dur:0, start:()=>{ tdoorUp = .001; objective('Vào tháp đồng hồ'); }}]);
}
function peeledGear(i){
  if(i === 0){ say('Tờ 1999… bánh răng đã mẻ rồi. Bóc sâu nữa?', 2.4); }
  else if(i === 1){ gearWhole(true); }
  else { gearWhole(false); say('Bóc quá tay, bánh răng biến mất. Bấm R dán lại.', 2.6); objective('Dán lại tờ 1985 (bấm R)'); }
}
function restoredGear(L){ gearWhole(L === 2); }
function gearWhole(on){
  if(on === machine) return;
  machine = on; sheetG.solved = on; gMid.visible = on; gBroken.visible = !on;
  if(on){ say('Năm 1985! Bánh răng còn nguyên!', 2);
    play([{dur:.6}, {dur:2.8, cam:[70, 3.4], start:()=>npcSay('tu', 'Chạy rồi! Lên thang đi con.', 2.6)}, {dur:0, start:()=>{ colour('r5'); objective('Đứng lên thang nâng, lên tầng trên'); }}]); }
}
function doorCheck(i){
  const d = DOORS[i], s = doorSheets[i], ok = s.L === d.ok && !s.done;
  if(ok === doors[i].open) return;
  doors[i].open = ok; s.solved = ok;
  const who = {hai, bong, tu}[d.who];
  if(ok){
    if(d.who === 'tu'){ tu.position.set(91.0, 4.6, .9); tu.rotation.y = .35; tuAt = 2; }
    who.visible = true; colour(d.who);
    say(['Tờ cô Hai mở quán!', 'Tờ của Bống!', 'Năm chú Tư mười tuổi!'][i], 1.8);
    npcSay(d.who, d.line, 2.6);
    if(doors.every(q=>q.open)) colour('r6');
    objective(i < 2 ? 'Qua cửa, tìm ngày của người kế tiếp' : 'Leo lên đỉnh tháp');
  } else {
    if(d.who !== 'tu') who.visible = false;
    if(s.done) say('Bóc quá tay rồi. Đứng gần, bấm R dán lại.', 2.4);
  }
}
function pastedWind(){ say('Bịt được lỗ gió!', 1.6); play([{dur:2.0, cam:[104, 10.6]}, {dur:0, start:()=>objective('Tới ròng rọc phía trên')}]); }
target({x:111.4, y:10.3, r:1.0, onHit:()=>{
  pulleyHit = true; basketWant = 8.4; say('Trúng ròng rọc! Cái giỏ hạ xuống!', 2.2);
  play([{dur:2.6, cam:[109.4, 11]}, {dur:0, start:()=>{ colour('r7', .6); objective('Đứng vào giỏ'); }}]);
}});
function peeledStairs(i){
  if(i === 0){ stairsK = .001; sheetT.solved = true; say('Tờ 8… cầu thang còn nguyên!', 2); objective('Leo lên đỉnh tháp'); }
  else { stairsK = 0; sheetT.solved = false; say('Bóc quá tay, bậc mất rồi. Bấm R dán lại.', 2.4); objective('Dán lại tờ 8 (bấm R)'); }
}
function restoredStairs(L){ if(L === 1){ stairsK = .001; sheetT.solved = true; objective('Leo lên đỉnh tháp'); } else { stairsK = 0; sheetT.solved = false; } }
function triedFace(){
  faceTries++;
  if(faceTries === 1){
    play([{dur:1.4, start:()=>say('Dính chặt quá… bóc không ra.', 1.6)},
      {dur:4.6, start:()=>{ memo(pageBack(['Chẳng ai nhớ nữa…'], '14')); caption('Mặt sau tờ lịch là chữ của bà Năm.'); }, end:()=>{ memoOff(); caption(''); }},
      {dur:3.0, start:()=>npcSay('tu', 'Tờ lịch của bà… thì chỉ bà gỡ được.', 3)},
      {dur:2.6, start:()=>say('Bà… dấu tay bà trên bụng mình!', 2.6)},
      {dur:0, start:()=>objective('Áp bụng vào tờ lịch (bấm E)')}]);
  } else if(!faceSoft){
    faceSoft = true;
    play([{dur:2.2, start:()=>{ say('Bà ơi…', 1.6); hug = 1; }, tick:(t)=>{ hug = Math.sin(Math.min(1, t/2.2)*Math.PI); }},
      {dur:1.8, start:()=>{ hug = 0; sheetF.locked = false; say('Tờ lịch mềm ra rồi!', 1.8); }},
      {dur:0, start:()=>objective('Bóc tờ lịch khỏi mặt đồng hồ')}]);
  }
}
let hug = 0;
function peeledFace(){
  sheetF.solved = true; sheetCr.locked = false; colour('r8');
  play([{dur:2.6, cam:[FACE.x, FACE.y - 2.5], start:()=>say('Kim đứng ở giờ Thân… chiều 14.', 2.4)},
    {dur:2.2, start:()=>npcSay('tu', 'Vặn cót đi con! Đi lùi mà vặn!', 2.2)},
    {dur:0, start:()=>objective('Đứng ở tay quay, đi lùi để vặn cót')}]);
}
// winding done: the clock runs, the calendar turns to the full moon, then the ending at the stall
let clockRun = 0, flipK = -1;
function wound(){
  sheetCr.solved = true; colour('r9'); objective('Rằm rồi!');
  const fade = $('fade');
  finish([
    {dur:3.0, cam:[FACE.x + 2, FACE.y - 2.4], start:()=>{ clockRun = 1; say('Tích… tắc…', 2); }},
    {dur:2.6, cam:[126.5, 16.4], start:()=>{ flipK = 0; }},
    {dur:4.6, cam:[60, 9, 52], start:()=>{ bars(true); caption('Đồng hồ chạy lại. Lịch sang Rằm. Đèn lồng sáng khắp phố.'); for(const z of ROOMS) colour(z); }, end:()=>caption('')},
    {dur:1.0, start:()=>fade.classList.remove('out')},
    {dur:.6, start:()=>{ startEnding(); }, end:()=>fade.classList.add('out')},
    {dur:2.6, cam:[-1.2, 2.2, 13], start:()=>caption('Tò chạy một mạch về sạp tò he đầu phố.'), end:()=>caption('')},
    {dur:2.2, cam:[-1.4, 2.0, 12], start:()=>say('Bà ơi! Đồng hồ chạy lại rồi!', 2.2)},
    {dur:2.6, cam:[-1.6, 2.0, 11], start:()=>caption('Bà vẫn ngủ. Phố có màu rồi, chỉ riêng bà còn xám.'), end:()=>caption('')},
    {dur:3.6, cam:[-1.8, 2.0, 10], start:()=>{ caption('Tò ôm lấy bà. Màu trên người Tò chảy sang bà.'); }, tick:t=>{ const k = Math.min(1, t/3.4); hug = 1; setZone('ba', k); setZone('0', 1 - k); }, end:()=>caption('')},
    {dur:2.6, cam:[-1.8, 2.0, 10], start:()=>{ hug = 0; baWake = 1; npcSay('ba', 'Ơ… con tò he của bà…', 2.6); }},
    {dur:3.0, cam:[-1.8, 2.0, 10], start:()=>npcSay('ba', 'Tò he thì nặn lại được mà.', 3)},
    {dur:3.2, cam:[-1.8, 2.0, 10], start:()=>caption('Bà nặn lại cho Tò, ấn ngón tay lên bụng như lần đầu.'), tick:t=>{ const k = Math.min(1, t/3); setZone('0', k); }, end:()=>caption('')},
    {dur:4.4, cam:[1.6, 2.4, 15], start:()=>{ arrive = 0; caption('Người trong phố kéo nhau tới sạp bà Năm.'); }, tick:t=>{ arrive = Math.min(1, t/4); }, end:()=>caption('')},
    {dur:3.2, cam:[1.6, 2.4, 15], start:()=>{ npcSay('hai', 'Bà ơi, con Hai nè!', 2.4); later(1.2, ()=>npcSay('bong', 'Bà Năm ơi, Rằm rồi!', 2.2)); }},
    {dur:3.8, cam:[1.0, 2.4, 14], start:()=>{ const r = relicsAll(); npcSay('ba', r === 3 ? 'Con gà trống của Hai. Con cá vàng của mẹ Bống. Con rồng của thằng Tư. Bà nhớ hết.' : 'Mấy đứa còn nhớ bà…', 3.8); }},
    {dur:2.8, cam:[1.0, 2.4, 14], start:()=>{ npcSay('tu', 'Năm sau tụi con lại tới, bà nhé.', 2.6); }},
    {dur:5.2, cam:[2, 9, 30], start:()=>{ trayAll(); bars(true); endTitle(true); }},
    {dur:.4, end:()=>{ bars(false); }}]);
}
let baWake = 0, arrive = -1;
const ARRIVE = [{o:hai, from:[16, 0, 1.2], to:[2.6, 0, 1.0], ry:-.6}, {o:me, from:[18, 0, 1.6], to:[4.2, 0, 1.3], ry:-.7}, {o:bong, from:[17, 0, 2.0], to:[3.4, 0, 2.0], ry:-.8}, {o:tu, from:[20, 0, 1.0], to:[5.6, 0, .8], ry:-.7}];
function startEnding(){
  ending = true;
  P.x = .4; P.y = 0; P.vx = P.vy = 0; P.face = -1; toInner.rotation.y = -.75;
  camPos.set(-2, 4.4, 14); camLook.set(-1, 2, -1);
  for(const q of ARRIVE){ q.o.visible = false; }
  for(const z of ROOMS.concat(['sky'])) setZone(z, 1);
  setZone('ba', 0);
}
function relicsAll(){ const r = relicLoad(); if(relicGot && !r.includes(3)) r.push(3); return [1, 2, 3].filter(n=>r.includes(n)).length; }
function trayAll(){ for(const n of [1, 2, 3]) traySet(n); for(let i=0;i<3;i++) setZone('tray' + i, 1); }
function endTitle(on){ const el = $('endT'); el.innerHTML = '<h1>Phố Cũ Bạc Màu</h1><p>chuyện nhỏ về những ngày bị quên</p>'; el.style.opacity = on ? 1 : 0; }
function drawFanFold(x, W, H){
  x.fillStyle = '#F6EBD9'; x.fillRect(20, 20, W-40, H-40); x.strokeStyle = '#141019'; x.lineWidth = 3; x.strokeRect(20, 20, W-40, H-40);
  x.fillStyle = '#3B2E2A'; x.font = '30px "Patrick Hand", cursive'; x.textAlign = 'center';
  x.fillText('Gấp đi gấp lại, bóp một đầu!', W/2, 64);
  x.lineWidth = 4; x.strokeStyle = '#B87333';
  x.strokeRect(45, 120, 100, 120); for(let i=1;i<6;i++){ x.setLineDash([5,5]); x.beginPath(); x.moveTo(45 + i*100/6, 120); x.lineTo(45 + i*100/6, 240); x.stroke(); } x.setLineDash([]);
  x.beginPath(); for(let i=0;i<=6;i++){ x.lineTo(215 + i*9, i%2 ? 120 : 132); } x.stroke(); x.strokeRect(215, 132, 54, 108);
  x.fillStyle = '#F4EFE4'; for(let i=0;i<7;i++){ const a = -1.1 + i*.37; x.save(); x.translate(390, 245); x.rotate(a); x.fillRect(-7, -112, 14, 112); x.strokeRect(-7, -112, 14, 112); x.restore(); }
  x.fillStyle = '#3B2E2A'; x.font = '44px "Patrick Hand", cursive'; x.fillText('→', 180, 196); x.fillText('→', 318, 196);
  x.font = '24px "Patrick Hand", cursive'; x.fillText('Bống vẽ', W - 90, H - 44);
}
function drawTuMemory(x, W, H){
  x.fillStyle = '#F6EBD9'; x.fillRect(20, 20, W-40, H-40); x.strokeStyle = '#141019'; x.lineWidth = 3; x.strokeRect(20, 20, W-40, H-40);
  x.fillStyle = '#3B2E2A'; x.font = '28px "Patrick Hand", cursive'; x.textAlign = 'center';
  x.fillText('Năm 1985, thằng Tư mười tuổi', W/2, 62);
  x.strokeStyle = '#7A4E2D'; x.lineWidth = 4;
  x.beginPath(); x.arc(150, 200, 38, 0, Math.PI*2); x.stroke(); x.beginPath(); x.moveTo(150, 238); x.lineTo(150, 300); x.stroke();
  x.beginPath(); x.moveTo(112, 260); x.lineTo(188, 260); x.stroke();
  x.beginPath(); x.arc(330, 230, 46, 0, Math.PI*2); x.stroke(); for(let i=0;i<12;i++){ const a = i/12*Math.PI*2; x.fillRect(330 + Math.cos(a)*38 - 2, 230 + Math.sin(a)*38 - 2, 4, 4); }
  x.beginPath(); x.moveTo(330, 230); x.lineTo(330, 196); x.moveTo(330, 230); x.lineTo(352, 240); x.stroke();
  x.font = '24px "Patrick Hand", cursive'; x.fillText('“Giữ giờ cho cả phố nghe con.”', W/2, 320);
}

// ================= per-frame level logic =================
LV.update = (dt, t)=>{
  for(const k in lines) if(lines[k].d > 0) lines[k].d -= dt;
  LV.lantern = ending ? .6 : 2.2;
  starGlow.position.set(P.x + .5*Math.cos(toInner.rotation.y), P.y + 1.6, .9); starGlow.material.opacity = ending ? 0 : .5 + Math.sin(t*3)*.08;
  for(const w of winGlow) w.m.material.opacity = (zoneK[w.z] || 0)*.8;
  moon.material.color.set('#B8B4AE').lerp(skyTmp.set('#FFF2C8'), zoneK.sky || 0);
  // room 1: the gate swings open
  if(gateOpen > 0 && gateOpen < 1) gateOpen = Math.min(1, gateOpen + dt*.8);
  gate.rotation.y = -gateOpen*1.4;
  if(!metGate && P.x > 8.2){ metGate = true; say('Cổng khoá rồi… tối quá, chẳng thấy gì.', 2.4); objective('Soi đèn tìm tờ lịch ở cổng'); }
  // room 2: the revolving lantern
  if(!metWall && P.x > 14.5){ metWall = true; colour('r1'); say('Tường cao quá. Có cái đèn kéo quân…', 2.4); objective('Bóc tờ lịch trên đèn kéo quân'); }
  if(kqOn && kqSpin){ kqT += dt; if(kqT > .95){ kqT = 0; kqPhase = (kqPhase + 1) % 3; } drum.rotation.y += dt*2.2; }
  kqGlow.material.opacity = kqOn ? .6 + Math.sin(t*5)*.08 : 0; kqLight.intensity = kqOn ? 1.6 : 0;
  for(let i=0;i<steps.length;i++){
    const s = steps[i], h = H_STEP[(i + kqPhase) % 3];
    s.y += (h - s.y)*Math.min(1, dt*(kqSpin ? 6 : 12));
    s.p.top = s.y;
    s.m.position.y = s.y - .9; s.m.material.opacity = kqOn ? (kqSpin ? .32 : .55) : 0;
    s.slab.position.y = s.y - .11; s.slab.material.opacity = kqOn && !kqSpin ? .92 : 0; s.slab.visible = kqOn && !kqSpin;
  }
  // any phase that still gets Tò over the wall counts, so the hint and halo move on with him
  if(!kqSolved && kqOn && P.x > 26.4 && P.ground && P.y > 3){ kqSolved = true; sheetK.solved = true; colour('r2', .6); }
  if(kqOn && !kqSpin && kqPhase === 0 && !kqSolved){ kqSolved = true; sheetK.solved = true; colour('r2', .6); say('Bóng thành bậc rồi!', 1.8); objective('Leo lên bóng ngựa, qua tường'); }
  if(!metBui && P.x > 30.2 && P.y < .5){ metBui = true; colour('r2'); say('Lũ Bụi chắn đường tới tiệm chú Tư…', 2.4); objective('Bóc tờ lịch trên tường'); }
  // room 4: the ceiling fan, chú Tư
  if(!metShop && P.x > 46.4){ metShop = true; say('Chú Tư ngủ gục rồi. Ba cầu dao bị dán xám.', 2.6); objective('Đọc lịch bloc trên tường'); }
  if(cfanK > 0) cfanK = Math.min(1, cfanK + dt*.5);
  cblades.rotation.y += dt*cfanK*14;
  tuR.head.rotation.x = tuAwake ? Math.sin(t*2)*.04 : .4 + Math.sin(t*1.3)*.04;
  tuR.belly.scale.y = 1 + Math.sin(t*1.6)*.02;
  if(tdoorUp > 0 && tdoorUp < 1) tdoorUp = Math.min(1, tdoorUp + dt*.7);
  tdoor.position.y = 4.4*tdoorUp*tdoorUp;
  // chú Tư goes ahead to the gears
  if(tuAwake && tuAt === 0 && P.x > 56 && tdoorUp >= 1){ tuAt = 1; tu.position.set(62.4, 0, .9); tu.rotation.y = .3; }
  // room 5: the machine
  if(!metGear && P.x > 61){ metGear = true; colour('r4'); say('Bánh răng giữa bị mẻ… máy không chạy.', 2.4); objective('Tìm năm bánh răng còn lành'); }
  for(const g of gears) if(g.visible) g.rotation.z += dt*(machine ? .9 : 0)*g.userData.sp + (clockRun ? dt*.6*g.userData.sp : 0);
  gBroken.rotation.z = Math.sin(t*.4)*.02;
  drawerOut += Math.max(-dt*2, Math.min(dt*1.5, (machine ? 1 : 0) - drawerOut)); drawer.position.z = -1.0 + drawerOut*.9;
  dragon.visible = drawerOut > .6; dragon.position.z = drawer.position.z + 1.1; if(!relicGot) dragon.rotation.y = Math.sin(t*1.3)*.4;
  // the hoist rises with Tò on it, waits upstairs while he is up there, and comes down to fetch him otherwise
  const want = machine ? (P.on === hoistP || P.y > 3 ? 4.6 : 0) : 0;
  hoistY += Math.max(-dt*1.6, Math.min(dt*1.1, want - hoistY));
  hoist.position.y = hoistY; hoistP.top = hoistY;
  hoistRope.scale.y = 25.4 - hoistY - 1.1; hoistRope.position.set(73.3, hoistY + 1.1 + hoistRope.scale.y/2, .3);
  pend.rotation.z = Math.sin(t*(machine || clockRun ? 1.8 : 0) )*.22*(machine || clockRun ? 1 : 0);
  // room 6: the doors
  if(!metDoors && P.x > 75 && P.y > 4.4){ metDoors = true; colour('r5'); say('Ba cánh cửa nặng quá, đẩy không nổi.', 2.4); objective('Tìm ngày cô Hai mở quán chè'); if(tuAt === 1){ tu.visible = false; } }
  for(const d of doors){ d.up += Math.max(-dt*1.4, Math.min(dt*.9, (d.open ? 1 : 0) - d.up)); d.g.position.y = 4.6 + 4.2*d.up*d.up; }
  haiR.arm.rotation.z = hai.visible ? -.6 + Math.sin(t*2)*.1 : 0;
  bongR.arms[1].rotation.z = bong.visible ? Math.sin(t*6)*.3 : 0;
  bong.position.y = (ending ? 0 : 4.6) + (bong.visible ? Math.abs(Math.sin(t*4))*.05 : 0);
  // room 7: the climb
  if(!metClimb && P.x > 96.4 && P.y > 4.4 && P.y < 6){ metClimb = true; colour('r6'); say('Cầu thang gãy hết rồi…', 2); objective('Kéo mép tờ dọc làm gờ, leo lên'); }
  if(!metWind && P.y > 8.2 && P.x > 99.5 && P.x < 108){ metWind = true; say(windSlot.filled ? 'Lên rồi!' : 'Gió lùa qua lỗ tường mạnh quá!', 2.2); objective(windSlot.filled ? 'Tới ròng rọc phía trên' : 'Lấy tờ lịch dán bịt lỗ gió'); }
  for(const s of streaks){ const k = (t*1.3 + s.ph) % 1; s.m.visible = !windSlot.filled && camLook.x > 92 && camLook.x < 118; s.m.position.set(108 - k*7, s.y + Math.sin(k*6 + s.ph*9)*.12, .2); s.m.material.opacity = Math.sin(k*Math.PI)*.6; }
  if(pulleyHit){
    if(P.on === basketP) onBasketT += dt; else onBasketT = 0;
    if(onBasketT > .4) basketWant = 11.8; else if(P.y < 10 && P.x > 103 && P.x < 110.5 && P.on !== basketP) basketWant = 8.4;
  }
  basketY += Math.max(-dt*2.4, Math.min(dt*1.6, basketWant - basketY));
  basket.position.set(109.2, basketY, .2); basketP.top = basketY;
  basketRope.scale.y = 25.4 - basketY - .6; basketRope.position.set(109.2, basketY + .6 + basketRope.scale.y/2, .2);
  pulley.rotation.z = -basketY*1.4;
  stairsK += Math.max(-dt*2, Math.min(dt*1.4, (sheetT.L === 1 ? 1 : 0) - stairsK)); if(stairsK < 0) stairsK = 0;
  stairs.visible = stairsK > .01; stairs.scale.y = Math.max(.01, stairsK); stairs.position.y = 12.2*(1 - stairsK);
  // chú Tư waits at the top by the crank
  if(tuAt === 2 && P.y > 12.5 && !ending){ tuAt = 3; tu.position.set(124.6, 14.8, .9); tu.rotation.y = -.4; }
  if(!metTop && P.y > 14.5 && P.x > 113.4){ metTop = true; colour('r7'); say('Mặt đồng hồ… bị dán kín bằng tờ lịch 14.', 2.6); objective('Gỡ tờ lịch khỏi mặt đồng hồ'); }
  // Tò presses his belly to the sheet
  toInner.position.z = hug*.35; toInner.rotation.x = hug*.25;
  // the clock running again, the calendar flipping
  if(clockRun){ minH.rotation.z -= dt*5.5; hourH.rotation.z -= dt*.46; crank.rotation.z += dt*.4; }
  else crank.rotation.z = -sheetCr.p*.9;
  if(flipK >= 0 && flipK < 1){ flipK = Math.min(1, flipK + dt*.7); calFlip.visible = true; calFlip.material.map = calTex[0]; calFlip.rotation.x = -flipK*Math.PI*.95; cal.material.map = calTex[1]; if(flipK >= 1) calFlip.visible = false; }
  // the ending: bà wakes, people arrive
  baR.head.rotation.x = ending ? .35*(1 - baWake) : .35 + Math.sin(t*1.1)*.03;
  if(ending){
    if(baWake > 0 && baWake < 1) baWake = Math.min(1, baWake + dt);
    if(arrive >= 0) for(const [i, q] of ARRIVE.entries()){
      const k = Math.max(0, Math.min(1, arrive*1.3 - i*.12)), e = k*k*(3 - 2*k);
      q.o.visible = true; q.o.position.set(q.from[0] + (q.to[0] - q.from[0])*e, q.from[1], q.from[2] + (q.to[2] - q.from[2])*e);
      q.o.rotation.y = k < 1 ? -1.4 : q.ry; colour(q.o === tu ? 'tu' : q.o === hai ? 'hai' : q.o === bong ? 'bong' : 'me');
    }
  }
};
LV.hint = ()=>{
  if(!sheetC.done) return P.x < 9 ? 'Đi sang phải. Đèn ông sao soi tới đâu thì mép tờ lịch sáng tới đó.' : 'Tờ lịch dán trên hộp chốt cổng, sát cánh cổng. Bóc nó ra.';
  if(!kqOn) return 'Bức tường cao quá. Bóc tờ xám trên chiếc đèn kéo quân.';
  if(!kqSolved || P.x < 26.4) return kqSpin ? 'Đứng cạnh đèn, bấm E để dừng khi ba bóng ngựa xếp thấp, vừa, cao từ trái sang.' : kqPhase === 0 ? 'Nhảy lên ba bậc bóng, rồi lên đầu tường.' : 'Bóng xếp sai rồi. Bấm E cạnh đèn để quay tiếp.';
  if(!buiGone) return !learned.includes('quat') ? 'Bóc tờ lịch trên tường phía trái, xem mặt sau.' : held.on ? (held.form === 'quat' ? 'Quay mặt về phía Lũ Bụi, đứng gần, bấm E để phẩy.' : 'Bấm Q cho tới khi gấp thành quạt.') : 'Lấy tờ lịch trên tường để gấp quạt.';
  if(!tuAwake) return !sheetBL.done ? 'Lịch bloc trên tường của chú Tư có ghi gì ở mặt sau.' : 'Bóc ba cầu dao theo thứ tự: một, ba, hai.';
  if(!machine && P.y < 1) return sheetG.L >= 3 ? 'Bóc quá tay rồi. Đứng gần chồng lịch, bấm R dán lại.' : 'Chồng lịch ở dưới bánh răng: năm nào bánh răng còn nguyên?';
  if(P.y < 4.4) return 'Đứng lên thang nâng bên phải. Nhảy sang ngăn kéo thì có thứ hay.';
  if(P.x < 96){ const i = doors.findIndex(d=>!d.open && P.x < d.x); if(i >= 0) return ['Ngày cô Hai mở quán chè: bóc tới tờ có chén chè.', 'Ngày của Bống: tờ có chiếc thuyền giấy.', 'Năm chú Tư mười tuổi, năm bánh răng còn lành.'][i]; }
  if(P.y < 8.2) return 'Nắm mép dưới tờ dọc, đi lùi để kéo lên nửa chừng, bấm E buông. Mép giấy thành gờ.';
  if(!windSlot.filled) return 'Lấy tờ lịch trên tường, đứng sát lỗ, bấm E để dán bịt lỗ gió.';
  if(!pulleyHit) return held.on ? (held.form === 'maybay' ? 'Đứng ở cuối hành lang, quay về phải, bấm E để phóng vào ròng rọc.' : 'Bấm Q để gấp máy bay.') : 'Lấy tờ lịch trên tường, gấp máy bay.';
  if(P.y < 11.6) return 'Đứng vào cái giỏ, nó sẽ kéo lên.';
  if(P.y < 14.5) return sheetT.L !== 1 ? (sheetT.L >= 2 ? 'Bóc quá tay rồi. Bấm R dán lại.' : 'Tờ lịch nào còn cầu thang?') : 'Leo bậc lên đỉnh tháp.';
  if(!sheetF.done) return faceTries === 0 ? 'Nắm mép tờ lịch trên mặt đồng hồ.' : 'Bấm E lần nữa: áp bụng có dấu tay bà vào tờ lịch.';
  return 'Tới tay quay bên phải, nắm lấy rồi đi lùi để vặn cót.';
};
LV.winText = ()=>{
  const r = relicsAll();
  return {
    h:'Hết chương 1. Cảm ơn bạn đã chơi!',
    p:'Đêm Rằm, đồng hồ chạy lại, bà Năm có màu trở lại, khay tò he của bà đủ ba màu.',
    memory:(fliesGot === 5
      ? '<b>Ký ức mở khoá.</b> Năm 1985, thằng Tư mười tuổi ăn chè không tiền ở quán cô Hai, rồi chạy ra sạp bà Năm xin nặn con rồng. Bà nặn cho, dặn: “Giữ giờ cho cả phố nghe con.” Từ đó Tư lên dây cót tháp đồng hồ mỗi tuần.'
      : 'Còn ' + (5 - fliesGot) + ' con đom đóm ở Màn 3 chưa tìm thấy.')
      + '<br><b>Tò he cũ tìm được:</b> ' + r + '/3. ' + (r === 3 ? 'Bà Năm gọi được tên cả ba người.' : 'Tìm đủ cả ba con thì bà Năm gọi được tên cả ba người.'),
    next:'Chương 2 · Mưa phố đang chờ bên kia sông'
  };
};

// ================= intro: the street dark, the tower far off, Tò with Bống's star =================
LV.intro = {end:12, sheetsAt:9,
  caps:[[0.5, 4.0, 'Tối 14 tháng Tám. Cả phố tắt đèn.'],
        [4.3, 8.0, 'Kim đồng hồ trên tháp vẫn đứng ở giờ của chiều 14.'],
        [8.3, 11.6, 'Tò cầm đèn ông sao của Bống, đi về phía tháp.']],
  run(it, dt, t){
    for(const z of ROOMS.concat(['tu','ba','sky'])) setZone(z, 0);
    const camX = it < 4 ? 30 - it*3 : it < 8 ? 61 : Math.max(2, 18 - (it - 8)*5);
    const camY = it >= 4 && it < 8 ? 18 : 2.4;
    camLook.lerp(tmpV.set(camX, camY, -1), Math.min(1, dt*2));
    camPos.lerp(tmpV.set(camX - 2.5, camY + 2.6, it >= 4 && it < 8 ? 30 : 16), Math.min(1, dt*2));
    camera.position.copy(camPos); camera.lookAt(camLook);
    sun.position.set(camLook.x - 8, 18, 12); sun.target.position.set(camLook.x, 0, 0);
    toInner.rotation.y = .9;
    LV.lantern = .95; starGlow.position.set(P.x + .5, P.y + 1.6, .9);
  },
  done(){
    learned.push('thuyen', 'maybay');
    say('Tối quá… mình soi đèn đi từ từ.', 2.4);
    objective('Đi về phía tháp đồng hồ');
  }};
startGame();
