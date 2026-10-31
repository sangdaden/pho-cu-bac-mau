// Phố Cũ Bạc Màu · shared engine for all levels: toon look, colour zones, characters, textures, building kit, sky and atmosphere, game core
// ================= renderer & scene =================
const stage = document.getElementById('stage');
const canvas = document.getElementById('c');
// phones get a lighter start (smaller canvas, smaller shadow map); quality() trims the canvas further if frames run slow
const MOBILE = matchMedia('(pointer:coarse)').matches;
const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
let DPR_MAX = Math.min(window.devicePixelRatio, MOBILE ? 1.5 : 2);
try { const d = +localStorage.getItem('phocu.dpr'); if(d) DPR_MAX = Math.min(DPR_MAX, d); } catch(e){}
// Cài đặt → Độ nét: a fixed choice turns the automatic trimming off
const DPR_FIX = window.AM && AM.set.net ? +AM.set.net : 0;
if(DPR_FIX) DPR_MAX = Math.min(window.devicePixelRatio, DPR_FIX);
renderer.setPixelRatio(DPR_MAX);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = MOBILE ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
const scene = new THREE.Scene();
const SKY_GREY = new THREE.Color('#CFCBC7'), SKY_COL = new THREE.Color('#F2C9A0');
scene.background = SKY_GREY.clone();
scene.fog = new THREE.Fog(SKY_GREY.clone(), 34, 120);
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200);
scene.add(new THREE.HemisphereLight('#FFF6EA', '#B9AFA6', 0.62));
const sun = new THREE.DirectionalLight('#FFFFFF', 0.62);
sun.castShadow = true; sun.shadow.mapSize.setScalar(MOBILE ? 1024 : 2048);
const sc = sun.shadow.camera; sc.left=-16; sc.right=16; sc.top=12; sc.bottom=-6; sc.near=1; sc.far=60;
sun.shadow.bias = -0.0008; scene.add(sun); scene.add(sun.target);

// ================= toon materials with colour zones =================
const ramp = new THREE.DataTexture(new Uint8Array([150,150,150,255, 205,205,205,255, 255,255,255,255]), 3, 1, THREE.RGBAFormat);
ramp.minFilter = ramp.magFilter = THREE.NearestFilter; ramp.generateMipmaps = false; ramp.needsUpdate = true;
// zone '0' is always in colour (Tò), 'keep' is always grey (Lũ Bụi); every other zone fades in as its sheet is peeled
let ZONE = '0';
const mats = {}; const zoneMats = {}; const zoneK = {'0':1, keep:0};
function toon(hex, keep, o){
  o = o||{};
  const z = keep ? 'keep' : ZONE; const k = hex + '|' + z + '|' + (o.map ? o.map.uuid : '') + (o.flat ? 'f' : '') + (o.nofog ? 'n' : '');
  if(mats[k]) return mats[k];
  const m = new THREE.MeshToonMaterial({color:new THREE.Color(hex).convertSRGBToLinear(), gradientMap:ramp});
  if(o.map){ m.map = o.map; if(o.alpha){ m.transparent = true; m.alphaTest = .35; } }
  if(o.flat) m.flatShading = true;
  if(o.nofog) m.fog = false;
  m.userData.base = m.color.clone();
  const c = new THREE.Color(hex); const l = 0.299*c.r+0.587*c.g+0.114*c.b;
  m.userData.grey = new THREE.Color(l*0.78+0.17, l*0.76+0.17, l*0.74+0.17).convertSRGBToLinear();
  if(keep) m.color.copy(m.userData.grey);
  if(!keep && z !== '0' && z !== 'sky') wipe(m, z);
  mats[k] = m; (zoneMats[z] = zoneMats[z] || []).push(m);
  if(z !== '0' && z !== 'keep' && !m.onBeforeCompile.isWipe) m.color.copy(m.userData.grey);
  return m;
}
function setZone(z, k){
  zoneK[z] = k;
  const u = zoneU[z];
  if(u){ u.k.value = k; return; }
  for(const m of zoneMats[z]||[]) m.color.copy(m.userData.grey).lerp(m.userData.base, k);
}
// colour spreads out from where the room was solved instead of fading in everywhere at once: each zone's materials share
// an origin and a 0..1 amount; the shader keeps grey beyond a ragged circle whose radius grows with the amount.
// With no origin (the intro, levels that set a zone directly) the amount is a plain fade, as before.
const zoneU = {};
const WIPE_R = 30;
function wipe(m, z){
  const u = zoneU[z] || (zoneU[z] = {k:{value:zoneK[z] === undefined ? 0 : zoneK[z]}, o:{value:new THREE.Vector2(1e5, 0)}});
  const grey = {value:m.userData.grey};
  m.color.copy(m.userData.base);
  m.onBeforeCompile = sh=>{
    sh.uniforms.uK = u.k; sh.uniforms.uO = u.o; sh.uniforms.uGrey = grey;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; uniform float uK; uniform vec2 uO; uniform vec3 uGrey;')
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );',
        'float wk = uK;\n' +
        'if(uO.x < 9e4 && uK < .999){ float d = length(vWP.xy - uO) + sin(vWP.x*1.7 + vWP.y*.9)*.45 + sin(vWP.y*2.3 - vWP.x*.6)*.35;\n' +
        '  float r = uK*' + WIPE_R + '.0; wk = 1.0 - smoothstep(r - 1.4, r, d); }\n' +
        'vec4 diffuseColor = vec4( mix(uGrey, diffuse, wk), opacity );');
  };
  m.onBeforeCompile.isWipe = true;
}
const OUTLINE = new THREE.MeshBasicMaterial({color:'#141019', side:THREE.BackSide});
const SPH = new THREE.SphereGeometry(1, 28, 20), SPH_S = new THREE.SphereGeometry(1, 14, 10);
function outline(mesh, w){
  const o = new THREE.Mesh(mesh.geometry, OUTLINE); const s = mesh.scale;
  o.scale.set(1 + w/Math.max(s.x,.01), 1 + w/Math.max(s.y,.01), 1 + w/Math.max(s.z,.01));
  mesh.add(o); return mesh;
}
function B(x,y,z){ return new THREE.Vector3(x, z, -y); }
function blob(parent, pos, scl, hex, opt){
  opt = opt||{};
  const m = new THREE.Mesh(opt.geo || (opt.small?SPH_S:SPH), toon(hex, opt.keep, opt));
  m.position.copy(pos);
  if(Array.isArray(scl)) m.scale.set(scl[0], scl[2], scl[1]); else m.scale.setScalar(scl);
  if(opt.rot) m.rotation.set(opt.rot[0]||0, opt.rot[1]||0, opt.rot[2]||0);
  m.castShadow = opt.shadow!==false; m.receiveShadow = true;
  if(opt.outline!==false && !opt.small) outline(m, opt.ow||0.045);
  parent.add(m); return m;
}
function mesh(parent, geo, hex, opt){
  opt=opt||{};
  if(opt.uv) worldUV(geo, opt.uv[0], opt.uv[1], opt.uv[2], opt.uv[3]);
  const m = new THREE.Mesh(geo, toon(hex, opt.keep, opt));
  if(opt.pos) m.position.copy(opt.pos);
  if(opt.rot) m.rotation.set(opt.rot[0]||0,opt.rot[1]||0,opt.rot[2]||0);
  if(opt.scl) m.scale.set(opt.scl[0],opt.scl[1],opt.scl[2]);
  m.castShadow = opt.shadow!==false; m.receiveShadow = true;
  if(opt.outline!==false) outline(m, opt.ow||0.04);
  parent.add(m); return m;
}
// box UVs in world units from the box's own corner, so one tiling texture keeps the same scale on every wall
function worldUV(geo, su, sv, u0, v0){
  geo.computeBoundingBox(); const bb = geo.boundingBox;
  const p = geo.attributes.position, n = geo.attributes.normal, uv = geo.attributes.uv;
  for(let i=0;i<p.count;i++){
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
    const X = p.getX(i)-bb.min.x, Y = p.getY(i)-bb.min.y, Z = p.getZ(i)-bb.min.z;
    let u, v;
    if(ay >= ax && ay >= az){ u = X; v = Z; } else if(ax >= az){ u = Z; v = Y; } else { u = X; v = Y; }
    uv.setXY(i, (u + (u0||0))/su, (v + (v0||0))/(sv||su));
  }
  uv.needsUpdate = true; return geo;
}
function box(parent, x0, x1, y0, y1, z0, z1, hex, opt){
  const m = mesh(parent, new THREE.BoxGeometry(x1-x0, y1-y0, z1-z0), hex, Object.assign({pos:new THREE.Vector3((x0+x1)/2,(y0+y1)/2,(z0+z1)/2), ow:.05}, opt||{}));
  // outline width in world units, so big walls don't grow thick dark rims seen from the slanted camera
  const o = m.children[m.children.length-1], w = (opt&&opt.ow) || .05;
  if(o && o.material === OUTLINE) o.scale.set(1 + 2*w/(x1-x0), 1 + 2*w/(y1-y0), 1 + 2*w/(z1-z0));
  return m;
}
function rod(parent, a, b, r, hex, opt){
  const d = new THREE.Vector3().subVectors(b,a); const len = d.length();
  const m = mesh(parent, new THREE.CylinderGeometry(r, r, len, 10), hex, Object.assign({ow:0.03},opt||{}));
  m.position.copy(a).addScaledVector(d, .5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), d.normalize());
  return m;
}
function eyes(parent, cx, y, z, sx, sy, look, gap, keep){
  gap = gap||0.36; const out = [];
  for(const s of [-1,1]){
    const ex = cx + s*gap;
    blob(parent, new THREE.Vector3(ex, y, z), [sx, sx*0.6, sy], '#FFFFFF', {ow:0.03, keep:true});
    const px = ex + look*sx*0.38;
    out.push(blob(parent, new THREE.Vector3(px, y-sy*0.05, z+sx*0.55), [sx*0.5, sx*0.12, sy*0.55], '#1E1530', {small:true, keep:true}));
    blob(parent, new THREE.Vector3(px+sx*0.18, y+sy*0.2, z+sx*0.62), [sx*0.15, sx*0.05, sx*0.16], '#FFFFFF', {small:true, keep:true});
  }
  return out;
}
function smile(parent, x, y, z, r, hex){
  return mesh(parent, new THREE.TorusGeometry(r, r*0.22, 8, 20, Math.PI), hex||'#7A2318', {pos:new THREE.Vector3(x,y,z), rot:[0,0,Math.PI], outline:false, shadow:false});
}

// ================= characters (same blocks as the approved 3D line-up) =================
function buildTo(g){
  const R='#C23A28', R2='#B4321F', Y='#E8A41A', SK='#F3D7B4';
  const body = blob(g, B(0,0,1.0), [.84,.76,.95], R);
  const legs = [];
  for(const s of [-1,1]) legs.push(blob(g, B(s*.4,-.08,.13), [.33,.38,.19], R2));
  const head = new THREE.Group(); g.add(head);
  blob(head, B(0,0,2.72), [.97,.92,.9], SK);
  for(let i=0;i<10;i++){
    const a = i/10*Math.PI*2; const p = new THREE.Mesh(SPH, toon(Y)); p.castShadow = true;
    p.position.set(Math.cos(a)*.62, 1.8, Math.sin(a)*.62); p.scale.set(.25,.2,.09);
    p.rotation.order = 'YXZ'; p.rotation.y = -a + Math.PI/2; p.rotation.x = 0.95; outline(p,.03); g.add(p);
  }
  const arms = [];
  for(const s of [-1,1]){
    const a = new THREE.Group(); a.position.copy(B(s*.8,-.04,1.55)); g.add(a);
    blob(a, new THREE.Vector3(s*.06,-.35,0), [.2,.21,.42], R, {rot:[0,0,s*0.42]});
    blob(a, new THREE.Vector3(s*.22,-.75,-.1), .26, Y);
    arms.push(a);
  }
  const stick = new THREE.Group(); g.add(stick);
  const a = B(.25,.5,.35), b = B(.95,.75,4.15); rod(stick, a, b, .07, '#C99A52');
  blob(head, B(0,0,3.8), [.26,.24,.55], R);
  blob(head, B(-.34,.05,3.62), [.18,.17,.4], Y, {rot:[0,0,0.6]});
  blob(head, B(.34,.05,3.62), [.18,.17,.4], '#2E9C93', {rot:[0,0,-0.6]});
  // eyes as on the approved cover: big round whites, large black pupils looking up, two highlights, thin dark brows, round rosy cheeks
  for(const s of [-1,1]){
    const ex = s*.36;
    blob(head, new THREE.Vector3(ex, 2.76, .64), [.36, .24, .42], '#FFFFFF', {ow:.03, keep:true});
    blob(head, new THREE.Vector3(ex + s*.015, 2.85, .84), [.25, .08, .29], '#141019', {small:true, keep:true});
    blob(head, new THREE.Vector3(ex + .08, 2.97, .91), [.085, .03, .095], '#FFFFFF', {small:true, keep:true});
    blob(head, new THREE.Vector3(ex - .07, 2.75, .9), [.04, .02, .045], '#FFFFFF', {small:true, keep:true});
    mesh(head, new THREE.TorusGeometry(.17, .022, 6, 14, Math.PI*.7), '#3A2420', {pos:new THREE.Vector3(ex, 3.08, .76), rot:[-.25, 0, Math.PI*.15], outline:false, shadow:false});
    blob(head, new THREE.Vector3(s*.64, 2.42, .6), [.15, .05, .12], '#F2938A', {small:true});
  }
  const mouth = smile(head, 0, 2.4, .86, .07);
  return {body, head, legs, arms, mouth};
}
function buildBa(g){
  const ST='#D8382A', BR='#7A4E2D', PA='#3E3A44', SK='#E8C39E';
  mesh(g, new THREE.CylinderGeometry(.75,.7,.16,24), ST, {pos:new THREE.Vector3(0,1.05,-.15)});
  for(const [x,z] of [[-.5,-.6],[.5,-.6],[-.5,.3],[.5,.3]]) rod(g, new THREE.Vector3(x*.75,1,z), new THREE.Vector3(x,0,z*1.2-.05), .07, ST);
  blob(g, new THREE.Vector3(0,1.85,-.15), [.82,.7,.85], BR);
  for(const s of [-1,1]){
    blob(g, new THREE.Vector3(s*.33,1.25,.35), [.3,.6,.27], PA, {rot:[Math.PI/2,0,0]});
    blob(g, new THREE.Vector3(s*.36,.62,.85), [.22,.24,.55], PA);
    blob(g, new THREE.Vector3(s*.36,.12,1.0), [.24,.3,.12], '#5A3B24');
  }
  mesh(g, new THREE.CylinderGeometry(.85,.75,.12,28), '#C9A15A', {pos:new THREE.Vector3(0,1.62,.7)});
  const tiny = [];
  [['#C23A28',-.42],['#E8A41A',0],['#2E9C93',.42]].forEach(([c,x],i)=>{
    const z0 = ZONE; ZONE = 'tray'+i;
    tiny.push(blob(g, new THREE.Vector3(x,1.82,.75), [.13,.12,.16], c, {ow:.02}));
    blob(g, new THREE.Vector3(x,2.05,.75), .1, '#F3D7B4', {ow:.02});
    ZONE = z0;
  });
  for(const s of [-1,1]){
    blob(g, new THREE.Vector3(s*.72,1.9,.1), [.18,.18,.42], BR, {rot:[0.9,0,s*0.25]});
    blob(g, new THREE.Vector3(s*.6,1.72,.6), .17, SK);
  }
  const head = new THREE.Group(); g.add(head);
  blob(head, new THREE.Vector3(0,2.95,-.1), [.74,.72,.7], SK);
  blob(head, new THREE.Vector3(0,3.3,-.25), [.74,.62,.5], '#B9B4AE');
  blob(head, new THREE.Vector3(0,3.4,-.78), [.36,.34,.32], '#B9B4AE');
  eyes(head, 0, 2.98, .56, .2, .22, .6, .26);
  for(const s of [-1,1]) mesh(head, new THREE.TorusGeometry(.25,.035,8,24), '#3A2C24', {pos:new THREE.Vector3(s*.26,2.98,.7), outline:false});
  for(const s of [-1,1]) blob(head, new THREE.Vector3(s*.48,2.72,.5), [.12,.04,.08], '#E79B85', {small:true});
  smile(head, 0, 2.66, .66, .12);
  return {head};
}
function buildHai(g){
  const TE='#2E8C86', PA='#2A2630', SK='#EBC7A0';
  for(const s of [-1,1]){
    blob(g, new THREE.Vector3(s*.28,.75,0), [.24,.24,.7], PA);
    blob(g, new THREE.Vector3(s*.3,.1,.12), [.22,.26,.13], '#B5512F');
  }
  blob(g, new THREE.Vector3(0,2.15,0), [.68,.55,.95], TE);
  blob(g, new THREE.Vector3(0,1.35,0), [.62,.5,.32], TE);
  blob(g, new THREE.Vector3(-.72,2.1,.05), [.17,.17,.5], TE, {rot:[0,0,-0.35]});
  blob(g, new THREE.Vector3(-.92,1.6,.12), .15, SK);
  const arm = new THREE.Group(); arm.position.set(.62,2.7,0); g.add(arm);
  blob(arm, new THREE.Vector3(.18,.35,0), [.17,.17,.5], TE, {rot:[0,0,-0.4]});
  blob(arm, new THREE.Vector3(.38,.82,.05), .15, SK);
  rod(arm, new THREE.Vector3(.38,.6,.05), new THREE.Vector3(.38,1.7,.15), .04, '#8C6631');
  mesh(arm, new THREE.SphereGeometry(.22,16,10,0,Math.PI*2,Math.PI/2,Math.PI/2), '#9A9DA3', {pos:new THREE.Vector3(.38,1.88,.18), rot:[Math.PI,0,0]});
  const head = new THREE.Group(); g.add(head);
  blob(head, new THREE.Vector3(0,3.55,0), [.66,.68,.64], SK);
  blob(head, new THREE.Vector3(0,3.75,-.2), [.68,.55,.52], '#1E1A22');
  blob(head, new THREE.Vector3(0,3.4,-.62), [.3,.3,.42], '#1E1A22');
  eyes(head, 0, 3.6, .6, .2, .23, -.5, .25);
  for(const s of [-1,1]) blob(head, new THREE.Vector3(s*.42,3.38,.46), [.11,.04,.07], '#E79B85', {small:true});
  smile(head, 0, 3.32, .62, .11);
  const hat = mesh(head, new THREE.ConeGeometry(1.15,.62,28,1,true), '#E3C77A', {pos:new THREE.Vector3(0,4.38,0), ow:.04});
  hat.material.side = THREE.DoubleSide; hat.castShadow = false;
  const pot = new THREE.Group(); pot.position.set(-1.55,0,.6); g.add(pot);
  mesh(pot, new THREE.CylinderGeometry(.55,.48,.85,24), '#6B6F75', {pos:new THREE.Vector3(0,.43,0)});
  mesh(pot, new THREE.CylinderGeometry(.5,.5,.04,24), '#F1E4C3', {pos:new THREE.Vector3(0,.84,0), outline:false});
  [['#8CC152',-.18,.1],['#F2C230',.18,-.05],['#C0392B',0,.22],['#FFFFFF',.05,-.22]].forEach(([c,x,z])=>blob(pot,new THREE.Vector3(x,.88,z),[.12,.12,.05],c,{small:true}));
  return {arm, head};
}
function buildBui(g, s, seed){
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const p = geo.attributes.position; let r = seed*17; const rnd=()=>{ r=(r*9301+49297)%233280; return r/233280; };
  const cache={};
  for(let i=0;i<p.count;i++){ const k=p.getX(i).toFixed(3)+p.getY(i).toFixed(3)+p.getZ(i).toFixed(3); const f=cache[k]||(cache[k]=0.82+rnd()*0.3); p.setXYZ(i,p.getX(i)*f,p.getY(i)*f,p.getZ(i)*f); }
  geo.computeVertexNormals();
  const m = mesh(g, geo, '#8E8A86', {keep:true, scl:[s,s*.92,s], ow:.035}); m.material.flatShading = true;
  for(const sd of [-1,1]){
    blob(g, new THREE.Vector3(sd*s*.34, s*.12, s*.82), [s*.26,s*.12,s*.3], '#FFFFFF', {keep:true, ow:.02});
    blob(g, new THREE.Vector3(sd*s*.34 + s*.07, s*.08, s*.95), [s*.12,s*.04,s*.14], '#1E1530', {keep:true, small:true});
  }
}
function buildBong(g){
  const YE='#F2C230', TE='#2E9C93', SK='#F0CFA8';
  for(const s of [-1,1]){ blob(g, new THREE.Vector3(s*.2,.3,0), [.16,.16,.3], SK); blob(g, new THREE.Vector3(s*.21,.07,.07), [.15,.18,.09], '#C23A28'); }
  blob(g, new THREE.Vector3(0,.72,0), [.44,.38,.24], TE);
  blob(g, new THREE.Vector3(0,1.1,0), [.44,.36,.38], YE);
  const arms = [];
  for(const s of [-1,1]){ const a = new THREE.Group(); a.position.set(s*.42,1.08,.22); g.add(a);
    blob(a, new THREE.Vector3(0,0,0), [.12,.12,.28], YE, {rot:[1.1,0,s*0.3]}); blob(a, new THREE.Vector3(-s*.12,-.1,.3), .11, SK); arms.push(a); }
  const boat = new THREE.Group(); boat.position.set(0,1.05,.68); g.add(boat);
  const sh = new THREE.Shape(); sh.moveTo(-.55,.18); sh.lineTo(.55,.18); sh.lineTo(.32,-.12); sh.lineTo(-.32,-.12); sh.closePath();
  mesh(boat, new THREE.ExtrudeGeometry(sh,{depth:.34,bevelEnabled:false}), '#F4EFE4', {pos:new THREE.Vector3(0,0,-.17), ow:.025});
  mesh(boat, new THREE.CylinderGeometry(0,.26,.42,3), '#F4EFE4', {pos:new THREE.Vector3(0,.39,0), scl:[1,1,.35], ow:.025});
  mesh(boat, new THREE.BoxGeometry(.9,.05,.36), '#D8382A', {pos:new THREE.Vector3(0,.1,0), outline:false});
  const head = new THREE.Group(); g.add(head);
  blob(head, new THREE.Vector3(0,2.0,0), [.72,.66,.66], SK);
  blob(head, new THREE.Vector3(0,2.2,-.18), [.74,.6,.56], '#1E1A22');
  blob(head, new THREE.Vector3(0,2.62,.22), [.2,.18,.2], '#1E1A22', {rot:[0.5,0,0]});
  blob(head, new THREE.Vector3(0,2.78,.42), [.08,.09,.14], '#1E1A22', {rot:[1.0,0,0], small:true});
  for(const s of [-1,1]) blob(head, new THREE.Vector3(s*.5,2.45,.3), [.14,.12,.12], '#C23A28', {ow:.02});
  eyes(head, 0, 2.02, .6, .21, .25, .3, .27);
  for(const s of [-1,1]) blob(head, new THREE.Vector3(s*.45,1.8,.46), [.12,.04,.08], '#EE8C78', {small:true});
  smile(head, 0, 1.74, .62, .12);
  for(const s of [-1,1]) blob(head, new THREE.Vector3(s*.7,2.0,0), [.1,.1,.14], SK, {ow:.025});
  return {head, boat, arms};
}
// Mẹ Bống: áo bà ba tím, quần đen, tóc búi, ngồi bó gối trên mạn ghe
function buildMe(g){
  const AO='#8E6CC0', PA='#2A2630', SK='#EBC7A0';
  for(const s of [-1,1]){
    blob(g, new THREE.Vector3(s*.3,.75,0), [.25,.25,.7], PA);
    blob(g, new THREE.Vector3(s*.3,.1,.12), [.2,.24,.12], '#7A4E2D');
  }
  blob(g, new THREE.Vector3(0,2.15,0), [.66,.55,.92], AO);
  blob(g, new THREE.Vector3(0,1.4,0), [.6,.5,.35], AO);
  for(let i=0;i<4;i++) blob(g, new THREE.Vector3(.18,2.5-i*.3,.5), .045, '#F4F1EA', {small:true});
  const arms = [];
  for(const s of [-1,1]){ const a = new THREE.Group(); a.position.set(s*.62,2.6,0); g.add(a);
    blob(a, new THREE.Vector3(s*.1,-.4,.05), [.17,.17,.5], AO, {rot:[0,0,s*0.3]}); blob(a, new THREE.Vector3(s*.2,-.85,.12), .15, SK); arms.push(a); }
  const head = new THREE.Group(); g.add(head);
  blob(head, new THREE.Vector3(0,3.5,0), [.64,.66,.62], SK);
  blob(head, new THREE.Vector3(0,3.72,-.18), [.67,.56,.52], '#1E1A22');
  blob(head, new THREE.Vector3(0,3.75,-.7), [.32,.3,.3], '#1E1A22');
  rod(head, new THREE.Vector3(-.35,3.85,-.7), new THREE.Vector3(.35,3.7,-.7), .025, '#C99A52', {outline:false});
  eyes(head, 0, 3.55, .58, .19, .22, .2, .24);
  for(const s of [-1,1]) blob(head, new THREE.Vector3(s*.42,3.32,.46), [.11,.04,.07], '#E79B85', {small:true});
  smile(head, 0, 3.28, .6, .1);
  return {head, arms};
}


