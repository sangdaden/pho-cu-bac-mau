// ================= Màn 2 · Rãnh nước: sunset to night down the canal alley, from Bống's door to her mother's sampan =================
// rooms (x): 1 ống bể, nhà Bống -6..12 · 2 rãnh thả thuyền 12..26 · 3 lỗ rò 26..44 · 4 âu thuyền 44..62 · 5 giờ Ngọ, giờ Tý 62..79
//            6 câu rao trong hẻm tối 79..96 · 7 máy bay giấy 96..108 · 8 ba lớp lịch 108..128.6 · 9 bến ghe mẹ Bống 128.6..150
LV.level = 2;
LV.start = {x:1, y:0};
LV.bounds = [-5.5, 149.2];
LV.cam = [4, 143];
LV.sky = ['r1','r2','r3','r4','r5','r6','r7','r8','r9','r9'];
const ROOMS = ['r1','r2','r3','r4','r5','r6','r7','r8','r9'];
function zoneFor(x){ return x < 12 ? 'r1' : x < 26 ? 'r2' : x < 44 ? 'r3' : x < 62 ? 'r4' : x < 79 ? 'r5' : x < 96 ? 'r6' : x < 108 ? 'r7' : x < 128.6 ? 'r8' : 'r9'; }
// hoàng hôn: violet above, pink, warm orange at the horizon
SKY.c.top.set('#3B4A8C'); SKY.c.mid.set('#C9719B'); SKY.c.bot.set('#F6B26B');
LIGHT.fog.set('#E7A386'); LIGHT.sun.set('#FFB27A');
SKY.g.top.set('#A9A6AE'); SKY.g.mid.set('#C4C0C2'); SKY.g.bot.set('#D3CDC8');

// ================= ground: lanes of pavement, ditches between them, the road in front =================
const LANDS = [[-14, 12, 0], [26, 30, 0], [42, 47.4, 0], [58, 62, 2.2], [62, 68, 3.6], [79, 118, 0], [128.6, 144, 0]];
for(const [x0, x1, top] of LANDS){
  for(let a = x0; a < x1; a += 12){ const b = Math.min(x1, a + 12); ZONE = zoneFor(a + .1);
    box(W, a, b, -5, top, -6, 3, top > 0 ? '#C2B6A8' : '#D9D0C4', {outline:false, uv:top > 0 ? [2, 1] : [3.2, 3.2], map:top > 0 ? TEX.stone : TEX.pave});
    if(top > 0) box(W, a, b, top - .14, top, -6, 3.04, '#D9D0C4', {ow:.03, uv:[3.2, 3.2], map:TEX.pave});
    box(W, a, b, top - .02, top + .06, 2.6, 2.9, '#B8A58E', {outline:false}); }
  plat(x0, x1, top, false, null, {safe:true});
}
// ditches: stone floor, a low kerb in front, the house walls behind run down into them
function ditch(x0, x1, floor){
  ZONE = zoneFor(x0 + .1);
  box(W, x0, x1, floor - .6, floor, -6, 3, '#8E857B', {outline:false, uv:[2,1], map:TEX.stone});
  box(W, x0, x1, floor, .08, 2.55, 3.0, '#9C8F80', {ow:.04, uv:[2,1], map:TEX.stone});
  box(W, x0, x1, floor, .02, -.62, -.5, '#7E756B', {outline:false, uv:[2,1], map:TEX.stone});
  for(const x of [x0, x1]) box(W, x - .12, x + .12, floor, .1, -.5, 2.9, '#A39788', {ow:.03, uv:[2,1], map:TEX.stone});
  for(let x = x0 + .8; x < x1 - .5; x += 1.7 + trnd()) mesh(W, new THREE.CylinderGeometry(.04, .04, .5 + trnd()*.4, 4), '#6FAE4E', {pos:new THREE.Vector3(x, floor + .3, 2.3), outline:false, shadow:false});
}
ditch(12, 26, -3); ditch(30, 42, -3); ditch(47.4, 58, -4.5);
const chA = channel({x0:12, x1:26, floor:-3, level:-3, z0:-.5, z1:2.55, speed:1.4});
const chB = channel({x0:30, x1:42, floor:-3, level:-2.7, z0:-.5, z1:2.55, speed:1.2});
const chC = channel({x0:47.4, x1:58, floor:-4.5, level:-4.5, z0:-.5, z1:2.55, speed:1.3});
// the open canals under room 5 and room 8 and the river at the bến
for(const [x0, x1] of [[68, 79], [118, 128.6], [144, 156]]){
  ZONE = zoneFor(x0 + .5); box(W, x0, x1, -3, -.5, -6, 3, '#4FB7D2', {outline:false, uv:[7, 7], map:TEX.water});
  hazard(x0, x1, -.6, 'Á! Nước! Tò sợ nước lắm!');
}
for(const [x0, x1] of [[-14, 12], [12, 30], [30, 47.4], [47.4, 62], [62, 79], [79, 96], [96, 108], [108, 128.6], [128.6, 156]]){
  ZONE = zoneFor(x0 + .1);
  box(W, x0, x1, -1.2, -.28, 3, 14, '#A9A097', {outline:false, uv:[4,4], map:TEX.road});
  box(W, x0, x1, -.28, 0, 2.95, 3.15, '#C2B6A8', {outline:false, uv:[2,1], map:TEX.stone});
}
for(let x = -12; x < 152; x += 4){ ZONE = zoneFor(x); box(W, x, x+2, -.27, -.26, 7.4, 7.6, '#E9E2D6', {outline:false, shadow:false}); }
for(let i=0;i<90;i++){ const x = -11 + trnd()*155; ZONE = zoneFor(x); mesh(W, new THREE.CircleGeometry(.09, 5), ['#E8A41A','#C98B4A','#7DBB4B'][i%3], {pos:new THREE.Vector3(x, -.26, 4 + trnd()*6), rot:[-Math.PI/2, 0, trnd()*3], outline:false, shadow:false}); }
for(const [x,z,r] of [[70,1.2,.55],[73.6,.2,.4],[77,1.6,.5],[120,1.4,.5],[124.5,.4,.6],[127,1.7,.45],[150,1.2,.6]]){
  ZONE = zoneFor(x); mesh(W, new THREE.CylinderGeometry(r, r, .05, 14, 1, false, .3, Math.PI*2-.6), '#5FAF55', {pos:new THREE.Vector3(x, -.47, z), ow:.02, shadow:false});
  if(r > .5) leaf(W, new THREE.Vector3(x+.1, -.3, z), [.16,.2,.16], '#F28AB8', {ow:.02});
}
// a row of houses behind every lane: walls run from deep below (the ditches show them) to the eaves
function house(x0, x1, h, c, o){
  o = o || {}; ZONE = zoneFor((x0 + x1)/2);
  box(W, x0, x1, -5, h, -4.2, -.5, c, Object.assign({}, WALL, {uv:[6, h + 5, 0, -5]}));
  box(W, x0 - .05, x1 + .05, h, h + .25, -4.4, -.3, '#C98B4A', {ow:.04});
  for(const x of [x0, x1]) box(W, x - .2, x + .2, 0, h, -.5, -.32, '#F4F1EA', {ow:.025});
  if(o.roof) roof(W, x0 - .3, x1 + .3, h + .25, -.15, 3.4, 1.5, o.roof);
}

