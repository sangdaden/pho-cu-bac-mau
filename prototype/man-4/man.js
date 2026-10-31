// ================= Màn 4 · Mưa phố (bản thử, mở đầu chương 2): three days after the full moon, the market street across the river, in the rain =================
// rooms (x): 1 bến chợ, quán nước -8..18 · 2 sân chợ, nón giấy 18..44 · 3 ô ông Bảy 44..59 · 4 mái nhà, tờ dọc che mưa 59..88 · 5 đám mây xám 88..102
// new here: rain wets Tò (he is rice dough) and washes his colour out; anything over his head keeps him dry
LV.level = 4;
LV.start = {x:-3.5, y:0};
LV.bounds = [-7.5, 101.5];
LV.cam = [0, 96];
LV.sky = ['r1','r2','r3','r4','r5'];
const ROOMS = ['r1','r2','r3','r4','r5'];
function zoneFor(x){ return x < 18 ? 'r1' : x < 44 ? 'r2' : x < 59 ? 'r3' : x < 88 ? 'r4' : 'r5'; }
const ROOF = 6.6;   // the rooftops of rooms 4 and 5
// grey is a wet slate sky; the colour that comes back is the clear gold of an evening after rain
SKY.g.top.set('#6F7784'); SKY.g.mid.set('#8C939D'); SKY.g.bot.set('#A6AAAF');
SKY.c.top.set('#3F7FC4'); SKY.c.mid.set('#9CCBE0'); SKY.c.bot.set('#FFD9A0');
LIGHT.fog.set('#B9C2C9'); LIGHT.sun.set('#FFE6BE');
LV.rain = (x, y)=> true;
// up on the roofs the camera rises with Tò so the long pages and the cloud stay in view
LV.camY = (x, y)=> y < 4.5 ? 2.8 + Math.max(0, y - 1)*.55 : y + 1.9;
LV.wetT = 2.8; LV.nonT = 7;
rain.k = 1;
TEX.tin = canvasTex(128, 64, (x,w,h)=>{
  x.fillStyle = '#F2F2F2'; x.fillRect(0,0,w,h);
  for(let i=0;i<16;i++){ const g = x.createLinearGradient(i*8,0,i*8+8,0); g.addColorStop(0,'rgba(0,0,0,.16)'); g.addColorStop(.5,'rgba(255,255,255,.12)'); g.addColorStop(1,'rgba(0,0,0,.16)'); x.fillStyle = g; x.fillRect(i*8,0,8,h); }
  speckle(x, w, h, 400, .06);
});
TEX.stripe = canvasTex(128, 64, (x,w,h)=>{ for(let i=0;i<8;i++){ x.fillStyle = i%2 ? '#FFFFFF' : '#C9C9C9'; x.fillRect(i*16, 0, 16, h); } speckle(x, w, h, 300, .05); });

// ================= ground: the wet street, then the rooftops =================
for(let a = -14; a < 59; a += 12){ const b = Math.min(59, a + 12); ZONE = zoneFor(a + .1);
  box(W, a, b, -2, 0, -6, 3, '#C9C3BA', {outline:false, uv:[3.2, 3.2], map:TEX.pave});
  box(W, a, b, -.02, .06, 2.6, 2.9, '#A8998A', {outline:false});
  box(W, a, b, -1.2, -.28, 3, 14, '#9A948E', {outline:false, uv:[4,4], map:TEX.road});
  box(W, a, b, -.28, 0, 2.95, 3.15, '#B6ABA0', {outline:false, uv:[2,1], map:TEX.stone}); }
// puddles that catch the light once the rain stops
const puddles = [];
for(const [x, z, s] of [[3, 1.4, 1.2], [14, .9, .9], [27, 1.8, 1.4], [36, .8, 1.0], [51, 1.6, 1.3], [62, 6, 2]]){
  if(x > 59) continue; ZONE = zoneFor(x);
  const m = mesh(W, new THREE.CircleGeometry(1, 24), '#8FB7D6', {pos:new THREE.Vector3(x, .015, z), rot:[-Math.PI/2, 0, 0], scl:[s*1.6, s*.7, 1], outline:false, shadow:false});
  puddles.push(m);
}
// safe spots are the dry ones: Tò goes back to the last shelter he stood under
for(const [x0, x1] of [[-14, 1], [18, 24], [42, 48]]) plat(x0, x1, 0, false, null, {safe:true});
plat(-14, 59, 0);
function house(x0, x1, h, c, o){
  o = o || {}; ZONE = zoneFor((x0 + x1)/2);
  box(W, x0, x1, -1, h, -4.2, -.5, c, Object.assign({}, WALL, {uv:[6, h + 1, 0, -1]}));
  box(W, x0 - .05, x1 + .05, h, h + .25, -4.4, -.3, '#C98B4A', {ow:.04});
  for(const x of [x0, x1]) box(W, x - .2, x + .2, 0, h, -.5, -.32, '#F4F1EA', {ow:.025});
  if(o.roof) roof(W, x0 - .3, x1 + .3, h + .25, -.15, 3.4, 1.5, o.roof);
}
// a downpipe pouring off a roof edge: a thin column of water
const spouts = [];
function spout(x, y, z, zone){
  ZONE = zone;
  const m = new THREE.Mesh(new THREE.CylinderGeometry(.07, .1, y, 8), new THREE.MeshBasicMaterial({color:'#CFE3F2', transparent:true, opacity:.55, depthWrite:false}));
  m.position.set(x, y/2, z); scene.add(m); spouts.push(m);
}

