// usage: node tran.js <level...>  · lists floors with another floor less than Tò's height above them (head may poke through the upper slab)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const THREE = fs.readFileSync(path.join(__dirname,'../../prototype/chung/three.min.js'));
(async()=>{
  const b = await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  for(const lv of process.argv.slice(2)){
    const p = await b.newPage({viewport:{width:640,height:400}});
    await p.route('**/three.min.js', r=>r.fulfill({body:THREE, contentType:'application/javascript'}));
    await p.route('https://fonts.googleapis.com/**', r=>r.abort());
    await p.goto('file://'+path.resolve(__dirname, '../../prototype/man-'+lv+'/index.html'));
    await p.waitForTimeout(1500);
    const out = await p.evaluate(()=>{ const g = __game, S = g.solids, H = 2.45, r = [];   // Tò drawn is 2.43 tall with his comb
      const shelves = new Set(g.sheets.filter(s=>s.shelf).map(s=>s.shelf));
      for(const a of S) for(const c of S){ if(a === c || shelves.has(c) || g.blocks.some(k=>k.topP === c && k.y0 <= a.top + .1)) continue; const d = c.top - a.top, ov = Math.min(a.x1, c.x1) - Math.max(a.x0, c.x0);
        if(d > .3 && d < H && ov > .9) r.push(`low ${a.x0.toFixed(1)}..${a.x1.toFixed(1)}@${a.top.toFixed(2)}${a.z!=null?' z'+a.z:''}  up ${c.x0.toFixed(1)}..${c.x1.toFixed(1)}@${c.top.toFixed(2)}  gap ${d.toFixed(2)}`); }
      return r; });
    console.log('Màn '+lv+': '+out.length); for(const l of out) console.log('  '+l);
    await p.close();
  }
  await b.close();
})();
