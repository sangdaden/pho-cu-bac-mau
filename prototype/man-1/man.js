// ================= Màn 1 · Mái hiên: nine rooms along one street, from bà Năm's stall to the grey tò he across the canal =================
// rooms (x): 1 sạp bà Năm -6..12 · 2 ống xối 12..24 · 3 ban công bà Ba 24..38 · 4 gờ hẹp gió 38..48 · 5 mái tôn Lũ Bụi 48..64
//            6 bồn nước, mèo, thang 64..82 · 7 xe chè cô Hai 82..97 · 8 chồng lịch, sào phơi 97..116 · 9 con tò he xám 116..134
LV.level = 1;
LV.start = {x:1.6, y:0};
LV.nextUrl = '../man-2/';
LV.bounds = [-5.5, 133.5];
LV.cam = [4, 129];
LV.sky = ['r1','r2','r3','r4','r5','r6','r7','r8','r9','r9'];
const ROOMS = ['r1','r2','r3','r4','r5','r6','r7','r8','r9'];
function zoneFor(x){ return x < 12 ? 'r1' : x < 24 ? 'r2' : x < 38 ? 'r3' : x < 48 ? 'r4' : x < 64 ? 'r5' : x < 82.5 ? 'r6' : x < 106 ? 'r7' : x < 116 ? 'r8' : 'r9'; }
TEX.tin = canvasTex(128, 64, (x,w,h)=>{
  x.fillStyle = '#F2F2F2'; x.fillRect(0,0,w,h);
  for(let i=0;i<16;i++){ const g = x.createLinearGradient(i*8,0,i*8+8,0); g.addColorStop(0,'rgba(0,0,0,.16)'); g.addColorStop(.5,'rgba(255,255,255,.12)'); g.addColorStop(1,'rgba(0,0,0,.16)'); x.fillStyle = g; x.fillRect(i*8,0,8,h); }
  for(let i=0;i<5;i++) soft(x, trnd()*w, trnd()*h, 6+trnd()*10, .12);
  speckle(x, w, h, 400, .06);
});

// ================= ground: street, canal, road in front =================
ZONE = 'r1';
for(const [x0,x1] of [[-14,12],[12,24],[24,38]]){ ZONE = zoneFor(x0+.1); box(W, x0, x1, -2, 0, -6, 3, '#D9D0C4', {outline:false, uv:[3.2, 3.2], map:TEX.pave}); box(W, x0, x1, -.02, .06, 1.4, 1.7, '#B8A58E', {outline:false}); }
for(const [x0,x1] of [[80.5,96],[96,106]]){ ZONE = zoneFor(x0+.1); box(W, x0, x1, -2, 0, -6, 3, '#D9D0C4', {outline:false, uv:[3.2, 3.2], map:TEX.pave}); box(W, x0, x1, -.02, .06, 1.4, 1.7, '#B8A58E', {outline:false}); }
plat(-14, 38, 0, false, null, {safe:true});
plat(80.5, 106, 0, false, null, {safe:true});
// two canals: the long one under the roofs of rooms 4-6, and the one room 8's pole crosses
for(const [x0,x1] of [[38,80.5],[106,116]]){
  ZONE = zoneFor(x0+1); box(W, x0, x1, -2.2, -.5, -6, 3, '#4FB7D2', {outline:false, uv:[7, 7], map:TEX.water});
  box(W, x0-.4, x0+.1, -2, .05, -6, 3, '#9C8F80', {ow:.04, uv:[2,1], map:TEX.stone});
  ZONE = zoneFor(x1+.2); box(W, x1-.1, x1+.4, -2, .05, -6, 3, '#9C8F80', {ow:.04, uv:[2,1], map:TEX.stone});
  hazard(x0, x1, -.6, 'Á! Nước! Tò sợ nước lắm!');
}
for(const [x0,x1] of [[-14,12],[12,24],[24,38],[38,48],[48,64],[64,80.5],[80.5,106],[106,116],[116,136]]){
  ZONE = zoneFor(x0+.1);
  box(W, x0, x1, -1.2, -.28, 3, 14, '#A9A097', {outline:false, uv:[4,4], map:TEX.road});
  const canal = (x0 >= 38 && x1 <= 80.5) || (x0 >= 106 && x1 <= 116);
  if(!canal){ box(W, x0, x1, -.28, 0, 2.95, 3.15, '#C2B6A8', {outline:false, uv:[2,1], map:TEX.stone}); box(W, x0, x1, -.3, -.24, 3.15, 3.5, '#8E857B', {outline:false}); }
  else {
    box(W, x0, x1, -2, .12, 2.6, 3.3, '#9C8F80', {ow:.04, uv:[2,1], map:TEX.stone});
    for(let x = x0+1; x < x1-.5; x += 2.2) box(W, x, x+.22, .12, 1.0, 2.85, 3.05, '#6E655C', {ow:.02});
    box(W, x0+.5, x1-.5, .9, 1.0, 2.85, 3.05, '#6E655C', {ow:.02});
    for(let x = x0+1.6; x < x1-1; x += 2.2) for(let i=0;i<5;i++) box(W, x+i*.36, x+i*.36+.05, .12, .9, 2.92, 2.98, '#6E655C', {outline:false});
  }
}
for(let x=-12; x<134; x+=4){ ZONE = zoneFor(x); box(W, x, x+2, -.27, -.26, 7.4, 7.6, '#E9E2D6', {outline:false, shadow:false}); }
for(let x=-11; x<106; x+=1.3 + trnd()*1.6){ if(x > 38 && x < 80.5) continue; ZONE = zoneFor(x); tuft(W, x, 0, trnd()<.5 ? -.3 : 2.85, .8 + trnd()*.5); }
for(let i=0;i<110;i++){ const x = -11 + trnd()*145; const canal = (x > 38 && x < 80.5) || (x > 106 && x < 116); ZONE = zoneFor(x);
  mesh(W, new THREE.CircleGeometry(.09, 5), ['#E8A41A','#C98B4A','#7DBB4B'][i%3], {pos:new THREE.Vector3(x, canal ? -.25 : .02, canal ? 4 + trnd()*4 : -.3 + trnd()*7), rot:[-Math.PI/2, 0, trnd()*3], outline:false, shadow:false}); }
// lotus pads, reeds and a paper boat on the canals
for(const [x,z,r] of [[40,1.2,.55],[41.4,.2,.4],[44.6,1.8,.5],[51,1.5,.6],[54,-.1,.45],[58.5,1.6,.5],[62,1.2,.4],[66.5,1.9,.55],[75.5,1.3,.6],[77.8,.3,.45],[108,1.4,.5],[111,.6,.6],[114,1.7,.45]]){
  ZONE = zoneFor(x); mesh(W, new THREE.CylinderGeometry(r, r, .05, 14, 1, false, .3, Math.PI*2-.6), '#5FAF55', {pos:new THREE.Vector3(x, -.47, z), ow:.02, shadow:false});
  if(r > .5) leaf(W, new THREE.Vector3(x+.1, -.3, z), [.16,.2,.16], '#F28AB8', {ow:.02});
}
for(const x of [38.4, 38.9, 79.5, 80, 106.4, 115.4]) { ZONE = zoneFor(x); for(let i=0;i<5;i++) mesh(W, new THREE.ConeGeometry(.05, 1 + trnd()*.8, 4), i%2 ? '#6FAE4E' : '#8CC152', {pos:new THREE.Vector3(x + (trnd()-.5)*.4, -.1, 1.2 + i*.3), rot:[0,0,(trnd()-.5)*.3], outline:false, shadow:false}); }
ZONE = 'r6';
(function(){ const g = new THREE.Group(); g.position.set(72, -.42, 1.8); g.rotation.y = .5; W.add(g);
  const sh = new THREE.Shape(); sh.moveTo(-.6,0); sh.lineTo(.6,0); sh.lineTo(.4,.28); sh.lineTo(-.4,.28); sh.closePath();
  mesh(g, new THREE.ExtrudeGeometry(sh, {depth:.4, bevelEnabled:false}), '#F2ECE1', {pos:new THREE.Vector3(0,0,-.2), ow:.02});
  mesh(g, new THREE.ConeGeometry(.3, .5, 4), '#F2ECE1', {pos:new THREE.Vector3(0,.5,0), ow:.02}); })();