// ================= room 1 · Bến chợ: a covered doorway to start under, then the open street and a tea stall with its awning rolled up =================
house(-8, 1.6, 8.0, '#E8A598', {roof:'#B5513A'});
house(1.6, 9.4, 9.4, '#F1DDB0');
house(9.4, 18, 7.6, '#9FCBC1', {roof:'#B5513A'});
ZONE = 'r1';
// the doorway Tò starts under: a deep tiled hood over a shuttered shop
box(W, -7.6, 1.0, 3.3, 3.5, -.5, 2.2, '#B5513A', {ow:.03, uv:[2,2], map:TEX.tile});
for(const x of [-7.4, .8]) box(W, x - .1, x + .1, 0, 3.3, 1.95, 2.15, '#7A4E2D', {ow:.02});
box(W, -7.0, .4, 0, 3.0, -.5, -.47, '#3B4152', {outline:false});
for(let i=0;i<7;i++) box(W, -6.9, .3, .2+i*.4, .26+i*.4, -.47, -.44, '#6E655C', {outline:false});
sign(W, -6.4, -.2, 3.6, 4.5, -.5, '#2E8C86', '#F4F1EA', 'TẠP HOÁ', 'cô Út');
plat(-7.6, 1.0, 3.3);
spout(1.05, 3.3, 2.15, 'r1');
win(W, -4.8, 5.0, 1.5, 2.0, -.5, '#F4F1EA', '#2E8C86'); win(W, -1.4, 5.0, 1.5, 2.0, -.5, '#F4F1EA', '#2E8C86');
balcony(W, -6.6, .8, 4.95, -.5, 1.0, '#E9DCC8', '#2E8C86');
hoaGiay(W, -.4, 1.4, 8.0, -.2, 3.0);
crate(-5.6, 1.2, .8, '#E9C46A', 0); stool(-2.8, 1.4, '#C23A28', 0);
// the tea stall: a low table, stools, two poles in front and the grey awning rolled up against the wall
win(W, 3.8, 5.4, 1.4, 1.8, -.5, '#F4F1EA', '#C23A28', {flower:'#F2C230'}); win(W, 7.2, 5.4, 1.4, 1.8, -.5, '#F4F1EA', '#C23A28');
balcony(W, 2.6, 8.4, 5.2, -.5, .9, '#E9DCC8', '#2A2630');
sign(W, 2.4, 4.6, 2.6, 3.3, -.5, '#F2C230', '#C23A28', 'TRÀ ĐÁ');
for(const x of [4.6, 11.6]) rod(W, new THREE.Vector3(x, 0, 1.7), new THREE.Vector3(x, 3.15, 1.7), .07, '#8A7D6F');
box(W, 7.2, 9.6, .55, .65, .2, 1.3, '#A27650', {ow:.025}); for(const x of [7.4, 9.4]) box(W, x - .05, x + .05, 0, .55, .3, 1.2, '#7A4E2D', {outline:false});
mesh(W, new THREE.SphereGeometry(.22, 12, 8), '#4E9A4A', {pos:new THREE.Vector3(8.0, .82, .7), scl:[1, .85, 1]});
for(const x of [6.6, 10.2]) stool(x, .9, '#2F6FB5', 0);
xeDap(14.6, 1.6, .2);
powerPole(16.8, 2.4);
ZONE = 'r1';
const bat = new THREE.Group(); bat.position.set(8.1, 3.6, -.45); scene.add(bat);
const batRoll = mesh(bat, new THREE.CylinderGeometry(.28, .28, 7.2, 14), '#4C7FB8', {rot:[0, 0, Math.PI/2], ow:.03});
const batSheet = new THREE.Group(); bat.add(batSheet); batSheet.rotation.x = .19;
mesh(batSheet, new THREE.BoxGeometry(7.2, .05, 1), '#4C7FB8', {pos:new THREE.Vector3(0, 0, .5), ow:.03, uv:[1, 1], map:TEX.stripe});
batSheet.scale.z = .01;
let batOpen = 0;
const batPlat = plat(4.6, 11.6, 3.2, true, ()=>batOpen > .7);

// ================= room 2 · Sân chợ: a tin awning with a page on its post, then the open market yard =================
house(18, 26, 8.6, '#D9A07A', {roof:'#B5513A'});
house(26, 35, 7.4, '#C7B8E0');
house(35, 44, 8.8, '#E9C46A', {roof:'#B5513A'});
ZONE = 'r2';
mesh(W, new THREE.BoxGeometry(6.4, .08, 2.8), '#7FA6B8', {pos:new THREE.Vector3(21, 3.72, .9), rot:[.12, 0, 0], uv:[2, 1], map:TEX.tin, ow:.03});
for(const x of [18.2, 23.8]) box(W, x - .08, x + .08, 0, 3.6, 2.15, 2.3, '#8A7D6F', {ow:.02});
plat(18, 24, 3.6);
spout(24.0, 3.6, 2.3, 'r2');
sign(W, 18.6, 23.4, 4.2, 5.0, -.5, '#C23A28', '#F2C230', 'CHỢ BẾN', 'sáng chiều');
for(let i=0;i<5;i++) mesh(W, new THREE.ConeGeometry(.42, .3, 16), '#E9D9B0', {pos:new THREE.Vector3(18.9 + i*.5, 2.5 - (i%2)*.12, -.25), rot:[.9, 0, 0]});
win(W, 20.4, 5.6, 1.4, 1.8, -.5, '#F4F1EA', '#2E8C86', {flower:'#F06BAE'}); win(W, 29.0, 5.0, 1.4, 1.8, -.5, '#F4F1EA', '#8E6CC0'); win(W, 32.4, 5.0, 1.4, 1.8, -.5, '#F4F1EA', '#8E6CC0');
win(W, 38.0, 5.4, 1.4, 1.8, -.5, '#F4F1EA', '#C23A28'); win(W, 41.4, 5.4, 1.4, 1.8, -.5, '#F4F1EA', '#C23A28');
balcony(W, 36.6, 42.8, 5.2, -.5, .9, '#E9DCC8', '#2A2630');
hoaGiay(W, 34.0, 35.4, 7.4, -.2, 2.4);
// stalls and crates left out in the rain: Tò has to hop over them
box(W, 28, 29.6, 0, .95, -.3, 1.5, '#A27650', {ow:.03, uv:[.8,.8], map:TEX.wood}); block(28, 29.6, -1, 1.0);
for(let i=0;i<5;i++) mesh(W, new THREE.SphereGeometry(.2, 10, 8), ['#E8442E','#7DBB4B','#F2C230'][i%3], {pos:new THREE.Vector3(28.3 + i*.28, 1.1, .4 + (i%2)*.3)});
crate(33.8, .6, 1.3, '#E9C46A', 0); crate(33.8, .6, 1.0, '#9FCBC1', .9); block(33.1, 34.5, -1, 1.7);
box(W, 37.4, 38.8, 0, .85, -.2, 1.4, '#7A4E2D', {ow:.03, uv:[.8,.8], map:TEX.wood}); block(37.4, 38.8, -1, .9);
for(let i=0;i<4;i++) mesh(W, new THREE.CylinderGeometry(.22, .18, .22, 12), '#4E9A4A', {pos:new THREE.Vector3(37.7 + i*.32, .98, .6)});
xeMay(25.4, 2.0, '#2F6FB5', .3); xeMay(40.6, 2.2, '#C23A28', -.2);
powerPole(31, 2.4);

