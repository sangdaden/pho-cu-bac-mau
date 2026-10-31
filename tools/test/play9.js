// usage: node play5.js <html> <outprefix> [shots] · plays Màn 9 through and screenshots each room
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
    window.walkTo = (x, max)=>{ let n=0; while(Math.abs(g.P.x - x) > .12 && n++ < (max||2000)){ g.keys.right = g.P.x < x; g.keys.left = g.P.x > x; g.tick(1); } g.keys.left = g.keys.right = false; g.tick(4); let m=0; while(!g.P.ground && m++<600) g.tick(1); return g.P.x; };
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
    window.leap = (x)=>{ G.jump(); G.tick(1); let n=0; while(n++<200){ const d = x - G.P.x; G.keys.right = d > .15; G.keys.left = d < -.15; G.tick(1); if(G.P.ground && n > 4) break; } G.keys.left = G.keys.right = false; G.tick(2); return +G.P.x.toFixed(2)+','+G.P.y.toFixed(2); };
    window.waitRao = (r)=>{ let n=0; while(r.t > .02 && n++<2000) G.tick(1); while(r.t < .02 && n++<2000) G.tick(1); };
    window.leaps = (xs)=>xs.map(x=>leap(x)).join(' ');
    window.rise = (x, ytop)=>{ let n=0; while(n++<900){ const d = x - G.P.x; G.keys.right = d > .1; G.keys.left = d < -.1; G.tick(1); if(G.P.y > ytop) break; } G.keys.left = G.keys.right = false; return +G.P.y.toFixed(2); };
    window.steer = (x, ymin)=>{ let n=0; while(n++<900){ const d = x - G.P.x; G.keys.right = d > .1; G.keys.left = d < -.1; G.tick(1); if(G.P.ground && G.P.y > ymin && n > 3) break; } G.keys.left = G.keys.right = false; G.tick(2); return +G.P.x.toFixed(2)+','+G.P.y.toFixed(2); };
    window.up = (pairs)=>pairs.map(([w, x])=>{ walkTo(w); return leap(x); }).join(' ');
    window.face = d=>{ G.keys[d] = true; G.tick(1); G.keys[d] = false; };
  });
  const log = async s=>{ try { console.log(JSON.stringify(await p.evaluate(s))); } catch(e){ console.log('EVAL ERR', e.message.slice(0,300)); } };



  await p.evaluate(()=>{ G.introTick(60*6); }); await snap('0-intro');
  await p.evaluate(()=>{ G.skipIntro(); idle(30); });
  await snap('1a');
  await log(()=>{ walkTo(-1.5); peel(SH('A')); waitFree(); fold('non'); walkTo(31.0); return st('r1 held='+G.held.form+' wet='+G.rain.wet.toFixed(2)+' f='+G.flies); });
  await snap('1b');
  await log(()=>{ walkTo(37.5); peel(SH('B')); waitFree(); walkTo(43.6); waitRao(vXoi.rao); idle(10); return st('r2 '+leaps([44.6, 46.8, 49.0, 50.6, 52.2, 55])+' f='+G.flies); });
  await snap('2a');
  await log(()=>{ walkTo(57.5); peel(SH('C')); waitFree(); fold('thuyen'); walkTo(61.6); use(); idle(20); const a = G.boat.on; const b = leap(63.2); walkTo(72.9); return st('r3 boat='+a+' '+b+' f='+G.flies+' '+leap(76.5)); });
  await snap('3a');
  await log(()=>{ walkTo(81.3); peel(SH('D')); waitFree(); fold('dieu'); walkTo(89.5); const y = rise(89.5, 9.0); return st('r4 rose='+y+' f='+G.flies+' '+steer(97, 7)); });
  await log(()=>{ walkTo(100.1); jump(null, 50); return st('r4 relic='+G.relic); });
  await snap('4a');
  await log(()=>{ walkTo(103.6); steer(105.3, -1); walkTo(105.3); peel(SH('E')); waitFree(); fold('den'); walkTo(110.0); use(); const a = H5[0].lit; const o = up([[110.6, 111.4], [112.6, 113.6]]); walkTo(114.4); use(); return st('r5 lit='+a+H5[1].lit+' '+o+' '+up([[114.8, 116.0], [117.0, 118.4], [119.2, 122.5]])); });
  await snap('5a');
  await log(()=>{ walkTo(129.5); peel(SH('F')); waitFree(); fold(null); walkTo(137.6); use(); idle(20); return st('r6 plank='+plankOn+' '+walkTo(150)); });
  await snap('6a');
  await log(()=>{ walkTo(153.5); peel(SH('G')); waitFree(); fold('quat'); let n=0; while(n++<8 && !dustGone){ walkTo(156.0 + n*.7); face('right'); use(); idle(50); } return st('r7 gone='+G.buis.filter(b=>b.gone).length); });
  await log(()=>{ fold('maybay'); walkTo(164.8); face('right'); use(); idle(150); waitFree(); idle(60); return st('r7 gate='+gateOpen+' '+walkTo(178)); });
  await snap('7a');
  await log(()=>{ walkTo(177.5); peel(SH('H')); waitFree(); fold('dieu'); walkTo(183.4); let n=0; while(n++<600 && !(gustT % 5.2 < .05)) G.tick(1); G.keys.right=true; G.tick(8); return st('r8 '+leap(198)+' f='+G.flies); });
  await snap('8a');
  await log(()=>{ walkTo(198.7); peel(SH('I')); waitFree(); fold('dieu'); walkTo(209.2); const y = rise(209.2, 6.8); return st('r9 rose='+y+' '+steer(213.0, 3.5)); });
  await log(()=>{ walkTo(213.6); peel(SH('Z')); idle(60); return st('r9 peeled done='+SH('Z').done+' won='+G.won); });
  await snap('9a');
  await log(()=>{ let n=0; while(!G.winReady && n++<4000) G.tick(1); idle(30); return st('end winReady='+G.winReady); });
  await snap('9b');
  if(errs.length) console.log('ERRORS\n'+errs.join('\n'));
})().then(()=>process.exit(0));