// ================= room 1 · Sạp bà Năm: bà's tò he shop (pink) and the shuttered shop under sheet A (cream) =================
ZONE = 'r1';
box(W, -6, 3.6, 0, 8.3, -4, -0.5, '#E8A598', WALL);
box(W, 3.6, 12, 0, 10.6, -4, -0.5, '#F1DDB0', WALL);
for(const [a,b,h] of [[-6,3.6,8.3],[3.6,12,10.6]]) box(W, a, b, h, h+.25, -4.2, -0.3, '#C98B4A', {ow:.04});
for(const x of [-6, 3.6, 12]) box(W, x-.22, x+.22, 0, x===-6 ? 8.3 : 10.6, -0.5, -0.32, '#F4F1EA', {ow:.025});
box(W, 3.6, 12, 3.75, 3.95, -0.5, -0.34, '#E9C46A', {ow:.025});
box(W, 3.6, 12, 7.05, 7.25, -0.5, -0.34, '#E9C46A', {ow:.025});
box(W, -5.2, 2.6, 0, 3.2, -0.5, -0.47, '#4A3A30', {outline:false});
for(const [a,b] of [[-5.6,-4.9],[2.3,3.0]]) box(W, a, b, 0, 3.2, -0.48, -0.3, '#A27650', {ow:.025, uv:[2,2], map:TEX.wood});
for(const y of [1.1, 2.1]) box(W, -4.6, 1.9, y, y+.08, -0.47, -0.2, '#A27650', {outline:false});
for(let i=0;i<14;i++){ const y = i<7 ? 1.18 : 2.18, x = -4.3 + (i%7)*.9; mesh(W, new THREE.CylinderGeometry(.16,.18,.36,10), ['#E8442E','#F2C230','#2E9C93','#E9E2D6','#4C7FB8'][i%5], {pos:new THREE.Vector3(x, y+.18, -.33), ow:.02}); }
box(W, -5.4, 2.8, 3.25, 3.5, -0.5, -0.1, '#7A4E2D', {ow:.025});
sign(W, -3.6, 1.6, 3.6, 4.55, -0.5, '#C23A28', '#F2C230', 'TÒ HE', 'bà Năm · số 14');
(function(){
  const x = -3.3, z = .5;
  rod(W, new THREE.Vector3(x, 0, z), new THREE.Vector3(x, 1.5, z), .06, '#C99A52');
  mesh(W, new THREE.CylinderGeometry(.3,.24,.65,12), '#D9B26A', {pos:new THREE.Vector3(x, 1.65, z)});
  for(let i=0;i<9;i++){ const a = i/9*Math.PI*2, tip = new THREE.Vector3(x + Math.cos(a)*.6, 2.1 + (i%3)*.2, z + Math.sin(a)*.45);
    rod(W, new THREE.Vector3(x, 1.65, z), tip, .015, '#C99A52', {outline:false});
    leaf(W, tip, [.12,.1,.15], ['#C23A28','#E8A41A','#2E9C93','#E8442E','#7DBB4B'][i%5], {ow:.02});
    leaf(W, tip.clone().add(new THREE.Vector3(0,.16,0)), .08, '#F3D7B4', {ow:.015}); }
})();
win(W, -2.8, 4.95, 1.5, 2.2, -0.5, '#F4F1EA', '#2E8C86', {ledge:false, grille:false});
win(W, 1.1, 4.95, 1.5, 2.2, -0.5, '#F4F1EA', '#2E8C86', {ledge:false, grille:false});
balcony(W, -5.4, 3.0, 4.95, -0.5, 1.15, '#E9DCC8', '#2E8C86');
roof(W, -6.3, 3.9, 8.45, -0.15, 3.4, 1.6, '#B5513A');
hoaGiay(W, 1.6, 3.5, 8.3, -0.2, 3.6);
hoaGiay(W, -5.8, -4.6, 8.3, -0.2, 1.6, '#F06BAE');
sign(W, 8.4, 11.7, 4.15, 5.1, -0.5, '#2F6FB5', '#F4F1EA', 'TẠP HOÁ');
win(W, 5.4, 5.0, 1.3, 1.6, -0.5, '#F4F1EA', '#4E9A4A', {flower:'#F2C230'});
win(W, 10.0, 5.6, 1.3, 1.6, -0.5, '#F4F1EA', '#4E9A4A');
box(W, 6.35, 7.25, 6.4, 7.0, -0.5, -0.1, '#E9E2D6', {ow:.03});
for(let i=0;i<4;i++) box(W, 6.45, 7.15, 6.48+i*.13, 6.52+i*.13, -0.1, -0.07, '#A8A096', {outline:false});
win(W, 7.8, 7.9, 1.6, 2.0, -0.5, '#F4F1EA', '#C23A28', {ledge:false});
balcony(W, 4.2, 11.4, 7.6, -0.5, .8, '#E9DCC8', '#2A2630', {pots:false});
for(let i=0;i<5;i++) box(W, 5 + i*1.2, 5.8 + i*1.2, 8.1, 8.9, -0.25, -0.2, ['#E8442E','#F4F1EA','#9FCBC1','#F2C230','#E8A598'][i], {ow:.015});
rod(W, new THREE.Vector3(4.6, 8.95, -.22), new THREE.Vector3(11, 8.95, -.22), .015, '#2A2630', {outline:false});
mesh(W, new THREE.CylinderGeometry(.6,.6,1.4,14), '#2F6FB5', {pos:new THREE.Vector3(10.3, 11.55, -2.4)});
mesh(W, new THREE.CylinderGeometry(.62,.62,.12,14), '#E9E2D6', {pos:new THREE.Vector3(10.3, 12.3, -2.4)});
plant(W, 6.8, 10.85, -1.4, .9, 'hoa'); plant(W, 8, 10.85, -1.2, .8);
box(W, 4.0, 10.8, 0, 3.4, -0.55, -0.45, '#2E8C86', {ow:.03});
for(let i=0;i<8;i++) box(W, 4.2, 10.6, .25+i*.4, .3+i*.4, -0.45, -0.42, '#246F6A', {outline:false});
for(const [x,c] of [[4.6,'#E8442E'],[6.2,'#F2C230'],[9.0,'#E8442E'],[10.3,'#9FCBC1']]){ mesh(W, new THREE.CylinderGeometry(.3,.24,.5,12), '#B5513A', {pos:new THREE.Vector3(x,.25,-.1)}); leaf(W, new THREE.Vector3(x,.75,-.1), [.38,.3,.32], '#4E9A4A'); leaf(W, new THREE.Vector3(x+.1,1.0,.05), .12, c, {ow:.02}); }
rod(W, new THREE.Vector3(7.5, 6.2, -.5), new THREE.Vector3(7.5, 6.2, -.15), .04, '#2A2630', {outline:false});
const star = new THREE.Group(); star.position.set(7.5, 4.6, -0.2); scene.add(star);
mesh(star, STAR_GEO, '#E8442E', {pos:new THREE.Vector3(0,0,-.12)});
rod(star, new THREE.Vector3(0,.7,0), new THREE.Vector3(0,1.6,0), .02, '#141019', {outline:false});
sign(W, -6.4, -1.0, 9.2, 10.1, 1.0, '#C23A28', '#F2C230', 'Vui Tết Trung thu');
rod(W, new THREE.Vector3(-8, 9.1, 3.4), new THREE.Vector3(-6.4, 9.65, 1.05), .015, '#2A2530', {outline:false});

// ================= room 2 · Ống xối: a downpipe sealed by a grey page, a pile of boxes too tall to jump =================
ZONE = 'r2';
box(W, 12, 18, 0, 9.2, -4, -0.5, '#F1E0C5', WALL);
box(W, 18, 24, 0, 8.4, -4, -0.5, '#E8A598', WALL);
for(const [a,b,h] of [[12,18,9.2],[18,24,8.4]]) box(W, a, b, h, h+.25, -4.2, -0.3, '#C98B4A', {ow:.04});
for(const x of [18, 24]) box(W, x-.2, x+.2, 0, x===18 ? 9.2 : 8.4, -0.5, -0.32, '#F4F1EA', {ow:.025});
box(W, 12.3, 15.2, 0, 3.0, -0.5, -0.47, '#4A3A30', {outline:false});
for(let i=0;i<7;i++) box(W, 12.4, 15.1, .2+i*.4, .26+i*.4, -0.47, -0.44, '#6E655C', {outline:false});
sign(W, 12.4, 15.2, 3.15, 3.95, -0.5, '#4E9A4A', '#F4F1EA', 'TIỆM MAY');
win(W, 14, 5.2, 1.4, 1.8, -0.5, '#F4F1EA', '#C23A28');
win(W, 16.6, 6.6, 1.0, 1.4, -0.5, '#F4F1EA', '#C23A28', {pot:false});
balcony(W, 18.6, 23.4, 4.9, -0.5, .9, '#E9DCC8', '#2A2630');
win(W, 21, 4.95, 1.6, 2.1, -0.5, '#F4F1EA', '#2F6FB5', {ledge:false, grille:false});
win(W, 21, 7.0, 1.2, 1.0, -0.5, '#F4F1EA', '#2F6FB5', {ledge:false});
hoaGiay(W, 22.4, 23.6, 8.3, -0.2, 2.4);
box(W, 18.5, 23.6, 0, 3.6, -0.5, -0.47, '#3B4152', {outline:false});
for(let i=0;i<8;i++) box(W, 18.6, 23.5, .2+i*.42, .26+i*.42, -0.47, -0.44, '#5B6172', {outline:false});
// rooftop water tank and the tin downpipe: gutter, pipe down the wall, an elbow mouth just above the pavement
mesh(W, new THREE.CylinderGeometry(.75,.75,1.5,14), '#2F6FB5', {pos:new THREE.Vector3(16.6, 10.2, -2.4)});
mesh(W, new THREE.CylinderGeometry(.78,.78,.12,14), '#E9E2D6', {pos:new THREE.Vector3(16.6, 11.0, -2.4)});
for(const x of [15.9, 17.3]) box(W, x-.06, x+.06, 9.45, 9.5, -2.9, -1.9, '#6E655C', {outline:false});
box(W, 12, 18.2, 9.1, 9.3, -.35, -.15, '#A8B4B8', {ow:.02});
rod(W, new THREE.Vector3(17.0, 9.2, -.4), new THREE.Vector3(17.0, 1.0, -.4), .12, '#A8B4B8', {ow:.025});
for(let y = 1.8; y < 9; y += 1.6) box(W, 16.8, 17.2, y, y+.1, -.55, -.26, '#6E655C', {outline:false});
rod(W, new THREE.Vector3(17.0, 1.05, -.4), new THREE.Vector3(17.55, .62, -.4), .12, '#A8B4B8', {ow:.025});
mesh(W, new THREE.CylinderGeometry(.16,.16,.1,12), '#6E655C', {pos:new THREE.Vector3(17.62, .57, -.4), rot:[0,0,Math.PI/2+.7], outline:false});
// drain grate where the water runs off
ZONE = 'r2';
box(W, 23.2, 24.6, .01, .04, .4, 2.6, '#5E574F', {outline:false});
for(let i=0;i<8;i++) box(W, 23.3, 24.5, .04, .06, .5+i*.27, .58+i*.27, '#3A3530', {outline:false});
// the boxes: three, two, one, taped cardboard
const boxes = new THREE.Group(); scene.add(boxes);
const boxPile = [];
[[19.7,0,1.05],[20.75,0,1.05],[21.8,0,.95],[20.2,1.05,1.05],[21.3,1.05,1.0],[20.7,2.1,1.1]].forEach(([x,y,s],i)=>{
  const g = new THREE.Group(); g.position.set(x + s/2 - .05, y + s/2, -.15 + (i%2)*.12); g.rotation.y = (i%3-1)*.08; boxes.add(g);
  mesh(g, new THREE.BoxGeometry(s, s, s*.9), ['#C9A273','#B98D5C','#D2AE7E'][i%3], {ow:.03});
  mesh(g, new THREE.BoxGeometry(s*.18, s*1.01, s*.91), '#E9D29A', {outline:false});
  mesh(g, new THREE.PlaneGeometry(s*.5, s*.3), '#5E4630', {pos:new THREE.Vector3(0, -s*.15, s*.455), outline:false});
  boxPile.push({g, x0:g.position.clone(), r0:g.rotation.y, d:i*.12});
});
const boxBlock = block(19.6, 22.9, 0, 3.2, ()=>boxT < .25);
let boxT = 0, waterOn = 0;
// water: a falling stream from the pipe mouth, a sheet of water along the pavement, and splashes
const waterMat = new THREE.MeshBasicMaterial({map:TEX.water, color:'#9FDCEB', transparent:true, opacity:0, depthWrite:false});
const stream = new THREE.Mesh(new THREE.PlaneGeometry(.5, .9), waterMat); stream.position.set(17.9, .35, -.2); scene.add(stream);
const flood = new THREE.Mesh(new THREE.PlaneGeometry(6.8, 2.6), waterMat); flood.rotation.x = -Math.PI/2; flood.position.set(21.2, .04, .9); scene.add(flood);
const splash = []; for(let i=0;i<24;i++){ const m = new THREE.Mesh(SPH_S, new THREE.MeshBasicMaterial({color:'#D8F2F8', transparent:true, opacity:0})); m.scale.setScalar(.07 + Math.random()*.07); scene.add(m); splash.push({m, ph:Math.random()}); }

