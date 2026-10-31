// usage: node play5.js <html> <outprefix> [shots] · plays Màn 5 through and screenshots each room
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const THREE = fs.readFileSync(path.join(__dirname,'../../prototype/chung/three.min.js'));
(async()=>{
  const [,, file, out, shots] = process.argv;
  const b = await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  if(process.env.JRCHECK) await require('./jrcheck').attach(p);
  const errs=[]; p.on('pageerror', e=>errs.push(e.message)); p.on('console', m=>{ if(m.type()==='error' && !/ERR_FAILED/.test(m.text())) errs.push(m.text()); });
  await p.route('**/three.min.js', r=>r.fulfill({body:THREE, contentType:'application/javascript'}));
  await p.route('https://fonts.googleapis.com/**', r=>r.abort());
  await p.goto('file://'+path.resolve(file));
  await p.waitForTimeout(2500); if(errs.length){ console.log('LOAD ERRORS\n'+errs.join('\n')); }
  const stage = await p.$('#stage');
  const snap = async n=>{ if(process.env.NOSHOT) return; if(shots === '0') return; await p.evaluate(()=>{ __game.pause=false; }); await p.waitForTimeout(350); await p.evaluate(()=>{ __game.pause=true; }); await stage.screenshot({path:`${out}-${n}.png`}); };
  await p.evaluate(()=>{
    const g = window.__game; window.G = g;
    g.pause = true;
    window.idle = n=>{ g.keys.left = g.keys.right = false; g.tick(n||1); };
    window.waitFree = ()=>{ let n=0; while(g.busy && n++<4000) g.tick(1); g.tick(10); };
    window.walkTo = (x, max)=>{ let n=0; while(Math.abs(g.P.x - x) > .12 && n++ < (max||2000)){ g.keys.right = g.P.x < x; g.keys.left = g.P.x > x; g.tick(1); } g.keys.left = g.keys.right = false; g.tick(4); let m=0; while(!g.P.ground && m++<120) g.tick(1); return g.P.x; };
    window.peel = (s)=>{ g.grab(); g.tick(2); let n=0; while(g.P.grab && n++ < 3000){ g.keys.right = true; g.tick(1); } g.keys.left = g.keys.right = false; g.tick(2); };
    window.jump = (dir, hold)=>{ g.jump(); if(dir) g.keys[dir] = true; g.tick(hold||50); g.keys.left = g.keys.right = false; g.tick(20); };
    window.st = (l)=>({l, x:+g.P.x.toFixed(2), y:+g.P.y.toFixed(2), obj:g.objective, flies:g.flies, relic:g.relic});
    window.use = ()=>{ G.grab(); G.tick(3); };
    window.fold = f=>{ let n=0; while(G.held.form !== f && n++<6){ G.fold(); } G.tick(2); };
    window.SH = id=>G.sheets.find(s=>s.id===id);
    window.R = ()=>{ G.back ? G.back() : null; };
    window.lv = ()=>G.channels.map(c=>c.level.toFixed(1)).join(' ');
    window.settle = ()=>idle(200);
    // ride the boat to x: step on, then walk
    window.hop = (x)=>{ jump(x > G.P.x ? 'right' : 'left', 18); return walkTo(x); };
  });
  const log = async s=>{ try { console.log(JSON.stringify(await p.evaluate(s))); } catch(e){ console.log('EVAL ERR', e.message.slice(0,300)); } };
  await p.evaluate(()=>{ G.introTick(60*6); }); await snap('0-intro');
  await p.evaluate(()=>{ G.skipIntro(); idle(30); });
  await snap('1a');
  // room 1: high water, peel to the low day, cross the stones
  await log(()=>{ walkTo(1.4); peel(SH('A')); waitFree(); settle(); return st('r1 low lv='+lv()); });
  await snap('1b');
  await log(()=>{ walkTo(3.9); jump('right',22); walkTo(5.4); jump('right',26); walkTo(8.0); const f=G.flies; jump('right',26); walkTo(10.6); jump('right',26); walkTo(13.2); jump('right',30); walkTo(15.4); return st('r1 crossed fliesBefore='+f); });
  // room 2: peel to the high day first, then fold the boat and ride
  await log(()=>{ walkTo(18.0); peel(SH('B')); waitFree(); settle(); return st('r2 high lv='+lv()); });
  await log(()=>{ walkTo(15.9); peel(SH('K')); fold('thuyen'); walkTo(19.6); use(); idle(30); return st('r2 boat on='+G.boat.on+' bx='+G.boat.x.toFixed(1)); });
  await snap('2a');
  await log(()=>{ walkTo(21.0); walkTo(36.6); return st('r2 crossed'); });
  // room 3: boat sheet, onto the quay, peel the day, launch, ride under the porch, jump up
  await log(()=>{ walkTo(36.4); peel(SH('L')); fold('thuyen'); walkTo(37.3); jump('right',20); walkTo(38.7); return st('r3 on quay held='+G.held.form); });
  await log(()=>{ peel(SH('C')); waitFree(); settle(); return st('r3 after peel held='+G.held.on+' lv='+lv()); });
  await log(()=>{ if(!G.held.on){ walkTo(38.3); jump('left',20); walkTo(36.4); idle(150); peel(SH('L')); fold('thuyen'); walkTo(37.3); jump('right',20); } walkTo(39.6); use(); idle(30); return st('r3 boat='+G.boat.on+' by='+G.boat.y.toFixed(2)); });
  await log(()=>{ jump('right',16); walkTo(48.6); const f=G.flies; idle(10); return st('r3 under porch flies '+f+'->'+G.flies); });
  await snap('3a');
  await log(()=>{ jump(null,60); idle(20); return st('r3 porch'); });
  await snap('3b');
  // room 4: down to the landing, onto the grounded đò, peel the mui page, back up, peel the day
  await log(()=>{ walkTo(57.5); walkTo(63.0); return st('r4 landing'); });
  await log(()=>{ walkTo(65.5); walkTo(68.0); idle(10); const f=G.flies; return st('r4 on do flies='+f+' y='+G.P.y.toFixed(2)); });
  await log(()=>{ walkTo(68.05); peel(SH('O')); waitFree(); return st('r4 chin awake'); });
  await snap('4a');
  await log(()=>{ walkTo(67.0); jump('left',30); walkTo(63.0); peel(SH('D')); waitFree(); settle(); return st('r4 high lv='+lv()); });
  await log(()=>{ walkTo(65.5); jump('right',14); walkTo(68.0); idle(30); waitFree(); idle(30); return st('r4 ferried'); });
  await snap('4b');
  await log(()=>{ walkTo(78.8); jump(null,40); idle(10); walkTo(79.6); jump('right',40); idle(20); return st('r4 relic?'); });
  // room 5: stones, sandbar, peel, mats, sandbar, peel, stones
  await log(()=>{ walkTo(82.6); jump(null, 70); walkTo(85.9); jump('right',24); walkTo(87.8); jump('right',26); walkTo(90.4); jump('right',30); walkTo(92.7); return st('r5 sandbar1'); });
  await log(()=>{ walkTo(92.9); peel(SH('E')); waitFree(); settle(); return st('r5 high lv='+lv()); });
  await snap('5a');
  await log(()=>{ walkTo(94.5); jump('right',22); walkTo(96.4); jump('right',24); walkTo(98.9); jump('right',24); walkTo(101.2); return st('r5 sandbar2'); });
  await log(()=>{ walkTo(101.2); peel(SH('F')); waitFree(); settle(); return st('r5 low lv='+lv()); });
  await log(()=>{ walkTo(102.6); jump('right',22); walkTo(104.0); jump('right',26); walkTo(106.3); jump('right',30); walkTo(108.6); return st('r5 crossed'); });
  // room 6: the bridge in the rain (should go soggy), then the kè at low water
  await log(()=>{ walkTo(108.6); jump('right',14); walkTo(109.8); return st('stair1'); });
  await log(()=>{ const tr=[]; G.jump(); G.keys.right=true; for(let i=0;i<60;i++){ G.tick(1); if(i==13) G.keys.right=false; if(i%6==0) tr.push(G.P.x.toFixed(1)+','+G.P.y.toFixed(1)); } walkTo(111.2); tr.push('|'+G.P.x.toFixed(1)+','+G.P.y.toFixed(1)); jump('right',14); tr.push('|'+G.P.x.toFixed(1)+','+G.P.y.toFixed(1)); walkTo(112.5); const y=tr.join(' ')+' '+G.P.y; walkTo(124.0); const f=G.flies; walkTo(133.0); idle(10); return st('r6 bridge y='+y+'  wet='+G.rain.wet.toFixed(2)+' fliesBefore='+f); });
  await snap('6a');
  await log(()=>{ walkTo(113.0); peel(SH('G')); waitFree(); settle(); return st('r6 low lv='+lv()+' wet='+G.rain.wet.toFixed(2)); });
  await log(()=>{ walkTo(120.0); idle(10); const w=G.rain.wet; walkTo(130.2); jump('right',30); walkTo(132.0); return st('r6 kè wetUnder='+w.toFixed(2)+' wet='+G.rain.wet.toFixed(2)); });
  await snap('6b');
  // room 7: plane at the wheel
  await log(()=>{ walkTo(136.9); peel(SH('M')); fold('maybay'); walkTo(139.0); G.keys.right=true; G.tick(1); G.keys.right=false; use(); idle(200); waitFree(); settle(); return st('r7 wheel hit='+G.targets[0].hit+' lv='+lv()); });
  await snap('7a');
  await log(()=>{ walkTo(145.0); walkTo(153.2); jump('right',30); walkTo(155.5); return st('r7 crossed'); });
  // room 8: fan Lũ Bụi
  await log(()=>{ walkTo(157.2); peel(SH('Q')); fold('quat'); walkTo(160.0); G.keys.right=true; G.tick(1); G.keys.right=false; use(); idle(40); walkTo(162.5); G.keys.right=true; G.tick(1); G.keys.right=false; use(); idle(40); for(let k=0;k<4 && !G.buis.filter(b=>b.fan!==undefined||true).every(b=>b.gone);k++){ walkTo(163.5 + k*.8); G.keys.right=true; G.tick(1); G.keys.right=false; use(); idle(40); } return st('r8 gone='+G.buis.filter(b=>b.gone).length); });
  await snap('8a');
  await log(()=>{ walkTo(166.0); jump(null,40); walkTo(170.5); return st('r8 crossed'); });
  // room 9: boat sheet, peel to Rằm, ride to the gauge, peel the last page
  await log(()=>{ walkTo(173.8); peel(SH('H')); waitFree(); idle(30); walkTo(173.8); peel(SH('H')); waitFree(); settle(); return st('r9 day L='+SH('H').L+' lv='+lv()); });
  await log(()=>{ walkTo(170.8); peel(SH('N')); fold('thuyen'); walkTo(175.6); use(); idle(30); jump('right',16); walkTo(186.85); idle(10); return st('r9 at gauge on boat='+(G.P.y > 0)); });
  await snap('9a');
  await log(()=>{ peel(SH('S')); idle(60); return st('r9 peeled done='+SH('S').done+' won='+G.won); });
  await snap('9b');
  await log(()=>{ let n=0; while(!G.winReady && n++<3000) G.tick(1); idle(30); return st('end winReady='+G.winReady); });
  await snap('9c');
  if(errs.length) console.log('ERRORS\n'+errs.join('\n'));
  return;
})().then(()=>process.exit(0));