// ================= room 1 · Ống bể: a broken downpipe over a dry ditch, Bống asleep on her doorstep =================
house(-6, 3.4, 8.6, '#E8A598', {roof:'#B5513A'});
house(3.4, 12, 7.8, '#F1E0C5');
ZONE = 'r1';
win(W, -3.6, 4.8, 1.5, 2.0, -.5, '#F4F1EA', '#2E8C86', {flower:'#F2C230'});
win(W, .6, 4.8, 1.5, 2.0, -.5, '#F4F1EA', '#2E8C86');
balcony(W, -5.2, 2.6, 4.6, -.5, 1.0, '#E9DCC8', '#2E8C86');
box(W, -5.4, -1.8, 0, 2.9, -.5, -.47, '#4A3A30', {outline:false});
for(let i=0;i<7;i++) box(W, -5.3, -1.9, .2+i*.4, .26+i*.4, -.47, -.44, '#6E655C', {outline:false});
sign(W, -5.4, -1.8, 3.0, 3.8, -.5, '#4E9A4A', '#F4F1EA', 'TIỆM GẠO');
hoaGiay(W, 1.4, 3.2, 8.6, -.2, 3.2);
// the downpipe from the roof gutter, cracked open where the sheet covers it
box(W, -6, 3.4, 8.5, 8.7, -.35, -.15, '#A8B4B8', {ow:.02});
rod(W, new THREE.Vector3(5.2, 7.8, -.4), new THREE.Vector3(5.2, 3.2, -.4), .13, '#A8B4B8', {ow:.025});
for(let y = 3.6; y < 7.6; y += 1.4) box(W, 5.0, 5.4, y, y+.1, -.55, -.26, '#6E655C', {outline:false});
rod(W, new THREE.Vector3(5.2, .9, -.4), new THREE.Vector3(5.2, .3, -.4), .13, '#A8B4B8', {ow:.025});
// a gutter channel along the foot of the wall that runs to the ditch
box(W, 5.0, 12.1, -.05, .02, -.5, -.1, '#7E756B', {outline:false});
// Bống's house: blue door, a step, pots of herbs, a tin washbasin
win(W, 6.0, 4.4, 1.3, 1.7, -.5, '#F4F1EA', '#2F6FB5', {flower:'#F06BAE'});
win(W, 10.2, 4.4, 1.3, 1.7, -.5, '#F4F1EA', '#2F6FB5');
box(W, 7.4, 11.4, 0, 3.1, -.5, -.47, '#3B4152', {outline:false});
box(W, 7.2, 11.6, 3.1, 3.3, -.5, -.3, '#7A4E2D', {ow:.025});
box(W, 7.3, 11.5, -.05, .18, -.5, .25, '#C2B6A8', {ow:.02, uv:[2,1], map:TEX.stone});
for(const [x,k] of [[11.9,'hoa']]) plant(W, x, 0, -.2, .7, k);
mesh(W, new THREE.CylinderGeometry(.5,.38,.28,16), '#B8C4C8', {pos:new THREE.Vector3(-.8, .14, .4), ow:.025});
balcony(W, 4.2, 11.4, 6.0, -.5, .8, '#E9DCC8', '#2A2630', {pots:false});
for(let i=0;i<5;i++) box(W, 4.8 + i*1.3, 5.6 + i*1.3, 6.5, 7.3, -.25, -.2, ['#F2C230','#F4F1EA','#E8442E','#9FCBC1','#F06BAE'][i], {ow:.015});
rod(W, new THREE.Vector3(4.5, 7.35, -.22), new THREE.Vector3(11.2, 7.35, -.22), .015, '#2A2630', {outline:false});
// water: a gush from the pipe, a stream along the gutter, a fall into the ditch
const waterMat = new THREE.MeshBasicMaterial({map:TEX.water, color:'#9FDCEB', transparent:true, opacity:0, depthWrite:false});
const gush = new THREE.Mesh(new THREE.PlaneGeometry(.55, 2.2), waterMat); gush.position.set(5.5, 1.5, -.2); scene.add(gush);
const gutterW = new THREE.Mesh(new THREE.PlaneGeometry(7, .35), waterMat); gutterW.rotation.x = -Math.PI/2; gutterW.position.set(8.6, .04, -.3); scene.add(gutterW);
const fall = new THREE.Mesh(new THREE.PlaneGeometry(.5, 3), waterMat); fall.position.set(12.3, -1.4, -.2); scene.add(fall);
let waterOn = 0;

// ================= room 2 · Thả thuyền: a long ditch between two lanes, the paper boat crosses it =================
house(12, 19, 8.2, '#9FCBC1', {roof:'#B5513A'});
house(19, 26, 7.4, '#E9C46A');
ZONE = 'r2';
win(W, 14.2, 3.6, 1.4, 1.8, -.5, '#F4F1EA', '#C23A28', {flower:'#F2C230'});
win(W, 17.0, 3.6, 1.4, 1.8, -.5, '#F4F1EA', '#C23A28');
balcony(W, 13, 18.4, 3.4, -.5, .9, '#E9DCC8', '#2A2630');
win(W, 22.4, 4.2, 2.0, 1.8, -.5, '#F4F1EA', '#4E9A4A', {open:1.3});
hoaGiay(W, 24.4, 25.8, 7.4, -.2, 2.6);
box(W, 19.8, 25.2, 1.2, 1.32, -.5, .1, '#C2B6A8', {ow:.02});
for(const [x,c] of [[20.6,'#E8442E'],[22.4,'#F2C230'],[24.2,'#9FCBC1']]){ mesh(W, new THREE.CylinderGeometry(.24,.18,.36,10), '#B5513A', {pos:new THREE.Vector3(x, 1.5, -.2), ow:.02}); leaf(W, new THREE.Vector3(x, 1.85, -.2), [.3,.26,.26], '#5FAF55'); leaf(W, new THREE.Vector3(x+.1, 2.05, -.1), .1, c, {ow:.02}); }

// ================= room 3 · Lỗ rò: the ditch leaks through a crack; a page pasted over it holds the water in =================
house(26, 34, 8.8, '#E8A598', {roof:'#B5513A'});
house(34, 44, 7.6, '#C7B8E0');
ZONE = 'r3';
win(W, 32.0, 4.6, 1.5, 2.0, -.5, '#F4F1EA', '#2E8C86');
// the old fish-shop window over the ditch: its sill is a ledge only a boat-rider can jump to
win(W, 35.4, 2.75, 1.6, 1.7, -.5, '#F4F1EA', '#C23A28', {ledge:false});
box(W, 34.3, 36.5, 2.42, 2.6, -.5, .35, '#E9DCC8', {ow:.025});
plat(34.4, 36.4, 2.6, true);
sign(W, 34.4, 36.4, 4.8, 5.5, -.5, '#2F6FB5', '#F4F1EA', 'CÁ KIỂNG');
win(W, 39.4, 4.4, 1.4, 1.8, -.5, '#F4F1EA', '#8E6CC0', {flower:'#F06BAE'});
balcony(W, 37.6, 43.4, 4.2, -.5, .9, '#E9DCC8', '#2A2630');
// the crack low on the ditch wall, and the spray that leaks out of it
box(W, 30.3, 31.5, -1.3, -.2, -.5, -.46, '#4A433C', {outline:false});
const leakSlot = slot({x0:30.3, x1:31.5, y0:-1.3, y1:-.2, z:-.44, onPaste:()=>pastedLeak()});
const sprayMat = new THREE.MeshBasicMaterial({color:'#D8F2F8', transparent:true, opacity:.8});
const spray = []; for(let i=0;i<14;i++){ const m = new THREE.Mesh(SPH_S, sprayMat); m.scale.setScalar(.06 + Math.random()*.05); scene.add(m); spray.push({m, ph:Math.random()}); }
// a pail and a sack on the bank, a crate of fish tins
ZONE = 'r3'; crate(28.8, -.1, .8, '#9FCBC1', 0);
mesh(W, new THREE.CylinderGeometry(.28,.22,.5,12), '#2F6FB5', {pos:new THREE.Vector3(26.7, .25, .2), ow:.025});
// the hidden one: bà Năm's goldfish tò he, in a tin on the sill
const fish = new THREE.Group(); fish.position.set(35.6, 2.6, -.05); scene.add(fish);
(function(g){
  mesh(g, new THREE.CylinderGeometry(.2, .2, .3, 14), '#B8C4C8', {pos:new THREE.Vector3(0, .15, 0), ow:.02});
  rod(g, new THREE.Vector3(0, .3, 0), new THREE.Vector3(0, .62, 0), .02, '#C99A52', {outline:false});
  blob(g, new THREE.Vector3(0, .78, 0), [.2, .14, .1], '#F2A23A', {ow:.02});
  mesh(g, new THREE.ConeGeometry(.12, .2, 4), '#E8442E', {pos:new THREE.Vector3(-.26, .78, 0), rot:[0, 0, Math.PI/2], ow:.015});
  blob(g, new THREE.Vector3(0, .93, 0), [.06, .08, .03], '#E8442E', {ow:.012});
  blob(g, new THREE.Vector3(.12, .81, .07), .025, '#141019', {small:true});
})(fish);
relic(fish, 35.6, 2.6, 'Con cá vàng của mẹ Bống');