// ================= room 3 · Ô ông Bảy: a market hall to shelter under, then the old umbrella mender's corner =================
house(44, 52, 7.8, '#9FCBC1', {roof:'#B5513A'});
house(52, 59, 8.6, '#E8A598');
ZONE = 'r3';
roof(W, 41.8, 48.2, 3.6, 2.4, 2.9, .9, '#B5513A');
for(const x of [42.1, 47.9]) box(W, x - .1, x + .1, 0, 3.6, 2.1, 2.3, '#7A4E2D', {ow:.02});
plat(42, 48, 3.6);
spout(48.2, 3.6, 2.4, 'r3');
for(let i=0;i<4;i++) crate(43.2 + i*1.2, 1.0, .75, ['#7DBB4B','#E9C46A','#E8442E','#9FCBC1'][i], 0);
sign(W, 49.2, 51.6, 2.6, 3.4, -.5, '#4C7FB8', '#F4F1EA', 'SỬA Ô', 'ông Bảy');
// a balcony up to the left: a quiet place to hide something
balcony(W, 46.4, 49.4, 6.8, -.5, 1.0, '#E9DCC8', '#2E8C86');
plat(46.4, 49.4, 6.8);
win(W, 47.9, 7.0, 1.4, 1.8, -.5, '#F4F1EA', '#2E8C86');
win(W, 54.6, 5.4, 1.4, 1.8, -.5, '#F4F1EA', '#C23A28', {flower:'#F2C230'});
// the toolbox under the hole, Tò's step up to patch it
box(W, 54.9, 56.1, 0, .85, .1, 1.1, '#5E4630', {ow:.03, uv:[.8,.8], map:TEX.wood}); box(W, 55.3, 55.7, .85, 1.0, .4, .8, '#2A2630', {outline:false});
block(54.9, 56.1, -1, .9);
for(let i=0;i<4;i++) mesh(W, new THREE.ConeGeometry(.16, 1.5, 8), ['#2A2630','#C23A28','#2F6FB5','#2A2630'][i], {pos:new THREE.Vector3(50.0 + i*.3, .75, -.3), rot:[0, 0, .08 - i*.04]});
// ông Bảy's big umbrella: furled and grey until its page comes off; then it opens over the corner, with a hole in it
const OX = 55.5, OY = 3.4;
rod(W, new THREE.Vector3(OX, 0, .4), new THREE.Vector3(OX, OY, .4), .07, '#5E4630');
const ombr = new THREE.Group(); ombr.position.set(OX, OY, .4); scene.add(ombr);
ZONE = 'r3';
for(let i=0;i<8;i++){
  const m = new THREE.Mesh(new THREE.SphereGeometry(3.1, 6, 6, i*Math.PI/4, Math.PI/4, 0, Math.PI*.42), toon(i%2 ? '#F4EFE4' : '#C23A28'));
  m.material.side = THREE.DoubleSide; m.castShadow = true; outline(m, .03); m.scale.y = .42; m.position.y = -.4; ombr.add(m);
}
mesh(ombr, new THREE.ConeGeometry(.1, .5, 8), '#5E4630', {pos:new THREE.Vector3(0, .95, 0)});
const hole = new THREE.Mesh(new THREE.CircleGeometry(.5, 16), new THREE.MeshBasicMaterial({color:'#141019'}));
hole.position.set(0, .9, 0); hole.rotation.x = -Math.PI/2; ombr.add(hole);
const leak = new THREE.Mesh(new THREE.CylinderGeometry(.08, .14, 2.4, 8), new THREE.MeshBasicMaterial({color:'#CFE3F2', transparent:true, opacity:0, depthWrite:false}));
leak.position.set(OX, 2.1, .4); scene.add(leak);
let ombrOpen = 0, patched = false;
const bounceOn = ()=> patched;
const canopy = [[52.6, 54.8], [56.2, 58.4]].map(([a, b])=>plat(a, b, 3.6, true, ()=>ombrOpen > .7, {bounce:17}));
for(const c of canopy) c.bounce = 0;
const holePlat = plat(54.8, 56.2, 3.6, true, ()=>patched, {bounce:17});

