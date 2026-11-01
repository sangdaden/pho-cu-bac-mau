// usage: node canh1.js <outdir>  · Màn 1 close-ups: the cat's leap and stroll, cô Hai pushing the cart, Tò standing on the awning
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const THREE = fs.readFileSync(path.join(__dirname,'../../prototype/chung/three.min.js'));
(async()=>{
  const out = process.argv[2];
  const b = await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:800}});
  const errs = []; p.on('pageerror', e=>errs.push(e.message));
  await p.route('**/three.min.js', r=>r.fulfill({body:THREE, contentType:'application/javascript'}));
  await p.route('https://fonts.googleapis.com/**', r=>r.abort());
  await p.goto('file://'+path.resolve(__dirname, '../../prototype/man-1/index.html'));
  await p.waitForTimeout(2000);
  const snap = async n=>{ await p.evaluate(()=>{ G.pause=false; }); await p.waitForTimeout(150); await p.evaluate(()=>{ G.pause=true; }); await p.screenshot({path:`${out}/${n}.png`, timeout:90000}); };
  const ev = (f, a)=>p.evaluate(f, a);
  await ev(()=>{ const g = window.__game; window.G = g; g.pause = true; g.skipIntro(); g.tick(10);
    window.peelAt = i=>{ const s = g.sheets[i]; g.tp(s.x0 + s.p + .3, s.y0 + .2); g.P.ground = false; g.tick(40); for(let k=0;k<20 && !g.P.grab;k++){ g.tp(s.x0 + s.p + .3, g.P.y); g.grab(); g.tick(3); } window.dbg = [g.P.x, g.P.y, g.busy, g.held.on, s.m.visible, s.locked]; let n = 0; while(g.P.grab && n++ < 2000){ g.keys.right = true; g.tick(1); } g.keys.right = false; return s.done; }; });
  // cat: tank sheet
  if(!process.env.NOCAT) console.log('tank peeled', await ev(()=>{ const i = G.sheets.findIndex(s=>s.id === 'T'); return peelAt(i); }));
  if(!process.env.NOCAT) for(const [n, k] of [['meo-1-nhay', 0], ['meo-2-dap', 30], ['meo-3-di', 50], ['meo-4-di', 12]]){ await ev(k=>{ G.tick(k); }, k); await snap(n); }
  // cô Hai: sheet B on the chè house
  console.log('B peeled', await ev(()=>{ const r0 = 0; const i = G.sheets.findIndex(s=>s.id === 'B'); G.tp(90, 0.1); G.tick(30); return peelAt(i); }));
  console.log('dbg', await ev(()=>window.dbg));
  await ev(()=>{ let n = 0; while(n++ < 60*8.4) G.tick(1); });
  await snap('hai-1'); await ev(()=>G.tick(9)); await snap('hai-2');
  await ev(()=>{ let n = 0; while(G.busy && n++ < 3000) G.tick(1); G.tick(30); G.tp(95.2, 3.4); G.P.ground = false; G.tick(60); });
  console.log('on awning', await ev(()=>[G.P.y, G.P.z]));
  await snap('maihien');
  console.log(errs.join('\n') || 'no errors');
  await b.close();
})();