// ================= room 4 · Âu thuyền: a deep lock; the gate on the wall lets the water in, and the boat rises to the quay =================
house(44, 52, 8.4, '#F1DDB0', {roof:'#B5513A'});
house(52, 62, 9.2, '#9FCBC1');
ZONE = 'r4';
// the sluice: an iron wheel and a mouth in the wall, where sheet G covers it
box(W, 44.4, 47.2, 0, 2.7, -.5, -.46, '#3B4152', {outline:false});
mesh(W, new THREE.TorusGeometry(.5, .06, 6, 18), '#6E655C', {pos:new THREE.Vector3(45.8, 3.3, -.3), outline:false});
for(const a of [0, Math.PI/3, Math.PI*2/3]) rod(W, new THREE.Vector3(45.8 + Math.cos(a)*.5, 3.3 + Math.sin(a)*.5, -.3), new THREE.Vector3(45.8 - Math.cos(a)*.5, 3.3 - Math.sin(a)*.5, -.3), .03, '#6E655C', {outline:false});
box(W, 47.1, 47.4, -4.5, 2.4, -.5, -.2, '#6E655C', {ow:.02});
box(W, 42.1, 44.3, 2.7, 2.85, -.5, -.3, '#7A4E2D', {ow:.02});
win(W, 49.4, 4.6, 1.5, 2.0, -.5, '#F4F1EA', '#2F6FB5', {flower:'#F2C230'});
win(W, 55.0, 5.0, 1.5, 2.0, -.5, '#F4F1EA', '#2E8C86');
hoaGiay(W, 50.6, 52, 8.4, -.2, 2.8);
// the quay: stone steps and bollards, a moored basket boat
for(let i=0;i<4;i++) box(W, 58 + i*.3, 62, -4.5 + i*0, 2.2 - (3 - i)*.02, 2.55 - i*.1, 2.95, '#A39788', {outline:false});
for(const x of [58.6, 61.4]){ mesh(W, new THREE.CylinderGeometry(.16, .2, .5, 10), '#4A433C', {pos:new THREE.Vector3(x, 2.45, 1.8), ow:.02}); }
box(W, 58, 58.25, -4.5, 2.2, -.5, 2.55, '#9C8F80', {ow:.03, uv:[2,1], map:TEX.stone});
// the inflow: water spouts out of the wall into the lock once the gate is open
const spout = new THREE.Mesh(new THREE.PlaneGeometry(.6, 4.4), waterMat); spout.position.set(47.7, -1.4, -.2); scene.add(spout);
let gateOpen = false;

// ================= room 5 · Giờ Ngọ, giờ Tý: a rooftop at sunset; under midnight the lanterns come down over the canal =================
ZONE = 'r5';
box(W, 62, 68, -5, 3.6, -4.2, -.5, '#E8A598', Object.assign({}, WALL, {uv:[6, 8.6, 0, -5]}));
box(W, 61.95, 68.05, 3.42, 3.6, -4.4, .5, '#C2B6A8', {ow:.035, uv:[3.2,3.2], map:TEX.pave});
win(W, 65, .9, 1.5, 1.7, -.5, '#F4F1EA', '#2E8C86');
box(W, 62.4, 67.6, 3.6, 7.2, -4.2, -2.2, '#F1E0C5', WALL);
box(W, 62.2, 67.8, 7.2, 7.45, -4.4, -2.0, '#C98B4A', {ow:.04});
plant(W, 67.2, 3.6, -1.6, .8, 'hoa');
box(W, 69, 79, -5, 7.2, -9, -5.2, '#C7B8E0', WALL);
// the almanac board the sheet hangs on
box(W, 62.7, 66.7, 3.75, 6.75, -2.2, -2.12, '#7A4E2D', {ow:.03});
// lanterns pulled up under the eaves until midnight; then they drop to be stepping stones
const LANT_STEPS = [[71.1, 3.2], [73.9, 2.4], [76.7, 1.6]];
const lantSteps = LANT_STEPS.map(([x, y], i)=>{
  const g = new THREE.Group(); g.position.set(x, 9, 0); scene.add(g);
  ZONE = '0';
  blob(g, new THREE.Vector3(0, -.45, 0), [.55, .42, .55], ['#E8442E','#F2C230','#F06BAE'][i], {ow:.03});
  for(const dy of [-.08, -.84]) mesh(g, new THREE.CylinderGeometry(.3, .3, .08, 12), '#C99A52', {pos:new THREE.Vector3(0, dy, 0), outline:false});
  rod(g, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 6, 0), .015, '#2A2530', {outline:false});
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), new THREE.MeshBasicMaterial({map:dotTex, color:'#FFC94A', transparent:true, opacity:0, depthWrite:false, blending:THREE.AdditiveBlending}));
  glow.position.set(0, -.45, .4); g.add(glow);
  const p = plat(x - .55, x + .55, y, true, ()=>nightK > .9);
  return {g, x, y, glow, p};
});
let nightWant = 0, nightK = 0;

// ================= room 6 · Câu rao: a covered lane at night, an old radio, three hanging tins to bump in the right order =================
house(79, 87, 8.6, '#D9A07A', {roof:'#B5513A'});
house(87, 96, 8.0, '#9FCBC1');
ZONE = 'r6';
// the lane roof: beams and a corrugated sheet overhead
for(let x = 80; x < 95.5; x += 2.2) box(W, x, x + .18, 5.6, 5.8, -.5, 2.6, '#7A4E2D', {ow:.02});
box(W, 79.5, 95.5, 5.8, 5.95, -.5, 2.6, '#8FA9B3', {ow:.03});
box(W, 79.5, 95.5, 5.0, 5.15, 2.45, 2.6, '#7A4E2D', {ow:.02});
// the radio on a windowsill
win(W, 82.6, 1.6, 2.4, 1.7, -.5, '#F4F1EA', '#C23A28', {ledge:false, grille:false});
box(W, 81.3, 83.9, .82, .95, -.5, .1, '#A27650', {ow:.025, uv:[.6,.6], map:TEX.wood});
for(const x of [81.45, 83.75]) box(W, x - .06, x + .06, 0, .82, -.4, 0, '#7A4E2D', {ow:.02});
const radio = new THREE.Group(); radio.position.set(82.6, .95, -.15); scene.add(radio);
box(radio, -.55, .55, 0, .62, -.18, .18, '#A27650', {ow:.025, uv:[.6,.6], map:TEX.wood});
mesh(radio, new THREE.CylinderGeometry(.2, .2, .04, 16), '#E9DCC8', {pos:new THREE.Vector3(-.22, .3, .19), rot:[Math.PI/2, 0, 0], outline:false});
box(radio, .1, .45, .2, .45, .18, .2, '#E9DCC8', {outline:false});
rod(radio, new THREE.Vector3(.4, .62, 0), new THREE.Vector3(.7, 1.3, 0), .015, '#6E655C', {outline:false});
// three tins on strings, each with a little sign of what it holds
const TINS = [{x:86.6, k:'BÒ BÍA', c:'#7DBB4B'}, {x:88.8, k:'CHÈ', c:'#E8442E'}, {x:91.0, k:'BÁNH TIÊU', c:'#F2C230'}];
const ORDER = [1, 2, 0];
const tins = TINS.map((q, i)=>{
  const g = new THREE.Group(); g.position.set(q.x, 5.6, 0); scene.add(g);
  ZONE = '0';
  rod(g, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -1.8, 0), .015, '#2A2530', {outline:false});
  mesh(g, new THREE.CylinderGeometry(.34, .34, .62, 14), q.c, {pos:new THREE.Vector3(0, -2.12, 0), ow:.03});
  mesh(g, new THREE.CylinderGeometry(.36, .36, .06, 14), '#B8B0A4', {pos:new THREE.Vector3(0, -1.8, 0), outline:false});
  ZONE = 'r6'; sign(W, q.x - .8, q.x + .8, 4.15, 4.6, -.45, '#F4F1EA', '#3B2E2A', q.k);
  return {g, x:q.x, y0:3.2, hit:false, sw:0};
});
let tinStep = 0, tinWrongT = 0, radioOn = false;
// the iron gate at the end of the lane
const gate = new THREE.Group(); gate.position.set(93.8, 0, 0); scene.add(gate);
box(gate, -.15, .15, 0, 5.6, -.4, .5, '#2A2630', {ow:.02});
for(let z = -.3; z < .5; z += .25) rod(gate, new THREE.Vector3(0, 0, z), new THREE.Vector3(0, 5.6, z), .04, '#3B4152', {outline:false});
let gateUp = 0;
const gateBlock = block(93.6, 94.0, -1, 7, ()=>gateUp < .5);