// ================= rooms 4 and 5 · the rooftops: buildings to bounce up onto, high walls with long pages, a gap, a low grey cloud =================
const TOPS = [[59, 70, '#E9C46A'], [70, 80, '#9FCBC1'], [82.5, 92, '#E8A598'], [92, 102, '#F1DDB0']];
for(const [x0, x1, c] of TOPS){ ZONE = zoneFor((x0 + x1)/2);
  box(W, x0, x1, -1, ROOF, -3.5, 2.6, c, Object.assign({}, WALL, {uv:[6, 8, 0, -1]}));
  box(W, x0 - .05, x1 + .05, ROOF - .1, ROOF + .05, -3.6, 2.7, '#B8A58E', {ow:.03, uv:[2,1], map:TEX.stone});
  box(W, x0, x1, ROOF, ROOF + .4, 2.4, 2.65, '#E9DCC8', {ow:.025});
  for(let x = x0 + 1.6; x < x1 - .8; x += 3.2){ win(W, x, 1.0, 1.3, 1.8, 2.6, '#F4F1EA', ['#2E8C86','#C23A28','#8E6CC0'][Math.floor(x)%3]); win(W, x, 3.9, 1.3, 1.6, 2.6, '#F4F1EA', '#2E8C86'); }
  // the storey above, set back: the wall the long pages hang on
  box(W, x0 + .3, x1 - .3, ROOF, ROOF + 5.2, -4.4, -.5, ['#F1DDB0','#E8A598','#D9A07A','#C7B8E0'][Math.floor(x0)%4], Object.assign({}, WALL, {uv:[6, 6]}));
  box(W, x0 + .1, x1 - .1, ROOF + 5.2, ROOF + 5.45, -4.6, -.3, '#C98B4A', {ow:.04});
}
block(59, 80, -1, ROOF); block(82.5, 102, -1, ROOF);
hazard(80, 82.5, ROOF - 1.2, 'Hụt chân rồi!');
ZONE = 'r4';
// a water tank on legs: the first dry spot up here
for(const x of [59.5, 62.5]) for(const z of [-.4, 1.4]) rod(W, new THREE.Vector3(x, ROOF, z), new THREE.Vector3(x, 9.6, z), .07, '#8A7D6F');
box(W, 59.2, 62.8, 9.5, 9.65, -.6, 1.6, '#8A7D6F', {ow:.02});
mesh(W, new THREE.CylinderGeometry(1.0, 1.0, 3.4, 18), '#D8DCE0', {pos:new THREE.Vector3(61, 10.6, .5), rot:[0, 0, Math.PI/2], ow:.04});
plat(59.2, 62.8, 9.6); plat(59, 63, ROOF, false, null, {safe:true});
// the upper storeys: shuttered windows, an air conditioner, a sign, washing left out, flowers spilling over
for(const [x, c] of [[66.4, '#2E8C86'], [73.6, '#C23A28'], [84.6, '#8E6CC0'], [101.0, '#2E8C86']]){ ZONE = zoneFor(x); win(W, x, ROOF + 1.6, 1.3, 1.6, -.5, '#F4F1EA', c, {flower:x%2 ? '#F06BAE' : '#F2C230'}); }
ZONE = 'r4';
box(W, 72.6, 74.4, ROOF + 3.4, ROOF + 4.2, -.5, .1, '#E9E2D6', {ow:.03}); for(let i=0;i<5;i++) box(W, 72.75, 74.25, ROOF + 3.5 + i*.13, ROOF + 3.55 + i*.13, .1, .12, '#8A8178', {outline:false});
sign(W, 81.0, 86.0, ROOF + 3.4, ROOF + 4.3, -.5, '#2F6FB5', '#F4F1EA', 'NHÀ TRỌ', 'phòng sạch');
hoaGiay(W, 64.2, 66.0, ROOF + 5.2, -.2, 2.2); hoaGiay(W, 86.4, 87.6, ROOF + 5.2, -.2, 2.0);
for(let k=0;k<4;k++) box(W, 72.3 + k*1.9, 73.1 + k*1.9, ROOF + 1.9, ROOF + 2.58, 1.78, 1.82, ['#E8442E','#F4F1EA','#2F6FB5','#F2C230'][k], {ow:.012});
for(let i=0;i<5;i++) plant(W, 63.8 + i*.6, ROOF, 1.6, .7, i%2 ? 'hoa' : 'la');
ZONE = 'r4';
mesh(W, new THREE.CylinderGeometry(.5, .5, 1.2, 12), '#2F6FB5', {pos:new THREE.Vector3(74.5, ROOF + .6, -1.6)});
rod(W, new THREE.Vector3(71.8, ROOF + 2.6, 1.8), new THREE.Vector3(79.6, ROOF + 2.6, 1.8), .012, '#2A2530', {outline:false});
spout(80.0, ROOF, 2.6, 'r4');
// room 5: a little attic with a tiled roof, then the cloud
ZONE = 'r5';
box(W, 88, 91.6, ROOF, 9.8, -2.4, -.5, '#D9A07A', Object.assign({}, WALL, {uv:[3, 3]}));
roof(W, 87.7, 91.9, 9.8, 1.6, 2.2, .7, '#B5513A');
for(const x of [88.1, 91.5]) box(W, x - .08, x + .08, ROOF, 9.8, 1.3, 1.45, '#7A4E2D', {ow:.02});
plat(87.8, 91.8, 9.8); plat(88, 91.6, ROOF, false, null, {safe:true});
for(let i=0;i<3;i++) mesh(W, new THREE.ConeGeometry(.42, .3, 16), '#E9D9B0', {pos:new THREE.Vector3(90.6, 7.0 + i*.3, -.4), rot:[.9, 0, 0]});
const cloudG = new THREE.Group(); cloudG.position.set(96.5, 12.4, -1.4); scene.add(cloudG);
for(const [x, y, s] of [[-3.6, 0, 1.6], [-1.6, .7, 2.2], [.6, .9, 2.4], [2.8, .4, 2.0], [4.4, -.2, 1.4], [0, -.4, 2.6]]) blob(cloudG, new THREE.Vector3(x, y, 0), [s, s*.8, s*.72], '#8E98A4', {ow:.05});