// Chú Tư: round belly, cap, moustache, towel over the shoulder; the blue standing fan is built by the level when it needs one
function buildTu(g){
  const SH='#E07B4F', PA='#4A3B34', SK='#D9A97F';
  for(const s of [-1,1]){
    blob(g, new THREE.Vector3(s*.42,.5,0), [.28,.28,.5], PA);
    blob(g, new THREE.Vector3(s*.44,.1,.14), [.26,.28,.14], '#2B2420');
  }
  const belly = blob(g, new THREE.Vector3(0,1.75,0), [1.0,.9,1.05], SH);
  blob(g, new THREE.Vector3(0,1.0,0), [.82,.7,.35], PA);
  mesh(g, new THREE.BoxGeometry(.38,.08,1.5), '#F4F1EA', {pos:new THREE.Vector3(-.55,2.62,0), rot:[0,0,0.35], ow:.025});
  mesh(g, new THREE.BoxGeometry(.38,.7,.08), '#F4F1EA', {pos:new THREE.Vector3(-.72,2.3,.72), rot:[0,0,0.2], ow:.025});
  const arms = [];
  for(const s of [-1,1]){ const a = new THREE.Group(); a.position.set(s*.9,2.2,.05); g.add(a);
    blob(a, new THREE.Vector3(s*.12,-.35,0), [.22,.22,.5], SK, {rot:[0,0,s*0.35]}); blob(a, new THREE.Vector3(s*.3,-.82,.1), .2, SK); arms.push(a); }
  const head = new THREE.Group(); g.add(head);
  blob(head, new THREE.Vector3(0,3.3,0), [.7,.7,.68], SK);
  mesh(head, new THREE.SphereGeometry(.73,24,12,0,Math.PI*2,0,Math.PI/2), '#2E8C86', {pos:new THREE.Vector3(0,3.55,-.04)});
  mesh(head, new THREE.CylinderGeometry(.5,.5,.06,20,1,false,-Math.PI/2,Math.PI), '#2E8C86', {pos:new THREE.Vector3(0,3.62,.42), scl:[1,1,1.1], rot:[0.12,0,0]});
  eyes(head, 0, 3.42, .64, .19, .22, .6, .26);
  for(const s of [-1,1]) blob(head, new THREE.Vector3(s*.2,3.06,.63), [.24,.07,.07], '#1E1A22', {small:true, rot:[0,0,s*-0.3]});
  blob(head, new THREE.Vector3(0,3.18,.68), [.13,.11,.11], '#C98E68', {ow:.025});
  smile(head, 0, 2.92, .6, .1);
  for(const s of [-1,1]) blob(head, new THREE.Vector3(s*.7,3.3,0), [.1,.1,.14], SK, {ow:.025});
  return {head, belly, arms};
}


const dotTex = (function(){ const c = document.createElement('canvas'); c.width = 64; c.height = 64; const x = c.getContext('2d');
  const g = x.createRadialGradient(32,32,0,32,32,32); g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(.35,'rgba(255,255,255,.55)'); g.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0,0,64,64); return new THREE.CanvasTexture(c); })();
// ================= textures: grey detail only, tinted by each material's colour so the grey/colour zones keep working =================
let tseed = 11; const trnd = ()=> (tseed = (tseed*16807) % 2147483647) / 2147483647;
function canvasTex(w, h, draw, clampT){
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
  draw(x, w, h);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
  t.wrapS = THREE.RepeatWrapping; t.wrapT = clampT ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
  t.anisotropy = 4; return t;
}
function speckle(x, w, h, n, a){ for(let i=0;i<n;i++){ x.fillStyle = trnd()<.5 ? `rgba(0,0,0,${trnd()*a})` : `rgba(255,255,255,${trnd()*a})`; x.fillRect(trnd()*w, trnd()*h, 1+trnd()*2, 1+trnd()*2); } }
function soft(x, cx, cy, r, a){ const g = x.createRadialGradient(cx,cy,0,cx,cy,r); g.addColorStop(0,`rgba(0,0,0,${a})`); g.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(cx-r,cy-r,r*2,r*2); }
const TEX = {};
// old lime plaster: soft stains, a few chipped spots showing brick, grime along the bottom (v runs 0..1 over 9 units of wall, clamped)
TEX.plaster = canvasTex(256, 512, (x,w,h)=>{
  x.fillStyle = '#F6F6F6'; x.fillRect(0,0,w,h);
  for(let i=0;i<46;i++){ const cx = trnd()*w, cy = trnd()*h, r = 14+trnd()*40, a = .03+trnd()*.05; for(const dx of [-w,0,w]) soft(x, cx+dx, cy, r, a); }
  for(let i=0;i<3;i++){
    const cx = 30+trnd()*(w-80), cy = h*.62 + trnd()*h*.3, bw = 16+trnd()*18, bh = 9+trnd()*8;
    x.fillStyle = 'rgba(0,0,0,.05)'; x.beginPath(); x.ellipse(cx, cy, bw, bh, 0, 0, Math.PI*2); x.fill();
    x.save(); x.beginPath(); x.ellipse(cx, cy, bw-3, bh-3, 0, 0, Math.PI*2); x.clip();
    for(let yy=cy-bh; yy<cy+bh; yy+=8) for(let xx=cx-bw-((yy/8)%2)*9; xx<cx+bw; xx+=18){ x.fillStyle = `rgba(0,0,0,${.07+trnd()*.05})`; x.fillRect(xx, yy, 16, 6); }
    x.restore();
  }
  for(let i=0;i<5;i++){ x.strokeStyle = 'rgba(0,0,0,.16)'; x.lineWidth = 1.2; x.beginPath(); let px = trnd()*w, py = trnd()*h*.8; x.moveTo(px,py); for(let k=0;k<6;k++){ px += (trnd()-.5)*16; py += 6+trnd()*10; x.lineTo(px,py); } x.stroke(); }
  const g = x.createLinearGradient(0, h, 0, h*.86); g.addColorStop(0,'rgba(40,30,20,.26)'); g.addColorStop(1,'rgba(40,30,20,0)'); x.fillStyle = g; x.fillRect(0, h*.86, w, h*.14);
  speckle(x, w, h, 2600, .07);
}, true);
// clay roof tiles, rows of half-round ends
TEX.tile = canvasTex(128, 128, (x,w,h)=>{
  x.fillStyle = '#E8E8E8'; x.fillRect(0,0,w,h);
  const rh = 16, tw = 16;
  for(let r=0;r<h/rh;r++) for(let c=-1;c<w/tw+1;c++){
    const ox = c*tw + (r%2)*tw/2, oy = r*rh;
    const g = x.createLinearGradient(0, oy, 0, oy+rh); g.addColorStop(0,'#FFFFFF'); g.addColorStop(.75,'#E2E2E2'); g.addColorStop(1,'#A8A8A8');
    x.fillStyle = g; x.beginPath(); x.moveTo(ox, oy); x.lineTo(ox, oy+rh-5); x.quadraticCurveTo(ox+tw/2, oy+rh+3, ox+tw, oy+rh-5); x.lineTo(ox+tw, oy); x.fill();
    x.strokeStyle = 'rgba(0,0,0,.22)'; x.lineWidth = 1; x.stroke();
  }
  speckle(x, w, h, 300, .08);
});
// pavement: big square tiles with worn grout
TEX.pave = canvasTex(256, 256, (x,w,h)=>{
  x.fillStyle = '#9A9A9A'; x.fillRect(0,0,w,h);
  const n = 4, s = w/n;
  for(let i=0;i<n;i++) for(let j=0;j<n;j++){ const v = 228 + Math.floor(trnd()*22); x.fillStyle = `rgb(${v},${v},${v})`; x.fillRect(i*s+2, j*s+2, s-4, s-4);
    if(trnd()<.3){ x.strokeStyle = 'rgba(0,0,0,.14)'; x.beginPath(); x.moveTo(i*s+trnd()*s, j*s+3); x.lineTo(i*s+trnd()*s, j*s+s-3); x.stroke(); } }
  speckle(x, w, h, 1800, .08);
});
TEX.road = canvasTex(256, 256, (x,w,h)=>{
  x.fillStyle = '#E6E6E6'; x.fillRect(0,0,w,h); speckle(x, w, h, 5000, .12);
  for(let i=0;i<10;i++) soft(x, trnd()*w, trnd()*h, 20+trnd()*30, .05);
});
TEX.stone = canvasTex(256, 128, (x,w,h)=>{
  x.fillStyle = '#8C8C8C'; x.fillRect(0,0,w,h);
  for(let r=0;r<4;r++) for(let c=-1;c<5;c++){ const v = 205 + Math.floor(trnd()*40); x.fillStyle = `rgb(${v},${v},${v})`;
    const ox = c*64 + (r%2)*32; x.beginPath(); x.roundRect ? x.roundRect(ox+2, r*32+2, 60, 28, 5) : x.rect(ox+2, r*32+2, 60, 28); x.fill(); }
  speckle(x, w, h, 900, .1);
});
TEX.louver = canvasTex(32, 64, (x,w,h)=>{
  x.fillStyle = '#F2F2F2'; x.fillRect(0,0,w,h);
  for(let y=0;y<h;y+=8){ x.fillStyle = 'rgba(0,0,0,.28)'; x.fillRect(0, y+5, w, 3); x.fillStyle = 'rgba(255,255,255,.6)'; x.fillRect(0, y, w, 1); }
});
TEX.wood = canvasTex(128, 128, (x,w,h)=>{
  x.fillStyle = '#EDEDED'; x.fillRect(0,0,w,h);
  for(let i=0;i<w;i+=16){ x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(i, 0, 2, h); for(let k=0;k<4;k++){ x.strokeStyle = `rgba(0,0,0,${.05+trnd()*.07})`; x.beginPath(); const gx = i+4+trnd()*9; x.moveTo(gx,0); x.bezierCurveTo(gx+3,h*.3,gx-3,h*.6,gx+1,h); x.stroke(); } }
});
TEX.water = canvasTex(256, 256, (x,w,h)=>{
  x.fillStyle = '#E4E4E4'; x.fillRect(0,0,w,h);
  for(let i=0;i<34;i++){ const cx = trnd()*w, cy = trnd()*h, l = 20+trnd()*40;
    for(const dx of [-w,0,w]) for(const dy of [-h,0,h]){ x.strokeStyle = 'rgba(255,255,255,.95)'; x.lineWidth = 3; x.beginPath(); x.moveTo(cx+dx-l/2, cy+dy); x.quadraticCurveTo(cx+dx, cy+dy-5, cx+dx+l/2, cy+dy); x.stroke();
      x.strokeStyle = 'rgba(0,0,0,.08)'; x.lineWidth = 2; x.beginPath(); x.moveTo(cx+dx-l/2, cy+dy+6); x.quadraticCurveTo(cx+dx, cy+dy+1, cx+dx+l/2, cy+dy+6); x.stroke(); } }
});
// facade of a background house: one bay (2.6 units) by one floor (3.2 units) with a shuttered window and a balcony rail
TEX.facade = canvasTex(128, 160, (x,w,h)=>{
  x.fillStyle = '#F4F4F4'; x.fillRect(0,0,w,h);
  for(let i=0;i<6;i++) soft(x, trnd()*w, trnd()*h, 18+trnd()*20, .05);
  x.fillStyle = 'rgba(0,0,0,.12)'; x.fillRect(0, h-12, w, 6);              // floor band
  x.fillStyle = 'rgba(255,255,255,.7)'; x.fillRect(0, h-14, w, 2);
  x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(30, 34, 68, 84);              // frame
  x.fillStyle = 'rgba(20,20,30,.62)'; x.fillRect(36, 40, 56, 72);           // dark window
  for(const sx of [14, 98]){ x.fillStyle = 'rgba(0,0,0,.24)'; x.fillRect(sx, 38, 16, 76); for(let y=40;y<112;y+=6){ x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(sx, y, 16, 2); } }
  x.fillStyle = 'rgba(0,0,0,.35)'; for(let i=36;i<92;i+=8) x.fillRect(i, 92, 2, 26); x.fillRect(32, 92, 64, 3);   // little balcony rail
  x.fillStyle = 'rgba(0,0,0,.2)'; x.fillRect(26, 118, 76, 5);
  speckle(x, w, h, 500, .06);
});
// clock face with the hands stopped (the story's stopped clock)
TEX.clock = canvasTex(128, 128, (x,w,h)=>{
  x.fillStyle = '#FFFFFF'; x.fillRect(0,0,w,h); x.fillStyle = '#2A2230'; x.font = 'bold 15px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  for(let i=1;i<=12;i++){ const a = i/12*Math.PI*2 - Math.PI/2; x.fillText(String(i), 64+Math.cos(a)*48, 64+Math.sin(a)*48); }
  x.lineCap = 'round'; x.strokeStyle = '#2A2230'; x.lineWidth = 5; x.beginPath(); x.moveTo(64,64); x.lineTo(64+26*Math.cos(-2.3), 64+26*Math.sin(-2.3)); x.stroke();
  x.lineWidth = 3; x.beginPath(); x.moveTo(64,64); x.lineTo(64, 22); x.stroke();
});
// hand-painted shop sign lettering: white text on clear, tinted by its material; redrawn once the web font arrives
const signTexs = [];
function textTex(text, sub){
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 128; const x = cv.getContext('2d');
  const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
  const draw = ()=>{ x.clearRect(0,0,512,128); x.fillStyle = '#FFFFFF'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = `${sub ? 64 : 84}px "Patrick Hand", "Be Vietnam Pro", sans-serif`; x.fillText(text, 256, sub ? 50 : 66);
    if(sub){ x.font = '34px "Be Vietnam Pro", sans-serif'; x.fillText(sub, 256, 104); } t.needsUpdate = true; };
  draw(); signTexs.push(draw); return t;
}
if(document.fonts && document.fonts.load) Promise.all([document.fonts.load('84px "Patrick Hand"'), document.fonts.load('34px "Be Vietnam Pro"'), document.fonts.load('bold 40px "Oswald"')]).then(()=>signTexs.forEach(f=>f())).catch(()=>{});


