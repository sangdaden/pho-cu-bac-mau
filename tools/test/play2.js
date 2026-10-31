// usage: node play.js <html> <outprefix>  · plays Màn 2 through with keyboard-equivalent input and screenshots each room
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
  await p.evaluate(()=>{ G.introTick(60*6); }); await snap('0-intro');
  await p.evaluate(()=>{ G.skipIntro(); idle(30); });
  const log = async s=>console.log(JSON.stringify(await p.evaluate(s)));
  await p.evaluate(()=>{
    window.use = ()=>{ G.grab(); G.tick(3); };
    window.fold = f=>{ let n=0; while(G.held.form !== f && n++<5){ G.fold(); } G.tick(2); };
    window.ride = x=>{ let n=0; while(Math.abs(G.P.x - x) > .15 && n++<2000){ G.keys.right = G.P.x < x; G.keys.left = G.P.x > x; G.tick(1); } G.keys.left=G.keys.right=false; G.tick(4); };
    window.SH = id=>G.sheets.find(s=>s.id===id);
  });
  await p.evaluate(()=>{ play([{dur:3, cam:[G.P.x + 1.6, 1.4, 6]}]); G.tick(100); }); await snap('0-eyes'); await p.evaluate(()=>{ waitFree(); });
  // room 1: dry ditch, pipe, Bống
  await log(()=>{ walkTo(11.5); return st('r1 at ditch edge'); });
  await log(()=>{ walkTo(8.0); use(); return st('r1 locked bong'); });
  await log(()=>{ walkTo(4.2); peel(SH('P')); waitFree(); idle(120); return st('r1 pipe level='+G.channels[0].level.toFixed(2)); });
  await snap('1a');
  await log(()=>{ walkTo(7.8); peel(SH('B')); waitFree(); return st('r1 bong held='+G.held.on+' learned='+G.learned); });
  await snap('1b');
  await log(()=>{ fold('thuyen'); walkTo(11.6); use(); idle(30); return st('r2 boat on='+G.boat.on+' x='+G.boat.x.toFixed(2)); });
  await log(()=>{ ride(19.2); jump(null,40); idle(20); return st('r2 boat mid, ff1'); });
  await snap('2');
  await log(()=>{ walkTo(27.5); return st('r2 crossed'); });
  // room 3: leak
  await log(()=>{ walkTo(26.8); peel(SH('Q')); waitFree(); walkTo(29.8); use(); waitFree(); idle(150); return st('r3 pasted level='+G.channels[1].level.toFixed(2)); });
  await snap('3a');
  await log(()=>{ idle(150); walkTo(26.8); peel(SH('Q')); waitFree(); fold('thuyen'); walkTo(29.7); use(); idle(30); ride(35.5); jump(null,40); idle(20); return st('r3 relic jump'); });
  await snap('3b');
  await log(()=>{ let n=0; G.keys.right=true; while(G.P.ground && n++<200) G.tick(1); G.keys.right=false; G.keys.left=true; G.tick(9); G.keys.left=false; idle(40); return st('r3 back down onto boat? y 0 on='+(G.P.on===G.boat.plat)); });
  await log(()=>{ ride(41); walkTo(43.5); return st('r3 crossed'); });
  // room 4: lock
  await log(()=>{ walkTo(44.7); peel(SH('G')); waitFree(); idle(260); return st('r4 gate level='+G.channels[2].level.toFixed(2)); });
  await log(()=>{ walkTo(42.4); peel(SH('H')); waitFree(); fold('thuyen'); walkTo(47.2); use(); idle(30); return st('r4 boat c='+(G.boat.c===G.channels[2])+' x='+G.boat.x.toFixed(2)); });
  await log(()=>{ ride(57.3); jump('right',45); idle(20); return st('r4 quay y 2.2'); });
  await snap('4');
  await log(()=>{ walkTo(60.2); jump(null,40); idle(20); return st('r4 ff2'); });
  // room 5: hour
  await log(()=>{ walkTo(61.6); jump('right',45); walkTo(63.2); return st('r5 roof y 3.6'); });
  await log(()=>{ peel(SH('N')); waitFree(); idle(150); return st('r5 night L='+SH('N').L); });
  await snap('5');
  await log(()=>{ walkTo(67.7); jump('right',42); idle(10); jump('right',45); idle(10); jump('right',45); idle(10); jump('right',50); walkTo(80.5); return st('r5 lanterns -> lane y0'); });
  // room 6: radio and tins
  await log(()=>{ walkTo(81.6); peel(SH('R')); waitFree(); return st('r6 radio'); });
  await log(()=>{ walkTo(82.6); jump(null,40); return st('r6 ff3'); });
  await log(()=>{ walkTo(86.6); jump(null,40); idle(60); return st('r6 wrong tin first'); });
  await log(()=>{ for(const x of [88.8, 91.0, 86.6]){ walkTo(x); jump(null,40); } waitFree(); idle(60); walkTo(96.8); return st('r6 gate passed'); });
  await snap('6');
  // room 7: plane
  await log(()=>{ waitFree(); idle(30); walkTo(98.6); peel(SH('F')); waitFree(); fold('maybay'); walkTo(99.5); G.keys.right=true; G.tick(2); G.keys.right=false; use(); idle(120); waitFree(); return st('r7 learned='+G.learned+' lights hit='+G.targets[0].hit); });
  await snap('7');
  await log(()=>{ idle(200); walkTo(108.6); return st('r7 passed bars'); });
  // room 8: stacks
  await log(()=>{ walkTo(109.2); peel(SH('L')); waitFree(); idle(120); return st('r8 ladder L='+SH('L').L); });
  await log(()=>{ walkTo(112.4); jump('right',30); idle(5); jump('right',30); idle(5); jump('right',35); idle(10); return st('r8 balcony y 4'); });
  await snap('8a');
  await log(()=>{ walkTo(115.4); peel(SH('S')); waitFree(); walkTo(115.4); peel(SH('S')); waitFree(); idle(150); return st('r8 bridge L='+SH('S').L); });
  await log(()=>{ walkTo(123.6); jump(null,40); walkTo(130); return st('r8 crossed to shed y 4'); });
  await snap('8b');
  // room 9: bến
  await log(()=>{ let n=0; while(G.P.x < 145.2 && n++ < 3000){ G.keys.right = true; const near = G.buis.some(b=>b.x > G.P.x && b.x - G.P.x < 2.2 && Math.abs(b.top-G.P.y)<1); if(near && G.P.ground) G.jump(); G.tick(1);} G.keys.right=false; G.tick(30); return st('r9 at ghe'); });
  await snap('9a');
  await log(()=>{ walkTo(147.4); jump(null,40); idle(20); return st('r9 ff5 on roof'); });
  await log(()=>{ jump('left',30); walkTo(141.8); peel(SH('M')); let n=0; while(!G.winReady && n++<4000) G.tick(1); G.tick(30); return st('r9 winReady='+G.winReady+' won='+G.won); });
  await p.evaluate(()=>{ document.getElementById('win').style.display='none'; }); await snap('9');
  console.log('info', JSON.stringify(await p.evaluate(()=>G.info)));
  console.log(errs.join('\n')||'no errors');
  await b.close();
})();
