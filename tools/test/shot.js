// usage: node shot.js <level> <out.png> <x> <y> [ticks] [js]  · drops Tò at x,y, lets the camera settle, screenshots
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const THREE = fs.readFileSync(path.join(__dirname,'../../prototype/chung/three.min.js'));
(async()=>{
  const [,, lv, out, x, y, ticks, js] = process.argv;
  const b = await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:800}});
  await p.route('**/three.min.js', r=>r.fulfill({body:THREE, contentType:'application/javascript'}));
  await p.route('https://fonts.googleapis.com/**', r=>r.abort());
  await p.goto('file://'+path.resolve(__dirname, '../../prototype/man-'+lv+'/index.html'));
  await p.waitForTimeout(2000);
  const r = await p.evaluate(([x, y, ticks, js])=>{ const g = window.__game; window.G = g; g.pause = true; g.skipIntro(); g.tick(10);
    g.tp(+x, +y); g.P.ground = false; g.P.on = null; g.tick(+(ticks||90)); const v = js ? eval(js) : ''; return {x:g.P.x, y:g.P.y, v}; }, [x, y, ticks, js]);
  console.log(JSON.stringify(r));
  await p.evaluate(()=>{ G.pause=false; }); await p.waitForTimeout(400); await p.evaluate(()=>{ G.pause=true; });
  await p.screenshot({path:out, timeout:90000});
  await b.close();
})();