// ================= room 7 · Máy bay giấy: a fenced yard; the breaker is out of reach behind the bars =================
house(96, 103, 8.4, '#E9C46A', {roof:'#B5513A'});
house(103, 108, 7.6, '#F1E0C5');
ZONE = 'r7';
win(W, 98.4, 4.4, 1.5, 2.0, -.5, '#F4F1EA', '#2F6FB5', {flower:'#F06BAE'});
win(W, 105.6, 4.0, 1.4, 1.8, -.5, '#F4F1EA', '#2E8C86');
crate(97.0, .4, .8, '#E8A598', 0);
// the breaker box on its post
box(W, 105.0, 105.3, 0, 2.6, -.3, 0, '#6E655C', {ow:.02});
box(W, 104.65, 105.65, 1.55, 2.5, -.1, .2, '#9FAFA8', {ow:.03});
const lever = new THREE.Group(); lever.position.set(105.15, 2.0, .25); scene.add(lever);
box(lever, -.06, .06, -.05, .45, -.05, .05, '#D8382A', {ow:.02});
lever.rotation.z = 2.6;
// the bars (they slide up once the lights come on)
const bars2 = new THREE.Group(); bars2.position.set(103.15, 0, 0); scene.add(bars2);
box(bars2, -.12, .12, 5.4, 5.6, -.4, .6, '#2A2630', {ow:.02});
for(let z = -.3; z < .6; z += .22) rod(bars2, new THREE.Vector3(0, 0, z), new THREE.Vector3(0, 5.5, z), .035, '#3B4152', {outline:false});
let barsUp = 0, lightsOn = false;
const barBlock = block(103.0, 103.3, -1, 7, ()=>barsUp < .5);
// street lamps on the posts: dark until the breaker is up
const lamps = [];
for(const x of [99.5, 106.5, 112, 121.5, 133, 140]){
  ZONE = zoneFor(x);
  rod(W, new THREE.Vector3(x, 0, 2.4), new THREE.Vector3(x, 5.2, 2.4), .07, '#3B4152', {ow:.02});
  rod(W, new THREE.Vector3(x, 5.2, 2.4), new THREE.Vector3(x - .7, 5.4, 2.4), .05, '#3B4152', {outline:false});
  mesh(W, new THREE.ConeGeometry(.3, .3, 10, 1, true), '#3B4152', {pos:new THREE.Vector3(x - .75, 5.3, 2.4), outline:false});
  const bulb = new THREE.Mesh(SPH_S, new THREE.MeshBasicMaterial({color:'#6E6A70'})); bulb.scale.setScalar(.14); bulb.position.set(x - .75, 5.12, 2.4); scene.add(bulb);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshBasicMaterial({map:dotTex, color:'#FFD58A', transparent:true, opacity:0, depthWrite:false, blending:THREE.AdditiveBlending}));
  glow.position.set(x - .75, 5.0, 2.7); scene.add(glow);
  lamps.push({bulb, glow});
}

// ================= room 8 · Ba lớp: two stacks of days; one shows a ladder, the deeper one a bamboo bridge =================
house(108, 114.6, 8.6, '#D9A07A', {roof:'#B5513A'});
house(114.6, 118.6, 9.4, '#E8A598');
ZONE = 'r8';
win(W, 111.0, 4.4, 1.4, 1.8, -.5, '#F4F1EA', '#2E8C86', {flower:'#F2C230'});
balcony(W, 114.8, 118.6, 4.0, -.5, 1.0, '#E9DCC8', '#2E8C86', {pots:false});
plat(114.8, 118.65, 4.0, true, null, {safe:true});
hoaGiay(W, 117, 118.4, 9.4, -.2, 3);
plant(W, 115.3, 4.0, -.15, .7, 'hoa');
// the ladder: only there while day 7 shows
const ladder = new THREE.Group(); ladder.position.set(113.4, 0, .25); ladder.rotation.z = -.32; scene.add(ladder);
for(const dz of [-.3, .3]) rod(ladder, new THREE.Vector3(0, 0, dz), new THREE.Vector3(0, 4.6, dz), .06, '#C99A52', {ow:.02});
for(let i=0;i<7;i++) rod(ladder, new THREE.Vector3(0, .5 + i*.6, -.3), new THREE.Vector3(0, .5 + i*.6, .3), .035, '#B08440', {outline:false});
ladder.visible = false;
let ladderK = 0;
const rungs = [plat(112.6, 114.0, 1.35, true, ()=>ladderK > .9), plat(113.5, 115.0, 2.7, true, ()=>ladderK > .9)];
// the bamboo bridge over the canal: only there while day 8 shows
const bamboo = new THREE.Group(); bamboo.position.set(118.6, 3.92, .1); scene.add(bamboo);
rod(bamboo, new THREE.Vector3(0, 0, -.2), new THREE.Vector3(10, 0, -.2), .1, '#C99A52');
rod(bamboo, new THREE.Vector3(0, 0, .2), new THREE.Vector3(10, 0, .2), .1, '#B08440');
rod(bamboo, new THREE.Vector3(0, 1.1, .45), new THREE.Vector3(10, 1.1, .45), .05, '#C99A52', {outline:false});
for(let i=0;i<=5;i++) rod(bamboo, new THREE.Vector3(i*2, 0, .45), new THREE.Vector3(i*2, 1.1, .45), .04, '#8C6631', {outline:false});
bamboo.scale.x = .001; bamboo.visible = false;
let bridgeOut = 0;
plat(118.6, 128.6, 4.0, true, ()=>bridgeOut > .99);

// ================= room 9 · Bến: a shed to land on, the lane down to the river, mẹ Bống asleep on her sampan =================
house(128.6, 136, 8.0, '#F1DDB0', {roof:'#B5513A'});
house(136, 144, 7.4, '#C7B8E0');
ZONE = 'r9';
// the shed whose tin roof the bridge lands on
box(W, 128.6, 131.6, 0, 4.0, -.5, 1.4, '#E8A598', WALL);
box(W, 128.55, 131.65, 3.85, 4.05, -.6, 1.6, '#8FA9B3', {ow:.035, uv:[1.6, 2], map:TEX.tin});
box(W, 129.4, 130.8, 0, 2.2, 1.4, 1.43, '#4A3A30', {outline:false});
block(128.6, 131.6, -1, 4.0);
win(W, 134, 4.2, 1.5, 1.9, -.5, '#F4F1EA', '#2F6FB5', {flower:'#F2C230'});
win(W, 139.6, 4.0, 1.5, 1.9, -.5, '#F4F1EA', '#8E6CC0');
sign(W, 137.6, 141.6, 1.4, 2.3, -.5, '#2E8C86', '#F4F1EA', 'BẾN ĐÒ');
for(let i=0;i<5;i++) box(W, 143.2 - i*.0, 144, -.5 - i*.3, -.3 - i*.3, -.5 + i*.0, 2.5, '#A39788', {outline:false});
// the sampan: a low hull, a curved bamboo cabin, eyes painted on the bow
const ghe = new THREE.Group(); ghe.position.set(147.2, -.42, .3); scene.add(ghe);
ZONE = 'r9';
(function(g){
  const sh = new THREE.Shape(); sh.moveTo(-3.2, .5); sh.quadraticCurveTo(0, .3, 3.2, .7); sh.lineTo(2.4, -.2); sh.lineTo(-2.4, -.2); sh.closePath();
  mesh(g, new THREE.ExtrudeGeometry(sh, {depth:2.4, bevelEnabled:false}), '#7A4E2D', {pos:new THREE.Vector3(0, 0, -1.8), ow:.04});
  box(g, -2.6, 2.6, .38, .44, -1.7, .5, '#A27650', {outline:false, uv:[.6,.6], map:TEX.wood});
  const cab = mesh(g, new THREE.CylinderGeometry(.9, .9, 2.6, 16, 1, true, 0, Math.PI), '#C99A52', {pos:new THREE.Vector3(.2, .6, -.9), rot:[0, 0, Math.PI/2], ow:.035});
  cab.material.side = THREE.DoubleSide;
  for(const s of [-1, 1]){ blob(g, new THREE.Vector3(2.75, .45, s*.62), [.16, .1, .06], '#F4F1EA', {ow:.015}); blob(g, new THREE.Vector3(2.8, .45, s*.66), [.07, .07, .03], '#141019', {small:true}); }
})(ghe);
plat(144.3, 150.2, 0, true, null, {safe:true});
plat(146.0, 148.8, 1.08, true);
hazard(150.2, 156, -.6, 'Á! Nước! Tò sợ nước lắm!');