// ================= room 3 · Ban công bà Ba: a tall plain wall, a vertical page, a balcony above =================
ZONE = 'r3';
box(W, 24, 38, 0, 10.4, -4, -0.5, '#7FC4B8', WALL);
box(W, 24, 38, 10.4, 10.65, -4.2, -0.3, '#C98B4A', {ow:.04});
for(const x of [24, 38]) box(W, x-.2, x+.2, 0, 10.4, -0.5, -0.32, '#F4F1EA', {ow:.025});
box(W, 24, 38, 0, .5, -0.5, -0.38, '#5E8F86', {outline:false});
box(W, 29.4, 33.0, 0, 3.0, -0.5, -0.47, '#4A3A30', {outline:false});
for(const [a,b] of [[29.0,29.5],[32.9,33.4]]) box(W, a, b, 0, 3.0, -0.48, -0.3, '#A27650', {ow:.025, uv:[2,2], map:TEX.wood});
sign(W, 29.3, 33.1, 3.2, 4.0, -0.5, '#F2C230', '#C23A28', 'NƯỚC MÍA', 'bà Ba');
win(W, 35.6, 1.0, 2.2, 1.9, -0.5, '#F4F1EA', '#C23A28', {flower:'#F06BAE'});
// stains and a vent on the plain stretch of wall, so it reads as "no way up" rather than empty
box(W, 25.0, 28.8, 9.0, 9.2, -0.5, -0.3, '#5E8F86', {ow:.02});
for(let i=0;i<3;i++) box(W, 26.2+i*.5, 26.5+i*.5, 7.4, 8.2, -0.5, -0.44, '#5E8F86', {outline:false});
balcony(W, 29, 38, 4.6, -0.5, 1.15, '#E9DCC8', '#2E8C86', {pots:false});
plat(29, 38.05, 4.6, true, null, {safe:true});
win(W, 31.4, 5.0, 1.6, 2.3, -0.5, '#F4F1EA', '#2E8C86', {ledge:false, grille:false});
win(W, 36.4, 5.0, 1.3, 2.3, -0.5, '#F4F1EA', '#2E8C86', {ledge:false, grille:false});
win(W, 27, 7.6, 1.3, 1.5, -0.5, '#F4F1EA', '#C23A28');
roof(W, 23.7, 38.3, 10.65, -0.15, 3.6, 1.7, '#B5513A');
hoaGiay(W, 36.6, 37.9, 10.4, -0.2, 3.0);
// potted plants on the balcony
plant(W, 30.4, 4.6, -.25, .95, 'chuoi'); plant(W, 32.6, 4.6, -.2, 1.0, 'hoa'); plant(W, 37.2, 4.6, -.2, .85);
// lịch bloc: a tear-off calendar on a nail by the balcony door
box(W, 34.35, 35.65, 4.95, 6.4, -0.5, -0.44, '#C23A28', {ow:.02});
box(W, 34.35, 35.65, 6.15, 6.4, -0.44, -0.4, '#8C2A1E', {outline:false});
rod(W, new THREE.Vector3(35, 6.55, -.5), new THREE.Vector3(35, 6.55, -.3), .03, '#2A2630', {outline:false});
ZONE = 'r3';
// the old rooster tò he hides behind a pot on the neighbour's balcony: only a high ledge on bà Ba's wall gets Tò up there
ZONE = 'r2';
plat(18.6, 23.4, 4.9, true);
plant(W, 20.4, 4.9, .05, .9, 'chuoi');
const rooster = new THREE.Group(); rooster.position.set(19.5, 4.9, -.1); scene.add(rooster);
(function(g){
  rod(g, new THREE.Vector3(0,0,0), new THREE.Vector3(0,.5,0), .025, '#C99A52', {outline:false});
  blob(g, new THREE.Vector3(0,.68,0), [.2,.17,.15], '#D8382A', {ow:.02});
  blob(g, new THREE.Vector3(.16,.86,0), .1, '#D8382A', {ow:.02});
  for(const [dx,dy,c] of [[-.2,.82,'#2E9C93'],[-.26,.72,'#F2C230'],[-.22,.92,'#4E9A4A']]) blob(g, new THREE.Vector3(dx,dy,0), [.08,.14,.05], c, {ow:.015, rot:[0,0,.6]});
  blob(g, new THREE.Vector3(.18,.98,0), [.04,.06,.03], '#E8442E', {ow:.012});
  blob(g, new THREE.Vector3(.26,.86,0), [.05,.03,.03], '#F2C230', {ow:.012});
  blob(g, new THREE.Vector3(.2,.89,.07), .02, '#141019', {small:true});
})(rooster);
relic(rooster, 19.5, 4.9, 'Con gà trống của cô Hai');

// ================= room 4 · Gờ hẹp: a canal-side house, a narrow ledge, wind, and a washing line under a page =================
ZONE = 'r4';
box(W, 38, 48, -2, 10.6, -4.2, -0.5, '#F1DDB0', Object.assign({}, WALL, {uv:[6, 12.6, 0, -2]}));
box(W, 38, 48, 10.6, 10.85, -4.4, -0.3, '#C98B4A', {ow:.04});
box(W, 38, 48, -2, -.3, -0.5, -0.3, '#9C8F80', {ow:.03, uv:[2,1], map:TEX.stone});
box(W, 38, 48, 4.42, 4.6, -0.5, .42, '#C2B6A8', {ow:.03, uv:[2,1], map:TEX.stone});
for(let x = 38.6; x < 48; x += 1.6) box(W, x, x+.16, 3.8, 4.42, -0.5, .2, '#A39788', {ow:.02});
plat(38, 48.05, 4.6, true);
win(W, 40.2, 1.0, 1.4, 1.9, -0.5, '#F4F1EA', '#2F6FB5', {flower:'#F2C230'});
win(W, 45.6, 1.0, 1.4, 1.9, -0.5, '#F4F1EA', '#2F6FB5');
win(W, 42.9, 7.6, 1.5, 1.8, -0.5, '#F4F1EA', '#2F6FB5', {flower:'#F06BAE'});
box(W, 39.6, 41.4, 7.4, 8.4, -0.5, -0.1, '#E9E2D6', {ow:.03});
roof(W, 37.7, 48.3, 10.85, -0.15, 3.6, 1.6, '#B5513A');
// the washing line: hidden behind the page, swings out when it is peeled and becomes a handrail
const rail = new THREE.Group(); rail.position.set(0, 0, -.42); scene.add(rail);
for(const x of [39.6, 46.8]) box(rail, x-.07, x+.07, 4.6, 6.7, -.3, .36, '#6E655C', {ow:.02});
rod(rail, new THREE.Vector3(39.6, 5.5, .3), new THREE.Vector3(46.8, 5.5, .3), .05, '#C99A52', {ow:.02});
rod(rail, new THREE.Vector3(39.6, 6.6, -.25), new THREE.Vector3(46.8, 6.6, -.25), .02, '#2A2630', {outline:false});
for(let i=0;i<5;i++) mesh(rail, new THREE.BoxGeometry(.8, .75, .05), ['#E8442E','#F2C230','#9FCBC1','#F4F1EA','#E8A598'][i], {pos:new THREE.Vector3(40.6+i*1.3, 6.2, -.25), rot:[0,0,(i%2?.08:-.06)], ow:.02});
rail.visible = false;
let railOn = false, railT = 0;
const gust = wind(40.3, 48.6, 4.4, 9, -7.6, ()=>!railOn);
// wind streaks blowing left along the ledge
const streakMat = new THREE.MeshBasicMaterial({color:'#FFFFFF', transparent:true, opacity:0, depthWrite:false});
const streaks = []; for(let i=0;i<14;i++){ const m = new THREE.Mesh(new THREE.PlaneGeometry(1.4 + Math.random(), .05), streakMat); scene.add(m); streaks.push({m, y:4.9 + Math.random()*3, z:-.2 + Math.random()*1.2, ph:Math.random(), sp:.5 + Math.random()*.5}); }