// ================= background =================
midRow(-16, 106, zoneFor, {zf:-5.4});
farRow(-24, 130);
clouds(-40, 150); hills(-40, 150);
// after the rain: a rainbow over the river
ZONE = 'sky';
const rainbow = new THREE.Group(); rainbow.position.set(60, -6, -70); scene.add(rainbow);
['#E8442E','#F28C28','#F2C230','#7DBB4B','#3FA7C9','#4C6FB8','#8E6CC0'].forEach((c, i)=>{
  const m = new THREE.Mesh(new THREE.TorusGeometry(46 - i*1.4, .75, 6, 64, Math.PI), new THREE.MeshBasicMaterial({color:c, transparent:true, opacity:0, depthWrite:false, fog:false}));
  rainbow.add(m); });
moteSpan(-10, 30);

// ================= sheets =================
const awnPic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.4)'; x.lineWidth = 4; x.beginPath(); x.moveTo(cw*.15, ch*.4); x.lineTo(cw*.85, ch*.3); x.lineTo(cw*.85, ch*.4); x.lineTo(cw*.15, ch*.5); x.closePath(); x.stroke();
  for(const p of [.2, .8]){ x.beginPath(); x.moveTo(cw*p, ch*.45); x.lineTo(cw*p, ch*.9); x.stroke(); } };
const nonPic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.42)'; x.lineWidth = 4; x.beginPath(); x.moveTo(cw*.15, ch*.72); x.lineTo(cw*.5, ch*.38); x.lineTo(cw*.85, ch*.72); x.closePath(); x.stroke();
  x.beginPath(); x.moveTo(cw*.3, ch*.72); x.quadraticCurveTo(cw*.5, ch*.86, cw*.7, ch*.72); x.stroke(); };
const umbPic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.4)'; x.lineWidth = 4; x.beginPath(); x.arc(cw*.5, ch*.55, cw*.32, Math.PI, 0); x.closePath(); x.stroke();
  x.beginPath(); x.moveTo(cw*.5, ch*.55); x.lineTo(cw*.5, ch*.88); x.arc(cw*.44, ch*.88, cw*.06, 0, Math.PI); x.stroke(); };
const cloudPic = (x, cw, ch)=>{ x.fillStyle = 'rgba(70,60,50,.18)'; for(const [a, b, r] of [[.3,.45,.14],[.5,.38,.18],[.7,.46,.13]]){ x.beginPath(); x.arc(cw*a, ch*b, cw*r, 0, Math.PI*2); x.fill(); }
  x.strokeStyle = 'rgba(70,60,50,.3)'; x.lineWidth = 3; for(let i=0;i<9;i++){ x.beginPath(); x.moveTo(cw*(.22 + i*.07), ch*.62); x.lineTo(cw*(.2 + i*.07), ch*.78); x.stroke(); } };
const sheetB = sheet({id:'B', x0:5.0, x1:6.6, y0:.4, y1:2.4, z:-.44, layers:[{n:'17', pic:awnPic}], onLayer:()=>peeledAwning()});
const sheetN = sheet({id:'N', x0:20.2, x1:22.0, y0:.35, y1:2.3, z:-.44, carry:true, respawn:true, layers:[{n:'17', pic:nonPic}], onLayer:()=>peeledNon()});
const sheetU = sheet({id:'U', x0:52.3, x1:53.9, y0:.4, y1:2.4, z:-.44, layers:[{n:'17', pic:umbPic}], onLayer:()=>peeledUmbrella()});
const sheetP = sheet({id:'P', x0:44.8, x1:46.4, y0:.4, y1:2.2, z:-.44, carry:true, respawn:true, layers:[{n:'17'}]});
const holeSlot = slot({x0:54.9, x1:56.1, y0:3.05, y1:3.5, z:1.2, onPaste:()=>patchedHole()});
const sheetV1 = sheet({id:'V', x0:68.4, x1:71.6, y0:ROOF + 1.0, y1:ROOF + 4.2, z:-.45, dir:'y', layers:[{n:'16'}]});
const sheetV2 = sheet({id:'W', x0:75.8, x1:79.0, y0:ROOF + 1.0, y1:ROOF + 4.2, z:-.45, dir:'y', layers:[{n:'16'}]});
const sheetC = sheet({id:'C', x0:88.6, x1:90.2, y0:ROOF + .4, y1:ROOF + 2.2, z:-.44, carry:true, respawn:true, layers:[{n:'17'}]});
const sheetS = sheet({id:'S', x0:93.0, x1:100.0, y0:ROOF + .5, y1:ROOF + 4.3, z:-.5, layers:[{n:'17', pic:cloudPic}], onLayer:()=>peeledCloud()});
sheetP.solved = sheetC.solved = true;