// ================= around and behind: poles, lanterns, trees, back rows, the clock tower close now =================
for(const [x,z,k] of [[-9,4.2,'p'],[-6.5,3.7,'s'],[2.5,3.9,'p'],[9.5,4.3,'s'],[14.5,4.1,'s'],[23,3.9,'p'],[27.3,4.2,'c'],[38.8,4.4,'s'],[44,4.4,'c'],[57,4.0,'p'],
                      [63,4.2,'s'],[72,4.4,'c'],[84,4.1,'s'],[88.5,3.8,'p'],[93,4.4,'c'],[101,4.0,'s'],[110,4.3,'p'],[121,4.2,'c'],[133,4.4,'s']]){
  ZONE = zoneFor(x);
  if(k==='s') stool(x, z, ['#D8382A','#2F6FB5','#D8382A','#E9A23B'][Math.floor(trnd()*4)]);
  else if(k==='c') crate(x, z, .9+trnd()*.3, ['#E9C46A','#9FCBC1','#E8A598'][Math.floor(trnd()*3)]);
  else plant(W, x, -.28, z, 1+trnd()*.4, ['hoa','chuoi','p'][Math.floor(trnd()*3)]);
}
ZONE = 'r1'; xeDap(-3.2, 4.5, .2);
ZONE = 'r4'; xeMay(52, 4.6, '#C23A28', -.15);
ZONE = 'r6'; xeDap(90, 4.6, -.2);
ZONE = 'r8'; xeMay(112.5, 4.6, '#2F6FB5', .2);
tree(W, -11, 3.8, 7.5, {s:1.2, zone:'r1'});
tree(W, 27.5, -4.8, 9, {s:1.05, zone:'r3', flower:'#F06BAE'});
tree(W, 60, -4.7, 10, {s:1.1, zone:'r4', flower:'#E8442E', c:['#4E9A4A','#5FAF55','#3F8A45']});
tree(W, 100.5, -4.7, 8.6, {s:1, zone:'r7'});
tree(W, 146, -4.8, 8, {s:1.05, zone:'r9', flower:'#B07CD0'});
const POLES = [-8, 15, 37, 53, 73, 78.4, 107.4, 123, 138];
for(const x of POLES){ ZONE = zoneFor(x); powerPole(x, 3.4); }
for(let i=0;i<POLES.length-1;i++){ ZONE = zoneFor(POLES[i]); poleWires([POLES[i], POLES[i+1]], 3.2); }
for(const [a, b, y, z, sag] of [[-5.5, 3.4, 7.8, 1.2, .9], [12.6, 25.4, 7.0, 1.0, .7], [26.4, 43.4, 7.6, 1.4, .9], [44.6, 61.4, 7.6, 1.2, .8], [96.5, 107.5, 7.4, 1.2, .6], [129, 143.5, 7.0, 1.2, .8]]){
  ZONE = zoneFor((a+b)/2); lanternString(a, b, y, z, sag);
}
midRow(-16, 158, zoneFor, {zf:-5.4});
farRow(-24, 176);
clockTower(166, -14);
clouds(-40, 200); hills(-40, 200);
for(const [x0, w, z] of [[-2, 3.4, -4.2], [18, 4.5, -4.4], [36, 3, -4.3], [52, 5, -4.4], [64, 3.6, -4.2]]) shaft(x0, w, z, zoneFor(x0), '#FFC48A');
moteSpan(-10, 30);

// ================= sheets =================
const sheetP = sheet({id:'P', x0:4.0, x1:6.6, y0:.3, y1:3.0, z:-.3, onLayer:()=>peeledPipe()});
const sheetB = sheet({id:'B', x0:7.6, x1:11.2, y0:.2, y1:3.0, z:-.44, carry:true, respawn:true, locked:true,
  onLocked:()=>say('Bống ngủ say quá… Rãnh còn khô, thả thuyền cũng chẳng đi.', 2.6), onLayer:()=>peeledBong()});
const sheetQ = sheet({id:'Q', x0:26.4, x1:29.4, y0:.3, y1:2.7, z:-.44, carry:true, respawn:true, onLayer:()=>{ if(!metQ){ metQ = true; say('Cầm được rồi. Dán bịt lỗ rò, hay gấp thuyền?', 2.6); } }});
const sheetG = sheet({id:'G', x0:44.6, x1:47.0, y0:.15, y1:2.6, z:-.42, onLayer:()=>peeledGate()});
const sheetH = sheet({id:'H', x0:42.2, x1:44.2, y0:.3, y1:2.6, z:-.44, carry:true, respawn:true});
const sunPic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.35)'; x.lineWidth = 6; x.beginPath(); x.arc(cw*.5, ch*.62, ch*.13, 0, Math.PI*2); x.stroke();
  for(let i=0;i<8;i++){ const a = i*Math.PI/4; x.beginPath(); x.moveTo(cw*.5 + Math.cos(a)*ch*.18, ch*.62 + Math.sin(a)*ch*.18); x.lineTo(cw*.5 + Math.cos(a)*ch*.26, ch*.62 + Math.sin(a)*ch*.26); x.stroke(); } };
const moonPic = (x, cw, ch)=>{ x.fillStyle = 'rgba(70,60,50,.3)'; x.beginPath(); x.arc(cw*.5, ch*.62, ch*.16, 0, Math.PI*2); x.fill();
  x.strokeStyle = 'rgba(70,60,50,.35)'; x.lineWidth = 3; for(const dx of [-.3, 0, .3]){ x.beginPath(); x.moveTo(cw*(.5+dx), ch*.15); x.lineTo(cw*(.5+dx), ch*.35); x.stroke(); x.beginPath(); x.arc(cw*(.5+dx), ch*.4, ch*.05, 0, Math.PI*2); x.stroke(); } };
const sheetN = sheet({id:'N', x0:62.9, x1:66.5, y0:3.95, y1:6.55, z:-2.08, layers:[{n:'Ngọ', pic:sunPic}, {n:'Tý', pic:moonPic}],
  onLayer:i=>peeledHour(i), onRestore:L=>restoredHour(L)});
const sheetR = sheet({id:'R', x0:81.5, x1:83.7, y0:.97, y1:1.8, z:.07, onLayer:()=>peeledRadio()});
const sheetM2 = sheet({id:'F', x0:98.4, x1:101.4, y0:.3, y1:2.6, z:-.44, carry:true, respawn:true, onLayer:()=>{ if(!metF){ metF = true; say('Gấp máy bay thử xem!', 2); } }});
const ladderPic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.4)'; x.lineWidth = 7; x.beginPath(); x.moveTo(cw*.55, ch*.98); x.lineTo(cw*.85, ch*.08); x.moveTo(cw*.7, ch*.98); x.lineTo(cw*.98, ch*.12); x.stroke();
  x.lineWidth = 4; for(let i=1;i<6;i++){ const k = i/6; x.beginPath(); x.moveTo(cw*(.55 + .3*k), ch*(.98 - .9*k)); x.lineTo(cw*(.7 + .28*k), ch*(.98 - .86*k)); x.stroke(); } };
const bridgePic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.4)'; x.lineWidth = 9; x.beginPath(); x.moveTo(cw*.02, ch*.8); x.lineTo(cw*.98, ch*.8); x.stroke();
  x.lineWidth = 3; x.beginPath(); x.moveTo(cw*.02, ch*.6); x.lineTo(cw*.98, ch*.6); x.stroke(); for(let i=0;i<5;i++){ x.beginPath(); x.moveTo(cw*(.1 + i*.2), ch*.6); x.lineTo(cw*(.1 + i*.2), ch*.8); x.stroke(); }
  x.lineWidth = 2; for(let i=0;i<6;i++){ x.beginPath(); x.moveTo(cw*(.1+i*.15), ch*.95); x.quadraticCurveTo(cw*(.17+i*.15), ch*.88, cw*(.24+i*.15), ch*.95); x.stroke(); } };
const boatPic = (x, cw, ch)=>{ x.fillStyle = 'rgba(70,60,50,.28)'; x.beginPath(); x.moveTo(cw*.2, ch*.75); x.lineTo(cw*.8, ch*.75); x.lineTo(cw*.7, ch*.88); x.lineTo(cw*.3, ch*.88); x.closePath(); x.fill();
  x.strokeStyle = 'rgba(70,60,50,.3)'; x.lineWidth = 2; for(let i=0;i<6;i++){ x.beginPath(); x.moveTo(cw*(.1+i*.15), ch*.95); x.quadraticCurveTo(cw*(.17+i*.15), ch*.88, cw*(.24+i*.15), ch*.95); x.stroke(); } };
const sheetL = sheet({id:'L', x0:109.0, x1:112.2, y0:.3, y1:3.0, layers:[{n:'14'}, {n:'7', pic:ladderPic}, {n:'5'}], onLayer:i=>peeledLadder(i), onRestore:L=>restoredLadder(L)});
const sheetS = sheet({id:'S', x0:115.2, x1:118.2, y0:4.35, y1:6.8, layers:[{n:'14'}, {n:'10', pic:boatPic}, {n:'8', pic:bridgePic}], onLayer:i=>peeledBridge(i), onRestore:L=>restoredBridge(L)});
const sheetM = sheet({id:'M', x0:141.6, x1:143.8, y0:.2, y1:1.9, z:-.44, onLayer:()=>peeledMe()});