// ================= room 5 · Mái tôn: two low houses with corrugated tin roofs; three Lũ Bụi asleep =================
ZONE = 'r5';
for(const [a,b,c] of [[48,56,'#E9C46A'],[56,64,'#9FCBC1']]){
  box(W, a, b, -2, 4.3, -4.2, -0.5, c, Object.assign({}, WALL, {uv:[6, 6.3, 0, -2]}));
  box(W, a-.05, b+.05, 4.3, 4.6, -4.4, .55, '#8FA9B3', {ow:.035, uv:[1.6, 2], map:TEX.tin});
  box(W, a, b, 4.1, 4.3, .4, .58, '#6E8590', {ow:.02});
  box(W, a, b, -2, -.3, -0.5, -0.3, '#9C8F80', {ow:.03, uv:[2,1], map:TEX.stone});
  win(W, a + 2.2, .8, 1.5, 1.8, -0.5, '#F4F1EA', c === '#E9C46A' ? '#C23A28' : '#2F6FB5');
  win(W, b - 2.2, .8, 1.5, 1.8, -0.5, '#F4F1EA', c === '#E9C46A' ? '#C23A28' : '#2F6FB5', {flower:'#F2C230'});
  // the next house up behind the roof, so the tin roof reads as a lower terrace
  box(W, a+.4, b-.4, 4.6, 9.2, -4.2, -2.8, c === '#E9C46A' ? '#E8A598' : '#F1E0C5', Object.assign({}, WALL));
  win(W, (a+b)/2, 6.2, 1.6, 1.8, -2.8, '#F4F1EA', '#4E9A4A');
  box(W, a+.2, b-.2, 9.2, 9.45, -4.4, -2.6, '#C98B4A', {ow:.04});
}
plat(48, 64, 4.6, true, null, {safe:true});
// rooftop clutter: an antenna, a chimney pipe, a broom and buckets
ZONE = 'r5';
rod(W, new THREE.Vector3(50.5, 4.6, -2.2), new THREE.Vector3(50.5, 7.4, -2.2), .03, '#6E655C', {outline:false});
for(const [y,w] of [[7.2,.8],[6.8,1.1],[6.4,1.4]]) rod(W, new THREE.Vector3(50.5-w/2, y, -2.2), new THREE.Vector3(50.5+w/2, y, -2.2), .02, '#6E655C', {outline:false});
mesh(W, new THREE.CylinderGeometry(.18,.18,1.4,10), '#8A8178', {pos:new THREE.Vector3(61.8, 5.3, -2.4)});
for(const [x,c] of [[58.6,'#2F6FB5'],[59.2,'#E8442E']]) mesh(W, new THREE.CylinderGeometry(.22,.18,.4,12), c, {pos:new THREE.Vector3(x, 4.8, -1.9), ow:.02});
plant(W, 54.6, 4.6, -2.2, .8, 'p');

// ================= room 6 · Bồn nước: a flat roof, a steel water tank with a cat on it, a bamboo ladder; a gap over the canal =================
ZONE = 'r6';
box(W, 64, 74, -2, 4.42, -4.2, -0.5, '#F1E0C5', Object.assign({}, WALL, {uv:[6, 6.4, 0, -2]}));
box(W, 63.95, 74.05, 4.42, 4.6, -4.4, .45, '#C2B6A8', {ow:.035, uv:[3.2,3.2], map:TEX.pave});
box(W, 64, 74, -2, -.3, -0.5, -0.3, '#9C8F80', {ow:.03, uv:[2,1], map:TEX.stone});
box(W, 64, 74, 4.6, 5.3, -4.4, -4.1, '#E9DCC8', {ow:.03});
win(W, 66.4, .8, 1.5, 1.8, -0.5, '#F4F1EA', '#2E8C86');
win(W, 71.6, .8, 1.5, 1.8, -0.5, '#F4F1EA', '#2E8C86', {flower:'#F06BAE'});
plat(64, 74, 4.6, true, null, {safe:true});
const TANK_X = 70, TANK_Z = -1.4;
mesh(W, new THREE.CylinderGeometry(1.15,1.15,2.1,24), '#BFD0DA', {pos:new THREE.Vector3(TANK_X, 5.9, TANK_Z), ow:.04});
for(const y of [5.2, 6.6]) mesh(W, new THREE.TorusGeometry(1.16,.04,6,28), '#8FA2AE', {pos:new THREE.Vector3(TANK_X, y, TANK_Z), rot:[Math.PI/2,0,0], outline:false});
mesh(W, new THREE.CylinderGeometry(1.2,1.2,.12,24), '#E9E2D6', {pos:new THREE.Vector3(TANK_X, 7.0, TANK_Z), ow:.03});
for(const [dx,dz] of [[-.8,-.8],[.8,-.8],[-.8,.8],[.8,.8]]) box(W, TANK_X+dx-.07, TANK_X+dx+.07, 4.6, 4.86, TANK_Z+dz-.07, TANK_Z+dz+.07, '#6E655C', {outline:false});
rod(W, new THREE.Vector3(TANK_X+1.1, 5.0, TANK_Z), new THREE.Vector3(TANK_X+1.9, 5.0, TANK_Z-1.2), .05, '#8FA2AE', {outline:false});
const tankTop = plat(TANK_X-1.1, TANK_X+1.1, 7.06, true, ()=>catGone);
// small shed on the far bank where the ladder lands, then a drop to Cô Hai's street
box(W, 80.5, 82.2, -2, 4.42, -4.2, -0.5, '#E8A598', Object.assign({}, WALL));
box(W, 80.45, 82.25, 4.42, 4.6, -4.4, .45, '#8FA9B3', {ow:.035, uv:[1.6, 2], map:TEX.tin});
plat(80.5, 82.2, 4.6, true, null, {safe:true});
box(W, 80.8, 81.9, 0, 2.2, -0.5, -0.47, '#4A3A30', {outline:false});
// the bamboo ladder: pivots at its foot; leaning on the tank, then knocked flat across the gap
const ladder = new THREE.Group(); ladder.position.set(72.9, 4.6, -.05); ladder.rotation.z = .14; scene.add(ladder);
for(const dz of [-.32, .32]) rod(ladder, new THREE.Vector3(0, 0, dz), new THREE.Vector3(0, 8.1, dz), .07, '#C99A52', {ow:.025});
for(let i=0;i<14;i++) rod(ladder, new THREE.Vector3(0, .35 + i*.56, -.32), new THREE.Vector3(0, .35 + i*.56, .32), .04, '#B08440', {outline:false});
for(let i=0;i<4;i++) for(const dz of [-.32, .32]) mesh(ladder, new THREE.TorusGeometry(.075,.02,4,10), '#8C6631', {pos:new THREE.Vector3(0, 1 + i*2, dz), rot:[Math.PI/2,0,0], outline:false});
let ladderT = 0, ladderFall = false;
const bridge = plat(73.2, 81.2, 4.68, true, ()=>ladderT >= 1);
// the cat, asleep on the tank lid
const cat = new THREE.Group(); cat.position.set(TANK_X, 7.06, TANK_Z + .3); cat.rotation.y = -.6; scene.add(cat);
blob(cat, new THREE.Vector3(0,.26,0), [.58,.38,.28], '#E89A3C');
blob(cat, new THREE.Vector3(.48,.3,.1), [.27,.25,.23], '#E89A3C');
blob(cat, new THREE.Vector3(.7,.25,.12), .09, '#F4F1EA', {ow:.02});
for(const dz of [-.08,.16]) mesh(cat, new THREE.ConeGeometry(.09,.18,4), '#E89A3C', {pos:new THREE.Vector3(.44,.55,.1+dz), ow:.02});
for(const dz of [-.04,.2]) box(cat, .7,.73, .35,.37, .06+dz-.05, .06+dz+.03, '#141019', {outline:false});
const catTail = rod(cat, new THREE.Vector3(-.52,.12,-.1), new THREE.Vector3(.05,.08,.42), .07, '#D9822E', {ow:.02});
for(const dx of [-.25,-.05,.15]) box(cat, dx, dx+.07, .45, .5, -.2, .2, '#C76E22', {outline:false});
let catGone = false, catT = -1;