// ================= characters =================
// ông Bảy: a thin old umbrella mender on a low stool, white beard, round glasses, a brown áo bà ba
function buildBay(g){
  const AO = '#8A5A3B', QU = '#2E2A30', SK = '#D9A57C', HAIR = '#F1EEE8';
  for(const s of [-1,1]){
    blob(g, new THREE.Vector3(s*.3, .95, .3), [.22, .48, .2], QU);
    blob(g, new THREE.Vector3(s*.32, .45, .72), [.19, .19, .4], QU);
    blob(g, new THREE.Vector3(s*.32, .08, .82), [.2, .28, .1], '#5E4630');
  }
  const body = blob(g, new THREE.Vector3(0, 1.7, 0), [.68, .58, .78], AO);
  for(let i=0;i<3;i++) blob(g, new THREE.Vector3(.08, 1.95 - i*.28, .57), .05, '#F1EEE8', {small:true});
  const arms = [];
  for(const s of [-1,1]){ const a = new THREE.Group(); a.position.set(s*.66, 2.15, .05); g.add(a);
    blob(a, new THREE.Vector3(s*.1, -.32, .1), [.18, .18, .46], AO, {rot:[-.5, 0, s*.3]}); blob(a, new THREE.Vector3(s*.16, -.6, .5), .16, SK); arms.push(a); }
  const head = new THREE.Group(); head.position.set(0, 0, 0); g.add(head);
  blob(head, new THREE.Vector3(0, 3.0, 0), [.6, .58, .64], SK);
  for(const s of [-1,1]) blob(head, new THREE.Vector3(s*.5, 3.08, -.12), [.16, .26, .22], HAIR);
  blob(head, new THREE.Vector3(0, 2.55, .32), [.36, .26, .34], HAIR);
  eyes(head, 0, 3.1, .5, .17, .2, .3, .22);
  for(const s of [-1,1]){
    mesh(head, new THREE.TorusGeometry(.2, .025, 6, 18), '#2A2630', {pos:new THREE.Vector3(s*.22, 3.1, .6), outline:false});
    blob(head, new THREE.Vector3(s*.22, 3.36, .55), [.17, .06, .05], HAIR, {small:true, rot:[0, 0, s*-.25]});
  }
  mesh(head, new THREE.BoxGeometry(.16, .025, .025), '#2A2630', {pos:new THREE.Vector3(0, 3.12, .62), outline:false});
  blob(head, new THREE.Vector3(0, 2.86, .6), [.11, .1, .1], '#C98E68', {ow:.025});
  return {head, body, arms};
}
ZONE = 'bay';
const bay = new THREE.Group(); bay.position.set(57.4, .5, .7); bay.rotation.y = -.35; bay.scale.setScalar(S*1.0); scene.add(bay); const bayR = buildBay(bay);
ZONE = 'r3'; stool(57.4, .7, '#7A4E2D', 0);
// the hidden old tò he: a little buffalo on the balcony, ông Bảy's
ZONE = 'keep';
const buffalo = new THREE.Group(); scene.add(buffalo); buffalo.scale.setScalar(.42);
(function(){ const C = '#3E3A44';
  blob(buffalo, new THREE.Vector3(0, .9, 0), [.9, .5, .55], C, {keep:true});
  blob(buffalo, new THREE.Vector3(.95, 1.05, 0), [.38, .32, .34], C, {keep:true});
  for(const s of [-1,1]) mesh(buffalo, new THREE.TorusGeometry(.26, .06, 6, 12, Math.PI), '#E9E2D6', {pos:new THREE.Vector3(1.0, 1.35, s*.18), rot:[0, Math.PI/2, 0], keep:true});
  for(const [x, z] of [[-.55,-.25],[-.55,.25],[.55,-.25],[.55,.25]]) blob(buffalo, new THREE.Vector3(x, .3, z), [.13, .13, .3], C, {keep:true});
  blob(buffalo, new THREE.Vector3(1.08, 1.12, .3), [.08, .05, .08], '#FFFFFF', {small:true, keep:true});
})();
buffalo.position.set(47.2, 6.8, .1);
relic(buffalo, 47.2, 6.8, 'Con trâu nhỏ của ông Bảy');
firefly(14.6, 1.7);
firefly(33.8, 3.3);
firefly(48.8, 8.2);
firefly(70.0, 9.6, ()=>sheetV1.p > .5);
firefly(85.4, 9.0);
for(const z of ROOMS.concat(['bay','sky'])) setZone(z, 0);

// ================= bubbles =================
const dist = o => Math.abs(P.x - o.position.x) + Math.abs(P.y - o.position.y)*.5;
const lines = {};
function npcSay(k, t, d){ lines[k] = {t, d}; }
function npcTalk(obj, k, dy, idle){ talker(obj, dy, ()=>{ const l = lines[k]; if(l && l.d > 0) return l.t; return idle ? idle() : ''; }); }
npcTalk(bay, 'bay', 2.2, ()=>{
  if(toSayT > 0 || busy() || P.won || dist(bay) > 6) return '';
  if(!bayAwake) return Math.sin(nowT*.8) > 0 ? '…ô thủng thì vá…' : '…ngày thủng thì…';
  if(!patched) return 'Dột! Lấy tờ lịch vá giùm ông.';
  return '';
});
talker(bay, 2.1, ()=> !bayAwake && dist(bay) > 6 ? 'z z z' : '', 'zzz');