// ================= characters in the level =================
ZONE = 'bong';
const bong = new THREE.Group(); bong.position.set(9.6, .18, .65); bong.rotation.y = .35; bong.scale.setScalar(S*1.25); scene.add(bong); const bongR = buildBong(bong);
ZONE = 'me';
const me = new THREE.Group(); me.position.set(145.0, .02, .35); me.rotation.y = .5; me.scale.setScalar(S*1.0); scene.add(me); const meR = buildMe(me);
let bongAwake = false, bongLine = '', bongLineT = 0, bongAt = 0, meAwake = false;
function bongSay(t, d){ bongLine = t; bongLineT = d; }
const BONG_AT = [[9.6, .18, .65, .35], [97.4, 0, .9, .5], [139.8, 0, .9, .9]];
bui({x:133, top:0, s:.46, a:132.2, b:135.6}); bui({x:138, top:0, s:.4, a:137.2, b:140.6});
firefly(19.2, 3.4, ()=>chA.level > -1);
firefly(60.2, 5.4);
firefly(82.6, 3.9, ()=>radioOn);
firefly(123.6, 7.0, ()=>bridgeOut > .99);
firefly(147.4, 3.4);
for(const z of ROOMS.concat(['bong','me','sky'])) setZone(z, 0);

// ================= bubbles =================
const dist = o => Math.abs(P.x - o.position.x);
talker(bong, 2.1, ()=>{
  if(bongLineT > 0) return bongLine; if(toSayT > 0 || busy() || P.won || dist(bong) > 4.5 || Math.abs(P.y - bong.position.y) > 2) return '';
  if(!bongAwake) return waterOn ? '…thuyền… nước về rồi hả…' : '…khò… thuyền con… mắc cạn…';
  if(bongAt === 0) return held.on ? (held.form ? 'Thả xuống rãnh đi!' : 'Bấm Q, gấp đôi, gấp đôi, lật lại!') : 'Lấy giấy trên cửa mà gấp nè!';
  if(bongAt === 1) return lightsOn ? 'Đèn sáng rồi! Đi tiếp đi!' : held.on ? 'Gấp máy bay, phóng qua song sắt!' : 'Giấy trên vách đó!';
  return meAwake ? '' : 'Mẹ ơi… mẹ dậy đi…';
});
talker(bong, 2.0, ()=> !bongAwake && !(dist(bong) < 4.5) ? 'z z z' : '', 'zzz');
talker(me, 2.4, ()=> !meAwake && toSayT <= 0 && dist(me) < 6 ? (Math.sin(nowT*.9) > 0 ? '…Rằm… mẹ dẫn con…' : 'z z z') : '', 'zzz');
const radioTalk = talker(radio, 1.6, ()=>{
  if(!radioOn || P.won) return '';
  const k = Math.floor(nowT/1.3) % 5;
  return ['Chè đậu…', 'Bánh tiêu…', 'Bò bía…', '♪', ''][k];
}, 'bubble radio');

// ================= story beats =================
let metLeak = false, metQ = false, metF = false, metLock = false, metRoof = false, metLane = false, metYard = false, metStacks = false, metShed = false, metBen = false, metDry = false, crossedA = false, crossedB = false;
function peeledPipe(){
  say('Ống nước bể!', 1.4); waterOn = 1; sheetB.locked = false;
  play([{dur:.8},
    {dur:2.8, cam:[16, 1.2], start:()=>{ chA.want = -.3; }},
    {dur:0, start:()=>{ colour('r1', .5); say('Nước về rãnh rồi. Bống còn ngủ…', 2.4); objective('Đánh thức bé Bống'); }}]);
}
function peeledBong(){
  if(bongAwake) return;
  bongAwake = true;
  play([{dur:.6, start:()=>{ colour('bong'); colour('r1'); say('Ồ, tờ lịch rời ra cầm được!', 2); }},
    {dur:2.6, start:()=>bongSay('A! Nước về rồi! Thuyền con chạy được rồi!', 2.8)},
    {dur:4.2, start:()=>{ memo(drawFold); bongSay('Gấp đôi, gấp đôi, lật lại!', 4.2); }, end:memoOff},
    {dur:0, start:()=>{ learned.push('thuyen'); say('Tò biết gấp thuyền rồi! Bấm Q.', 2.6); objective('Gấp thuyền, thả xuống rãnh'); }}]);
}
function pastedLeak(){
  say('Bịt được lỗ rò!', 1.6); chB.want = -.3;
  play([{dur:2.6, cam:[36, 1.2]}, {dur:0, start:()=>{ colour('r3'); objective('Gấp thuyền, qua rãnh'); say('Lấy thêm tờ nữa mà gấp thuyền.', 2.4); }}]);
}
function peeledGate(){
  gateOpen = true; chC.want = -.3; say('Cống mở! Nước vào âu!', 2);
  play([{dur:2.8, cam:[52, .4]}, {dur:0, start:()=>{ colour('r4', .6); objective(boat.on && boat.c === chC ? 'Đứng trên thuyền chờ nước dâng, lên bến' : 'Gấp thuyền thả xuống âu, lên bến'); }}]);
}
function peeledHour(i){
  if(i === 0){
    nightWant = 1; sheetN.solved = true; colour('r5');
    say('Giờ Tý… nửa đêm!', 2);
    play([{dur:1.6}, {dur:3.2, cam:[74, 4]},
      {dur:0, start:()=>{ say('Đèn lồng thả xuống rồi. Nhảy qua đèn!', 2.6); objective('Nhảy qua đèn lồng xuống hẻm'); }}]);
  } else {
    nightWant = 0; sheetN.solved = false;
    say('Hết lịch, trời sáng lại… đèn kéo lên mất.', 2.6); objective('Dán lại tờ giờ Tý (bấm R)');
  }
}
function restoredHour(L){
  if(L === 1){ nightWant = 1; sheetN.solved = true; say('Nửa đêm lại rồi.', 1.6); objective('Nhảy qua đèn lồng xuống hẻm'); }
  else { nightWant = 0; sheetN.solved = false; objective('Bóc tờ giờ Ngọ'); }
}
function peeledRadio(){
  radioOn = true; say('Cái đài… đang rao gì đó.', 2.2);
  play([{dur:3.8, cam:[86, 3.2], start:()=>{}},
    {dur:0, start:()=>{ objective('Cụng đầu vào lon theo câu rao'); say('Chè đậu, bánh tiêu, bò bía… cụng theo thứ tự!', 3); }}]);
}
function peeledLadder(i){
  if(i === 0){ ladderK = 0.001; sheetL.solved = true; say('Tờ 7… có cái thang dựng ở đây!', 2.4); objective('Leo thang lên ban công'); }
  else { ladderK = 0; sheetL.solved = false; say('Sang tờ 5 thì thang biến mất. Bấm R dán lại.', 2.8); objective('Dán lại tờ 7 (bấm R)'); }
}
function restoredLadder(L){
  if(L === 1){ ladderK = .001; sheetL.solved = true; say('Thang về rồi.', 1.4); objective('Leo thang lên ban công'); }
  else { ladderK = 0; sheetL.solved = false; }
}
function peeledBridge(i){
  if(i === 0){ say('Tờ 10… chỉ có chiếc ghe. Bóc sâu hơn nữa?', 2.6); }
  else if(i === 1){ bridgeOut = .001; sheetS.solved = true; colour('r8'); say('Tờ 8! Cầu tre bắc qua kênh!', 2.2);
    play([{dur:1.2}, {dur:2.8, cam:[124, 5.6]}, {dur:0, start:()=>objective('Đi cầu tre qua kênh')}]); }
  else { bridgeOut = 0; sheetS.solved = false; say('Bóc quá tay rồi, cầu mất. Bấm R dán lại.', 2.6); objective('Dán lại tờ 8 (bấm R)'); }
}
function restoredBridge(L){
  if(L === 2){ bridgeOut = .001; sheetS.solved = true; say('Cầu tre về rồi.', 1.6); objective('Đi cầu tre qua kênh'); }
  else { bridgeOut = 0; sheetS.solved = false; }
}
function peeledMe(){
  play([{dur:1.0, start:()=>say('Mặt sau có chữ…', 1.4)},
    {dur:4.2, start:()=>memo(pageBack(['Rằm này mẹ dẫn', 'con ra hàng bà Năm.'], '14')), end:memoOff},
    {dur:3.2, start:()=>{ meAwake = true; colour('me'); colour('r9'); bongSay('Mẹ ơi!', 2.2); }},
    {dur:3.4, start:()=>{ meSay('Mẹ quên mất… Rằm này mình đi, mẹ hứa.', 3.4); }},
    {dur:0, start:()=>endLevel()}]);
}
let meLine = '', meLineT = 0;
function meSay(t, d){ meLine = t; meLineT = d; }
talker(me, 2.5, ()=> meLineT > 0 ? meLine : '');
function endLevel(){
  objective('Xong màn 2');
  finish([{dur:2.6, start:()=>bongSay('Tò cầm đèn ông sao nè. Lên tháp tối lắm!', 3)},
    {dur:1.6, start:()=>{ starH.visible = true; say('Cảm ơn Bống!', 1.6); }},
    {dur:3.6, cam:[160, 12, 26], start:()=>{ bars(true); caption('Trên tháp, kim đồng hồ vẫn đứng ở giờ của chiều 14.'); }, end:()=>{ bars(false); caption(''); }}]);
}
function drawFold(x, W, H){
  // Bống's folding steps, drawn in crayon on the back of her page
  x.fillStyle = '#F6EBD9'; x.fillRect(20, 20, W-40, H-40); x.strokeStyle = '#141019'; x.lineWidth = 3; x.strokeRect(20, 20, W-40, H-40);
  x.fillStyle = '#3B2E2A'; x.font = '30px "Patrick Hand", cursive'; x.textAlign = 'center';
  x.fillText('Gấp đôi, gấp đôi, lật lại!', W/2, 64);
  x.lineWidth = 4; x.strokeStyle = '#2F6FB5';
  const cx = [90, 240, 390];
  x.strokeRect(cx[0]-45, 120, 90, 120); x.setLineDash([6,6]); x.beginPath(); x.moveTo(cx[0]-45, 180); x.lineTo(cx[0]+45, 180); x.stroke(); x.setLineDash([]);
  x.beginPath(); x.moveTo(cx[1]-50, 230); x.lineTo(cx[1]+50, 230); x.lineTo(cx[1]+50, 190); x.lineTo(cx[1], 130); x.lineTo(cx[1]-50, 190); x.closePath(); x.stroke();
  x.fillStyle = '#F4EFE4'; x.beginPath(); x.moveTo(cx[2]-60, 200); x.lineTo(cx[2]+60, 200); x.lineTo(cx[2]+38, 238); x.lineTo(cx[2]-38, 238); x.closePath(); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(cx[2]-30, 200); x.lineTo(cx[2], 140); x.lineTo(cx[2]+30, 200); x.closePath(); x.fill(); x.stroke();
  x.fillStyle = '#D8382A'; x.fillRect(cx[2]-52, 206, 104, 6);
  x.fillStyle = '#3B2E2A'; x.font = '44px "Patrick Hand", cursive'; for(const k of [0, 1]) x.fillText('→', (cx[k] + cx[k+1])/2, 196);
  x.font = '24px "Patrick Hand", cursive'; x.fillText('Bống, 6 tuổi', W - 110, H - 44);
}
// the star lantern Bống gives Tò at the end
const starH = new THREE.Group(); starH.position.set(.2, .5, .1); heldG.add(starH); starH.visible = false;
ZONE = '0';
(function(){ const m = mesh(starH, STAR_GEO, '#E8442E', {ow:.04}); m.scale.setScalar(.7); m.position.y = 1.6;
  rod(starH, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1.3, 0), .03, '#C99A52', {outline:false}); })();