// ================= room 7 · Xe chè cô Hai: the chè house, awning folded behind sheet B, the cart =================
ZONE = 'r7';
box(W, 89, 106, 0, 4, -4, -0.5, '#E9C46A', WALL);
box(W, 89, 106, 3.8, 4.0, -4, 0.45, '#C98B4A', {uv:[3.2,3.2], map:TEX.pave});
box(W, 89, 106, 3.62, 3.8, .3, .55, '#B5513A', {ow:.025});
for(let x = 89.3; x < 106; x += .9) box(W, x, x+.3, 3.5, 3.62, .3, .45, '#B5513A', {outline:false});
plat(89, 106, 4.0, true, null, {safe:true});
for(const x of [89, 106]) box(W, x-.2, x+.2, 0, 3.62, -0.5, -0.32, '#F4F1EA', {ow:.025});
box(W, 89.4, 92.2, 0, 2.9, -0.5, -0.47, '#4A3A30', {outline:false});
for(let x = 89.55; x < 92.1; x += .2) box(W, x, x+.08, .6, 2.9, -0.47, -0.42, ['#E8442E','#F2C230','#2E9C93','#F4F1EA'][Math.round((x-89.55)/.2)%4], {outline:false});
box(W, 89.2, 92.4, 2.9, 3.05, -0.5, -0.36, '#7A4E2D', {ow:.02});
sign(W, 89.3, 92.4, 3.08, 3.6, -0.5, '#2F6FB5', '#F4F1EA', 'CHÈ CÔ HAI');
win(W, 103, 0.9, 3.4, 1.9, -0.5, '#F4F1EA', '#2E8C86', {open:1.35, flower:'#F06BAE'});
box(W, 99, 106, 0, .5, -0.5, -0.38, '#C98B4A', {outline:false});
// rooftop terrace: back railing, big pots, a washing line
box(W, 89.2, 97, 4, 4.9, -3.9, -3.7, '#E9DCC8', {ow:.03});
for(const [x,k] of [[90.4,'chuoi'],[92.1,'hoa'],[95.6,'p']]) plant(W, x, 4, -2.9, 1.05, k);
for(const x of [90, 96.4]) rod(W, new THREE.Vector3(x, 4, -2.2), new THREE.Vector3(x, 6.6, -2.2), .04, '#8C6631', {outline:false});
rod(W, new THREE.Vector3(90, 6.4, -2.2), new THREE.Vector3(96.4, 6.4, -2.2), .015, '#2A2630', {outline:false});
for(let i=0;i<5;i++) box(W, 90.5+i*1.15, 91.3+i*1.15, 5.5 - (i%2)*.2, 6.38, -2.24, -2.19, ['#2F6FB5','#F4F1EA','#E8442E','#F2C230','#9FCBC1'][i], {ow:.015});
// the awning: hinged at the top, folded flat against the wall until sheet B is peeled
const awning = new THREE.Group(); awning.position.set(95.5, 3.1, -0.42); scene.add(awning);
for(let i=0;i<8;i++) mesh(awning, new THREE.BoxGeometry(.7, .06, 1.9), i%2? '#F4F1EA' : '#D8382A', {pos:new THREE.Vector3(-2.45+i*.7, 0, .95), ow:.02});
for(let i=0;i<8;i++) mesh(awning, new THREE.CylinderGeometry(.35,.35,.06,12,1,false,0,Math.PI), i%2? '#F4F1EA' : '#D8382A', {pos:new THREE.Vector3(-2.45+i*.7, 0, 1.9), ow:.02});
mesh(awning, new THREE.CylinderGeometry(.06,.06,5.6,8), '#8C6631', {pos:new THREE.Vector3(0,0,1.9), rot:[0,0,Math.PI/2], ow:.02});
awning.rotation.x = Math.PI/2;
let awningOpen = false, awningT = 0;
plat(92.9, 98.1, 3.1, true, ()=>awningOpen && awningT > .6);
// the chè cart: wooden body, a glass case of jars, two wheels and push handles; a one-way step once it stands under the awning
const cart = new THREE.Group(); cart.position.set(85.2, 0, .55); scene.add(cart);
(function(g){
  box(g, -.95, .95, .45, .55, -.5, .5, '#7A4E2D', {ow:.025, uv:[.6,.6], map:TEX.wood});
  box(g, -.9, .9, .55, .95, -.45, .45, '#A27650', {ow:.025, uv:[.6,.6], map:TEX.wood});
  box(g, -.8, .8, .95, 1.12, -.4, .4, '#E9F4F2', {ow:.02});
  for(let i=0;i<4;i++) mesh(g, new THREE.CylinderGeometry(.13,.13,.26,10), ['#8CC152','#F2C230','#C0392B','#E9E2D6'][i], {pos:new THREE.Vector3(-.55+i*.37, 1.0, 0), outline:false});
  for(const dz of [-.5, .5]){ mesh(g, new THREE.TorusGeometry(.3,.06,6,16), '#2A2630', {pos:new THREE.Vector3(.2, .3, dz), outline:false}); mesh(g, new THREE.CylinderGeometry(.08,.08,.08,8), '#B8B0A4', {pos:new THREE.Vector3(.2,.3,dz), rot:[Math.PI/2,0,0], outline:false}); }
  for(const dz of [-.38, .38]) rod(g, new THREE.Vector3(-.9, .8, dz), new THREE.Vector3(-1.6, 1.05, dz), .035, '#7A4E2D', {outline:false});
  rod(g, new THREE.Vector3(-.8, 1.12, 0), new THREE.Vector3(-.8, 2.3, 0), .025, '#6E655C', {outline:false});
  const um = new THREE.Group(); um.position.set(-.8, 2.3, 0); g.add(um);
  for(let i=0;i<8;i++) mesh(um, new THREE.ConeGeometry(.9, .4, 3, 1, true, i*Math.PI/4, Math.PI/4), i%2 ? '#F4F1EA' : '#2E9C93', {pos:new THREE.Vector3(0,0,0), outline:false});
  box(g, -.6, .6, .56, .86, .46, .47, '#C23A28', {outline:false});
})(cart);
const cartPlat = plat(0, 0, 1.15, true);
let cartGo = false;
// Cô Hai, asleep on a stool beside her cart
const hai = new THREE.Group(); hai.position.set(86.9, 0, .2); hai.rotation.y = .25; hai.scale.setScalar(S*1.05); scene.add(hai); const haiR = buildHai(hai);
ZONE = 'r7'; stool(86.9, .2, '#2F6FB5', 0);
let haiAwake = false, haiWake = 0, haiLine = '', haiLineT = 0;
function haiSay(t, d){ haiLine = t; haiLineT = d; }

// ================= room 8 · Lớp thứ hai: the rooftop room with a stack of days, and the bamboo pole of day 13 =================
ZONE = 'r8';
box(W, 97, 105, 4, 7.2, -3.5, -0.5, '#9FCBC1', WALL);
box(W, 96.7, 105.3, 7.2, 7.5, -3.7, -0.3, '#B5513A', {ow:.04});
box(W, 97.4, 105.2, 7.5, 7.6, -3.5, -.5, '#8A7D6F', {outline:false});
mesh(W, new THREE.CylinderGeometry(.55,.55,1.3,14), '#2F6FB5', {pos:new THREE.Vector3(103.6, 8.15, -2.4)});
mesh(W, new THREE.CylinderGeometry(.57,.57,.1,14), '#E9E2D6', {pos:new THREE.Vector3(103.6, 8.82, -2.4)});
plant(W, 101.6, 7.6, -2.6, .8, 'hoa');
hoaGiay(W, 96.9, 97.9, 7.45, -0.25, 2.4);
hoaGiay(W, 104.4, 105.3, 7.45, -0.25, 1.4, '#F06BAE');
const pole = new THREE.Group(); pole.position.set(104, 0, 0); scene.add(pole);
rod(pole, new THREE.Vector3(0, 3.92, .1), new THREE.Vector3(12.6, 3.92, .1), .1, '#C99A52');
for(let i=0;i<12;i++) box(pole, .5+i*1.04, .52+i*1.04, 3.82, 4.02, .0, .2, '#8C6631', {outline:false});
for(let i=0;i<5;i++) mesh(pole, new THREE.BoxGeometry(.9, 1.1, .05), ['#E8442E','#F2C230','#9FCBC1','#F4F1EA','#E8A598'][i], {pos:new THREE.Vector3(2.2+i*2.3, 3.3, -.15), rot:[0,0,(i%2?.08:-.06)], ow:.02});
pole.scale.x = .001; pole.visible = false;
let poleOut = 0, poleWant = 0;
plat(105.6, 116.6, 4.0, true, ()=>poleOut >= .99);

// ================= room 9 · Con tò he xám: the house across the canal, two Lũ Bụi on patrol, the grey tò he =================
ZONE = 'r9';
box(W, 116, 134, -2, 4, -4, -0.5, '#D9A07A', Object.assign({}, WALL, {uv:[4, 9, 0, -1.5]}));
box(W, 116, 134, 3.8, 4.0, -4, 0.9, '#C98B4A', {uv:[3.2,3.2], map:TEX.pave});
box(W, 116, 134, 3.62, 3.8, .75, 1.0, '#B5513A', {ow:.025});
plat(116, 134, 4.0, true, null, {safe:true});
box(W, 116, 134, -2, -.3, -0.5, -0.3, '#9C8F80', {ow:.03, uv:[2,1], map:TEX.stone});
win(W, 121.5, 1, 2.6, 1.9, -0.5, '#F4F1EA', '#2F6FB5');
win(W, 128.5, 1, 2.6, 1.9, -0.5, '#F4F1EA', '#2F6FB5', {flower:'#F2C230'});
sign(W, 123.6, 126.4, 1.3, 2.7, -0.5, '#E9E2D6', '#C23A28', 'SỬA QUẠT', 'chú Tư');
box(W, 131, 134, 4, 9, -3.5, -0.5, '#E8A598', WALL);
win(W, 132.5, 6, 1.4, 1.8, -0.5, '#F4F1EA', '#2E8C86', {open:1.3});
roof(W, 130.7, 134.3, 9, -0.2, 3.1, 1.2, '#B5513A');
hoaGiay(W, 130.8, 131.6, 8.9, -0.3, 3.2);
box(W, 117.5, 122, 4.3, 5.6, -3.2, -2.9, '#F1E0C5', {ow:.03});
plant(W, 118, 4, -2.4, .9, 'chuoi'); plant(W, 127.5, 4, -2.6, .8, 'hoa');
ZONE = 'goal';
const goal = new THREE.Group(); goal.position.set(129.2, 4, 0); scene.add(goal);
mesh(goal, new THREE.CylinderGeometry(.35,.4,.5,16), '#8C6631', {pos:new THREE.Vector3(0,.25,0)});
const gt = new THREE.Group(); gt.position.y = .5; gt.scale.setScalar(.28); goal.add(gt);
buildTo(gt);