// ================= story beats =================
let metRain = false, metYard = false, metBay = false, metRoof = false, metCloud = false, wetOnce = false, bayAwake = false, stopping = false, rainbowK = 0;
function peeledAwning(){
  sheetB.solved = true; batOpen = .001; say('Tấm bạt bung ra!', 1.6);
  play([{dur:2.2, cam:[10, 2.6]}, {dur:0, start:()=>{ colour('r1'); objective('Chạy từ mái này sang mái khác'); }}]);
}
function peeledNon(){
  if(learned.includes('non')){ return; }
  play([{dur:.8, start:()=>say('Mặt sau có hình vẽ…', 1.4)},
    {dur:4.6, start:()=>memo(drawNonFold), end:memoOff},
    {dur:0, start:()=>{ learned.unshift('non'); held.form = null; sheetN.solved = true; say('Tò biết gấp nón rồi! Bấm Q.', 2.6); objective('Gấp nón giấy, đội nón qua sân chợ'); }}]);
}
function peeledUmbrella(){
  sheetU.solved = true; ombrOpen = .001; say('Cái ô bung ra!', 1.6);
  play([{dur:1.6, cam:[55.5, 3.0]},
    {dur:2.4, start:()=>{ bayAwake = true; colour('bay'); npcSay('bay', 'Ơ… ô của ông mở rồi hả?', 2.4); }},
    {dur:2.6, start:()=>npcSay('bay', 'Thủng một lỗ, dột ngay hộp đồ nghề…', 2.6)},
    {dur:0, start:()=>objective('Lấy tờ lịch vá lỗ thủng trên ô')}]);
}
function patchedHole(){
  patched = true; for(const c of canopy) c.bounce = 17; colour('r3', .7);
  play([{dur:2.4, start:()=>npcSay('bay', 'Kín rồi! Căng như mặt trống.', 2.4)},
    {dur:2.8, start:()=>npcSay('bay', 'Trèo lên mà nhún, lên mái nhà được đó con.', 2.8)},
    {dur:0, start:()=>objective('Nhảy lên mặt ô, nhún lên mái nhà')}]);
}
function peeledCloud(){
  sheetS.solved = true; stopping = true; objective('Mưa tạnh rồi!');
  finish([
    {dur:2.6, cam:[96, 10.4, 20], start:()=>say('Mây tan rồi…', 2)},
    {dur:4.0, cam:[60, 9, 46], start:()=>{ bars(true); caption('Mưa tạnh. Nắng chiều trải khắp chợ bên sông.'); for(const z of ROOMS) colour(z); rainbowK = .001; }, end:()=>caption('')},
    {dur:3.0, cam:[56.5, 2.8, 14], start:()=>{ colour('bay'); npcSay('bay', 'Tạnh rồi! Cảm ơn con nghe.', 2.6); }},
    {dur:4.8, cam:[56.5, 2.8, 14], start:()=>memo(drawBayMemory), end:memoOff},
    {dur:3.0, cam:[56.5, 2.8, 14], start:()=>npcSay('bay', 'Ô thủng thì vá. Ngày bị quên thì… có con bóc giùm.', 3)},
    {dur:.6, end:()=>bars(false)}]);
}
function drawNonFold(x, W, H){
  x.fillStyle = '#F6EBD9'; x.fillRect(20, 20, W-40, H-40); x.strokeStyle = '#141019'; x.lineWidth = 3; x.strokeRect(20, 20, W-40, H-40);
  x.fillStyle = '#3B2E2A'; x.font = '30px "Patrick Hand", cursive'; x.textAlign = 'center';
  x.fillText('Đi mưa thì đội nón vào con!', W/2, 64);
  x.lineWidth = 4; x.strokeStyle = '#B87333';
  x.strokeRect(50, 130, 96, 96); x.setLineDash([6, 5]); x.beginPath(); x.moveTo(50, 226); x.lineTo(146, 130); x.stroke(); x.setLineDash([]);
  x.beginPath(); x.moveTo(205, 226); x.lineTo(301, 226); x.lineTo(205, 130); x.closePath(); x.stroke();
  x.fillStyle = '#F4EFE4'; x.beginPath(); x.moveTo(360, 236); x.lineTo(410, 140); x.lineTo(460 - 20, 236); x.closePath(); x.fill(); x.stroke();
  x.beginPath(); x.ellipse(400, 236, 44, 10, 0, 0, Math.PI*2); x.stroke();
  x.fillStyle = '#3B2E2A'; x.font = '44px "Patrick Hand", cursive'; x.fillText('→', 176, 194); x.fillText('→', 332, 194);
  x.font = '24px "Patrick Hand", cursive'; x.fillText('chữ bà Năm', W - 100, H - 44);
}
function drawBayMemory(x, W, H){
  x.fillStyle = '#F6EBD9'; x.fillRect(20, 20, W-40, H-40); x.strokeStyle = '#141019'; x.lineWidth = 3; x.strokeRect(20, 20, W-40, H-40);
  x.fillStyle = '#3B2E2A'; x.font = '28px "Patrick Hand", cursive'; x.textAlign = 'center';
  x.fillText('Mùa mưa năm 1992, chợ bên sông', W/2, 62);
  x.strokeStyle = '#7A4E2D'; x.lineWidth = 4;
  for(let i=0;i<3;i++){ const cx = 130 + i*110; x.beginPath(); x.arc(cx, 190, 48, Math.PI, 0); x.closePath(); x.stroke(); x.beginPath(); x.moveTo(cx, 190); x.lineTo(cx, 262); x.stroke(); }
  x.strokeStyle = 'rgba(80,110,140,.5)'; x.lineWidth = 2; for(let i=0;i<16;i++){ const a = 60 + (i*47)%360, b = 90 + (i*31)%60; x.beginPath(); x.moveTo(a, b); x.lineTo(a - 4, b + 14); x.stroke(); }
  x.fillStyle = '#3B2E2A'; x.font = '24px "Patrick Hand", cursive'; x.fillText('“Ông vá ô cho cả chợ, chẳng lấy tiền ai.”', W/2, 312);
}