// ================= per-frame level logic =================
LV.update = (dt, t)=>{
  if(bongLineT > 0) bongLineT -= dt; if(meLineT > 0) meLineT -= dt;
  // night: from giờ Tý to the end of the level
  nightK += Math.max(-dt*.5, Math.min(dt*.5, nightWant - nightK)); NIGHT.k = nightK*.92;
  LV.lantern = nightK*.9;
  // room 1: water pours from the pipe along the gutter into the ditch
  waterMat.opacity += ((waterOn ? .75 : 0) - waterMat.opacity)*Math.min(1, dt*3);
  gush.visible = gutterW.visible = fall.visible = waterMat.opacity > .02;
  spout.visible = gateOpen && waterMat.opacity > .02 && chC.level < chC.want - .05;
  // Bống: asleep with her head down; awake she bounces; she runs ahead out of sight to the yard and then the bến
  const want = P.x > 118 ? 2 : P.x > 40 ? 1 : 0;
  if(bongAwake && want !== bongAt && dist(bong) > 14){ bongAt = want; const q = BONG_AT[want]; bong.position.set(q[0], q[1], q[2]); bong.rotation.y = q[3]; }
  bongR.head.rotation.x = bongAwake ? Math.sin(t*3)*.06 : .4 + Math.sin(t*1.4)*.04;
  bongR.boat.visible = bongAt === 0;
  bong.position.y = BONG_AT[bongAt][1] + (bongAwake ? Math.abs(Math.sin(t*4))*.06 : 0);
  bongR.arms[1].rotation.z = bongAwake && bongLineT > 0 ? Math.sin(t*9)*.4 : 0;
  meR.head.rotation.x = meAwake ? 0 : .38 + Math.sin(t*1.2)*.04;
  if(meAwake){ meR.arms[0].rotation.z = -.9; meR.arms[1].rotation.z = .9; }
  // room 2: arriving at the dry ditch, crossing
  if(!metDry && P.x > 10.5 && !waterOn){ metDry = true; say('Rãnh khô cong. Sâu quá, không nhảy qua được.', 2.6); objective('Làm nước chảy lại'); }
  if(!crossedA && P.x > 26.2 && P.ground && P.y > -.1){ crossedA = true; sheetB.solved = true; colour('r2'); say('Qua rồi! Thuyền giấy chở được Tò!', 2.4); objective('Qua rãnh thứ hai'); }
  // room 3: the leak: spray from the crack until it is pasted over
  const leaking = !leakSlot.filled;
  for(const s of spray){ const k = (t*1.4 + s.ph) % 1; s.m.visible = leaking && Math.abs(camLook.x - 31) < 16; s.m.position.set(30.9 + (s.ph - .5)*.5 + k*.5, -1 + Math.sin(k*Math.PI)*.5 - k*1.2, -.3 + k*1.4); }
  if(crossedA && !metLeak && P.x > 28.5){ metLeak = true; say('Rãnh này nước cạn quá… nước rò đi đâu?', 2.6); objective('Bịt lỗ rò cho nước dâng'); }
  if(!crossedB && P.x > 42.2 && P.ground && P.y > -.1){ crossedB = true; sheetQ.solved = true; colour('r3'); objective('Mở cống cho nước vào âu'); say('Âu thuyền khô… sâu hơn nữa.', 2.4); }
  // the golden fish rides on its sill; nothing to animate but the bob
  fish.rotation.y = relicGot ? fish.rotation.y : Math.sin(t*1.3)*.3;
  // room 4: through the lock to the quay
  if(!metLock && P.x > 58.2 && P.y > 2.1){ metLock = true; colour('r4'); sheetG.solved = true; sheetH.solved = true; objective('Lên mái nhà, bóc tờ giờ Ngọ'); say('Lên bến rồi!', 1.6); }
    // room 5: the lanterns drop at midnight
  for(const L of lantSteps){ const gy = L.y + .9 + Math.sin(t*1.6 + L.x)*.05; const k = Math.min(1, nightK/.9); L.g.position.y = 9 + (gy - 9)*(k*k*(3 - 2*k)); L.glow.material.opacity = nightK*(.7 + Math.sin(t*3 + L.x)*.15); L.p.top = L.g.position.y - .9; }
  if(!metRoof && P.x > 62.2 && P.y > 3.5){ metRoof = true; say('Tờ lịch giờ trên tấm bảng… giờ Ngọ là giữa trưa.', 2.6); objective('Bóc tờ giờ Ngọ'); }
  // room 6: the radio and the tins
  if(!metLane && P.x > 79.4 && P.y < .5){ metLane = true; colour('r5'); say('Hẻm tối quá… cửa sắt đóng rồi.', 2.4); objective('Bóc tờ trên cái đài'); }
  for(let i=0;i<tins.length;i++){
    const c = tins[i];
    if(!c.hit && radioOn && P.vy > 0 && Math.abs(P.x - c.x) < .62 && P.y + P.h > c.y0 - .05 && P.y + P.h < c.y0 + .7){
      P.vy = -2; c.sw = 1;
      if(ORDER[tinStep] === i){ c.hit = true; tinStep++; say(['Chè đậu!', 'Bánh tiêu!', 'Bò bía!'][tinStep - 1], 1.2);
        if(tinStep === 3){ play([{dur:.6}, {dur:2.8, cam:[93, 2.4], start:()=>{ gateUp = .001; }}, {dur:0, start:()=>{ colour('r6'); say('Cửa sắt mở rồi!', 1.8); objective('Đi qua cửa sắt'); }}]); } }
      else { tinWrongT = .9; say('Cộc! Sai thứ tự rồi… nghe lại câu rao.', 2.2); }
    }
    c.sw *= Math.max(0, 1 - dt*1.6); c.g.rotation.z = Math.sin(t*9)*.25*c.sw;
  }
  if(tinWrongT > 0){ tinWrongT -= dt; if(tinWrongT <= 0){ tinStep = 0; for(const c of tins) c.hit = false; } }
  for(const c of tins) c.g.position.y = 5.6 + (c.hit ? .15 : 0);
  if(gateUp > 0 && gateUp < 1) gateUp = Math.min(1, gateUp + dt*.6);
  gate.position.y = 5.2*gateUp*gateUp;
  // room 7: Bống again, the plane through the bars
  if(!metYard && P.x > 96.2 && P.y < .5){ metYard = true;
    play([{dur:2.6, start:()=>bongSay('Tò ơi! Bống chạy tắt đường mương nè!', 2.8)},
      {dur:3.4, start:()=>bongSay('Cầu dao ở sau song sắt. Gấp máy bay mà phóng!', 3.4)},
      {dur:0, start:()=>{ learned.push('maybay'); say('Tò biết gấp máy bay rồi!', 2.2); objective('Phóng máy bay trúng cầu dao'); }}]); }
  if(barsUp > 0 && barsUp < 1) barsUp = Math.min(1, barsUp + dt*.6);
  bars2.position.y = 5.2*barsUp*barsUp;
  lever.rotation.z += ((lightsOn ? .5 : 2.6) - lever.rotation.z)*Math.min(1, dt*8);
  for(const L of lamps){ L.glow.material.opacity = lightsOn ? .55 + Math.sin(t*2 + L.bulb.position.x)*.06 : 0; L.bulb.material.color.set(lightsOn ? '#FFF2B0' : '#6E6A70'); }
  // room 8: ladder and bridge follow the days that show
  ladderK += Math.max(-dt*2, Math.min(dt*1.4, (sheetL.L === 1 ? 1 : 0) - ladderK)); if(ladderK < 0) ladderK = 0;
  ladder.visible = ladderK > .01; ladder.scale.y = Math.max(.01, ladderK);
  if(!metStacks && P.x > 108.4 && P.y < .5){ metStacks = true; colour('r7'); say('Hai chồng lịch… đứng gần thì thấy ngày bên dưới.', 2.8); objective('Tìm ngày có cái thang'); }
  const bw = sheetS.L === 2 ? 1 : 0; if(bridgeOut > 0 || bw) bridgeOut += Math.max(-dt*1.2, Math.min(dt*.9, bw - bridgeOut));
  bamboo.visible = bridgeOut > .002; bamboo.scale.x = Math.max(.001, 1 - Math.pow(1 - Math.max(0, bridgeOut), 3));
  if(!metShed && P.x > 128.8 && P.y > 3.9){ metShed = true; say('Sang bên này rồi. Nghe tiếng nước… bến đò!', 2.4); objective('Xuống bến tìm mẹ Bống'); }
  if(!metBen && P.x > 141 && P.y < .5){ metBen = true; colour('r8'); say('Mẹ Bống ngủ trên ghe… có tờ lịch dán trên vách bến.', 2.6); objective('Bóc tờ lịch trên vách bến'); }
};
// the breaker: a plane through the bars hits it
target({x:105.15, y:2.05, r:.9, onHit:()=>{
  lightsOn = true; say('Trúng rồi! Đèn sáng!', 2);
  play([{dur:.4}, {dur:2.8, cam:[104, 3], start:()=>{ barsUp = .001; }}, {dur:0, start:()=>{ colour('r7'); objective('Đi qua song sắt'); }}]);
}});
LV.hint = ()=>{
  if(!sheetP.done) return 'Rãnh khô thì thuyền không đi được. Ống nước trên tường bị dán xám: bóc nó ra.';
  if(!bongAwake) return 'Bóc tờ lịch trên cửa nhà Bống, ngay sau lưng Bống.';
  if(!crossedA) return held.on ? (held.form === 'thuyen' ? 'Đứng sát bờ rãnh, bấm E để thả thuyền, rồi bước lên thuyền mà đi.' : 'Bấm Q để gấp tờ lịch thành thuyền.') : 'Lấy thêm giấy trên cửa nhà Bống để gấp thuyền.';
  if(!crossedB) return !leakSlot.filled ? 'Nước rò qua vết nứt dưới rãnh. Lấy giấy trên vách, đứng ở bờ, bấm E để dán bịt ô viền chấm.' : 'Lấy thêm tờ nữa, gấp thuyền (Q), thả xuống (E) rồi đi qua.';
  if(!metLock) return !gateOpen ? 'Âu khô quá. Bóc tờ dán trên miệng cống ở tường, nước sẽ vào.' : 'Lấy giấy ở vách trái, gấp thuyền (Q), thả xuống âu (E). Đứng trên thuyền, nước dâng thì nhảy lên bến.';
  if(nightK < .9) return P.y < 3.4 ? 'Nhảy lên mái nhà bên phải.' : 'Tấm bảng có tờ giờ Ngọ. Đứng gần thì thấy lờ mờ giờ Tý bên dưới.';
  if(P.x < 79) return 'Nhảy qua ba chiếc đèn lồng xuống hẻm.';
  if(tinStep < 3) return !radioOn ? 'Cái đài trên bậu cửa sổ bị dán xám. Bóc ra nghe nó rao gì.' : 'Nhảy cụng đầu vào ba cái lon theo đúng thứ tự câu rao: chè, bánh tiêu, bò bía.';
  if(!lightsOn) return held.on ? (held.form === 'maybay' ? 'Đứng quay về phía song sắt, bấm E để phóng máy bay vào cầu dao.' : 'Bấm Q để gấp thành máy bay.') : 'Lấy tờ giấy trên vách, gấp máy bay (Q).';
  if(P.y < 3.9 && P.x < 118.6) return sheetL.L !== 1 ? (sheetL.L >= 2 ? 'Bóc quá tay rồi. Đứng gần, bấm R để dán lại tờ 7.' : 'Chồng lịch dưới đất: ngày nào có cái thang?') : 'Leo thang lên ban công.';
  if(P.x < 128.6) return sheetS.L !== 2 ? (sheetS.L >= 3 ? 'Bóc quá tay rồi. Bấm R để dán lại.' : 'Chồng lịch trên ban công: bóc sâu tới ngày có cầu tre.') : 'Đi cầu tre qua kênh. Nhảy lên lấy đom đóm.';
  return fliesGot < 5 ? 'Xuống bến, bóc tờ lịch trên vách cạnh ghe. Đom đóm còn sót thì thử trên mui ghe.' : 'Xuống bến, bóc tờ lịch trên vách cạnh ghe.';
};
LV.winText = ()=>({
  h:'Xong màn 2!',
  p:'Bống và mẹ đã tỉnh, con hẻm sáng đèn. Con tò he thứ hai trên khay của bà Năm lấy lại màu vàng.',
  memory:(fliesGot === 5
    ? '<b>Ký ức mở khoá.</b> Hồi mẹ Bống bằng Bống bây giờ, mẹ được bà Năm nặn cho con cá vàng, đứng ngắm cả buổi trước sạp. Mẹ hứa với mình: sau này có con, Rằm nào cũng dẫn ra hàng bà.'
    : 'Còn ' + (5 - fliesGot) + ' con đom đóm chưa tìm thấy. Tìm đủ 5 con để mở trọn ký ức của mẹ Bống.')
    + '<br>' + (relicGot ? '<b>Tò he cũ:</b> con cá vàng của mẹ Bống, cất trong lon trên bậu cửa tiệm cá kiểng. Phải đứng trên thuyền mới nhảy tới.' : 'Có một con tò he cũ trên một bậu cửa sổ sát rãnh nước. Từ bờ thì không tới được.'),
  next:'Tiếp theo · Màn 3: Tháp đồng hồ. Cầm đèn ông sao của Bống, leo lên tháp.'
});