// ================= around and behind: props, poles, lanterns, trees, back rows, the clock tower =================
for(const [x,z,k] of [[-9,4.2,'p'],[-6.5,3.7,'s'],[-5.7,4.4,'s'],[-1.2,4.0,'c'],[2.5,3.9,'p'],[9.5,4.3,'s'],[11.2,3.8,'c'],
                      [14.5,4.1,'s'],[15.3,3.7,'s'],[23,3.9,'p'],[27.3,4.2,'c'],[34,4.3,'s'],[36.4,3.9,'p'],[44,4.4,'c'],[57,4.0,'p'],[63,4.2,'s'],[70,4.4,'c'],
                      [84,4.1,'s'],[88.5,3.8,'p'],[93,4.4,'c'],[101,4.0,'s'],[104.5,4.3,'p'],[121,4.2,'c'],[127,4.0,'p'],[133,4.4,'s']]){
  ZONE = zoneFor(x);
  if(k==='s') stool(x, z, ['#D8382A','#2F6FB5','#D8382A','#E9A23B'][Math.floor(trnd()*4)]);
  else if(k==='c') crate(x, z, .9+trnd()*.3, ['#E9C46A','#9FCBC1','#E8A598'][Math.floor(trnd()*3)]);
  else plant(W, x, -.28, z, 1+trnd()*.4, ['hoa','chuoi','p'][Math.floor(trnd()*3)]);
}
ZONE = 'r1'; xeMay(5.2, 4.6, '#C23A28', -.15); xeDap(-4.2, 4.5, .2);
ZONE = 'r3'; xeMay(31.2, 4.7, '#2F6FB5', .2);
ZONE = 'r5'; xeDap(53, 4.6, -.2);
ZONE = 'r7'; xeMay(98.4, 4.6, '#E9C46A', -.1);
ZONE = 'r9'; xeMay(124.4, 4.6, '#4E9A4A', .15);
for(const [x,k] of [[-7,'p'],[20.5,'hoa'],[46,'p'],[67,'hoa'],[90.5,'p'],[112,'hoa'],[128.5,'p']]){ ZONE = zoneFor(x); plant(W, x, -.28, 7.4, 1.2, k); }
tree(W, -11, 3.8, 7.5, {s:1.2, zone:'r1'});
tree(W, 52, 6.2, 8.5, {s:1.15, zone:'r5', flower:'#E8442E', c:['#4E9A4A','#5FAF55','#3F8A45']});
tree(W, 88, -4.8, 9, {s:1.05, zone:'r7', flower:'#F06BAE'});
tree(W, 93.2, -4.7, 10, {s:1.1, zone:'r7', flower:'#E8442E', c:['#4E9A4A','#5FAF55','#3F8A45']});
tree(W, 121, -4.7, 8.2, {s:1, zone:'r9'});
tree(W, 109.5, -4.8, 7.4, {s:.95, zone:'r8', flower:'#B07CD0'});
const POLES = [-8, 13, 31, 47, 66, 86, 107, 126];
for(const x of POLES){ ZONE = zoneFor(x); powerPole(x, (x > 38 && x < 80.5) || (x > 106 && x < 116) ? 2.95 : 3.4); }
for(let i=0;i<POLES.length-1;i++){ ZONE = zoneFor(POLES[i]); poleWires([POLES[i], POLES[i+1]], 3.2); }
ZONE = 'r1'; wire(new THREE.Vector3(-8,7.6,3.4), new THREE.Vector3(-3,7.8,-.5), .5); wire(new THREE.Vector3(13,7.6,3.4), new THREE.Vector3(9,7.2,-.5), .4);
ZONE = 'r3'; wire(new THREE.Vector3(31,7.6,3.4), new THREE.Vector3(26,8.2,-.5), .5);
ZONE = 'r7'; wire(new THREE.Vector3(86,7.6,3.4), new THREE.Vector3(93,7.3,-.5), .6);
ZONE = 'r9'; wire(new THREE.Vector3(126,7.6,3.4), new THREE.Vector3(132,8.2,-.5), .7);
for(const [a, b, y, z, sag] of [[-5.5, 3.4, 7.6, 1.2, .9], [3.6, 12.4, 9.6, 1.0, .8], [12.6, 23.6, 9.2, 1.0, .7], [24.6, 37.4, 9.6, 1.4, .9], [49, 63, 7.6, 1.6, .6], [89.5, 97, 8.9, 1.0, .5], [118, 130.6, 7.4, 1.2, .8]]){
  ZONE = zoneFor((a+b)/2); lanternString(a, b, y, z, sag);
}
midRow(-16, 140, zoneFor, {zf:-5});
farRow(-24, 160);
clockTower(141, -18);
clouds(-40, 180); hills(-40, 180);
for(const [x0, w, z] of [[-2, 3.4, -4.2], [16, 4.5, -4.4], [27, 3, -4.3], [43, 5, -4.4], [58, 3.6, -4.2], [76, 4, -4.3], [92, 4.5, -4.4], [110, 4, -4.3], [126, 3.6, -4.2]]) shaft(x0, w, z, zoneFor(x0));

// ================= sheets =================
const sheetA = sheet({id:'A', x0:3.8, x1:11.0, y0:.1, y1:3.6, onLayer:()=>peeledA()});
const sheetP = sheet({id:'P', x0:15.4, x1:18.2, y0:.3, y1:3.2, z:-.28, onLayer:()=>peeledPipe()});
const sheetV = sheet({id:'V', x0:25.4, x1:28.4, y0:.2, y1:4.6, dir:'y', onRelease:s=>{ if(s.p > 1 && !metShelf){ metShelf = true; say('Mép giấy cong ra thành gờ!', 2); } },
  onFull:()=>{ if(!metFull){ metFull = true; say('Kéo hết thì không còn gờ… để nó dán lại đã.', 2.6); } }});
const sheetBloc = sheet({id:'L', x0:34.45, x1:35.55, y0:5.0, y1:6.15, z:-.42, onLayer:()=>peeledBloc()});
const sheetW = sheet({id:'W', x0:40.0, x1:46.4, y0:5.2, y1:6.5, z:-.42, onLayer:()=>peeledRail()});
const sheetT = sheet({id:'T', x0:68.9, x1:71.1, y0:5.0, y1:6.7, z:TANK_Z + 1.2, onLayer:()=>peeledTank()});
const sheetB = sheet({id:'B', x0:92.8, x1:98.2, y0:.1, y1:2.9, z:-.35, onLayer:()=>peeledB()});
// the stack: day 14 on top, then 13 (the day the pole was out over the canal), then 12 (the pole still rolled up)
const polePic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.4)'; x.lineWidth = 10; x.beginPath(); x.moveTo(cw*.05, ch*.8); x.lineTo(cw*.98, ch*.8); x.stroke();
  x.fillStyle = 'rgba(70,60,50,.25)'; for(let i=0;i<4;i++) x.fillRect(cw*(.25 + i*.18), ch*.8, cw*.1, ch*.13);
  x.strokeStyle = 'rgba(70,60,50,.3)'; x.lineWidth = 3; for(let i=0;i<6;i++){ x.beginPath(); x.moveTo(cw*(.15+i*.14), ch*.97); x.quadraticCurveTo(cw*(.22+i*.14), ch*.9, cw*(.29+i*.14), ch*.97); x.stroke(); } };
const nopolePic = (x, cw, ch)=>{ x.strokeStyle = 'rgba(70,60,50,.4)'; x.lineWidth = 10; x.beginPath(); x.moveTo(cw*.82, ch*.55); x.lineTo(cw*.86, ch*.95); x.stroke();
  x.strokeStyle = 'rgba(70,60,50,.3)'; x.lineWidth = 3; for(let i=0;i<6;i++){ x.beginPath(); x.moveTo(cw*(.15+i*.14), ch*.97); x.quadraticCurveTo(cw*(.22+i*.14), ch*.9, cw*(.29+i*.14), ch*.97); x.stroke(); } };
const sheetS = sheet({id:'S', x0:97.6, x1:104.4, y0:4.1, y1:6.9, layers:[{n:'14'}, {n:'13', pic:polePic}, {n:'12', pic:nopolePic}],
  onLayer:i=>peeledStack(i), onRestore:L=>restoredStack(L)});

// ================= characters in the level =================
ZONE = 'r1';
const ba = new THREE.Group(); ba.position.set(-1.2, 0, .3); ba.rotation.y = .5; ba.scale.setScalar(S*1.05); scene.add(ba); const baR = buildBa(ba);
let baLine = '', baLineT = 0;
function baSay(t, d){ baLine = t; baLineT = d; }
bui({x:53, top:4.6, s:.42, sleep:true}); bui({x:56.5, top:4.6, s:.5, sleep:true}); bui({x:60, top:4.6, s:.38, sleep:true});
bui({x:120.5, top:4, s:.5, a:120.5, b:122.5}); bui({x:124, top:4, s:.42, a:124, b:126.6});
firefly(7.4, 2.6, ()=>sheetA.done);
firefly(44.6, 7.4, ()=>railOn);
firefly(TANK_X, 8.1, ()=>sheetT.done);
firefly(110.5, 6.5, ()=>poleOut > .99);
firefly(-3.6, 1.4);
for(const z of ROOMS.concat(['goal','sky'])) setZone(z, 0);

// ================= bubbles =================
const dist = o => Math.abs(P.x - o.position.x);
talker(ba, 2.3, ()=>{
  if(baLineT > 0) return baLine; if(busy() || P.y > 1 || dist(ba) > 4.5) return '';
  return sheetA.done ? 'Đi gọi mấy đứa nhỏ năm xưa về giúp bà…' : '…khò… con bóc giúp… phố nhé…';
});
talker(ba, 2.2, ()=> !sheetA.done && !(dist(ba) < 4.5 && P.y < 1) ? 'z z z' : '', 'zzz');
talker(hai, 2.9, ()=>{
  if(haiLineT > 0) return haiLine; if(busy() || P.won || P.y > 1 || dist(hai) > 5) return '';
  return haiAwake ? 'Leo lên xe chè, lên mái hiên đi con!' : 'Mái hiên… dính cứng rồi…';
});
talker(hai, 2.8, ()=> !haiAwake && !(dist(hai) < 5 && P.y < 1) ? 'z z z' : '', 'zzz');
talker(cat, 1.2, ()=> catT < 0 || catT > 3.2 ? 'z z z' : '', 'zzz');
const buiTalk = new THREE.Object3D(); scene.add(buiTalk);
talker(buiTalk, .9, ()=>{
  const b0 = buis.reduce((a,b)=>Math.abs(b.x-P.x) < Math.abs(a.x-P.x) ? b : a);
  buiTalk.position.copy(b0.g.position);
  return P.y > 3.5 && Math.abs(b0.x - P.x) < 5 && Math.sin(nowT*1.4) > 0 && !P.won ? (b0.sleep && !b0.awake ? 'z z z' : '…phù…') : '';
});