// ================= per-frame level logic =================
LV.update = (dt, t)=>{
  for(const k in lines) if(lines[k].d > 0) lines[k].d -= dt;
  // the rain eases off once the cloud's page is gone
  if(stopping) rain.k = Math.max(0, rain.k - dt*.45);
  for(const s of spouts) s.material.opacity = .55*rain.k;
  for(const m of puddles) m.material.color.setRGB(.56 + .3*(1 - rain.k), .72 + .2*(1 - rain.k), .84 + .1*(1 - rain.k));
  if(rainbowK > 0) rainbowK = Math.min(1, rainbowK + dt*.35);
  for(const m of rainbow.children) m.material.opacity = rainbowK*.55;
  cloudG.position.y = 12.4 + (stopping ? (1 - rain.k)*10 : Math.sin(t*.6)*.15);
  // room 1: the awning unrolls over the stall
  if(batOpen > 0 && batOpen < 1) batOpen = Math.min(1, batOpen + dt*1.4);
  batSheet.scale.z = Math.max(.01, batOpen*2.15); batRoll.position.z = batOpen*2.1; batRoll.position.y = -batOpen*.4;
  // room 3: the umbrella opens; until it is patched the hole lets the rain through onto the toolbox
  if(ombrOpen > 0 && ombrOpen < 1) ombrOpen = Math.min(1, ombrOpen + dt*1.2);
  const o = Math.max(.12, ombrOpen); ombr.scale.set(o, 1 + (1 - o)*2.2, o); ombr.position.y = OY - (1 - o)*.9;
  hole.visible = !patched && ombrOpen > .5; leak.material.opacity = !patched && ombrOpen > .5 ? .5*rain.k : 0;
  bayR.head.rotation.x = bayAwake ? Math.sin(t*1.3)*.04 : .35 + Math.sin(t*1.2)*.04;
  bay.position.y = .5;
  // first time the rain gets to him: say what it does
  if(!wetOnce && rain.wet > .3){ wetOnce = true; say('Mưa! Tò là bột gạo, ướt là nhũn ra…', 2.6); }
  if(!metRain && P.x > 2){ metRain = true; objective('Bóc tờ lịch ở quán trà đá'); }
  if(!metYard && P.x > 18.5){ metYard = true; colour('r1'); say('Sân chợ trống trơn, chẳng có mái nào…', 2.6); objective('Bóc tờ lịch trên cột mái tôn'); }
  if(!metBay && P.x > 42.5){ metBay = true; colour('r2'); say('Bên kia có ông cụ ngủ cạnh cái ô to.', 2.4); objective('Bóc tờ lịch trên biển SỬA Ô'); }
  if(!metRoof && P.y > ROOF - .2 && P.x > 59){ metRoof = true; colour('r3'); say('Lên mái rồi! Mà mưa to quá…', 2.4); objective('Kéo tờ lịch dọc lên làm mái che'); }
  if(!metCloud && P.x > 88.2 && P.y > ROOF - .2){ metCloud = true; colour('r4'); say('Đám mây xám dán đầy tờ lịch!', 2.6); objective('Đội nón, bóc tờ lịch dưới đám mây'); }
};
LV.hint = ()=>{
  if(P.x < 18) return !sheetB.done ? 'Đường dài quá, đi mưa sẽ nhũn. Bóc tờ lịch dưới tấm bạt cuộn ở quán trà đá.' : 'Đứng dưới mái hay tấm bạt thì khô lại. Chạy từng đoạn ngắn.';
  if(P.x < 42) return !learned.includes('non') ? 'Bóc tờ lịch trên cột mái tôn, xem mặt sau.' : held.on ? (held.form === 'non' ? 'Đội nón rồi, chạy qua sân chợ. Nón giấy chỉ chịu được một lúc.' : 'Bấm Q cho tới khi gấp thành nón.') : 'Lấy tờ lịch trên cột để gấp nón.';
  if(P.y < ROOF - .5){
    if(!sheetU.done) return 'Bóc tờ lịch trên biển SỬA Ô.';
    if(!patched) return held.on ? (held.form ? 'Bấm Q để mở tờ lịch ra, rồi đứng lên hộp đồ nghề dưới lỗ thủng, bấm E để dán.' : 'Đứng lên hộp đồ nghề dưới lỗ thủng, bấm E để dán.') : 'Lấy tờ lịch trên tường dưới mái chợ, mang ra vá lỗ thủng.';
    return 'Từ hộp đồ nghề nhảy lên mặt ô, nhún rồi sang phải lên mái nhà.';
  }
  if(P.x < 88) return 'Nắm mép dưới tờ lịch dọc, đi lùi để kéo lên trên đầu, bấm E buông. Mép giấy thành mái che.';
  if(!sheetS.done) return held.on && held.form === 'non' ? 'Đội nón rồi. Nắm mép tờ lịch dưới đám mây, đi lùi để bóc.' : 'Bóc dưới mưa lâu lắm. Lấy tờ lịch trong gác, gấp nón rồi hẵng ra.';
  return '';
};
LV.winText = ()=>({
  h:'Mưa tạnh rồi!',
  p:'Chợ bên sông có màu trở lại. Ông Bảy lại ngồi vá ô dưới mái hiên.',
  memory:(fliesGot === 5
    ? '<b>Ký ức mở khoá.</b> Mùa mưa năm 1992, ông Bảy vá ô cho cả chợ, chẳng lấy tiền ai. Bà Năm nặn tặng ông con trâu nhỏ, bảo: “Ông giữ cho chợ khỏi ướt, tui giữ cho ông khỏi buồn.”'
    : 'Còn ' + (5 - fliesGot) + ' con đom đóm ở Màn 4 chưa tìm thấy.')
    + (relicGot ? '<br><b>Tìm được con trâu nhỏ của ông Bảy.</b>' : '<br>Có một con tò he cũ giấu trên ban công chợ.'),
  next:'Chương 2 còn tiếp · đây là bản thử cơ chế mưa'
});

// ================= intro: rain over the market across the river =================
LV.intro = {end:12, sheetsAt:9,
  caps:[[0.5, 4.0, 'Rằm qua được ba hôm. Trời đổ cơn mưa đầu mùa.'],
        [4.3, 8.0, 'Gió đêm Rằm thổi những tờ lịch bóc rồi bay qua sông, dán kín chợ bên kia.'],
        [8.3, 11.6, 'Tò là bột gạo. Dính mưa lâu là nhũn ra, bạc cả màu.']],
  run(it, dt, t){
    for(const z of ROOMS.concat(['bay','sky'])) setZone(z, 0);
    const camX = it < 4 ? 40 - it*4 : it < 8 ? 90 - (it - 4)*4 : Math.max(-2, 12 - (it - 8)*4);
    const camY = it >= 4 && it < 8 ? 10 : 2.6;
    camLook.lerp(tmpV.set(camX, camY, -1), Math.min(1, dt*2));
    camPos.lerp(tmpV.set(camX - 2.5, camY + 2.6, it >= 4 && it < 8 ? 26 : 17), Math.min(1, dt*2));
    camera.position.copy(camPos); camera.lookAt(camLook);
    sun.position.set(camLook.x - 8, 18, 12); sun.target.position.set(camLook.x, 0, 0);
    toInner.rotation.y = .9;
  },
  done(){
    learned.push('thuyen', 'maybay', 'quat');
    say('Mưa to quá… đi từ mái này sang mái khác thôi.', 2.6);
    objective('Qua chợ bên sông, đừng để ướt nhũn');
  }};
startGame();