// ================= day-sheet texture: torn grey calendar pages, a big day number on top, and a faint picture of what that day held =================
function dayTexture(w, h, day, seed, pic){
  const pxu = 64, cw = Math.max(48, Math.round(w*pxu)), ch = Math.max(48, Math.round(h*pxu));
  const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch; const x = cv.getContext('2d');
  const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding;
  const draw = ()=>{
  let r; const rnd=()=>{ r=(r*9301+49297)%233280; return r/233280; };
  r = seed % 233280; x.fillStyle = '#B7B3AE'; x.fillRect(0,0,cw,ch);
  const pw = 1.5*pxu, ph = 1.9*pxu;
  for(let yy=-ph*0.3; yy<ch; yy+=ph*0.78) for(let xx=-pw*0.3; xx<cw; xx+=pw*0.8){
    const ox = xx + (rnd()-.5)*20, oy = yy + (rnd()-.5)*20;
    x.save(); x.translate(ox+pw/2, oy+ph/2); x.rotate((rnd()-.5)*0.14);
    x.fillStyle = rnd()<.5 ? '#C2BEB9' : '#ADA9A4'; x.fillRect(-pw/2,-ph/2,pw,ph);
    x.strokeStyle = 'rgba(80,72,70,.25)'; x.lineWidth = 2; x.strokeRect(-pw/2,-ph/2,pw,ph);
    x.fillStyle = 'rgba(90,82,80,.22)'; x.fillRect(-pw/2,-ph/2,pw,ph*0.16);
    x.font = `bold ${Math.round(ph*0.42)}px "Patrick Hand", sans-serif`; x.textAlign='center'; x.textBaseline='middle';
    x.fillStyle = 'rgba(80,72,70,.2)'; x.fillText(String(1+Math.floor(rnd()*30)), 0, ph*0.08);
    x.restore();
  }
  for(let i=0;i<cw*ch/90;i++){ x.fillStyle = `rgba(60,55,52,${rnd()*0.08})`; x.fillRect(rnd()*cw, rnd()*ch, 2, 2); }
  if(pic){ x.save(); pic(x, cw, ch); x.restore(); }
  if(day){
    // the day leaf: a whiter calendar page with a darker header strip and the day in big numerals
    const bw = Math.min(cw*.86, 1.5*pxu), bh = Math.min(ch*.86, 1.9*pxu), bx = (cw-bw)/2, by = Math.min(ch*.08, 10);
    x.save(); x.translate(bx+bw/2, by+bh/2); x.rotate((rnd()-.5)*.06);
    x.fillStyle = '#D6D2CD'; x.fillRect(-bw/2,-bh/2,bw,bh);
    x.fillStyle = '#8E8A86'; x.fillRect(-bw/2,-bh/2,bw,bh*.17);
    x.strokeStyle = 'rgba(60,55,52,.5)'; x.lineWidth = 2; x.strokeRect(-bw/2,-bh/2,bw,bh);
    const fs = Math.round(Math.min(bh*.5, bw*(day.length > 3 ? .3 : day.length > 2 ? .4 : .62)));
    x.font = `bold ${fs}px "Oswald", "Arial Narrow", sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = '#4A453F'; x.fillText(day, 0, bh*.1);
    x.restore();
  }
  t.needsUpdate = true; };
  draw(); signTexs.push(draw); return t;
}

// ================= scenery groups and shared shapes =================
// static scenery goes into W and is merged into a few big meshes by bake() (one draw per material)
const W = new THREE.Group(); scene.add(W);
const PLASTER = [6, 9], WALL = {uv:PLASTER, map:TEX.plaster};
const ICO = new THREE.IcosahedronGeometry(1, 1), ICO0 = new THREE.IcosahedronGeometry(1, 0);
function leaf(parent, pos, s, hex, o){ return blob(parent, pos, s, hex, Object.assign({geo:ICO, flat:true, ow:.04}, o||{})); }
const STAR_GEO = (function(){
  const sh = new THREE.Shape();
  for(let i=0;i<10;i++){ const a = i/10*Math.PI*2 + Math.PI/2; const r = i%2? .3 : .7; i? sh.lineTo(Math.cos(a)*r, Math.sin(a)*r) : sh.moveTo(Math.cos(a)*r, Math.sin(a)*r); }
  return new THREE.ExtrudeGeometry(sh,{depth:.25, bevelEnabled:true, bevelSize:.05, bevelThickness:.05, bevelSegments:2});
})();

// ---------- building kit ----------
// window with louvre shutters opened out, a frame, an iron grille and a ledge with a pot
function win(p, cx, y0, w, h, zf, trim, shut, o){
  o = o||{};
  box(p, cx-w/2-.14, cx+w/2+.14, y0-.14, y0+h+.14, zf, zf+.07, trim, {ow:.025});
  box(p, cx-w/2, cx+w/2, y0, y0+h, zf+.05, zf+.08, '#3B4152', {outline:false});
  box(p, cx-.03, cx+.03, y0, y0+h, zf+.08, zf+.1, trim, {outline:false});
  for(const s of [-1,1]){
    const g = new THREE.Group(); g.position.set(cx + s*(w/2+.12), y0, zf+.08); g.rotation.y = -s*(o.open===undefined ? 1.15 : o.open); p.add(g);
    mesh(g, new THREE.BoxGeometry(w/2, h, .06), shut, {pos:new THREE.Vector3(s*w/4, h/2, 0), uv:[.5, .5], map:TEX.louver, ow:.02});
  }
  if(o.grille !== false) for(let gx = cx-w/2+.2; gx < cx+w/2-.1; gx += .3) box(p, gx-.02, gx+.02, y0, y0+h, zf+.12, zf+.15, '#2A2630', {outline:false});
  if(o.ledge !== false){
    box(p, cx-w/2-.3, cx+w/2+.3, y0-.3, y0-.14, zf, zf+.42, trim, {ow:.025});
    if(o.pot !== false){ for(const dx of [-w*.28, w*.22]){ mesh(p, new THREE.CylinderGeometry(.16,.12,.24,10), '#B5513A', {pos:new THREE.Vector3(cx+dx, y0-.02, zf+.24), ow:.02});
      leaf(p, new THREE.Vector3(cx+dx, y0+.22, zf+.24), [.26,.22,.22], '#5FAF55'); leaf(p, new THREE.Vector3(cx+dx+.12, y0+.36, zf+.3), .09, o.flower || '#E8442E', {ow:.02}); } }
  }
}
// balcony: slab, turned balusters, top rail, potted plants
function balcony(p, x0, x1, y, zf, d, slab, rail, o){
  o = o||{};
  box(p, x0, x1, y-.2, y, zf, zf+d, slab, {ow:.04});
  box(p, x0, x1, y-.32, y-.2, zf+d-.12, zf+d+.04, slab, {ow:.02});
  for(let x = x0+.15; x <= x1-.14; x += .32) rod(p, new THREE.Vector3(x, y, zf+d-.08), new THREE.Vector3(x, y+.8, zf+d-.08), .035, rail, {outline:false});
  box(p, x0, x1, y+.78, y+.88, zf+d-.16, zf+d, rail, {ow:.02});
  for(const s of [0,1]) box(p, s ? x1-.12 : x0, s ? x1 : x0+.12, y, y+.88, zf, zf+d, rail, {ow:.02});
  if(o.pots !== false) for(let x = x0+.5; x < x1-.3; x += 1.3 + trnd()*.6){
    mesh(p, new THREE.CylinderGeometry(.2,.15,.3,10), ['#B5513A','#E9E2D6','#2F6FB5'][Math.floor(trnd()*3)], {pos:new THREE.Vector3(x, y+.15, zf+.35), ow:.02});
    leaf(p, new THREE.Vector3(x, y+.5, zf+.35), [.32,.3,.3], trnd()<.5 ? '#4E9A4A' : '#5FAF55');
    if(trnd()<.5) leaf(p, new THREE.Vector3(x+.15, y+.7, zf+.45), .1, '#F2C230', {ow:.02});
  }
}
// sloped clay-tile roof with a ridge and a row of round tile ends along the eave
function roof(p, x0, x1, yE, zf, d, rise, c){
  const len = Math.hypot(d, rise), a = Math.atan2(rise, d);
  const g = new THREE.Group(); g.position.set((x0+x1)/2, yE, zf); g.rotation.x = a; p.add(g);
  mesh(g, new THREE.BoxGeometry(x1-x0, .14, len), c, {pos:new THREE.Vector3(0, 0, -len/2), uv:[2, 2], map:TEX.tile, ow:.04});
  for(let x = x0+.13; x < x1; x += .26) mesh(g, new THREE.CylinderGeometry(.09,.09,.12,8), c, {pos:new THREE.Vector3(x-(x0+x1)/2, -.02, .03), rot:[Math.PI/2,0,0], outline:false});
  rod(p, new THREE.Vector3(x0-.05, yE+rise+.06, zf-d), new THREE.Vector3(x1+.05, yE+rise+.06, zf-d), .14, c, {ow:.03});
  for(const s of [x0, x1]){ const sh = new THREE.Shape(); sh.moveTo(0,0); sh.lineTo(-d,0); sh.lineTo(-d,rise); sh.closePath();
    const m = mesh(p, new THREE.ExtrudeGeometry(sh, {depth:.16, bevelEnabled:false}), c === '#B5513A' ? '#E9DCC8' : '#E9DCC8', {ow:.03});
    m.rotation.y = -Math.PI/2; m.position.set(s + (s===x0 ? .08 : -.08) + .08, yE, zf); }
}
// a hand-painted sign board with lettering
function sign(p, x0, x1, y0, y1, z, board, ink, text, sub){
  box(p, x0, x1, y0, y1, z, z+.1, board, {ow:.03});
  box(p, x0+.08, x1-.08, y0+.08, y1-.08, z+.1, z+.12, ink, {outline:false});
  box(p, x0+.14, x1-.14, y0+.14, y1-.14, z+.12, z+.13, board, {outline:false});
  const th = Math.min(y1-y0-.2, (x1-x0-.3)/4), tw = th*4;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(tw, th), toon(ink, false, {map:textTex(text, sub), alpha:true}));
  m.position.set((x0+x1)/2, (y0+y1)/2, z+.14); p.add(m);
}
// bougainvillea (hoa giấy) spilling over an edge: magenta bracts among leaves, hanging longer in the middle
function hoaGiay(p, x0, x1, y, z, drop, c){
  c = c || '#E0398C';
  for(let x = x0; x <= x1; x += .22){
    const t = (x-x0)/Math.max(.01, x1-x0), hang = drop*(.35 + .65*Math.sin(t*Math.PI))*(.7+trnd()*.5);
    for(let yy = 0; yy < hang; yy += .2){
      const pos = new THREE.Vector3(x + (trnd()-.5)*.26, y - yy, z + (trnd()-.2)*.35);
      const r = trnd();
      leaf(p, pos, (r < .55 ? .12 : .15) + trnd()*.05, r < .55 ? c : r < .7 ? '#F06BAE' : r < .88 ? '#4E9A4A' : '#3F8A45', {ow:.025, shadow:false});
    }
  }
}
// a stylised low-poly tree: tapered trunk, two branches, chunky faceted canopy
function tree(p, x, z, h, o){
  o = o||{}; const C = o.c || ['#4E9A4A','#5FAF55','#78C25C'], s = o.s || 1;
  if(o.zone) ZONE = o.zone;
  rod(p, new THREE.Vector3(x,-.3,z), new THREE.Vector3(x+.25*s,h*.55,z), .26*s, '#7A5638', {ow:.04});
  rod(p, new THREE.Vector3(x+.15*s,h*.4,z), new THREE.Vector3(x-1.1*s,h*.66,z+.2), .12*s, '#7A5638', {ow:.03});
  rod(p, new THREE.Vector3(x+.2*s,h*.45,z), new THREE.Vector3(x+1.2*s,h*.7,z-.2), .12*s, '#7A5638', {ow:.03});
  const n = o.n || 7;
  for(let i=0;i<n;i++){
    const a = i/n*Math.PI*2, r = (i%2 ? 1.5 : .9)*s;
    leaf(p, new THREE.Vector3(x + Math.cos(a)*r*1.2, h*.72 + Math.sin(a*1.7)*.9*s + (i%3)*.35*s, z + Math.sin(a)*r*.6), (1.05 + trnd()*.55)*s, C[i%C.length], {ow:.05});
  }
  leaf(p, new THREE.Vector3(x+.1, h*.95, z), 1.3*s, C[0], {ow:.05});
  if(o.flower) for(let i=0;i<12;i++) leaf(p, new THREE.Vector3(x + (trnd()-.5)*3.4*s, h*.68 + trnd()*1.9*s, z + .5 + trnd()*.8), .24*s, o.flower, {ow:.03, shadow:false});
}
// potted plants of a few kinds
function plant(p, x, y, z, s, kind){
  const pc = ['#B5513A','#C98B4A','#E9E2D6','#2F6FB5'][Math.floor(trnd()*4)];
  mesh(p, new THREE.CylinderGeometry(.42*s,.3*s,.62*s,12), pc, {pos:new THREE.Vector3(x, y+.31*s, z), ow:.03});
  box(p, x-.44*s, x+.44*s, y+.58*s, y+.66*s, z-.44*s, z+.44*s, pc, {outline:false});
  if(kind === 'chuoi'){   // banana-like broad leaves
    for(let i=0;i<5;i++){ const a = i/5*Math.PI*2; const g = new THREE.Group(); g.position.set(x, y+.6*s, z); g.rotation.set(0, a, .55 + (i%2)*.25); p.add(g);
      blob(g, new THREE.Vector3(0, .75*s, 0), [.16*s, .07*s, .8*s], i%2 ? '#5FAF55' : '#78C25C', {ow:.025}); }
  } else if(kind === 'hoa'){
    leaf(p, new THREE.Vector3(x, y+.95*s, z), [.55*s,.45*s,.5*s], '#4E9A4A');
    for(let i=0;i<6;i++) leaf(p, new THREE.Vector3(x+(trnd()-.5)*.8*s, y+(1.05+trnd()*.35)*s, z+.1+trnd()*.35*s), .12*s, ['#E8442E','#F2C230','#F06BAE'][i%3], {ow:.02});
  } else {
    for(let i=0;i<4;i++) leaf(p, new THREE.Vector3(x+(trnd()-.5)*.6*s, y+(.85+trnd()*.5)*s, z+(trnd()-.5)*.4*s), (.3+trnd()*.12)*s, i%2?'#4E9A4A':'#5FAF55');
  }
}
function tuft(p, x, y, z, s){ for(let i=0;i<4;i++) mesh(p, new THREE.ConeGeometry(.05*s,.38*s*(.7+trnd()*.6),4), i%2?'#5FAF55':'#78C25C', {pos:new THREE.Vector3(x+(i-1.5)*.07*s, y+.16*s, z), rot:[0,0,(i-1.5)*.28], outline:false, shadow:false}); }


// ================= sky, clouds, hills =================
const skyU = {top:{value:new THREE.Color()}, mid:{value:new THREE.Color()}, bot:{value:new THREE.Color()}};
// each level may replace SKY.c / FOG_C / SUN_C with its own time of day
const SKY = {g:{top:new THREE.Color('#B9B6B2'), mid:new THREE.Color('#CFCCC8'), bot:new THREE.Color('#D8D4CF')},
             c:{top:new THREE.Color('#5EA8E6'), mid:new THREE.Color('#B4DCF6'), bot:new THREE.Color('#FCE3C0')}};
const LIGHT = {fog:new THREE.Color('#F3DDC0'), sun:new THREE.Color('#FFE3B8'), sunK:[.62,.82], fillK:[.1,.24], hemiK:[.62,.62]};
const skyDome = new THREE.Mesh(new THREE.SphereGeometry(160, 32, 16), new THREE.ShaderMaterial({uniforms:skyU, side:THREE.BackSide, depthWrite:false, fog:false,
  vertexShader:'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader:'uniform vec3 top; uniform vec3 mid; uniform vec3 bot; varying vec3 vP; void main(){ float h = vP.y; vec3 c = mix(bot, mid, smoothstep(-0.02, 0.16, h)); c = mix(c, top, smoothstep(0.16, 0.55, h)); gl_FragColor = linearToOutputTexel(vec4(c, 1.)); }'}));
skyDome.renderOrder = -1; scene.add(skyDome);
const fill = new THREE.DirectionalLight('#A9C8FF', .2); fill.position.set(30, 10, -20); scene.add(fill); scene.add(fill.target);
const hemi = scene.children.find(o=>o.isHemisphereLight);
const skyTmp = new THREE.Color();
function skyUpdate(){
  const k = zoneK.sky;
  for(const n of ['top','mid','bot']) skyU[n].value.copy(SKY.g[n]).lerp(SKY.c[n], k).convertSRGBToLinear();
  scene.background.copy(SKY.g.bot).lerp(SKY.c.bot, k);
  scene.fog.color.copy(SKY.g.bot).lerp(LIGHT.fog, k);
  sun.color.set('#FFFFFF').lerp(LIGHT.sun, k);
  sun.intensity = LIGHT.sunK[0] + (LIGHT.sunK[1]-LIGHT.sunK[0])*k; fill.intensity = LIGHT.fillK[0] + (LIGHT.fillK[1]-LIGHT.fillK[0])*k;
  if(hemi) hemi.intensity = LIGHT.hemiK[0] + (LIGHT.hemiK[1]-LIGHT.hemiK[0])*k;
  // night: the sky, fog and sun slide toward a blue evening; lanterns and fireflies become the light
  const n = NIGHT.k;
  if(n > 0){
    for(const c of ['top','mid','bot']) skyU[c].value.lerp(skyTmp.copy(NIGHT[c]).convertSRGBToLinear(), n);
    scene.background.lerp(NIGHT.bot, n); scene.fog.color.lerp(NIGHT.fog, n);
    sun.color.lerp(skyTmp.set('#9FB4FF'), n); sun.intensity *= 1 - .75*n; fill.intensity *= 1 - .3*n;
    if(hemi) hemi.intensity *= 1 - .5*n;
  }
  if(hemi){ hemi.color.set('#FFF6EA').lerp(skyTmp.set('#8C9BE0'), n); hemi.groundColor.set('#B9AFA6').lerp(skyTmp.set('#4A4870'), n); }
}
const NIGHT = {k:0, top:new THREE.Color('#0F1530'), mid:new THREE.Color('#25356E'), bot:new THREE.Color('#3E4680'), fog:new THREE.Color('#2B3163')};
function clouds(x0, x1){
  ZONE = 'sky';
  for(let x = x0; x < x1; x += 14 + trnd()*6){
    const cy = 21 + trnd()*9, cz = -70 - trnd()*20, s = 2.4 + trnd()*1.6;
    for(let k=0;k<6;k++) blob(W, new THREE.Vector3(x + (k-2.5)*s*.9, cy + Math.sin(k*1.3)*s*.35 + (k%2)*s*.3, cz), [s*(1 + (k%3)*.25), s*.7, s*.8], '#FFFFFF', {nofog:true, outline:false, shadow:false});
  }
}
function hills(x0, x1){
  ZONE = 'sky';
  for(let x = x0, i = 0; x < x1; x += 11 + trnd()*5, i++) blob(W, new THREE.Vector3(x, -3, -62 - trnd()*10), [9 + trnd()*6, 6, 7 + trnd()*5], i%2 ? '#8FB59A' : '#A3C3A4', {geo:ICO0, flat:true, outline:false, shadow:false});
}

// ================= street furniture =================
function stool(x, z, c, y){ const g = new THREE.Group(); g.position.set(x, y===undefined ? -.28 : y, z); g.rotation.y = trnd()*.6-.3; W.add(g);
  mesh(g, new THREE.CylinderGeometry(.34,.4,.08,16), c, {pos:new THREE.Vector3(0,.55,0)});
  for(let i=0;i<4;i++){ const a = i*Math.PI/2+.78; mesh(g, new THREE.BoxGeometry(.07,.55,.07), c, {pos:new THREE.Vector3(Math.cos(a)*.27,.27,Math.sin(a)*.27), rot:[Math.sin(a)*.12,0,-Math.cos(a)*.12], ow:.015}); } }
function crate(x, z, s, c, y){ const g = new THREE.Group(); g.position.set(x, y===undefined ? -.28 : y, z); g.rotation.y = trnd()*.5-.25; W.add(g);
  mesh(g, new THREE.BoxGeometry(s*1.1, s*.7, s*.8), c, {pos:new THREE.Vector3(0, s*.35, 0)});
  for(let i=0;i<3;i++) mesh(g, new THREE.BoxGeometry(s*1.12, s*.06, s*.82), '#5E4630', {pos:new THREE.Vector3(0, s*(.15+i*.22), 0), outline:false});
  for(let i=0;i<3;i++) leaf(g, new THREE.Vector3((i-1)*s*.3, s*.78, 0), s*.18, ['#E8442E','#F2C230','#7DBB4B'][i], {ow:.02}); }
function xeMay(x, z, c, ry){ const g = new THREE.Group(); g.position.set(x, -.28, z); g.rotation.y = ry; W.add(g);
  for(const dx of [-.62, .62]){ mesh(g, new THREE.TorusGeometry(.27,.09,8,18), '#2A2630', {pos:new THREE.Vector3(dx,.36,0), outline:false}); mesh(g, new THREE.CylinderGeometry(.12,.12,.1,10), '#B8B0A4', {pos:new THREE.Vector3(dx,.36,0), rot:[Math.PI/2,0,0], outline:false}); }
  blob(g, new THREE.Vector3(-.2,.62,0), [.55,.26,.28], c, {ow:.03});
  blob(g, new THREE.Vector3(.5,.72,0), [.2,.4,.22], c, {ow:.03, rot:[0,0,-.3]});
  box(g, -.75, .05, .82, .95, -.2, .2, '#2A2630', {ow:.02});
  rod(g, new THREE.Vector3(.62,.36,0), new THREE.Vector3(.72,1.15,0), .04, '#6E655C', {outline:false});
  rod(g, new THREE.Vector3(.72,1.15,-.35), new THREE.Vector3(.72,1.15,.35), .035, '#2A2630', {outline:false});
  blob(g, new THREE.Vector3(.8,1.02,0), [.1,.1,.1], '#F2E7A0', {ow:.02});
  box(g, -1.0, -.6, .75, 1.0, -.22, .22, '#5E4630', {ow:.02}); }
function xeDap(x, z, ry){ const g = new THREE.Group(); g.position.set(x, -.28, z); g.rotation.y = ry; W.add(g);
  for(const dx of [-.55, .55]) mesh(g, new THREE.TorusGeometry(.33,.035,6,20), '#2A2630', {pos:new THREE.Vector3(dx,.36,0), outline:false});
  const P3 = (a,b,c)=>new THREE.Vector3(a,b,c);
  for(const [a,b] of [[P3(-.55,.36,0),P3(0,.4,0)],[P3(0,.4,0),P3(.45,.85,0)],[P3(-.15,.85,0),P3(.45,.85,0)],[P3(-.55,.36,0),P3(-.15,.85,0)],[P3(0,.4,0),P3(-.15,.85,0)],[P3(.55,.36,0),P3(.45,.95,0)]]) rod(g, a, b, .03, '#2E8C86', {outline:false});
  box(g, .3, .8, .95, 1.3, -.22, .22, '#C99A52', {ow:.02, uv:[.5,.5], map:TEX.wood});
  for(let i=0;i<4;i++) leaf(g, new THREE.Vector3(.4+i*.12, 1.36, (i%2-.5)*.2), .11, ['#E8442E','#F2C230','#F06BAE','#E8442E'][i], {ow:.02});
  box(g, -.3, -.05, .9, .96, -.1, .1, '#2A2630', {outline:false}); }
const WIRE_M = new THREE.MeshBasicMaterial({color:'#2A2530'});
function wire(a, b, sag, parent){
  const pts = []; for(let i=0;i<=16;i++){ const t = i/16; pts.push(new THREE.Vector3().lerpVectors(a,b,t).add(new THREE.Vector3(0, -sag*4*t*(1-t), 0))); }
  const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, .03, 5), WIRE_M); (parent||W).add(m); return pts;
}
function powerPole(x, z){
  box(W, x-.14, x+.14, -.3, 9.4, z-.14, z+.14, '#A39A8F', {ow:.04, uv:[1,2], map:TEX.plaster});
  box(W, x-1.1, x+1.1, 8.55, 8.7, z-.1, z+.1, '#8A8178', {ow:.03});
  mesh(W, new THREE.CylinderGeometry(.32,.32,.7,12), '#8A8178', {pos:new THREE.Vector3(x+.4, 7.0, z+.3)});
  for(let i=0;i<5;i++) box(W, x-.25, x+.25, 1.6+i*.6, 1.65+i*.6, z+.14, z+.2, '#6E655C', {outline:false});
  for(let i=0;i<3;i++) box(W, x-.32 + i*.22, x-.14 + i*.22, 5.2, 5.55, z+.14, z+.28, ['#E9E2D6','#9FCBC1','#E9E2D6'][i], {ow:.015});
  mesh(W, new THREE.TorusGeometry(.32,.06,6,14), '#2A2530', {pos:new THREE.Vector3(x, 6.4, z+.16), rot:[Math.PI/2,0,0], outline:false});
}
function poleWires(xs, z){
  for(let i=0;i<xs.length-1;i++){
    for(const [k,dx] of [[0,-.9],[1,0],[2,.9]]) wire(new THREE.Vector3(xs[i]+dx, 8.62, z), new THREE.Vector3(xs[i+1]+dx, 8.62, z), .9+k*.25);
    wire(new THREE.Vector3(xs[i], 7.6, z), new THREE.Vector3(xs[i+1], 7.6, z), 1.4);
  }
}
// Trung thu lanterns: round paper lanterns and little stars, each with a soft glow once its zone has colour
const glows = [];
const LANT = ['#E8442E','#F2C230','#E8442E','#F06BAE','#F2C230','#2E9C93'];
function lantern(x, y, z, c, kind){
  const zn = ZONE;
  if(kind === 'sao'){ const m = mesh(W, STAR_GEO, c, {ow:.03}); m.scale.setScalar(.42); m.position.set(x, y-.3, z-.05); }
  else {
    blob(W, new THREE.Vector3(x, y-.42, z), [.3,.3,.38], c, {ow:.03});
    for(const a of [0, Math.PI/2]) mesh(W, new THREE.TorusGeometry(.305,.018,4,20), '#8C3A20', {pos:new THREE.Vector3(x, y-.42, z), rot:[0, a, 0], scl:[1,1.25,1], outline:false});
    for(const dy of [-.1, -.74]) mesh(W, new THREE.CylinderGeometry(.13,.13,.08,10), '#C99A52', {pos:new THREE.Vector3(x, y+dy, z), outline:false});
    rod(W, new THREE.Vector3(x, y-.78, z), new THREE.Vector3(x, y-1.05, z), .03, '#F2C230', {outline:false});
  }
  rod(W, new THREE.Vector3(x, y+.05, z), new THREE.Vector3(x, y-.1, z), .012, '#2A2530', {outline:false});
  const g = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshBasicMaterial({map:dotTex, color:c, transparent:true, opacity:0, depthWrite:false, blending:THREE.AdditiveBlending}));
  g.position.set(x, y-.42, z+.2); scene.add(g); glows.push({m:g, z:zn});
}
function lanternString(a, b, y, z, sag){
  const pts = wire(new THREE.Vector3(a, y, z), new THREE.Vector3(b, y, z), sag);
  for(let i=2;i<pts.length-1;i+=2){ const p = pts[i]; lantern(p.x, p.y, p.z, LANT[(i/2 + Math.round(a))%LANT.length], i%4 ? 'tron' : 'sao'); }
}

// ================= background rows: mid row right behind the street, far row, clock tower =================
function midRow(x0, x1, zoneAt, o){
  o = o||{};
  const MID = ['#E8A598','#E9C46A','#9FCBC1','#F1E0C5','#D9A07A','#C7B8E0'];
  let i = o.i0 || 0;
  for(let x = x0; x < x1; i++){
    const w = 4.6 + (i%2)*.5, h = (o.h||7.6) + ((i*53)%5)*1.0, xa = x, xb = x + w, zf = o.zf || -5;
    x += w + .4 + (i%3)*.2;
    ZONE = zoneAt((xa+xb)/2);
    if(i%5 === 2){ tree(W, (xa+xb)/2, zf-2, 9.5, {s:1.15, zone:ZONE, flower: i%2 ? '#E8442E' : null}); continue; }
    const c = MID[i%MID.length];
    box(W, xa, xb, -2, h, zf-4.5, zf, c, {ow:.05, uv:[2.6, 3.2, 0, 1.6], map:TEX.facade});
    box(W, xa-.2, xb+.2, h, h+.35, zf-4.7, zf+.2, '#B5513A', {ow:.03});
    if(i%3 === 0) roof(W, xa-.15, xb+.15, h+.35, zf+.1, 4.2, 1.8, '#B5513A');
    else if(i%3 === 1){ mesh(W, new THREE.CylinderGeometry(.5,.5,1.2,12), ['#2F6FB5','#E9E2D6'][i%2], {pos:new THREE.Vector3(xa+1.3, h+.95, zf-2)}); plant(W, xb-1.2, h+.35, zf-1, .9, 'hoa'); }
    else { box(W, xa+.4, xb-.4, h+.35, h+2.2, zf-4, zf-1.5, MID[(i+2)%MID.length], {ow:.04, uv:[2.6, 3.2, 0, 1.6], map:TEX.facade}); box(W, xa+.2, xb-.2, h+2.2, h+2.4, zf-4.2, zf-1.3, '#B5513A', {ow:.03}); }
    if(i%2) box(W, xa+.5, xb-.5, 6.2, 6.35, zf, zf+.8, '#8A7D6F', {ow:.02});
    if(i%4 === 1) hoaGiay(W, xa+.3, xa+1.6, h-.1, zf+.15, 2.6);
    if(i%4 === 3){ rod(W, new THREE.Vector3(xa+.4, 7.4, zf+.3), new THREE.Vector3(xb-.4, 7.4, zf+.3), .012, '#2A2530', {outline:false});
      for(let k=0;k<3;k++) box(W, xa+.7+k*1.3, xa+1.5+k*1.3, 6.7, 7.38, zf+.28, zf+.32, ['#E8442E','#F4F1EA','#2F6FB5'][k], {ow:.012}); }
    box(W, xa+.8, xb-.8, 8.4, 8.9, zf+.02, zf+.4, '#E9E2D6', {ow:.02});
  }
}
function farRow(x0, x1){
  ZONE = 'sky';
  for(let x = x0, i = 0; x < x1; x += 8, i++){
    const h = 7 + ((i*29)%6)*1.1;
    box(W, x, x+7, -2, h, -26, -21, ['#D9C7B8','#E2D2B0','#C8D3CC','#DCC9C0'][i%4], {outline:false, shadow:false, uv:[2.6, 3.2, 0, 1.6], map:TEX.facade});
    if(i%2) for(let k=0;k<3;k++) leaf(W, new THREE.Vector3(x+7.4, h*.55 + k*1.3, -20.5), 1.6, ['#8FB59A','#7FAA8C'][k%2], {outline:false, shadow:false});
  }
}
function clockTower(x, z){
  ZONE = 'sky';
  box(W, x-2, x+2, -2, 20, z-2, z+2, '#D9A07A', {ow:.07, shadow:false, uv:PLASTER, map:TEX.plaster});
  for(const y of [6, 12]) box(W, x-2.2, x+2.2, y, y+.4, z-2.2, z+2.2, '#F4F1EA', {ow:.04, shadow:false});
  box(W, x-2.5, x+2.5, 20, 21, z-2.5, z+2.5, '#B5513A', {ow:.05, shadow:false});
  mesh(W, new THREE.ConeGeometry(3.3, 4, 4), '#B5513A', {pos:new THREE.Vector3(x, 23, z), rot:[0,Math.PI/4,0], ow:.06, shadow:false});
  mesh(W, new THREE.CylinderGeometry(1.4,1.4,.2,28), '#F4F1EA', {pos:new THREE.Vector3(x, 16.5, z+2.1), rot:[Math.PI/2,0,0], ow:.05, shadow:false});
  const m = new THREE.Mesh(new THREE.CircleGeometry(1.25, 28), toon('#FFFFFF', false, {map:TEX.clock})); m.position.set(x, 16.5, z+2.22); W.add(m);
  for(const dx of [-1.2, 1.2]) box(W, x+dx-.4, x+dx+.4, 8, 10.4, z+1.95, z+2.1, '#3B4152', {ow:.03, shadow:false});
}

// ================= atmosphere: shafts of light, dust motes, lantern glows, moving water =================
const shafts = [];
const shaftTex = (function(){
  const c = document.createElement('canvas'); c.width = 64; c.height = 256; const x = c.getContext('2d');
  const g = x.createLinearGradient(0,0,0,256); g.addColorStop(0,'rgba(255,255,255,.9)'); g.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0,0,64,256);
  const g2 = x.createLinearGradient(0,0,64,0); g2.addColorStop(0,'rgba(0,0,0,1)'); g2.addColorStop(.3,'rgba(0,0,0,0)'); g2.addColorStop(.7,'rgba(0,0,0,0)'); g2.addColorStop(1,'rgba(0,0,0,1)');
  x.globalCompositeOperation = 'destination-out'; x.fillStyle = g2; x.fillRect(0,0,64,256);
  return new THREE.CanvasTexture(c); })();
function shaft(x, w, z, zone, color){
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 18), new THREE.MeshBasicMaterial({map:shaftTex, color:color||'#FFE6B0', transparent:true, opacity:0, depthWrite:false, blending:THREE.AdditiveBlending, fog:false}));
  m.position.set(x, 6, z); m.rotation.z = .42; scene.add(m); shafts.push({m, z:zone});
}
const MOTES = 260, moteGeo = new THREE.BufferGeometry(), moteP = new Float32Array(MOTES*3), moteS = [];
moteGeo.setAttribute('position', new THREE.BufferAttribute(moteP, 3));
const motes = new THREE.Points(moteGeo, new THREE.PointsMaterial({map:dotTex, color:'#FFF1C4', size:.22, transparent:true, opacity:.75, depthWrite:false, blending:THREE.AdditiveBlending}));
motes.frustumCulled = false; scene.add(motes);
function moteSpan(x0, x1){ moteS.length = 0; for(let i=0;i<MOTES;i++) moteS.push({x:x0 + Math.random()*(x1-x0), y:Math.random()*10, z:-3 + Math.random()*9, ph:Math.random()*6, sp:.2 + Math.random()*.4}); }
moteSpan(-10, 30);
const WATER_TEX = [TEX.water];
function atmosphere(t){
  for(const g of glows) g.m.material.opacity = (zoneK[g.z]||0)*(.55 + Math.sin(t*2 + g.m.position.x)*.12);
  for(const s of shafts) s.m.material.opacity = .05 + .16*(zoneK[s.z]||0);
  // motes wrap around the camera so a long level needs no more of them
  const cx = camera.position.x;
  for(let i=0;i<MOTES;i++){ const m = moteS[i]; let x = m.x + Math.sin(t*m.sp + m.ph)*.6; x = cx - 20 + ((x - cx + 20) % 40 + 40) % 40;
    moteP[i*3] = x; moteP[i*3+1] = (m.y + t*m.sp*.25) % 10; moteP[i*3+2] = m.z + Math.cos(t*m.sp*.7 + m.ph)*.4; }
  moteGeo.attributes.position.needsUpdate = true;
  motes.material.opacity = .25 + .5*zoneK.sky;
  for(const tx of WATER_TEX) tx.offset.set(t*.03, t*.015);
}

// ================= bake: merge all static scenery into one mesh per material =================
function bake(){
  W.updateMatrixWorld(true);
  const groups = new Map();
  W.traverse(o=>{
    if(!o.isMesh) return;
    const geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    geo.applyMatrix4(o.matrixWorld); geo.computeBoundingBox();
    // one merged mesh per material per 24-unit stretch of street, so a long level can skip what the camera can't see
    const key = o.material.uuid + (o.castShadow ? 's' : '') + '|' + Math.floor((geo.boundingBox.min.x + geo.boundingBox.max.x)/48);
    let g = groups.get(key); if(!g){ g = {mat:o.material, cast:o.castShadow, geos:[]}; groups.set(key, g); }
    g.geos.push(geo);
  });
  scene.remove(W);
  for(const g of groups.values()){
    let n = 0; for(const q of g.geos) n += q.attributes.position.count;
    const pos = new Float32Array(n*3), nor = new Float32Array(n*3), uv = new Float32Array(n*2);
    let k = 0;
    for(const q of g.geos){
      const c = q.attributes.position.count;
      pos.set(q.attributes.position.array, k*3);
      if(q.attributes.normal) nor.set(q.attributes.normal.array, k*3);
      if(q.attributes.uv) uv.set(q.attributes.uv.array, k*2);
      k += c; q.dispose();
    }
    const bg = new THREE.BufferGeometry();
    bg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); bg.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); bg.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    bg.computeBoundingSphere(); const m = new THREE.Mesh(bg, g.mat); m.castShadow = g.cast; m.receiveShadow = true; scene.add(m);
  }
}

// ================= game core: HUD, zones, platforms, calendar sheets with layers, player, story beats, input, camera =================
// a level script fills LV and builds its street with the kit above, then calls startGame()
const LV = {start:{x:0, y:0}, bounds:[-5, 100], cam:[4, 96], sky:[], hint:()=>'', update:null, intro:null, winText:null, level:1};

// ---------- HUD, shared by every level ----------
stage.insertAdjacentHTML('beforeend', `
<div class="hud"><span class="hudL"><button class="menuB" id="menuB" title="Tạm dừng (Esc)" aria-label="Tạm dừng">❚❚</button><span class="pill" id="title"></span></span><span class="hudR"><span class="pill" id="hand" style="display:none"></span><span class="pill wet" id="wet" style="display:none" title="Tò là bột gạo, ướt quá là nhũn">Ướt <b><i id="wetB"></i></b></span><span class="pill" id="ffly">Đom đóm 0/5</span><span class="pill" id="relic" title="Con tò he cũ giấu trong màn">Tò he cũ 0/1</span><span class="pill tray" title="Khay tò he của bà Năm">Khay của bà <i id="t1"></i><i id="t2"></i><i id="t3"></i></span></span></div>
<div class="bars t off" id="barT"></div><div class="bars b off" id="barB"></div>
<div class="cap" id="cap"></div><div class="skip" id="skip" style="opacity:0">${MOBILE ? 'Chạm để bỏ qua' : 'Space hoặc chạm để bỏ qua'}</div>
<div class="hint" id="hint"></div>
<div class="pad l"><button data-k="left">◀</button><button data-k="right">▶</button><button data-k="hint" class="sm">?</button></div>
<div class="pad r"><button data-k="back" class="sm" aria-label="Dán lại tờ vừa bóc">↺</button><button data-k="fold" class="sm">Gấp</button><button class="grab" data-k="grab" id="grabB">Bóc</button><button data-k="jump">⤒</button></div>
<div class="memo" id="memo"><canvas id="memoC" width="480" height="360"></canvas></div>
<div class="win" id="win"><div class="card"><h2 id="winH"></h2><p id="winP"></p><div class="memory" id="memory"></div><p class="next" id="winNext"></p><div class="btns" id="winB"></div></div></div>
<div class="over" id="pause"><div class="card"><h2>Tạm dừng</h2><div class="btns"><button class="btn" id="pGo">Chơi tiếp</button><button class="btn alt" id="pAgain">Chơi lại màn này</button><button class="btn alt" id="pSet">Cài đặt</button><button class="btn alt" id="pFull">Toàn màn hình</button><a class="btn alt" href="../index.html" id="pHome">Về màn hình chính</a></div>
${MOBILE ? `<ul class="keyl"><li><b>◀</b> <b>▶</b> đi, trượt ngón để đổi hướng · <b>⤒</b> nhảy</li><li><b>Bóc</b> nắm mép sáng rồi đi lùi để bóc · bấm lần nữa để buông</li><li>Đang cầm tờ lịch: <b>Dùng</b> để dán, thả, phóng, phẩy · <b>Gấp</b> đổi kiểu gấp</li><li><b>↺</b> dán lại tờ vừa bóc, hoặc về chỗ an toàn · <b>?</b> gợi ý</li><li>Tiến độ tự lưu sau mỗi màn.</li></ul>` : `<ul class="keyl"><li><b>←</b> <b>→</b> đi · <b>↑</b> hoặc <b>Space</b> nhảy</li><li><b>E</b> nắm mép sáng rồi đi lùi để bóc · <b>E</b> lần nữa để buông</li><li>Đang cầm tờ lịch: <b>E</b> để dán, thả, phóng, phẩy · <b>Q</b> gấp</li><li><b>R</b> dán lại tờ vừa bóc, hoặc về chỗ an toàn · <b>H</b> gợi ý · <b>Esc</b> tạm dừng</li><li>Tiến độ tự lưu sau mỗi màn.</li></ul>`}</div></div>
<div class="over" id="sets"><div class="card"><h2>Cài đặt</h2><div class="sets">
<label for="sNhac">Nhạc</label><input type="range" id="sNhac" min="0" max="1" step="0.05">
<label for="sTieng">Tiếng động</label><input type="range" id="sTieng" min="0" max="1" step="0.05">
<label for="sNet">Độ nét</label><select id="sNet"><option value="">Tự động</option><option value="2">Cao</option><option value="1">Vừa</option><option value="0.75">Thấp (máy yếu)</option></select>
<label for="sRung">Rung khi bóc</label><input type="checkbox" id="sRung">
<label for="sChu">Chữ to</label><input type="checkbox" id="sChu">
<label for="sTrai">Nút cho tay trái</label><input type="checkbox" id="sTrai">
</div><p class="setsN" id="setsN"></p><div class="btns"><button class="btn" id="sOk">Xong</button></div></div></div>
<div class="toast" id="toast" style="opacity:0"></div><div class="endT" id="endT"></div>
<div class="xoay" id="xoay"><div class="dt"></div><p>Xoay ngang điện thoại để chơi</p></div>`);
document.body.insertAdjacentHTML('beforeend', '<div class="fade" id="fade"></div>');
const $ = id => document.getElementById(id);
const grabB = $('grabB'), titleEl = $('title'), fflyEl = $('ffly'), relicEl = $('relic'), capEl = $('cap'), skipEl = $('skip'), barT = $('barT'), barB = $('barB'), hintEl = $('hint'), memoEl = $('memo');
const TRAY_C = ['#C23A28', '#E9A23B', '#2E9C93'];
function trayLoad(){ try { return JSON.parse(localStorage.getItem('phocu.tray') || '[]'); } catch(e){ return []; } }
// nine levels, three chapters: the HUD shows this chapter's row of the tray (the title screen shows all three rows)
function trayShow(){ const tr = trayLoad(), c0 = Math.floor(((LV.level || 1) - 1)/3)*3; for(let i=0;i<3;i++) $('t'+(i+1)).style.background = tr.includes(c0+i+1) ? TRAY_C[i] : '';
  const el = $('t1').parentNode; el.title = 'Khay tò he của bà Năm, chương ' + (c0/3 + 1); }
function traySet(n){ const tr = trayLoad(); if(!tr.includes(n)) tr.push(n); try { localStorage.setItem('phocu.tray', JSON.stringify(tr)); } catch(e){} trayShow(); }
trayShow();
// ---------- progress: one save for the whole game, so the title screen can offer "Chơi tiếp" ----------
const LEVEL_URL = [null, '../man-1/index.html', '../man-2/index.html', '../man-3/index.html', '../man-4/index.html', '../man-5/index.html', '../man-6/index.html', '../man-7/index.html', '../man-8/index.html', '../man-9/index.html'];
function saveGet(){ try { return JSON.parse(localStorage.getItem('phocu.save') || '{}') || {}; } catch(e){ return {}; } }
function savePut(o){ try { localStorage.setItem('phocu.save', JSON.stringify(Object.assign(saveGet(), o))); } catch(e){} }
function relicSave(n){ try { const r = JSON.parse(localStorage.getItem('phocu.relic') || '[]'); if(!r.includes(n)) r.push(n); localStorage.setItem('phocu.relic', JSON.stringify(r)); } catch(e){} }
function relicLoad(){ try { return JSON.parse(localStorage.getItem('phocu.relic') || '[]'); } catch(e){ return []; } }
let leaving = false;
addEventListener('pageshow', e=>{ if(e.persisted){ leaving = false; $('fade').classList.add('out'); } });
function goTo(url){ if(leaving) return; leaving = true; $('fade').classList.remove('out'); setTimeout(()=>{ location.href = url; }, 900); }
function toast(t, sec){ const el = $('toast'); el.textContent = t; el.style.opacity = 1; setTimeout(()=>{ el.style.opacity = 0; }, (sec || 2.4)*1000); }
// ---------- pause menu ----------
let paused = false;
function setPause(on){ if(P.won && on) return; paused = on; $('pause').style.display = on ? 'flex' : 'none'; if(on){ for(const k in keys) keys[k] = false; } else canvas.focus(); }
$('menuB').onclick = ()=>setPause(!paused);
$('pGo').onclick = ()=>setPause(false);
$('pAgain').onclick = ()=>{ location.hash = 'choi'; location.reload(); };
if(!document.documentElement.requestFullscreen || matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone === true) $('pFull').style.display = 'none';
// ---------- settings (chung/am.js keeps them) ----------
$('pSet').onclick = ()=>{
  if(!window.AM){ toast('Chưa tải được phần cài đặt.'); return; }
  const S = AM.set; $('sNhac').value = S.nhac; $('sTieng').value = S.tieng; $('sNet').value = S.net || ''; $('sRung').checked = !!S.rung; $('sChu').checked = !!S.chu; $('sTrai').checked = !!S.trai;
  $('setsN').textContent = ''; $('sets').style.display = 'flex';
};
for(const [id, k, num] of [['sNhac', 'nhac', 1], ['sTieng', 'tieng', 1]]) $(id).addEventListener('input', e=>{ AM.start(); AM.change(k, +e.target.value); if(k === 'tieng') AM.play('fly'); });
for(const [id, k] of [['sRung', 'rung'], ['sChu', 'chu'], ['sTrai', 'trai']]) $(id).addEventListener('change', e=>{ AM.change(k, e.target.checked); if(k === 'rung' && e.target.checked) AM.buzz(40); });
$('sNet').addEventListener('change', e=>{ AM.change('net', e.target.value); $('setsN').textContent = 'Độ nét mới có hiệu lực khi mở lại màn.'; });
$('sOk').onclick = ()=>{ $('sets').style.display = 'none'; };
$('pFull').onclick = ()=>{ const d = document; if(d.fullscreenElement) d.exitFullscreen(); else if(d.documentElement.requestFullscreen) d.documentElement.requestFullscreen().catch(()=>{}); setPause(false); };
$('pHome').onclick = e=>{ e.preventDefault(); goTo('../index.html'); };
function bars(on){ barT.classList.toggle('off', !on); barB.classList.toggle('off', !on); stage.classList.toggle('cine', on); }
function caption(t){ if(t){ if(capEl.textContent !== t) capEl.textContent = t; capEl.style.opacity = 1; } else capEl.style.opacity = 0; }

// ---------- sound: chung/am.js; silent while a run is being replayed ----------
function sfx(n, v){ if(window.AM && !JR.replay) AM.play(n, v); }
function buzz(ms){ if(window.AM && !JR.replay) AM.buzz(ms); }

// ---------- colour zones: each room fades from grey to colour when it is solved; the sky follows the share of rooms in colour ----------
const zoneT = {};
function colour(z, k){ k = k === undefined ? 1 : k; const was = zoneT[z]||0;
  if(k > was + .05 && (zoneK[z]||0) < .02 && zoneU[z] ) zoneU[z].o.value.set(P.x, P.y + .6);
  if(k >= .99 && was < .99 && !intro.on){ sfx('colour'); buzz(25); }
  zoneT[z] = Math.max(was, k); }
function zonesTick(dt){
  for(const z in zoneT){ const c = zoneK[z]||0, t = zoneT[z]; if(Math.abs(t-c) <= .001) continue;
    // a spreading zone grows at a steady pace (about two seconds to the far end); the others ease in as before
    if(zoneU[z] && zoneU[z].o.value.x < 9e4 && t > c) setZone(z, Math.min(t, c + dt*.5));
    else setZone(z, Math.abs(t-c) < .01 ? t : c + (t-c)*Math.min(1, dt*2.5)); }
  if(LV.sky.length){ let s = 0; for(const z of LV.sky) s += zoneK[z]||0; const k = s/LV.sky.length, c = zoneK.sky||0; if(Math.abs(k-c) > .001) setZone('sky', c + (k-c)*Math.min(1, dt*2)); }
  if(window.AM) AM.colour(zoneK.sky||0);
  skyUpdate();
}

// ---------- level geometry the player collides with ----------
const solids = [], blocks = [], hazards = [], winds = [], lifts = [];
// one-way top: Tò lands on it from above and walks through it from below. safe: landing here moves the "về chỗ an toàn" point
// bounce: landing on it throws Tò back up at that speed (an open umbrella)
function plat(x0, x1, top, oneway, on, o){ const p = {x0, x1, top, on:on||(()=>true), safe:!!(o && o.safe), bounce:o && o.bounce, onBounce:o && o.onBounce}; solids.push(p); return p; }
// a solid box: blocks walking from either side and can be stood on
function block(x0, x1, y0, y1, on){ const b = {x0, x1, y0, y1, on:on||(()=>true)}; blocks.push(b); b.topP = plat(x0, x1, y1, false, ()=>b.on()); return b; }
// falling below y between x0..x1 (water, a gap) puts Tò back on the last safe spot
function hazard(x0, x1, y, msg){ hazards.push({x0, x1, y, msg}); }
// wind pushes Tò along x while he is not holding on to anything
function wind(x0, x1, y0, y1, force, on){ const w = {x0, x1, y0, y1, force, on:on||(()=>true)}; winds.push(w); return w; }
// a warm updraft: only lifts Tò while he holds a paper kite
function lift(x0, x1, y0, y1, on){ const l = {x0, x1, y0, y1, on:on||(()=>true)}; lifts.push(l); return l; }
const GLIDE = 2.4;

// ---------- calendar sheets: a stack of day-pages; peel the top one to reach the day below ----------
const sheets = [];
const haloTex = (function(){ const c = document.createElement('canvas'); c.width = 64; c.height = 64; const x = c.getContext('2d');
  const g = x.createLinearGradient(0,0,64,0); g.addColorStop(0,'rgba(255,255,255,0)'); g.addColorStop(.5,'rgba(255,255,255,1)'); g.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0,0,64,64); return new THREE.CanvasTexture(c); })();
const arrowGeo = (function(){ const sh = new THREE.Shape(); sh.moveTo(-.45,-.13); sh.lineTo(.1,-.13); sh.lineTo(.1,-.3); sh.lineTo(.45,0); sh.lineTo(.1,.3); sh.lineTo(.1,.13); sh.lineTo(-.45,.13); sh.closePath(); return new THREE.ShapeGeometry(sh); })();
const CURL_GEO = new THREE.CylinderGeometry(1, 1, 1, 16), CURL_M = new THREE.MeshToonMaterial({color:new THREE.Color('#C9C5C0').convertSRGBToLinear(), gradientMap:ramp});
// o: {id, x0, x1, y0, y1, z, layers:[{n:'14', pic}], dir:'x' (peel left to right) | 'y' (peel bottom-up, let go midway for a ledge), onLayer(i), onRestore(L), onRelease, onFull}
function sheet(o){
  const s = Object.assign({dir:'x', z:-.38, layers:[{n:'14'}], L:0, p:0, done:false, full:false, rest:0, solved:false, peek:1}, o);
  s.w = s.x1 - s.x0; s.h = s.y1 - s.y0;
  s.tex = s.layers.map((l, i)=>{ const t = dayTexture(s.w, s.h, l.n, s.id.charCodeAt(0)*7 + i*131 + 3, l.pic); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t; });
  const geo = new THREE.PlaneGeometry(s.w, s.h);
  s.back = new THREE.Mesh(geo, new THREE.MeshToonMaterial({map:s.tex[0], gradientMap:ramp})); s.back.position.set(s.x0 + s.w/2, s.y0 + s.h/2, s.z - .012); s.back.receiveShadow = true; scene.add(s.back);
  s.m = new THREE.Mesh(geo, new THREE.MeshToonMaterial({map:s.tex[0], gradientMap:ramp, transparent:true})); s.m.receiveShadow = true; scene.add(s.m);
  s.frame = new THREE.Mesh(new THREE.PlaneGeometry(s.w + .1, s.h + .1), new THREE.MeshBasicMaterial({color:'#141019'})); s.frame.position.set(s.x0 + s.w/2, s.y0 + s.h/2, s.z - .02); scene.add(s.frame);
  s.curl = new THREE.Mesh(CURL_GEO, CURL_M); s.curl.castShadow = true; outline(s.curl, .03); scene.add(s.curl);
  s.glow = new THREE.Group(); scene.add(s.glow);
  const len = s.dir === 'x' ? s.h : s.w;
  s.core = new THREE.Mesh(new THREE.PlaneGeometry(.1, len), new THREE.MeshBasicMaterial({color:'#FFF2B0', transparent:true, depthWrite:false}));
  s.halo = new THREE.Mesh(new THREE.PlaneGeometry(.7, len + .4), new THREE.MeshBasicMaterial({map:haloTex, color:'#FFC94A', transparent:true, depthWrite:false, blending:THREE.AdditiveBlending}));
  s.glow.add(s.halo); s.glow.add(s.core);
  s.arrow = new THREE.Mesh(arrowGeo, new THREE.MeshBasicMaterial({color:'#F6B93B'})); outline(s.arrow, .05); s.arrow.visible = false; scene.add(s.arrow);
  if(s.dir === 'y'){
    s.curl.rotation.z = Math.PI/2; s.glow.rotation.z = Math.PI/2; s.arrow.rotation.z = Math.PI;
    // let go midway and the curled edge stays out from the wall: a ledge Tò can stand on
    s.shelf = plat(s.x0 + .1, s.x1 - .1, s.y0, true, ()=>s.p > .5 && P.grab !== s && !s.full && !s.done);
  }
  sheets.push(s); updSheet(s); return s;
}
function sheetVis(s, v){ for(const m of [s.m, s.back, s.frame, s.curl, s.glow]) m.visible = v; if(!v) s.arrow.visible = false; }
function updSheet(s){
  const n = s.layers.length, front = s.tex[s.L], back = s.tex[s.L + 1];
  if(s.done || !front){ sheetVis(s, false); return; }
  s.m.material.map = front;
  if(back){ s.back.material.map = back; back.repeat.set(1, 1); back.offset.set(0, 0); }
  s.back.visible = !!back; s.frame.visible = true; s.m.visible = true; s.curl.visible = true; s.glow.visible = true;
  const r = .14 + .26*Math.min(1, s.p/2.5);
  if(s.dir === 'x'){
    const rem = Math.max(.0001, s.w - s.p);
    s.m.scale.set(rem/s.w, 1, 1); s.m.position.set(s.x0 + s.p + rem/2, s.y0 + s.h/2, s.z);
    front.repeat.set(rem/s.w, 1); front.offset.set(s.p/s.w, 0);
    s.curl.scale.set(r, s.h, r); s.curl.position.set(s.x0 + s.p, s.y0 + s.h/2, s.z + r);
    s.glow.position.set(s.x0 + s.p, s.y0 + s.h/2, s.z + 2*r + .03);
    if(!back){ s.frame.scale.set(rem/s.w, 1, 1); s.frame.position.x = s.x0 + s.p + rem/2; }
  } else {
    const rem = Math.max(.0001, s.h - s.p);
    s.m.scale.set(1, rem/s.h, 1); s.m.position.set(s.x0 + s.w/2, s.y0 + s.p + rem/2, s.z);
    front.repeat.set(1, rem/s.h); front.offset.set(0, s.p/s.h);
    s.curl.scale.set(r, s.w, r); s.curl.position.set(s.x0 + s.w/2, s.y0 + s.p, s.z + r);
    s.glow.position.set(s.x0 + s.w/2, s.y0 + s.p, s.z + 2*r + .03);
    if(!back){ s.frame.scale.set(1, rem/s.h, 1); s.frame.position.y = s.y0 + s.p + rem/2; }
    s.shelf.top = s.y0 + s.p + .05;
  }
}
function layerDone(s){
  sfx('layer'); buzz(30);
  const i = s.L; s.L++; s.p = 0; if(s.L >= s.layers.length) s.done = true;
  updSheet(s); lastProgT = nowT;
  if(s.carry && s.done) takeHeld(s);
  if(s.onLayer) s.onLayer(i);
}
// R next to a stack puts the last peeled day back on
function restoreLayer(s){
  if(s.L <= 0) return false;
  s.L--; s.p = 0; s.done = false; sfx('paste'); updSheet(s); sheetVis(s, true); updSheet(s);
  if(s.onRestore) s.onRestore(s.L);
  return true;
}
function nearSheet(any){
  for(const s of sheets){
    if(s.done || s.full || (!s.m.visible && !s.ghost) || intro.on) continue;
    if(s.dir === 'x'){
      const tabX = s.x0 + s.p, grip = P.y + 1.0;
      if(Math.abs(P.x - tabX) < 1.0 && grip > s.y0 - .3 && grip < s.y1 + .3) return s;
    } else {
      const edge = s.y0 + s.p;
      if(P.x > s.x0 - .3 && P.x < s.x1 + .3 && P.y < edge - .1 && P.y + 2.6 > edge) return s;
    }
  }
  return null;
}
function stackNear(){
  for(const s of sheets){ if(s.layers.length < 2 || s.L === 0) continue;
    if(P.x > s.x0 - 2 && P.x < s.x1 + 2.5 && P.y + 1 > s.y0 - 1 && P.y < s.y1) return s; }
  return null;
}

// ---------- fireflies (5 per level) and the hidden old tò he ----------
const flies = []; let fliesGot = 0;
function firefly(x, y, show){
  const g = new THREE.Group(); g.position.set(x, y, .3); scene.add(g);
  g.add(new THREE.Mesh(new THREE.SphereGeometry(.11, 10, 8), new THREE.MeshBasicMaterial({color:'#FFF2A0'})));
  const h = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshBasicMaterial({map:dotTex, color:'#FFD54A', transparent:true, depthWrite:false, blending:THREE.AdditiveBlending}));
  g.add(h);
  const f = {g, h, x, y, show:show||(()=>true), got:false, gotT:0, ph:Math.random()*6}; flies.push(f); return f;
}
let relicObj = null, relicGot = false;
function relic(g, x, y, name){ relicObj = {g, x, y, name, t:0}; relicEl.title = name; }

// ---------- Lũ Bụi: patrol a stretch, or sleep behind the walkway and wake when Tò lands hard nearby ----------
const buis = [];
function bui(o){
  const g = new THREE.Group(); scene.add(g); ZONE = 'keep'; buildBui(g, o.s, buis.length + 3);
  const b = Object.assign({home:o.x, dir:1, ph:buis.length*1.7, z:o.sleep ? -.9 : .2, awake:!o.sleep, t:0, g}, o);
  g.position.set(b.x, b.top + b.s, b.z);
  buis.push(b); return b;
}
function wakeNear(x, y){
  for(const b of buis) if(b.sleep && !b.awake && Math.abs(b.x - x) < 3.5 && Math.abs(b.top - y) < 1){ b.awake = true; b.t = 3.2; say('Ối… chúng tỉnh rồi!', 1.6); }
}

// ---------- bubbles: anything can talk; fn returns the line to show, or '' ----------
const talkers = [];
function talker(obj, dy, fn, cls){ const d = document.createElement('div'); d.className = cls || 'bubble'; stage.appendChild(d); const t = {obj, dy, fn, d}; talkers.push(t); return t; }
let toSay = '', toSayT = 0, sayNext = null;
function say(t, dur){ toSay = t; toSayT = dur || 2.2; }
// story beats: an objective line, and short locked camera moves that show what changed and what comes next
let OBJ = '', nowT = 0, lastProgT = 0, hintT = 0;
// on a phone there is no keyboard: hints and goals name the on-screen buttons instead (E is the yellow button, whose label follows what it does)
function grabLabel(){ return P.grab ? 'Buông' : held.on ? 'Dùng' : 'Bóc'; }
// a key is a lone capital letter: \b would also match the R of "Rãnh", so look for letters on either side, Vietnamese ones included
const KEY_RE = /(?<!\p{L})[EQRH](?!\p{L})/gu, KEY_BTN = {Q:'Gấp', R:'↺', H:'?'};
function keysTxt(t){ return MOBILE && t ? t.replace(KEY_RE, k=>KEY_BTN[k] || grabLabel()) : t; }
function objective(t){ lastProgT = nowT; if(OBJ === t) return; OBJ = t; titleEl.textContent = keysTxt(t); titleEl.classList.remove('pop'); void titleEl.offsetWidth; titleEl.classList.add('pop'); }
const seq = []; let cur = null, winReady = false;
function play(steps){ for(const st of steps) seq.push(st); }
function busy(){ return !!cur || seq.length > 0; }
function runSeq(dt){
  if(!cur && seq.length){ cur = seq.shift(); cur.t = 0; if(cur.start) cur.start(); }
  if(!cur) return;
  cur.t += dt; if(cur.tick) cur.tick(cur.t, dt);
  if(cur.t >= cur.dur){ if(cur.end) cur.end(); cur = null; if(seq.length) runSeq(0); }
}
// the memo overlay: a memory picture, or the back of a calendar page with a line of ca dao on it
const memoX = $('memoC').getContext('2d');
function memo(draw){ memoX.save(); memoX.clearRect(0, 0, 480, 360); draw(memoX, 480, 360); memoX.restore(); memoEl.style.opacity = 1; }
function memoOff(){ memoEl.style.opacity = 0; }
function pageBack(lines, day){
  return (x, W, H)=>{
    x.fillStyle = '#F4EEE2'; x.beginPath(); x.moveTo(60, 20);
    for(let i=0;i<=18;i++) x.lineTo(60 + i*20, 12 + (i%2)*9); x.lineTo(420, 340); x.lineTo(60, 340); x.closePath(); x.fill();
    x.strokeStyle = '#141019'; x.lineWidth = 3; x.stroke();
    x.fillStyle = 'rgba(194,58,40,.12)'; x.font = 'bold 150px "Oswald", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(day || '14', 240, 200);
    x.strokeStyle = 'rgba(80,72,70,.25)'; x.lineWidth = 1.5; for(let y = 90; y < 330; y += 36){ x.beginPath(); x.moveTo(84, y); x.lineTo(396, y); x.stroke(); }
    x.fillStyle = '#3B2E2A'; x.font = '40px "Patrick Hand", cursive';
    lines.forEach((l, i)=> x.fillText(l, 240, 120 + i*50 - (lines.length - 1)*12));
  };
}

// ---------- input ----------
const keys = {left:false, right:false, jump:false, grab:false};
const KM = {ArrowLeft:'left', KeyA:'left', ArrowRight:'right', KeyD:'right', ArrowUp:'jump', KeyW:'jump', Space:'jump', KeyE:'grab', KeyJ:'grab'};
let jumpQueued = false, grabQueued = false, stepD = 0;
function back(){
  jrAct(64);
  if(intro.on || P.won || busy()) return;
  const s = stackNear(); if(s && !P.grab){ restoreLayer(s); say('Dán lại tờ ' + s.layers[s.L].n + '.', 1.4); return; }
  P.x = P.check.x; P.y = P.check.y; P.vx = P.vy = 0; release(); say('Về chỗ an toàn.', 1.2);
}
addEventListener('keydown', e=>{
  if(intro.on && (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape')){ e.preventDefault(); endIntro(); return; }
  if(e.code === 'Escape' || e.code === 'KeyP'){ setPause(!paused); return; }
  if(paused) return;
  if(e.code === 'KeyR'){ back(); return; }
  if(e.code === 'KeyQ'){ fold(); return; }
  if(e.code === 'KeyH'){ hintT = 6; return; }
  const k = KM[e.code]; if(!k) return; e.preventDefault();
  if(k === 'jump' && !keys.jump) jumpQueued = true;
  if(k === 'grab' && !keys.grab) grabQueued = true;
  keys[k] = true;
});
addEventListener('keyup', e=>{ const k = KM[e.code]; if(k) keys[k] = false; });
document.querySelectorAll('.pad button').forEach(b=>{
  const k = b.dataset.k;
  if(k === 'left' || k === 'right') return;
  const on = e=>{ e.preventDefault(); if(intro.on){ endIntro(); return; } if(k === 'hint'){ hintT = 6; return; } if(k === 'back'){ back(); return; } if(k === 'fold'){ fold(); return; }
    if(k === 'jump' && !keys.jump) jumpQueued = true; if(k === 'grab' && !keys.grab) grabQueued = true; keys[k] = true; b.classList.add('on'); };
  const off = e=>{ e.preventDefault(); if(k in keys) keys[k] = false; b.classList.remove('on'); };
  b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('pointerleave', off);
});
// ◀ ▶ share one finger: sliding across switches direction without lifting it, like a real d-pad
const padL = document.querySelector('.pad.l'), dirB = [...padL.querySelectorAll('[data-k=left],[data-k=right]')];
let dirId = null;
function dirSet(k){ keys.left = k === 'left'; keys.right = k === 'right'; for(const b of dirB) b.classList.toggle('on', b.dataset.k === k); }
function dirAt(x){ return x < (dirB[0].getBoundingClientRect().right + dirB[1].getBoundingClientRect().left)/2 ? 'left' : 'right'; }
for(const b of dirB) b.addEventListener('pointerdown', e=>{ e.preventDefault(); if(intro.on){ endIntro(); return; } dirId = e.pointerId; try { padL.setPointerCapture(e.pointerId); } catch(_){} dirSet(b.dataset.k); });
padL.addEventListener('pointermove', e=>{ if(e.pointerId === dirId) dirSet(dirAt(e.clientX)); });
for(const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) padL.addEventListener(ev, e=>{ if(e.pointerId === dirId){ dirId = null; dirSet(null); } });
canvas.addEventListener('pointerdown', ()=>{ canvas.focus(); if(intro.on) endIntro(); });
stage.addEventListener('contextmenu', e=>e.preventDefault());
// in a phone browser the address bar eats a big slice of a landscape screen: the first touch asks for full screen and holds it landscape
// (an installed app already opens full screen; iPhone Safari has no full screen for pages, so there it is a no-op)
const STANDALONE = matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone === true;
function fullLandscape(){
  const d = document.documentElement;
  if(d.requestFullscreen && !document.fullscreenElement) d.requestFullscreen({navigationUI:'hide'}).then(()=>{ if(screen.orientation && screen.orientation.lock) return screen.orientation.lock('landscape'); }).catch(()=>{});
}
if(MOBILE && !STANDALONE) addEventListener('pointerdown', fullLandscape, {once:true, capture:true});

// ---------- Tò ----------
const S = 0.55;  // Tò is small: the street should feel big
ZONE = '0';
const toG = new THREE.Group(); toG.scale.setScalar(S); scene.add(toG);
const toInner = new THREE.Group(); toG.add(toInner); const TO = buildTo(toInner);
const P = {x:0, y:0, vx:0, vy:0, w:.95, h:2.25, ground:true, face:1, grab:null, gx:0, gp:0, check:{x:0, y:0}, won:false, knock:0, walkT:0};
const GRAV = 30, JUMP = 13, SPEED = 5.4, PEEL_SPEED = 2.6;
talker(toG, 1.75, ()=> toSayT > 0 ? toSay : '');
function grab(s){
  P.grab = s; sfx('grab'); buzz(12);
  if(s.dir === 'x') P.x = s.x0 + s.p + .45;
  else { P.gx = Math.min(P.x, s.x1 - .2); P.x = P.gx; P.gp = s.p; }
}
function release(){ const s = P.grab; P.grab = null; if(s && s.onRelease) s.onRelease(s); }
function standingOn(x, yPrev, yNew){
  let best = null;
  for(const s of solids){
    if(!s.on()) continue;
    if(x + P.w/2 - .08 < s.x0 || x - P.w/2 + .08 > s.x1) continue;
    // on a tie the safe one wins, so a dry spot drawn over a longer floor still counts
    if(yPrev >= s.top - .02 && yNew <= s.top + .001){ if(!best || s.top > best.top || (s.top === best.top && s.safe && !best.safe)) best = s; }
  }
  return best;
}
function respawn(msg){ if(/Nước|nước|Rãnh/.test(msg)) sfx('splash'); say(msg, 2.4); P.x = P.check.x; P.y = P.check.y; P.vx = P.vy = 0; release(); }

// ---------- hands: carry a peeled page, paste it over a dotted slot, or fold it into a boat, a plane or a fan ----------
const FORMS = {thuyen:'thuyền', maybay:'máy bay', quat:'quạt', non:'nón', dieu:'diều', den:'đèn'};
const learned = [];
const held = {on:false, form:null, src:null, wear:1};
const handEl = $('hand');
const heldG = new THREE.Group(); heldG.position.set(0, 1.05, .95); toInner.add(heldG);
ZONE = '0';
const HELD = {paper:new THREE.Group(), thuyen:new THREE.Group(), maybay:new THREE.Group(), quat:new THREE.Group()};
for(const k in HELD){ HELD[k].visible = false; heldG.add(HELD[k]); }
// a paper nón sits on Tò's head, not in his hands (Màn 4: walking in the rain)
HELD.non = new THREE.Group(); HELD.non.position.set(0, 3.95, .05); HELD.non.rotation.x = -.12; HELD.non.visible = false; toInner.add(HELD.non);
(function(){ const m = mesh(HELD.non, new THREE.ConeGeometry(1.45, .95, 20, 1, true), '#F4EFE4', {ow:.04}); m.material.side = THREE.DoubleSide;
  for(let i=0;i<3;i++) mesh(HELD.non, new THREE.TorusGeometry(.42 + i*.38, .025, 4, 24), '#C9B994', {pos:new THREE.Vector3(0, .26 - i*.25, 0), rot:[Math.PI/2, 0, 0], outline:false});
  mesh(HELD.non, new THREE.TorusGeometry(1.0, .03, 4, 24, Math.PI), '#C23A28', {pos:new THREE.Vector3(0, -.4, .2), rot:[.25, 0, Math.PI], outline:false}); })();
// a paper kite held up over his head on a short string: jump to glide, ride a warm updraft to climb
HELD.dieu = new THREE.Group(); HELD.dieu.position.set(-.4, 5.2, -.4); HELD.dieu.scale.setScalar(1.45); HELD.dieu.visible = false; toInner.add(HELD.dieu);
(function(){ const ks = new THREE.Shape(); ks.moveTo(0, .95); ks.lineTo(.68, .15); ks.lineTo(0, -.85); ks.lineTo(-.68, .15); ks.closePath();
  const k = mesh(HELD.dieu, new THREE.ShapeGeometry(ks), '#F4EFE4', {ow:.04}); k.material.side = THREE.DoubleSide;
  rod(HELD.dieu, new THREE.Vector3(0, .95, .02), new THREE.Vector3(0, -.85, .02), .025, '#B88A4A', {outline:false});
  rod(HELD.dieu, new THREE.Vector3(-.68, .15, .02), new THREE.Vector3(.68, .15, .02), .025, '#B88A4A', {outline:false});
  for(let i=0;i<4;i++) blob(HELD.dieu, new THREE.Vector3(Math.sin(i*1.4)*.12, -1.05 - i*.32, 0), [.1, .04, .1], '#C23A28', {small:true});
  rod(HELD.dieu, new THREE.Vector3(0, -.85, 0), new THREE.Vector3(.5, -3.1, .9), .012, '#3B2E2A', {outline:false}); })();
// a paper star lantern on a bamboo stick, a candle inside: it carries a flame to the lanterns hung along the street
HELD.den = new THREE.Group(); HELD.den.position.set(.3, 0, .1); HELD.den.visible = false; heldG.add(HELD.den);
(function(){ rod(HELD.den, new THREE.Vector3(0, -.3, 0), new THREE.Vector3(.1, 1.9, 0), .03, '#C99A52', {outline:false});
  const st = new THREE.Shape(); for(let i=0;i<10;i++){ const a = Math.PI/2 + i*Math.PI/5, r = i%2 ? .26 : .62; if(i) st.lineTo(Math.cos(a)*r, Math.sin(a)*r); else st.moveTo(Math.cos(a)*r, Math.sin(a)*r); }
  mesh(HELD.den, new THREE.ExtrudeGeometry(st, {depth:.22, bevelEnabled:false}), '#E8442E', {pos:new THREE.Vector3(.12, 2.5, -.11), ow:.035, keep:true});
  for(let i=0;i<3;i++) blob(HELD.den, new THREE.Vector3(.12 + (i - 1)*.12, 1.75 - i*.18, .05), [.05, .12, .03], '#F2C230', {small:true, keep:true});
  const g = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.MeshBasicMaterial({map:dotTex, color:'#FFC94A', transparent:true, opacity:.55, depthWrite:false, blending:THREE.AdditiveBlending}));
  g.position.set(.12, 2.5, .2); HELD.den.add(g); })();
(function(){
  const pm = toon('#E9E4DA'); const pg = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.2), pm); pm.side = THREE.DoubleSide; HELD.paper.add(pg); HELD.paper.rotation.x = -.3;
  const ol = new THREE.Mesh(new THREE.PlaneGeometry(1.08, 1.28), new THREE.MeshBasicMaterial({color:'#141019', side:THREE.DoubleSide})); ol.position.z = -.01; HELD.paper.add(ol);
  const sh = new THREE.Shape(); sh.moveTo(-.75,.22); sh.lineTo(.75,.22); sh.lineTo(.45,-.18); sh.lineTo(-.45,-.18); sh.closePath();
  mesh(HELD.thuyen, new THREE.ExtrudeGeometry(sh, {depth:.42, bevelEnabled:false}), '#F4EFE4', {pos:new THREE.Vector3(0,0,-.21), ow:.03});
  mesh(HELD.thuyen, new THREE.CylinderGeometry(0,.34,.56,3), '#F4EFE4', {pos:new THREE.Vector3(0,.5,0), scl:[1,1,.35], ow:.03});
  const ps = new THREE.Shape(); ps.moveTo(.8,0); ps.lineTo(-.6,.5); ps.lineTo(-.35,0); ps.lineTo(-.6,-.5); ps.closePath();
  const pl = mesh(HELD.maybay, new THREE.ShapeGeometry(ps), '#F4EFE4', {ow:.04}); pl.material.side = THREE.DoubleSide; HELD.maybay.rotation.x = -1.2;
  for(let i=0;i<7;i++){ const m = mesh(HELD.quat, new THREE.BoxGeometry(.16, .9, .03), i%2 ? '#F4EFE4' : '#E8C27A', {pos:new THREE.Vector3(0,.45,0), ow:.02}); const g = new THREE.Group(); g.rotation.z = (i - 3)*.22; g.add(m); HELD.quat.add(g); }
})();
function showHeld(){
  for(const k in HELD) HELD[k].visible = false;
  if(held.on) HELD[held.form || 'paper'].visible = true;
  handEl.style.display = held.on ? '' : 'none';
  handEl.textContent = held.on ? 'Tay: ' + (held.form ? FORMS[held.form] : 'tờ lịch') : '';
}
function takeHeld(s){
  if(held.on && held.src && held.src !== s && held.src.respawn) later(1.5, ((q)=>()=>resetSheet(q))(held.src));
  held.on = true; held.form = null; held.src = s; held.wear = 1; showHeld();
}
function dropHeld(){ const s = held.src; held.on = false; held.form = null; held.src = null; showHeld(); if(s && s.respawn) later(2, ()=>resetSheet(s)); }
function fold(){
  jrAct(128);
  if(intro.on || P.won || busy()) return;
  if(!held.on){ say('Tay không có tờ lịch nào để gấp.', 1.6); return; }
  if(!learned.length){ say('Tò chưa biết gấp gì cả.', 1.6); return; }
  const order = learned.concat([null]); held.form = order[(order.indexOf(held.form) + 1) % order.length]; showHeld(); sfx('fold');
  say(held.form ? 'Gấp thành ' + FORMS[held.form] + '!' : 'Mở ra thành tờ lịch.', 1.2);
}
function useHeld(){
  const f = held.form;
  if(!f){
    const sl = nearSlot();
    if(sl){ sfx('paste'); buzz(20); sl.filled = true; sl.patch.visible = true; sl.line.visible = false; dropHeld(); say('Dán!', 1); if(sl.onPaste) sl.onPaste(sl); return; }
    say(learned.length ? 'Bấm Q để gấp, hoặc tìm ô viền chấm để dán.' : 'Tìm ô viền chấm để dán tờ này.', 2); return;
  }
  if(f === 'thuyen'){
    const c = channels.find(c=>P.x > c.x0 - 1.6 && P.x < c.x1 + 1.6 && P.y > c.level - .3);
    if(!c){ say('Phải đứng sát chỗ có nước mới thả thuyền.', 2); return; }
    launchBoat(c, P.x); sfx('use'); dropHeld(); say('Thả thuyền!', 1.2); return;
  }
  if(f === 'maybay'){ throwPlane(); sfx('use'); dropHeld(); return; }
  if(f === 'quat'){ waveFan(); sfx('use'); }
  if(f === 'den'){ if(!(LV.onDen && LV.onDen())) say('Chẳng có đèn treo nào gần để thắp.', 1.6); return; }
  if(f === 'dieu') say(P.ground ? 'Nhảy lên là lượn. Gặp luồng gió nóng thì bay lên!' : 'Lượn…', 1.8);
  if(f === 'non') say(held.wear > .5 ? 'Đội nón rồi, đi mưa được một lúc.' : 'Nón sắp nhũn rồi, tìm chỗ trú đi!', 1.8);
}

// dotted slots where a carried page can be pasted (a leak, a gap in the wind)
const slots = [];
function slot(o){
  const s = Object.assign({filled:false, z:-.3}, o);
  const g = new THREE.BufferGeometry().setFromPoints([[s.x0,s.y0],[s.x1,s.y0],[s.x1,s.y1],[s.x0,s.y1],[s.x0,s.y0]].map(q=>new THREE.Vector3(q[0], q[1], s.z)));
  s.line = new THREE.Line(g, new THREE.LineDashedMaterial({color:'#FFE27A', dashSize:.2, gapSize:.12})); s.line.computeLineDistances(); scene.add(s.line);
  s.patch = new THREE.Mesh(new THREE.PlaneGeometry(s.x1 - s.x0, s.y1 - s.y0), new THREE.MeshToonMaterial({map:dayTexture(s.x1 - s.x0, s.y1 - s.y0, '14', 77), gradientMap:ramp}));
  s.patch.position.set((s.x0 + s.x1)/2, (s.y0 + s.y1)/2, s.z + .01); s.patch.visible = false; scene.add(s.patch);
  slots.push(s); return s;
}
function nearSlot(){ for(const s of slots) if(!s.filled && P.x > s.x0 - 1.3 && P.x < s.x1 + 1.3 && P.y + 1.2 > s.y0 - 1.2 && P.y < s.y1 + .5) return s; return null; }
function unpaste(s){ s.filled = false; s.patch.visible = false; s.line.visible = true; }

// water channels whose level moves, and the one paper boat Tò rides on them
const channels = [];
const chanMat = new THREE.MeshToonMaterial({map:TEX.water, color:new THREE.Color('#3FA7C9').convertSRGBToLinear(), gradientMap:ramp, transparent:true, opacity:.88});
function channel(o){
  const c = Object.assign({z0:-1.6, z1:1.6, speed:1.1}, o); c.want = c.level;
  c.m = new THREE.Mesh(new THREE.BoxGeometry(c.x1 - c.x0, 1, c.z1 - c.z0), chanMat); c.m.position.set((c.x0 + c.x1)/2, 0, (c.z0 + c.z1)/2); scene.add(c.m);
  channels.push(c); return c;
}
const boat = {on:false, c:null, x:0, y:0, g:new THREE.Group()};
scene.add(boat.g); boat.g.visible = false;
(function(){
  const sh = new THREE.Shape(); sh.moveTo(-1.1,.32); sh.lineTo(1.1,.32); sh.lineTo(.7,-.12); sh.lineTo(-.7,-.12); sh.closePath();
  mesh(boat.g, new THREE.ExtrudeGeometry(sh, {depth:.9, bevelEnabled:false}), '#F4EFE4', {pos:new THREE.Vector3(0,0,-.45), ow:.04});
  mesh(boat.g, new THREE.CylinderGeometry(0,.55,.8,3), '#F4EFE4', {pos:new THREE.Vector3(0,.7,-.2), scl:[1,1,.3], ow:.035});
  mesh(boat.g, new THREE.BoxGeometry(1.8,.06,.84), '#D8382A', {pos:new THREE.Vector3(0,.2,0), outline:false});
})();
boat.plat = plat(0, 0, 0, true, ()=>boat.on);
function launchBoat(c, x){ boat.on = true; boat.c = c; boat.x = Math.max(c.x0 + 1.1, Math.min(c.x1 - 1.1, x)); boat.y = Math.max(c.floor + .05, c.level); boat.g.visible = true; }
function boatTick(dt, t){
  for(const c of channels){
    c.level += Math.max(-dt*c.speed, Math.min(dt*c.speed, c.want - c.level));
    const h = Math.max(.02, c.level - c.floor); c.m.scale.y = h; c.m.position.y = c.floor + h/2; c.m.visible = c.level > c.floor + .03;
  }
  if(!boat.on) return;
  const c = boat.c, floating = c.level > c.floor + .45;
  boat.y += ((floating ? c.level : c.floor + .02) - boat.y)*Math.min(1, dt*3);
  if(P.on === boat.plat && floating && Math.abs(P.vx) > .1) boat.x = Math.max(c.x0 + 1.1, Math.min(c.x1 - 1.1, P.x));
  boat.plat.x0 = boat.x - 1.05; boat.plat.x1 = boat.x + 1.05; boat.plat.top = boat.y + .3;
  boat.g.position.set(boat.x, boat.y + (floating ? Math.sin(t*2.2)*.04 : 0), .1); boat.g.rotation.z = floating ? Math.sin(t*1.7)*.04 : .08;
}

// paper plane: flies the way Tò faces and can hit a target he can't reach (a switch behind bars)
const targets = [];
function target(o){ const q = Object.assign({hit:false, r:.9}, o); targets.push(q); return q; }
const plane = {on:false, x:0, y:0, vx:0, vy:0, t:0, g:new THREE.Group()};
scene.add(plane.g); plane.g.visible = false;
(function(){ const ps = new THREE.Shape(); ps.moveTo(.55,0); ps.lineTo(-.4,.32); ps.lineTo(-.22,0); ps.lineTo(-.4,-.32); ps.closePath();
  const m = mesh(plane.g, new THREE.ShapeGeometry(ps), '#F4EFE4', {ow:.03}); m.material.side = THREE.DoubleSide; m.rotation.x = -1.3; })();
function throwPlane(){ plane.on = true; plane.t = 0; plane.x = P.x + P.face*.6; plane.y = P.y + 1.3; plane.vx = P.face*7.5; plane.vy = 1.6; plane.g.visible = true; say('Bay đi!', 1); }
function planeTick(dt){
  if(!plane.on) return;
  plane.t += dt; plane.vy -= 1.6*dt; plane.x += plane.vx*dt; plane.y += plane.vy*dt;
  plane.g.position.set(plane.x, plane.y, .3); plane.g.rotation.set(0, plane.vx < 0 ? Math.PI : 0, Math.atan2(plane.vy, Math.abs(plane.vx)));
  for(const q of targets) if(!q.hit && Math.hypot(plane.x - q.x, plane.y - q.y) < q.r){ q.hit = true; plane.on = false; plane.g.visible = false; if(q.onHit) q.onHit(q); return; }
  if(plane.t > 2.4 || plane.y < -1){ plane.on = false; plane.g.visible = false; say('Trượt rồi… gấp lại cái khác.', 1.8); }
}
// paper fan: a wave sends Lũ Bụi that can be blown floating up and away
let fanT = 0;
function waveFan(){
  fanT = .45; let n = 0;
  for(const b of buis) if(b.fan && !b.gone && Math.sign(b.x - P.x) === P.face && Math.abs(b.x - P.x) < 5 && Math.abs(b.top - P.y) < 1.6){ b.gone = true; b.goneT = 0; n++; }
  say(n ? 'Phù! Bay hết!' : 'Phẩy phẩy…', 1); if(LV.onFan) LV.onFan(n);
}
// timers
const timers = [];
function later(sec, fn){ timers.push({t:sec, fn}); }
function timersTick(dt){ for(let i = timers.length - 1; i >= 0; i--){ timers[i].t -= dt; if(timers[i].t <= 0){ const f = timers[i].fn; timers.splice(i, 1); f(); } } }
function resetSheet(s){ s.L = 0; s.p = 0; s.done = false; s.full = false; sheetVis(s, true); updSheet(s); }
// Tò's star lantern: a warm light that follows him (Màn 3)
const toLight = new THREE.PointLight('#FFD58A', 0, 11, 1.4); scene.add(toLight);
// ---------- rain (Màn 4): open sky wets Tò and washes his colour out; anything over his head keeps him dry ----------
// LV.rain(x, y) says where rain falls; LV.wetT = seconds in the open before he goes soggy; LV.nonT = seconds a paper nón lasts
const rain = {k:0, wet:0, open:false};
const wetEl = $('wet'), wetB = $('wetB');
function covered(){
  for(const s of solids){
    if(!s.on() || s === P.on || P.x < s.x0 + .15 || P.x > s.x1 - .15) continue;
    if(s.top > P.y + 1.3 && s.top < P.y + 9) return true;
  }
  // a calendar sheet pulled up over his head is a little roof too
  for(const s of sheets) if(s.dir === 'y' && !s.done && s.p > .25 && P.x > s.x0 && P.x < s.x1){ const e = s.y0 + s.p; if(e > P.y + 1.1 && e < P.y + 4.5) return true; }
  return false;
}
function wetTick(dt){
  if(!LV.rain) return;
  wetEl.style.display = '';
  rain.open = rain.k > .3 && LV.rain(P.x, P.y) && !covered();
  if(P.won || busy()) rain.wet = Math.max(0, rain.wet - dt);
  else if(rain.open && held.on && held.form === 'non'){
    held.wear -= dt/(LV.nonT || 7); rain.wet = Math.max(0, rain.wet - dt*.3);
    if(held.wear <= 0){ say('Nón nhũn mất rồi!', 1.8); dropHeld(); }
  }
  else if(rain.open){ rain.wet += dt/(LV.wetT || 2.8); lastProgT = nowT; }
  else rain.wet = Math.max(0, rain.wet - dt/1.1);
  if(rain.wet >= 1){ rain.wet = 0; respawn('Ướt nhũn rồi! Tò là bột gạo mà…'); }
  else if(rain.wet > .55 && toSayT <= 0 && rain.open) say('Ướt quá! Tìm chỗ trú!', 1.2);
  wetB.style.width = Math.round(rain.wet*100) + '%'; wetEl.classList.toggle('hot', rain.wet > .55);
  setZone('0', 1 - rain.wet*.75);
}
// streaks around the camera: a near band in front of the shelters and a far band behind the street
const RAIN_N = 900, rainP = new Float32Array(RAIN_N*6), rainS = [];
const rainGeo = new THREE.BufferGeometry(); rainGeo.setAttribute('position', new THREE.BufferAttribute(rainP, 3));
const rainLines = new THREE.LineSegments(rainGeo, new THREE.LineBasicMaterial({color:'#DCE6F2', transparent:true, opacity:0, depthWrite:false}));
rainLines.frustumCulled = false; rainLines.visible = false; scene.add(rainLines);
for(let i=0;i<RAIN_N;i++) rainS.push({x:Math.random()*44, y:Math.random()*20, z:i%3 ? 1.9 + Math.random()*5 : -9 + Math.random()*5, v:16 + Math.random()*6});
// drops that run off Tò while he is wet
const dripP = new Float32Array(24*3), drips = []; const dripGeo = new THREE.BufferGeometry(); dripGeo.setAttribute('position', new THREE.BufferAttribute(dripP, 3));
const dripPts = new THREE.Points(dripGeo, new THREE.PointsMaterial({map:dotTex, color:'#BFE3FF', size:.22, transparent:true, depthWrite:false})); dripPts.frustumCulled = false; scene.add(dripPts);
for(let i=0;i<24;i++) drips.push({x:0, y:-99, vy:0});
let rainLast = 0;
function rainTick(t){
  const dt = Math.min(.05, t - rainLast); rainLast = t;
  if(!LV.rain){ return; }
  if(window.AM) AM.rain(rain.k);
  rainLines.visible = rain.k > .01; rainLines.material.opacity = .5*rain.k;
  const cx = camera.position.x, cy = camLook.y;
  for(let i=0;i<RAIN_N;i++){
    const d = rainS[i]; if(!paused && !hook.pause) d.y -= d.v*dt; if(d.y < -1) d.y += 21;
    const x = cx - 22 + ((d.x + d.y*.12) % 44 + 44) % 44, y = cy - 7 + d.y, j = i*6;
    rainP[j] = x; rainP[j+1] = y; rainP[j+2] = d.z; rainP[j+3] = x - .08; rainP[j+4] = y + .7; rainP[j+5] = d.z;
  }
  rainGeo.attributes.position.needsUpdate = true;
  for(let i=0;i<drips.length;i++){
    const d = drips[i];
    if(d.y < P.y - .2 && rain.wet > .08 && Math.random() < rain.wet*.35){ d.x = P.x + (Math.random() - .5)*.9; d.y = P.y + .6 + Math.random()*1.2; d.vy = 0; }
    d.vy -= 14*dt; d.y += d.vy*dt; dripP[i*3] = d.x; dripP[i*3+1] = d.y; dripP[i*3+2] = .7;
  }
  dripGeo.attributes.position.needsUpdate = true;
}
function step(dt, t){
  let dir = (keys.right?1:0) - (keys.left?1:0);
  if(P.won || busy()){ dir = 0; jumpQueued = false; grabQueued = false; if(P.grab) release(); }
  // holding a curled edge: walk backwards to peel
  if(P.grab){
    const s = P.grab;
    if(grabQueued || !P.ground){ grabQueued = false; release(); }
    else if(s.dir === 'x'){
      P.vx = dir*PEEL_SPEED; P.face = -1;
      P.x = Math.max(s.x0 + s.p - .2, P.x + P.vx*dt);
      s.p = Math.min(s.w, Math.max(s.p, P.x - s.x0 - .45));
      updSheet(s);
      if(s.p >= s.w - .02){ P.grab = null; layerDone(s); } else if(dir) lastProgT = nowT;
    } else {
      P.vx = dir*PEEL_SPEED; P.face = 1;
      P.x = Math.max(LV.bounds[0], Math.min(P.gx, P.x + P.vx*dt));
      s.p = Math.max(0, Math.min(s.h, P.gp + (P.gx - P.x)*.85));
      if(s.p >= s.h - .02){ s.p = s.h; P.grab = null; s.full = true; s.rest = 2; if(s.onFull) s.onFull(s); }
      updSheet(s); if(dir) lastProgT = nowT;
    }
  }
  if(!P.grab){
    if(grabQueued && P.ground){
      // holding a page but standing at another edge with no slot to paste into: put the page down and take hold of the edge
      // a nón stays on his head, so his hands are free to peel
      const hands = held.on && held.form !== 'non', ns = hands && !nearSlot() && nearSheet();
      if(ns && !ns.locked){ dropHeld(); say('Bỏ tờ đang cầm xuống.', 1); grab(ns); }
      else if(hands || (held.on && !nearSheet())) useHeld();
      else { const s = nearSheet(); if(s){ if(s.locked){ if(s.onLocked) s.onLocked(s); } else grab(s); } else if(LV.use) LV.use(); }
    }
    const target = dir*SPEED;
    if(P.knock > 0) P.knock -= dt; else P.vx += (target - P.vx)*Math.min(1, dt*14);
    if(dir) P.face = dir;
    if(jumpQueued && P.ground && !P.grab){ P.vy = JUMP; P.ground = false; sfx('jump'); }
  }
  if(window.AM && !JR.replay) AM.tear(P.grab && dir ? 1 : 0);
  jumpQueued = false; grabQueued = false;
  if(P.ground && P.on && P.on.on() && P.vy <= 0 && P.x + P.w/2 - .08 >= P.on.x0 && P.x - P.w/2 + .08 <= P.on.x1) P.y = P.on.top;
  P.vy -= GRAV*dt;
  if(held.on && held.form === 'dieu' && !P.grab){
    let up = false;
    for(const l of lifts) if(l.on() && P.x > l.x0 && P.x < l.x1 && P.y > l.y0 - .1 && P.y < l.y1){ up = true; P.vy = Math.min(7, P.vy + (GRAV + 34)*dt); }
    if(!up && P.vy < -GLIDE) P.vy = -GLIDE;
    HELD.dieu.rotation.z = Math.sin(t*7)*.07 + (P.ground ? 0 : up ? .12 : -.18);
  }
  const yPrev = P.y, vyIn = P.vy, wasGround = P.ground; let ny = P.y + P.vy*dt;
  let nx = P.grab ? P.x : P.x + P.vx*dt;
  if(!P.grab) for(const w of winds) if(w.on() && P.x > w.x0 && P.x < w.x1 && P.y > w.y0 - .1 && P.y < w.y1) nx += w.force*dt;
  for(const b of blocks){
    if(!b.on() || P.y + 1.2 <= b.y0 || P.y >= b.y1 - .02) continue;
    if(P.x + P.w/2 <= b.x0 + .02 && nx + P.w/2 > b.x0) nx = b.x0 - P.w/2;
    else if(P.x - P.w/2 >= b.x1 - .02 && nx - P.w/2 < b.x1) nx = b.x1 + P.w/2;
  }
  nx = Math.max(LV.bounds[0], Math.min(LV.bounds[1], nx));
  const st = P.vy <= 0 ? standingOn(nx, yPrev, ny) : null;
  P.on = st;
  if(st){ ny = st.top; P.vy = 0; P.ground = true; if(st.safe) P.check = {x:Math.max(st.x0 + .7, Math.min(st.x1 - .7, nx)), y:st.top}; }
  else P.ground = false;
  if(st && st.bounce && vyIn < -3){ P.vy = st.bounce; P.ground = false; P.on = null; ny = st.top + .02; if(st.onBounce) st.onBounce(); }
  P.x = nx; P.y = ny;
  if(st && !wasGround && vyIn < -9) wakeNear(P.x, P.y);
  if(st && !wasGround && vyIn < -4){ sfx('land', -vyIn); if(vyIn < -12) buzz(20); }
  if(P.ground && !P.grab && Math.abs(P.vx) > 1.5){ stepD += Math.abs(P.vx)*dt; if(stepD > .95){ stepD = 0; sfx('step'); } }
  wetTick(dt);
  for(const h of hazards) if(P.y < h.y && P.x > h.x0 && P.x < h.x1){ respawn(h.msg); break; }
  for(const c of channels) if(P.x > c.x0 && P.x < c.x1 && P.y < Math.max(c.floor + .5, c.level - .25) && P.on !== boat.plat){ respawn(c.level > c.floor + .45 ? 'Á! Nước! Tò sợ nước lắm!' : 'Rãnh sâu quá!'); break; }
  // Lũ Bụi bump Tò back
  for(const b of buis){
    if(b.z < -.3 || b.gone) continue;
    const by = b.top + b.s;
    if(Math.abs(P.x - b.x) < (P.w/2 + b.s*.9) && P.y < by + b.s*.6 && P.y + P.h > b.top + .05){
      P.vx = (P.x < b.x ? -1 : 1)*9; P.vy = 7; P.knock = .35; P.ground = false; release();
      say('Hắt xì! Bụi quá!', 1.6);
    }
  }
  for(const f of flies){
    if(f.got || !f.show()) continue;
    if(Math.abs(P.x - f.g.position.x) < .9 && f.g.position.y > P.y - .3 && f.g.position.y < P.y + P.h + .4){
      f.got = true; f.gotT = 0; fliesGot++; sfx('fly'); fflyEl.textContent = 'Đom đóm ' + fliesGot + '/5';
      if(fliesGot === 5) say('Đủ 5 con đom đóm rồi!', 2);
    }
  }
  if(relicObj && !relicGot && Math.abs(P.x - relicObj.x) < .9 && P.y > relicObj.y - .5 && P.y < relicObj.y + 1.6){
    relicGot = true; sfx('relic'); buzz(40); relicSave(LV.level); relicEl.textContent = 'Tò he cũ 1/1'; relicEl.classList.add('got'); say('Con tò he cũ của bà! ' + relicObj.name + '.', 2.8); lastProgT = nowT;
  }
}

// ---------- Bụi, fireflies, sheets: per-frame motion ----------
function actors(dt, t){
  timersTick(dt); boatTick(dt, t); planeTick(dt);
  if(fanT > 0){ fanT -= dt; HELD.quat.rotation.z = Math.sin(fanT*30)*.5; }
  toLight.position.set(P.x + .3, P.y + 2.2, 1.6); toLight.intensity = LV.lantern || 0;
  for(const b of buis){
    if(b.sleep){
      if(b.awake){
        b.t -= dt;
        const tx = b.t > 0 ? Math.max(b.home - 4, Math.min(b.home + 4, P.x)) : b.home;
        b.dir = Math.sign(tx - b.x) || b.dir; b.x += Math.max(-dt*2.6, Math.min(dt*2.6, tx - b.x));
        b.z += (.2 - b.z)*Math.min(1, dt*5);
        if(b.t <= 0 && Math.abs(b.x - b.home) < .05) b.awake = false;
      } else b.z += (-.9 - b.z)*Math.min(1, dt*3);
    } else {
      b.x += b.dir*dt*1.4; if(b.x > b.b){ b.x = b.b; b.dir = -1; } if(b.x < b.a){ b.x = b.a; b.dir = 1; }
    }
    if(b.gone){ b.goneT += dt; b.g.position.y += dt*3.5; b.g.rotation.z += dt*6; b.g.scale.setScalar(Math.max(.01, 1 - b.goneT*.8)); b.g.visible = b.goneT < 1.3; continue; }
    const hop = (b.awake || !b.sleep) ? Math.abs(Math.sin(t*3 + b.ph))*.25 : Math.sin(t*1.5 + b.ph)*.03;
    b.g.position.set(b.x, b.top + b.s + hop, b.z); b.g.rotation.y = b.dir*.4;
    b.g.scale.set(1, (b.sleep && !b.awake) ? .9 + Math.sin(t*1.5 + b.ph)*.04 : 1, 1);
  }
  for(const f of flies){
    if(f.got){ f.gotT += dt; f.g.scale.setScalar(1 + f.gotT*4); f.h.material.opacity = Math.max(0, 1 - f.gotT*2); f.g.visible = f.gotT < .5; f.g.position.y += dt*2; continue; }
    f.g.visible = !intro.on && f.show();
    f.g.position.set(f.x + Math.sin(t*1.3 + f.ph)*.35, f.y + Math.sin(t*2.1 + f.ph)*.25, .3);
    f.h.material.opacity = .6 + Math.sin(t*5 + f.ph)*.35;
  }
  if(relicObj){
    const g = relicObj.g;
    if(relicGot){ relicObj.t += dt; g.position.y = relicObj.y + relicObj.t*1.6; g.rotation.y += dt*8; g.scale.setScalar(Math.max(.01, 1 - relicObj.t*.7)); g.visible = relicObj.t < 1.4; }
    else g.rotation.y = Math.sin(t*1.2)*.25;
  }
  // a fully pulled-up sheet springs back after a moment
  for(const s of sheets) if(s.full){ s.rest -= dt; if(s.rest <= 0){ s.p = Math.max(0, s.p - dt*3.5); updSheet(s); if(s.p === 0) s.full = false; } }
  const near = !P.grab && !busy() && nearSheet();
  const focus = sheets.find(q=>!q.done && !q.solved);
  for(const s of sheets){
    if(s.done || (!s.m.visible && !s.ghost)) continue;
    updSheet(s);
    if(near === s){ const k = 1.15 + Math.sin(t*8)*.15; s.curl.scale.x *= k; s.curl.scale.z *= k; }
    const lit = !LV.dark || Math.abs(P.x - (s.x0 + s.x1)/2) < s.w/2 + 4 && Math.abs(P.y + 1 - (s.y0 + s.y1)/2) < s.h/2 + 3.5;
    s.halo.material.opacity = (.55 + Math.sin(t*4 + s.x0)*.25 + (near === s ? .3 : 0))*(s === focus ? 1 : .3)*(s.full || !lit ? 0 : 1);
    s.core.material.opacity = s.full || !lit ? 0 : 1;
    if(s.ghost){ s.m.visible = s.back.visible = s.frame.visible = s.curl.visible = false; }
    s.arrow.visible = (near === s || P.grab === s);
    if(s.dir === 'x') s.arrow.position.set(s.x0 + s.p + 1.9 + Math.sin(t*6)*.12, Math.min(s.y1 - .3, P.y + 1.5), s.z + 1.2);
    else s.arrow.position.set(P.x - 1.6 - Math.sin(t*6)*.12, P.y + 1.4, .9);
    // standing close to a stack lets the next day show through
    const peekOn = s.layers.length - s.L > 1 && Math.abs(P.x - (s.x0 + s.x1)/2) < s.w/2 + 2.5 && Math.abs(P.y + 1 - (s.y0 + s.y1)/2) < s.h/2 + 1.5 && !P.grab;
    s.peek += ((peekOn ? .55 : 1) - s.peek)*Math.min(1, dt*4); s.m.material.opacity = s.peek;
  }
  return near;
}

// ---------- Tò's pose and the camera ----------
const camPos = new THREE.Vector3(6, 6, 22), camLook = new THREE.Vector3(6, 3, 0), tmpV = new THREE.Vector3();
function camTo(x, y, z, dt, k){
  camLook.lerp(tmpV.set(x, y, -1), Math.min(1, dt*k));
  camPos.lerp(tmpV.set(x - 3, y + 2.9, z), Math.min(1, dt*k));   // slight 3/4 view shows the houses' sides
  camera.position.copy(camPos); camera.lookAt(camLook);
  sun.position.set(camLook.x - 8, 18, 12); sun.target.position.set(camLook.x, 0, 0);
}
function poseTo(dt, t){
  toG.position.set(P.x, P.y, 0);
  const faceY = P.grab ? (P.grab.dir === 'x' ? -0.9 : 0.6) : (P.face > 0 ? 0.75 : -0.75);
  toInner.rotation.y += (faceY - toInner.rotation.y)*Math.min(1, dt*12);
  const moving = Math.abs(P.vx) > .3 && P.ground;
  P.walkT += dt*(moving ? (P.grab ? 7 : 12) : 0);
  toInner.position.y = moving ? Math.abs(Math.sin(P.walkT))*.18 : Math.sin(t*2.2)*.03;
  toInner.rotation.z = moving ? Math.sin(P.walkT)*.08 : 0;
  TO.legs[0].position.z = .08 + (moving ? Math.sin(P.walkT)*.25 : 0); TO.legs[1].position.z = .08 - (moving ? Math.sin(P.walkT)*.25 : 0);
  for(const [i, a] of TO.arms.entries()){
    const target = P.grab ? (P.grab.dir === 'x' ? -1.3 : -2.6) : held.on && held.form !== 'non' ? -1.2 : (P.ground ? (moving ? Math.sin(P.walkT + i*Math.PI)*.5 : 0) : -2.2);
    a.rotation.x += (target - a.rotation.x)*Math.min(1, dt*12);
  }
  TO.body.scale.y = .95*(1 + (P.ground ? 0 : .06))*(1 - rain.wet*.14);
}
function place(el, obj, dy, text){
  if(!text){ el.style.opacity = 0; return; }
  obj.getWorldPosition(tmpV); tmpV.y += dy; tmpV.project(camera);
  el.style.left = ((tmpV.x + 1)/2*stage.clientWidth) + 'px'; el.style.top = ((1 - tmpV.y)/2*stage.clientHeight) + 'px';
  if(el.textContent !== text) el.textContent = text; el.style.opacity = 1;
}
// two people talking side by side: lift the higher bubble clear of the lower one instead of drawing them on top of each other
function unstack(){
  const on = talkers.filter(k=>k.d.style.opacity === '1').map(k=>({d:k.d, y:parseFloat(k.d.style.top)})).sort((a, b)=>b.y - a.y);
  const done = [];
  for(const b of on){
    let r = b.d.getBoundingClientRect();
    for(const o of done) if(r.left < o.right && r.right > o.left && r.top < o.bottom && r.bottom > o.top){ b.d.style.top = (parseFloat(b.d.style.top) - (r.bottom - o.top) - 4) + 'px'; r = b.d.getBoundingClientRect(); }
    done.push(r);
  }
}
function animate(dt, t){
  nowT = t; runSeq(dt);
  if(LV.update) LV.update(dt, t);
  poseTo(dt, t);
  const near = actors(dt, t);
  zonesTick(dt);
  let look = Math.max(LV.cam[0], Math.min(LV.cam[1], P.x + P.face*1.5));
  let ty = LV.camY ? LV.camY(P.x, P.y) : 2.8 + Math.max(0, P.y - 1)*.55, cz = 18.5, ck = 3;
  if(cur && cur.cam){ look = cur.cam[0]; ty = cur.cam[1]; cz = cur.cam[2] || 18.5; ck = 2.2; }
  camTo(look, ty, cz, dt, ck);
  if(toSayT > 0) toSayT -= dt;
  if(toSayT <= 0 && sayNext){ say(sayNext[0], sayNext[1]); sayNext = null; }
  for(const k of talkers) place(k.d, k.obj, k.dy, k.fn());
  unstack();
  if(!P.won && !busy() && hintT <= 0 && t - lastProgT > 25){ hintT = 6; lastProgT = t; }
  // short control prompts always; the fuller hint only when H is pressed or Tò has been stuck a while
  if(hintT > 0) hintT -= dt;
  let h = '';
  if(P.won || busy()) h = '';
  else if(P.grab) h = P.grab.dir === 'x' ? 'Đi lùi để kéo · E để buông' : 'Đi lùi để kéo mép lên · E để buông, mép giấy thành gờ';
  else if(held.on) h = held.form ? (held.form === 'thuyen' ? 'E để thả thuyền xuống nước · Q đổi kiểu gấp' : held.form === 'maybay' ? 'E để phóng máy bay · Q đổi kiểu gấp' : held.form === 'non' ? 'Đang đội nón giấy, đi mưa được một lúc · Q đổi kiểu gấp' : held.form === 'den' ? 'Cầm đèn: E để thắp đèn treo, soi chỗ tối · Q đổi kiểu gấp' : held.form === 'dieu' ? 'Cầm diều: nhảy là lượn, vào luồng gió nóng là bay lên · Q đổi kiểu gấp' : 'E để phẩy quạt · Q đổi kiểu gấp') : (nearSlot() ? 'E để dán vào ô viền chấm' : learned.length ? 'Q để gấp tờ lịch' : 'Tìm ô viền chấm để dán');
  else if(near) h = near.locked ? 'E để thử bóc' : 'E để nắm mép';
  else if(stackNear() && !stackNear().solved) h = 'R để dán lại tờ vừa bóc';
  else if(hintT > 0) h = LV.hint();
  h = keysTxt(h); if(hintEl.textContent !== h) hintEl.textContent = h; hintEl.style.opacity = h ? 1 : 0;
  if(MOBILE){ const g = grabLabel(); if(grabB.textContent !== g) grabB.textContent = g; }
}

// ---------- intro (each level writes its own; this runs the captions and the skip) ----------
const intro = {on:false, t:0};
function endIntro(){
  if(intro.ended) return;
  intro.ended = true; intro.on = false; caption(''); skipEl.style.opacity = 0; bars(false);
  for(const s of sheets){ sheetVis(s, true); updSheet(s); }
  if(LV.intro && LV.intro.done) LV.intro.done();
}
function runIntro(dt, t){
  intro.t += dt; const it = intro.t; nowT = t;
  let c = ''; for(const k of LV.intro.caps) if(it >= k[0] && it < k[1]) c = k[2];
  caption(c);
  for(const s of sheets) sheetVis(s, it > (LV.intro.sheetsAt || 0));
  for(const f of flies) f.g.visible = false;
  poseTo(dt, t);
  LV.intro.run(it, dt, t);
  skyUpdate();
  if(it >= LV.intro.end) endIntro();
}

// ---------- win ----------
function finish(steps){ jrClear(); sfx('win'); buzz(60); P.won = true; release(); play(steps.concat([{dur:0, start:()=>{ winReady = true; }}])); }
// the win card leads straight on: the next level, or (after the last one) back to the title
function showWin(){
  const w = LV.winText();
  $('winH').textContent = w.h; $('winP').textContent = w.p; $('memory').innerHTML = w.memory; $('winNext').textContent = w.next;
  const next = LV.nextUrl || LEVEL_URL[LV.level + 1], s = saveGet();
  savePut({man: next ? LV.level + 1 : LV.level, max: Math.max(s.max || 1, next ? LV.level + 1 : LV.level), done: !!s.done || !next});
  const B = $('winB'); B.innerHTML = '';
  const btn = (t, cls, fn)=>{ const b = document.createElement('button'); b.className = 'btn ' + cls; b.textContent = t; b.onclick = fn; B.appendChild(b); return b; };
  if(next) btn('Tiếp tục', '', ()=>goTo(next)).focus();
  else btn('Về màn hình chính', '', ()=>goTo('../index.html')).focus();
  btn('Chơi lại màn này', 'alt', ()=>{ location.hash = 'choi'; location.reload(); });
  $('win').style.display = 'flex'; traySet(LV.level);
}
addEventListener('keydown', e=>{ if($('win').style.display === 'flex' && e.code === 'Enter'){ const b = $('winB').firstChild; if(b) b.click(); } });

// ---------- loop ----------
let simT = 0;
function resize(){
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h, false); camera.aspect = w/h;
  camera.fov = w < 640 ? 46 : 34; camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
// held upright on a phone the street is too narrow to read and the pads cover it: pause and ask to turn the phone
const PORTRAIT = matchMedia('(orientation:portrait) and (pointer:coarse)');
function portraitCheck(){ if(PORTRAIT.matches && !paused) setPause(true); }
if(PORTRAIT.addEventListener) PORTRAIT.addEventListener('change', portraitCheck); else PORTRAIT.addListener(portraitCheck);
// frame-rate guard: every 2 s, if frames average slower than ~45 fps, render a smaller canvas (never below 0.75) and remember it for the next level
let qT = 0, qN = 0, qWait = 3;
function quality(ms){
  if(ms > 250 || DPR_FIX) return;  // tab was hidden or the page stalled loading: not a fair sample
  if(qWait > 0){ qWait -= ms/1000; return; }
  qT += ms; qN++;
  if(qT < 2000) return;
  const avg = qT/qN; qT = qN = 0;
  const r = renderer.getPixelRatio();
  if(avg > 22 && r > .76){ const n = Math.max(.75, r - .25); renderer.setPixelRatio(n); resize(); qWait = 1; try { localStorage.setItem('phocu.dpr', n); } catch(e){} }
}
// ---------- run journal: "Chơi tiếp" picks a level up where Tò left it ----------
// The game runs in fixed 1/60 s steps, so the same input on the same step always gives the same street. The journal keeps only
// what the player did (button state when it changes, plus Dán lại and Gấp) and on "Chơi tiếp" the level is played back to that step
// before the screen fades in. If the level's code changed since and the replay ends somewhere else, the level simply starts over.
const STEP = 1/60, JR_KEY = 'phocu.jr';
const JR = {n:0, ev:[], last:-1, t0:0, replay:false, dirty:false};
function jrCode(){ return (keys.left?1:0)|(keys.right?2:0)|(keys.jump?4:0)|(keys.grab?8:0)|(jumpQueued?16:0)|(grabQueued?32:0); }
function jrAct(c){ if(!JR.replay && !intro.on && !P.won){ JR.ev.push(JR.n, c); JR.dirty = true; } }
function jrStep(){
  if(JR.replay) return;
  if(JR.n === 0) JR.t0 = simT - STEP;
  const c = jrCode(); if(c !== JR.last || (c & 48)){ JR.ev.push(JR.n, c); JR.last = c; JR.dirty = true; }
  JR.n++;
}
// after the step, so the saved spot is where the journal's last step leaves Tò
function jrTick(){ if(!JR.replay && JR.n % 300 === 0) jrSave(); }
function jrSave(){
  if(JR.replay || !JR.dirty || P.won || intro.on || !LV.level) return; JR.dirty = false;
  try { localStorage.setItem(JR_KEY, JSON.stringify({man:LV.level, n:JR.n, t0:+JR.t0.toFixed(4), x:+P.x.toFixed(3), y:+P.y.toFixed(3), ev:JR.ev})); } catch(e){}
}
function jrLoad(){ try { const j = JSON.parse(localStorage.getItem(JR_KEY) || 'null'); return j && j.man === LV.level && Array.isArray(j.ev) ? j : null; } catch(e){ return null; } }
function jrClear(){ try { localStorage.removeItem(JR_KEY); } catch(e){} }
addEventListener('pagehide', jrSave);
document.addEventListener('visibilitychange', ()=>{ if(document.hidden) jrSave(); });
function liveStep(){ simT += STEP; if(intro.on) runIntro(STEP, simT); else { jrStep(); step(STEP, simT); animate(STEP, simT); jrTick(); } }
// plays the journal back in slices so the page stays responsive; done(true) when Tò ends where the journal says
function jrReplay(j, done){
  JR.replay = true; if(window.AM) AM.mute(true); simT = j.t0; let i = 0, n = 0; const tStart = performance.now();
  const slice = ()=>{
    try {
      const end = Math.min(j.n, n + 1500);
      for(; n < end; n++){
        while(i < j.ev.length && j.ev[i] === n){ const c = j.ev[i+1]; i += 2;
          if(c === 64) back(); else if(c === 128) fold();
          else { keys.left = !!(c&1); keys.right = !!(c&2); keys.jump = !!(c&4); keys.grab = !!(c&8); jumpQueued = !!(c&16); grabQueued = !!(c&32); } }
        simT += STEP; step(STEP, simT); animate(STEP, simT);
      }
    } catch(e){ JR.replay = false; if(window.AM) AM.mute(false); hook.jrResult = {x:P.x, y:P.y, ok:false, err:String(e && e.message || e), at:n}; done(false); return; }
    if(n < j.n){ setTimeout(slice, 0); return; }
    for(const k in keys) keys[k] = false; jumpQueued = grabQueued = false;
    JR.replay = false; if(window.AM) AM.mute(false); JR.n = j.n; JR.ev = j.ev.slice(); JR.last = -1; JR.t0 = j.t0;
    hook.jrResult = {ms:Math.round(performance.now() - tStart), x:P.x, y:P.y, at:n, ok:Math.abs(P.x - j.x) < .05 && Math.abs(P.y - j.y) < .05 && !P.won};
    done(Math.abs(P.x - j.x) < .05 && Math.abs(P.y - j.y) < .05 && !P.won);
  };
  slice();
}
let last = performance.now(), acc = 0;
function loop(now){
  const ms = now - last; quality(ms); last = now;
  // never more than two steps a frame: a very slow frame slows the game down instead of jumping it ahead (as before)
  if(!hook.pause && !paused && !JR.replay){ acc = Math.min(acc + ms/1000, 2*STEP); let k = 0; while(acc > STEP*.75 && k++ < 2){ acc -= STEP; liveStep(); } }
  if(P.won && winReady && $('win').style.display !== 'flex') showWin();
  atmosphere(simT); rainTick(simT); skyDome.position.copy(camera.position);
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
// test hook: lets an automated run drive the same input the keyboard does
const hook = window.__game = {pause:false, P, keys, sheets, buis, LV, zoneK,
  jump:()=>{ jumpQueued = true; }, grab:()=>{ grabQueued = true; }, back,
  skipIntro:()=>{ if(intro.on) endIntro(); }, introTick:(n)=>{ for(let i=0;i<n && intro.on;i++){ simT += 1/60; runIntro(1/60, simT); } },
  tick:(n)=>{ for(let i=0;i<n;i++){ simT += STEP; if(intro.on) runIntro(STEP, simT); else { jrStep(); step(STEP, simT); animate(STEP, simT); jrTick(); } } }, jrSave, jrLoad, get jr(){ return JR; },
  tp:(x, y)=>{ P.x = x; P.y = y; P.vx = P.vy = 0; },
  get flies(){ return fliesGot; }, held, learned, boat, channels, lifts, winds, fold, slots, targets, rain, get relic(){ return relicGot; }, get info(){ return renderer.info.render; }, get busy(){ return busy(); }, get objective(){ return OBJ; }, get won(){ return P.won; }, get winReady(){ return winReady; }};
function startGame(){
  savePut({man: LV.level, max: Math.max(saveGet().max || 1, LV.level)});
  const fadeIn = ()=>requestAnimationFrame(()=>requestAnimationFrame(()=>$('fade').classList.add('out')));
  bake();
  P.x = LV.start.x; P.y = LV.start.y; P.check = {x:LV.start.x, y:LV.start.y};
  resize();
  camPos.set(P.x - 3, 5.7, 18.5); camLook.set(P.x, 2.8, -1);
  trayShow(); if(window.AM) AM.level(LV.level);
  const j = location.hash === '#tiep' ? jrLoad() : null;
  if(!j) jrClear();
  if(!j) fadeIn();
  if(j){
    endIntro();
    const fd = $('fade'); fd.classList.add('wait'); fd.textContent = 'Tò đang về lại chỗ cũ…';
    jrReplay(j, ok=>{
      if(!ok){ jrClear(); location.hash = 'choi'; location.reload(); return; }
      camPos.set(P.x - 3, 5.7, 18.5); camLook.set(P.x, 2.8, -1);
      if(history.replaceState) history.replaceState(null, '', location.pathname);
      fd.textContent = ''; fd.classList.remove('wait'); fadeIn(); toast('Tò về lại chỗ cũ.', 2.4); portraitCheck(); last = performance.now(); requestAnimationFrame(loop);
    });
    return;
  }
  if(LV.intro && location.hash !== '#choi'){ intro.on = true; bars(true); skipEl.style.opacity = 1; }
  else endIntro();
  portraitCheck();
  requestAnimationFrame(loop);
}

// works offline and installs like an app (Thêm vào màn hình chính): see /sw.js
if('serviceWorker' in navigator && location.protocol.startsWith('http')) addEventListener('load', ()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