// ================= story beats =================
let metShelf = false, metFull = false, metBalcony = false, metWind = false, metBui = false, metRoof5 = false, metTank = false, metStreet = false, metRoof7 = false, metRoof9 = false;
function peeledA(){
  colour('r1'); say('Ồ… bên dưới vẫn còn màu!', 2.4);
  play([{dur:2.0},
    {dur:3.4, start:()=>baSay('Con của bà… đi gọi mấy đứa nhỏ năm xưa về giúp bà nhé.', 3.6)},
    {dur:2.8, cam:[20, 2.6], start:()=>baSay('Cô Hai bán chè ở cuối phố đó.', 3)},
    {dur:0, start:()=>{ say('Đống thùng cao quá… nhảy không tới.', 2.6); objective('Qua đống thùng giấy'); }}]);
}
function peeledPipe(){
  say('Nước!', 1.2); waterOn = 1;
  play([{dur:.6},
    {dur:2.6, cam:[21, 2.4], start:()=>{ boxT = .001; }},
    {dur:0, start:()=>{ colour('r2'); say('Nước cuốn đống thùng đi rồi!', 2.2); objective('Lên ban công bà Ba'); }}]);
}
function peeledBloc(){
  play([{dur:3.6, start:()=>memo(pageBack(['Leo cao', 'phải vịn.'], '14')), end:memoOff},
    {dur:0, start:()=>say('Leo cao phải vịn… vịn vào đâu ta?', 2.6)}]);
}
function peeledRail(){
  railOn = true; rail.visible = true; say('Dây phơi! Có chỗ vịn rồi.', 2.2); colour('r4'); objective('Qua mái tôn');
}
function peeledTank(){
  catT = 0; say('Á, mèo!', 1.2);
  play([{dur:.4}, {dur:3.0, cam:[76.5, 5.6]},
    {dur:0, start:()=>{ colour('r6'); say('Cái thang thành cầu rồi!', 2.2); objective('Qua thang tre, xuống phố'); }}]);
}
function peeledB(){
  say('Mái hiên bung ra rồi!', 1.6); awningOpen = true; colour('r7', .5);
  play([{dur:1.4},
    {dur:4.0, start:()=>memo(drawHaiMemory), end:memoOff},
    {dur:2.0, start:()=>{ haiAwake = true; colour('r7'); haiSay('Chè đậu, chè bưởi đây!', 2.6); }},
    {dur:3.4, cam:[92, 2.6], start:()=>{ cartGo = true; haiSay('Để cô đẩy xe chè lại cho con leo!', 3.4); }},
    {dur:2.6, cam:[96, 4.6], start:()=>haiSay('Lên mái hiên, ra mái nhà đi con!', 4)},
    {dur:0, start:()=>objective('Leo lên xe chè, lên mái hiên')}]);
}
function peeledStack(i){
  if(i === 0){
    poleWant = 1; sheetS.solved = true; colour('r8');
    say('Tờ 13… hôm qua có cái sào phơi đồ!', 2.4);
    play([{dur:1.4}, {dur:3.0, cam:[110.5, 5.2]},
      {dur:0, start:()=>{ say('Bên kia kênh… con tò he xám!', 2.4); objective('Đi trên sào qua kênh'); }}]);
  } else {
    poleWant = 0; sheetS.solved = false;
    say(i === 1 ? 'Ơ, sào biến mất rồi! Bóc quá tay sang tờ 12…' : 'Hết lịch… không còn sào nữa.', 2.8);
    objective('Dán lại tờ 13 (bấm R)');
  }
}
function restoredStack(L){
  if(L === 1){ poleWant = 1; sheetS.solved = true; say('Tờ 13 về rồi, sào lại bắc qua kênh.', 2.2); objective('Đi trên sào qua kênh'); }
  else if(L === 0){ poleWant = 0; sheetS.solved = false; objective('Bóc chồng lịch trên phòng nhỏ'); }
  else { poleWant = 0; }
}
function drawHaiMemory(x, W, H){
  // the back of Cô Hai's calendar page: her first day at the stall, a boy gets a bowl for free. No words.
  x.fillStyle = '#F6EBD9'; x.beginPath(); x.moveTo(0, 14);
  for(let i=0;i<=24;i++) x.lineTo(i*20, 6 + (i%2)*10); x.lineTo(W, H); x.lineTo(0, H); x.closePath(); x.fill();
  const g = x.createLinearGradient(0, 30, 0, 250); g.addColorStop(0, '#F7C48A'); g.addColorStop(1, '#FBE3C0');
  x.fillStyle = g; x.fillRect(22, 32, W-44, 220);
  x.fillStyle = '#E8A598'; x.fillRect(30, 70, 120, 182); x.fillStyle = '#E9C46A'; x.fillRect(330, 90, 120, 162);
  x.fillStyle = '#F1E0C5'; x.fillRect(50, 100, 34, 44); x.fillRect(360, 120, 34, 44);
  for(let i=0;i<9;i++){ x.fillStyle = i%2 ? '#F4F1EA' : '#D8382A'; x.fillRect(150 + i*20, 96, 20, 22); }
  x.fillStyle = '#A27650'; x.fillRect(150, 196, 180, 14); x.fillRect(160, 210, 10, 42); x.fillRect(310, 210, 10, 42);
  x.fillStyle = '#5E4630'; x.beginPath(); x.ellipse(205, 186, 34, 14, 0, 0, Math.PI*2); x.fill(); x.fillRect(171, 170, 68, 16);
  x.strokeStyle = 'rgba(255,255,255,.8)'; x.lineWidth = 3; for(const dx of [190, 205, 220]){ x.beginPath(); x.moveTo(dx, 164); x.bezierCurveTo(dx-8, 150, dx+8, 140, dx, 126); x.stroke(); }
  x.fillStyle = '#2E8C86'; x.beginPath(); x.ellipse(270, 178, 24, 34, 0, 0, Math.PI*2); x.fill();
  x.fillStyle = '#F2C9A0'; x.beginPath(); x.arc(270, 132, 16, 0, Math.PI*2); x.fill();
  x.fillStyle = '#E9D29A'; x.beginPath(); x.moveTo(240, 128); x.lineTo(270, 98); x.lineTo(300, 128); x.closePath(); x.fill();
  x.fillStyle = '#F2C9A0'; x.fillRect(288, 168, 30, 9);
  x.fillStyle = '#F4F1EA'; x.beginPath(); x.ellipse(330, 172, 15, 7, 0, 0, Math.PI*2); x.fill();
  for(const [dx,cl] of [[-6,'#D8382A'],[0,'#4E9A4A'],[6,'#F2C230']]){ x.fillStyle = cl; x.beginPath(); x.arc(330+dx, 168, 3.5, 0, Math.PI*2); x.fill(); }
  x.fillStyle = '#4C7FB8'; x.beginPath(); x.ellipse(358, 228, 14, 22, 0, 0, Math.PI*2); x.fill();
  x.fillStyle = '#F2C9A0'; x.beginPath(); x.arc(358, 196, 12, 0, Math.PI*2); x.fill();
  x.fillStyle = '#2A2230'; x.beginPath(); x.arc(358, 191, 12, Math.PI, 0); x.fill();
  x.fillStyle = '#F2C9A0'; x.fillRect(338, 206, 14, 6);
  x.fillStyle = '#D9D0C4'; x.fillRect(22, 252, W-44, 70);
  x.fillStyle = 'rgba(120,70,30,.10)'; x.fillRect(0, 0, W, H);
  x.strokeStyle = '#141019'; x.lineWidth = 3; x.strokeRect(22, 32, W-44, 290);
}

