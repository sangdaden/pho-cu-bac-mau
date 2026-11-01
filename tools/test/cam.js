// usage: node cam.js <level> <outdir> <x> [forms...]  · Tò holding each paper form (facing right, then left), screenshots cropped around him
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const THREE = fs.readFileSync(path.join(__dirname,'../../prototype/chung/three.min.js'));
(async()=>{
  const [,, lv, out, x, ...forms] = process.argv;
  const b = await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:800}});
  await p.route('**/three.min.js', r=>r.fulfill({body:THREE, contentType:'application/javascript'}));
  await p.route('https://fonts.googleapis.com/**', r=>r.abort());
  await p.goto('file://'+path.resolve(__dirname, '../../prototype/man-'+lv+'/index.html'));
  await p.waitForTimeout(2000);
  await p.evaluate(x=>{ const g = window.__game; window.G = g; g.pause = true; g.skipIntro(); g.tick(10); g.tp(+x, 2); g.P.ground = false; g.tick(120);
    for(const f of ['thuyen','maybay','quat','non','dieu','den']) if(!g.learned.includes(f)) g.learned.push(f); g.held.on = true; g.held.form = null; }, x);
  for(const f of forms){
    for(const dir of ['right', 'left']){
      const box = await p.evaluate(([f, dir])=>{ const g = G; let n = 0; while(g.held.form !== (f === 'paper' ? null : f) && n++ < 10){ g.fold(); g.tick(1); }
        g.keys[dir] = true; g.tick(2); g.keys[dir] = false; g.tick(40);
        // Tò's head on screen, to crop around him
        return {f:g.held.form}; }, [f, dir]);
      await p.evaluate(()=>{ G.pause=false; }); await p.waitForTimeout(150); await p.evaluate(()=>{ G.pause=true; });
      await p.screenshot({path:`${out}/cam-${f}-${dir}.png`, timeout:90000});
      console.log(f, dir, JSON.stringify(box));
    }
  }
  await b.close();
})();
