// usage: node play.js <html> <outprefix>  · plays Màn 1 through with keyboard-equivalent input and screenshots each room
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const THREE = fs.readFileSync(path.join(__dirname,'../../prototype/chung/three.min.js'));
(async()=>{
  const [,, file, out] = process.argv;
  const b = await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:800}});
  if(process.env.JRCHECK) await require('./jrcheck').attach(p);
  const errs=[]; p.on('pageerror', e=>errs.push(e.message)); p.on('console', m=>{ if(m.type()==='error') errs.push(m.text()); });
  await p.route('**/three.min.js', r=>r.fulfill({body:THREE, contentType:'application/javascript'}));
  await p.route('https://fonts.googleapis.com/**', r=>r.abort());
  await p.goto('file://'+path.resolve(file));
  await p.waitForTimeout(2500); if(errs.length){ console.log('LOAD ERRORS\n'+errs.join('\n')); }
  const stage = await p.$('#stage');
  const snap = async n=>{ if(process.env.NOSHOT) return; await p.evaluate(()=>{ __game.pause=false; }); await p.waitForTimeout(300); await p.evaluate(()=>{ __game.pause=true; }); await stage.screenshot({path:`${out}-${n}.png`}); };
  await p.evaluate(()=>{
    const g = window.__game; window.G = g;
    g.pause = true;
    window.idle = n=>{ g.keys.left = g.keys.right = false; g.tick(n||1); };
    window.waitFree = ()=>{ let n=0; while(g.busy && n++<3000) g.tick(1); g.tick(10); };
    window.walkTo = (x, max)=>{ let n=0; while(Math.abs(g.P.x - x) > .12 && n++ < (max||2000)){ g.keys.right = g.P.x < x; g.keys.left = g.P.x > x; g.tick(1); } g.keys.left = g.keys.right = false; g.tick(4); return g.P.x; };
    window.peel = (s, dir)=>{ g.grab(); g.tick(2); let n=0; while(g.P.grab && n++ < 3000){ g.keys[dir||'right'] = true; g.tick(1); } g.keys.left = g.keys.right = false; g.tick(2); };
    window.jump = (dir, hold)=>{ g.jump(); if(dir) g.keys[dir] = true; g.tick(hold||50); g.keys.left = g.keys.right = false; g.tick(20); };
    window.st = (l)=>({l, x:+g.P.x.toFixed(2), y:+g.P.y.toFixed(2), obj:g.objective, flies:g.flies, relic:g.relic});
  });
  await p.evaluate(()=>{ G.introTick(60*7); }); await snap('0-intro');
  await p.evaluate(()=>{ G.skipIntro(); idle(30); });
  const log = async s=>console.log(JSON.stringify(await p.evaluate(s)));
  // room 1
  await log(()=>{ walkTo(4.0); peel(G.sheets[0]); waitFree(); return st('r1 peeled A done='+G.sheets[0].done); });
  await snap('1');
  // room 2: boxes block, then pipe
  await log(()=>{ walkTo(25); return st('r2 blocked at boxes? expect x<19.2'); });
  await log(()=>{ walkTo(15.5); peel(G.sheets[1]); waitFree(); idle(120); walkTo(25); return st('r2 after water, expect x 25'); });
  await snap('2');
  // room 3: half-peel the vertical sheet, climb the ledge, then the balcony
  await log(()=>{ walkTo(27.6); G.grab(); G.tick(2); let n=0; const s=G.sheets[2]; while(s.p < 2.25 && n++<500){ G.keys.left=true; G.tick(1);} G.keys.left=false; G.grab(); G.tick(3); return st('r3 shelf p='+s.p.toFixed(2)+' top='+s.shelf.top.toFixed(2)); });
  await log(()=>{ walkTo(26.8); jump(null, 40); return st('r3 on shelf? expect y~2.3'); });
  await snap('3a');
  await log(()=>{ jump('right', 45); walkTo(30); return st('r3 balcony expect y 4.6'); });
  await snap('3b');
  // room 4: lịch bloc, wind, rail
  await log(()=>{ walkTo(34.5); peel(G.sheets[3]); waitFree(); return st('r4 bloc'); });
  await log(()=>{ walkTo(45, 400); return st('r4 wind expect x~40.3'); });
  await snap('4a');
  await log(()=>{ walkTo(40.0); peel(G.sheets[4]); waitFree(); walkTo(44.6); jump(null,40); return st('r4 rail, firefly2'); });
  await snap('4b');
  // room 5: walk past sleeping Bụi
  await log(()=>{ walkTo(65); return st('r5 walked past, expect x 65'); });
  await snap('5');
  // room 6: tank, cat, ladder
  await log(()=>{ walkTo(69.0); peel(G.sheets[5]); waitFree(); idle(240); return st('r6 tank peeled'); });
  await log(()=>{ walkTo(70); jump(null, 40); idle(30); return st('r6 firefly3'); });
  await snap('6');
  await log(()=>{ walkTo(81.5); idle(10); walkTo(85, 400); idle(60); return st('r6 bridge crossed, on street y 0'); });
  // room 7: Cô Hai, awning, cart
  await log(()=>{ walkTo(92.9); peel(G.sheets[6]); waitFree(); return st('r7 B peeled'); });
  await snap('7a');
  await log(()=>{ walkTo(95.5); jump(null, 40); return st('r7 on cart? y 1.15'); });
  await log(()=>{ jump(null, 40); return st('r7 on awning? y 3.1'); });
  await log(()=>{ jump('right', 40); walkTo(97.7); return st('r7 roof y 4'); });
  await snap('7b');
  // room 8: stack; then over-peel and restore
  await log(()=>{ peel(G.sheets[7]); waitFree(); idle(200); return st('r8 day13 L='+G.sheets[7].L); });
  await snap('8a');
  await log(()=>{ walkTo(97.7); peel(G.sheets[7]); waitFree(); idle(200); return st('r8 overpeel L='+G.sheets[7].L); });
  await snap('8b');
  await log(()=>{ G.back(); idle(200); return st('r8 restored L='+G.sheets[7].L); });
  await log(()=>{ walkTo(110.5); jump(null,40); walkTo(118); return st('r8 crossed pole, ff4'); });
  // room 9: jump the patrol, reach the goal
  await log(()=>{ let n=0; while(G.P.x < 129 && n++ < 3000){ G.keys.right = true; const near = G.buis.some(b=>b.x > G.P.x && b.x - G.P.x < 2.2 && b.top===4); if(near && G.P.ground) G.jump(); G.tick(1);} G.keys.right=false; G.tick(30); return st('r9 won='+G.won); });
  await snap('9a');
  await log(()=>{ let n=0; while(!G.winReady && n++<3000) G.tick(1); G.tick(30); return st('winReady='+G.winReady); });
  await snap('9b');
  console.log('info', JSON.stringify(await p.evaluate(()=>G.info)));
  console.log(errs.join('\n')||'no errors');
  await b.close();
})();