// ================= per-frame level logic =================
LV.update = (dt, t)=>{
  if(baLineT > 0) baLineT -= dt; if(haiLineT > 0) haiLineT -= dt;
  // room 1: bà half wakes with the colour
  star.rotation.z = Math.sin(t*1.1)*.1*zoneK.r1;
  baR.head.rotation.x = .35*(1 - zoneK.r1*.7) + Math.sin(t*1.3)*.04;
  // room 2: water pours, the boxes tumble off the pavement onto the road
  waterMat.opacity += ((waterOn ? .75 : 0) - waterMat.opacity)*Math.min(1, dt*3);
  stream.visible = flood.visible = waterMat.opacity > .02;
  if(waterOn){ for(const s of splash){ const k = (t*1.3 + s.ph) % 1; s.m.material.opacity = .8*(1-k); s.m.position.set(18 + k*5 + s.ph*.8, .1 + Math.sin(k*Math.PI)*.6, .2 + s.ph*1.6 + k*1.2); } }
  if(boxT > 0 && boxT < 1){ boxT = Math.min(1, boxT + dt*.45); }
  for(const b of boxPile){ const k = Math.max(0, Math.min(1, (boxT - b.d*.5)/(1 - .4))); const e = k*k*(3-2*k);
    b.g.position.set(b.x0.x + e*(1.6 + b.d*4), b.x0.y*(1-e) + (-.28 + .5)*e*.6 + Math.sin(e*Math.PI)*.4, b.x0.z + e*(3.6 + b.d*3)); b.g.rotation.set(e*.5, b.r0 + e*(1 + b.d*3), e*(b.d > .3 ? 1.4 : -.5)); }
  // room 3: the first time Tò stands on the balcony
  if(!metBalcony && P.ground && P.y > 4.5 && P.x > 29 && P.x < 38.5){ metBalcony = true; sheetV.solved = true; colour('r3'); say('Lên được rồi!', 1.6); objective('Đi qua gờ hẹp'); }
  // room 4: wind on the ledge until the washing line is out
  if(!metWind && !railOn && P.y > 4.4 && P.x > 39.6 && P.x < 41){ metWind = true; say('Gió mạnh quá! Không đi được…', 2.4); objective('Tìm chỗ vịn trên gờ hẹp'); }
  if(railOn && railT < 1){ railT = Math.min(1, railT + dt*2); rail.position.z = -.42 + .42*(1 - Math.pow(1 - railT, 3)); }
  streakMat.opacity += ((railOn ? 0 : .55) - streakMat.opacity)*Math.min(1, dt*2);
  for(const s of streaks){ const k = (t*s.sp + s.ph) % 1; s.m.position.set(49 - k*10, s.y + Math.sin(k*6 + s.ph*5)*.15, s.z); s.m.visible = streakMat.opacity > .02 && Math.abs(camLook.x - 44) < 16; }
  // room 5: walking past the sleepers
  if(!metBui && P.x > 49 && P.y > 4.4){ metBui = true; say('Suỵt… Lũ Bụi đang ngủ. Đi nhẹ thôi, đừng nhảy.', 2.8); }
  if(!metRoof5 && P.x > 64.4 && P.y > 4.4){ metRoof5 = true; colour('r5'); objective('Sang mái bên kia kênh'); }
  // room 6: the cat leaps off the tank, knocks the ladder flat across the gap, then strolls over and curls up on the shed
  if(!metTank && P.x > 66 && P.y > 4.4){ metTank = true; say('Bồn nước bị dán xám… mèo đang ngủ trên đó.', 2.6); }
  if(catT >= 0){
    catT += dt;
    if(catT < .7){ const k = catT/.7; cat.position.set(TANK_X + k*2.6, 7.06 + Math.sin(k*Math.PI)*1.2 - k*.9, TANK_Z + .3 + k*1.2); cat.rotation.y = -.2; ladderFall = true; }
    else if(catT < 1.6){ cat.position.y = Math.max(4.68, cat.position.y - dt*6); }
    else if(ladderT >= 1){ cat.position.x = Math.min(81.4, cat.position.x + dt*3.2); cat.position.y = 4.68; cat.position.z = .1; if(cat.position.x >= 81.4){ cat.rotation.y = -1.2; catGone = true; } }
  }
  if(ladderFall && ladderT < 1){ ladderT = Math.min(1, ladderT + dt*1.3); }
  const le = ladderT < 1 ? ladderT*ladderT : 1; ladder.rotation.z = .14 + (-Math.PI/2 - .14)*le;
  catTail.rotation.z = Math.sin(t*2)*.1;
  // room 7: reaching the street, the cart rolls under the awning
  if(!metStreet && P.x > 83 && P.y < .5){ metStreet = true; objective('Đánh thức cô Hai'); say('Cô Hai cũng ngủ quên rồi…', 2.2); }
  if(cartGo && cart.position.x < 95.5){ cart.position.x = Math.min(95.5, cart.position.x + dt*2.8); hai.position.x = cart.position.x - 1.9; hai.rotation.y = 1.3; }
  cartPlat.x0 = cart.position.x - .95; cartPlat.x1 = cart.position.x + .95;
  if(awningOpen && awningT < 1) awningT = Math.min(1, awningT + dt*1.6);
  const ea = awningT < 1 ? 1 - Math.pow(1 - awningT, 3)*Math.cos(awningT*7) : 1;
  awning.rotation.x = Math.PI/2*(1 - ea) + .06*ea;
  haiWake += ((haiAwake ? 1 : 0) - haiWake)*Math.min(1, dt*3);
  haiR.head.rotation.x = .38*(1 - haiWake) + (haiWake < .5 ? Math.sin(t*1.2 + 1)*.05 : 0);
  haiR.arm.rotation.z = Math.sin(t*2)*.12*haiWake;
  if(!metRoof7 && P.ground && P.y > 3.9 && P.x > 89 && P.x < 106){ metRoof7 = true; objective('Bóc chồng lịch trên phòng nhỏ'); say('Một chồng lịch… lờ mờ thấy hình gì bên dưới.', 2.6); }
  // room 8: the pole slides out over the canal while day 13 shows, and back in when it doesn't
  poleOut += Math.max(-dt*1.2, Math.min(dt*.9, poleWant - poleOut));
  pole.visible = poleOut > .002; pole.scale.x = Math.max(.001, 1 - Math.pow(1 - poleOut, 3));
  // room 9: the goal
  if(!metRoof9 && P.x > 116.5 && P.y > 3.9){ metRoof9 = true; colour('r8'); objective('Nhảy qua Lũ Bụi, tới con tò he xám'); }
  goal.rotation.y = Math.sin(t*1.5)*.3; gt.position.y = .5 + (P.won ? Math.abs(Math.sin(t*6))*.3 : 0);
  if(P.won) colour('goal'), colour('r9');
  if(!P.won && Math.abs(P.x - goal.position.x) < 1.1 && P.y > 3.9){
    say('Con tò he có màu rồi!', 2.0); objective('Xong màn 1');
    finish([{dur:2.2},
      {dur:3.6, cam:[136, 14, 24], start:()=>{ bars(true); caption('Xa xa, kim đồng hồ trên tháp vẫn đứng im.'); }, end:()=>{ bars(false); caption(''); }},
      {dur:2.6, start:()=>say('Đồng hồ… đứng rồi. Phải tới đó thôi.', 2.6)}]);
  }
};
LV.hint = ()=>{
  if(!sheetA.done) return 'Vệt sáng vàng là chỗ bóc được. Đứng cạnh tấm xám gần bà Năm, bấm E rồi đi lùi.';
  if(!sheetP.done) return 'Đống thùng cao quá. Miệng ống xối trên tường bị dán xám, bóc nó ra.';
  if(!metBalcony) return metFull ? 'Kéo mép tờ dọc lên nửa chừng thôi, rồi bấm E buông. Mép cong thành gờ để nhảy lên.' : 'Nắm mép dưới tờ dọc trên tường, đi lùi để kéo mép lên, rồi bấm E buông giữa chừng.';
  if(!railOn) return P.x < 38.6 && !sheetBloc.done ? 'Cuốn lịch bloc trên ban công có ghi gì ở mặt sau. Rồi tìm chỗ vịn dọc gờ hẹp.' : 'Đứng ở đầu gờ hẹp, bóc tờ xám trên tường ngay phía trên gờ.';
  if(P.x < 64) return 'Lũ Bụi tỉnh khi nghe tiếng nhảy gần. Cứ đi bộ thong thả qua chúng.';
  if(!sheetT.done) return 'Bóc tờ xám trên bồn nước. Coi chừng con mèo.';
  if(P.x < 83) return 'Đi trên cây thang tre qua kênh, rồi nhảy xuống phố.';
  if(!sheetB.done) return 'Mái hiên nhà cô Hai bị dán gập. Bóc tấm xám dưới mái, từ mép bên trái.';
  if(P.y < 3.5) return 'Leo lên xe chè, nhảy lên mái hiên sọc đỏ, rồi lên mái nhà.';
  if(poleOut < .99) return sheetS.L >= 2 ? 'Bóc quá tay rồi. Đứng gần chồng lịch, bấm R để dán lại tờ 13.' : 'Đứng gần chồng lịch thì thấy lờ mờ tờ bên dưới. Tờ nào có cái sào?';
  if(P.x < 116) return 'Đi trên sào phơi đồ qua kênh. Nhảy lên lấy đom đóm phía trên.';
  return fliesGot < 5 ? 'Nhảy qua Lũ Bụi. Còn đom đóm thì thử tìm sau lưng bà Năm.' : 'Nhảy qua Lũ Bụi, tới con tò he xám.';
};
LV.winText = ()=>({
  h:'Xong màn 1!',
  p:'Cô Hai đã tỉnh, phố có màu trở lại. Một con tò he trên khay của bà Năm lấy lại màu đỏ.',
  memory:(fliesGot === 5
    ? '<b>Ký ức mở khoá.</b> Ngày đầu cô Hai mở quán, có đứa bé đứng nhìn nồi chè mãi mà không đủ tiền. Cô múc cho một chén đầy, không lấy tiền. Đứa bé đó bây giờ là chú Tư.'
    : 'Còn ' + (5 - fliesGot) + ' con đom đóm chưa tìm thấy. Tìm đủ 5 con để mở trọn ký ức của cô Hai.')
    + '<br>' + (relicGot ? '<b>Tò he cũ:</b> con gà trống của cô Hai, giấu sau chậu kiểng trên ban công nhà bên. Bà Năm nặn cho cô năm cô lên bảy.' : 'Có một con tò he cũ giấu trên một ban công. Gờ giấy càng cao thì nhảy càng xa.'),
  next:'Tiếp theo · Màn 2: Rãnh nước. Bé Bống đang chờ trong con hẻm.'
});

// ================= intro: the street in colour, bà tears page 14, the calendar pages blow in =================
const pageTex = (function(){ const c = document.createElement('canvas'); c.width = 64; c.height = 80; const x = c.getContext('2d');
  x.fillStyle = '#F2ECE1'; x.fillRect(0,0,64,80); x.fillStyle = '#C23A28'; x.fillRect(0,0,64,14);
  x.fillStyle = '#5A4E4A'; x.font = 'bold 40px sans-serif'; x.textAlign = 'center'; x.fillText('14', 32, 62); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t; })();
const pages = [];
for(let i=0;i<46;i++){
  const m = new THREE.Mesh(new THREE.PlaneGeometry(.55, .7), new THREE.MeshBasicMaterial({map:pageTex, side:THREE.DoubleSide, transparent:true}));
  m.visible = false; scene.add(m);
  pages.push({m, x0: 16 + Math.random()*26, y0: 1 + Math.random()*8, z: -1.2 + Math.random()*3.2, sp: 7 + Math.random()*6, ph: Math.random()*6, d: Math.random()*1.4});
}
LV.intro = {end:19, sheetsAt:11.8,
  caps:[[0.6, 4.2, 'Chiều 14 tháng Tám. Sạp tò he của bà Năm đã bốn mươi năm ở đầu phố.'],
        [4.6, 8.4, 'Bà nặn xong một con tò he, ấn ngón tay lên bụng cho may.'],
        [8.8, 12.6, 'Năm nay chẳng đứa trẻ nào ghé. Bà xé tờ lịch 14, thở dài: “Chẳng ai nhớ nữa…”'],
        [13.0, 16.6, 'Đồng hồ cuối phố đứng lại. Lịch cũ bay khắp phố, cả phố bạc màu.']],
  run(it, dt, t){
    const k = it < 10.2 ? 1 : Math.max(0, 1 - (it - 10.2)/2.8);
    for(const z of ROOMS.concat(['goal','sky'])) setZone(z, k);
    for(const p of pages){
      const pt = it - 9.4 - p.d;
      p.m.visible = pt > 0 && pt < 4.6;
      if(p.m.visible){
        p.m.position.set(p.x0 - pt*p.sp, p.y0 + Math.sin(pt*3 + p.ph)*.6 - pt*.3, p.z);
        p.m.rotation.set(Math.sin(pt*4 + p.ph)*.8, pt*2 + p.ph, Math.cos(pt*3 + p.ph)*.6);
        p.m.material.opacity = Math.min(1, 4.6 - pt);
      }
    }
    const pop = (it > 5.2 && it < 6.2) ? Math.sin((it - 5.2)*Math.PI) : 0;
    toInner.scale.set(1 + pop*.12, 1 - pop*.1 + Math.sin(t*2.2)*.01, 1 + pop*.12);
    toInner.rotation.y = it < 13.5 ? .9 : .9 - Math.min(1, it - 13.5)*1.6;
    baR.head.rotation.x = it < 13.5 ? 0 : Math.min(.35, (it - 13.5)*.3);
    const camX = 2.5 + Math.max(0, it - 9)*1.4*(it < 12.5 ? 1 : 0) + (it >= 12.5 ? 4.9 - Math.min(4.9, (it - 12.5)*2.4) : 0);
    camLook.lerp(tmpV.set(camX, 2.6, -1), Math.min(1, dt*2));
    camPos.lerp(tmpV.set(camX - 2.5, 5.4, 16.5), Math.min(1, dt*2));
    camera.position.copy(camPos); camera.lookAt(camLook);
    sun.position.set(camLook.x - 8, 18, 12); sun.target.position.set(camLook.x, 0, 0);
  },
  done(){
    for(const p of pages) p.m.visible = false;
    for(const z of ROOMS.concat(['goal','sky'])) setZone(z, 0);
    toInner.scale.setScalar(1);
    say('Bà ơi?… Bà ngủ mất rồi.', 2.6);
    objective('Đánh thức bà Năm');
  }};
startGame();
