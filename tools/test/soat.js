// usage: node soat.js <outdir> "<level> <x> <y>" ...  · stands Tò at each spot (dropped just above y) and screenshots, one page per level
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const THREE = fs.readFileSync(path.join(__dirname,'../../prototype/chung/three.min.js'));
(async()=>{
  const [,, out, ...spots] = process.argv;
  const b = await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const by = {}; for(const s of spots){ const [l, x, y] = s.split(' '); (by[l] = by[l] || []).push([+x, +y]); }
  for(const lv in by){
    const p = await b.newPage({viewport:{width:1280,height:800}});
    await p.route('**/three.min.js', r=>r.fulfill({body:THREE, contentType:'application/javascript'}));
    await p.route('https://fonts.googleapis.com/**', r=>r.abort());
    await p.goto('file://'+path.resolve(__dirname, '../../prototype/man-'+lv+'/index.html'));
    await p.waitForTimeout(1500);
    await p.evaluate(()=>{ const g = window.__game; window.G = g; g.pause = true; g.skipIntro(); g.tick(10); });
    for(const [x, y] of by[lv]){
      const r = await p.evaluate(([x, y])=>{ G.tp(x, y + .05); G.P.ground = false; G.P.on = null; G.tick(150); return [+G.P.x.toFixed(2), +G.P.y.toFixed(2)]; }, [x, y]);
      await p.evaluate(()=>{ G.pause=false; }); await p.waitForTimeout(150); await p.evaluate(()=>{ G.pause=true; });
      await p.screenshot({path:`${out}/m${lv}-${x}.png`, timeout:90000});
      console.log(lv, x, y, '->', r);
    }
    await p.close();
  }
  await b.close();
})();
