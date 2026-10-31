// usage: node resume.js [level...] · plays each level a while with seeded random input, leaves, then opens it again with "Chơi tiếp"
// and checks the replay puts Tò back on the exact spot (the run journal in chung/pho.js)
const { chromium } = require('playwright');
const path = require('path');
const levels = process.argv.slice(2).map(Number).filter(Boolean);
(async()=>{
  const b = await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  let bad = 0;
  for(const n of (levels.length ? levels : [1,2,3,4,5,6,7,8,9])){
    const ctx = await b.newContext({viewport:{width:1280, height:720}});
    const errs = [];
    const page = async ()=>{ const p = await ctx.newPage(); p.on('pageerror', e=>errs.push(e.message)); await p.route('https://fonts.googleapis.com/**', r=>r.abort()); return p; };
    const url = 'file://' + path.resolve(__dirname, '../../prototype/man-' + n + '/index.html');
    const p1 = await page(); await p1.goto(url); await p1.waitForTimeout(1500);
    const a = await p1.evaluate(()=>{
      const G = window.__game; G.pause = true; G.skipIntro();
      let r = 12345; const rnd = ()=>(r = (r*1103515245 + 12345) & 0x7fffffff)/0x7fffffff;
      for(let i=0;i<2400;i++){
        if(i % 40 === 0){ const d = rnd(); G.keys.right = d < .7; G.keys.left = d > .85; }
        if(rnd() < .03) G.jump();
        if(rnd() < .01) G.grab();
        if(rnd() < .002) G.fold();
        if(rnd() < .001) G.back();
        G.tick(1);
      }
      G.keys.left = G.keys.right = false; G.tick(30);
      G.jr.dirty = true; G.jrSave();
      return {x:G.P.x, y:G.P.y, n:G.jr.n, ev:G.jr.ev.length/2};
    });
    await p1.close();
    const p2 = await page(); await p2.goto(url + '#tiep');
    await p2.waitForFunction(()=>window.__game && window.__game.jrResult, null, {timeout:120000}).catch(()=>{});
    const c = await p2.evaluate(()=>window.__game.jrResult ? Object.assign({n:__game.jr.n}, __game.jrResult) : {x:NaN, y:NaN, n:-1});
    const ok = !!c.ok && Math.abs(a.x - c.x) < .05 && Math.abs(a.y - c.y) < .05 && !errs.length;
    if(!ok) bad++;
    console.log(`Màn ${n}: ${ok ? 'OK' : 'LỆCH'} · ${a.n} bước, ${a.ev} sự kiện · lúc rời (${a.x.toFixed(2)}, ${a.y.toFixed(2)}) · mở lại (${c.x.toFixed(2)}, ${c.y.toFixed(2)})${errs.length ? ' · lỗi: ' + errs.join(' | ') : ''}`);
    await ctx.close();
  }
  await b.close();
  process.exit(bad ? 1 : 0);
})();