// ================= intro: the alley at sunset, Bống asleep by the dry ditch =================
LV.intro = {end:12, sheetsAt:9,
  caps:[[0.5, 4.0, 'Hoàng hôn 14 tháng Tám. Tò rẽ vào con hẻm có rãnh nước.'],
        [4.3, 8.0, 'Bé Bống ngủ gục trên bậc cửa, tay còn ôm chiếc thuyền giấy. Rãnh khô cong.'],
        [8.3, 11.6, 'Mẹ Bống hứa Rằm này dẫn Bống ra hàng bà Năm. Rồi mẹ cũng quên.']],
  run(it, dt, t){
    for(const z of ROOMS.concat(['bong','me','sky'])) setZone(z, 0);
    const camX = it < 4 ? 30 - it*4 : Math.max(5, 14 - (it - 4)*2.2);
    camLook.lerp(tmpV.set(camX, 1.6, -1), Math.min(1, dt*2));
    camPos.lerp(tmpV.set(camX - 2.5, 4.8, 16), Math.min(1, dt*2));
    camera.position.copy(camPos); camera.lookAt(camLook);
    sun.position.set(camLook.x - 8, 18, 12); sun.target.position.set(camLook.x, 0, 0);
    toInner.rotation.y = .9;
  },
  done(){
    say('Bống ơi?… Ngủ mất rồi.', 2.2);
    objective('Làm nước chảy lại');
  }};
startGame();
