// usage: node play5.js <html> <outprefix> [shots] · plays Màn 8 through and screenshots each room
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
  await log(()=>{ walkTo(3.5); peel(SH('T')); waitFree(); fold('den'); walkTo(10); use(); idle(10); return st('r1 lit='+H1.lit+' '+up([[7.8, 8.6], [9.4, 11.0], [11.8, 13.2], [13.9, 16.5]])+' f='+G.flies); });
  await snap('1b');
  await log(()=>{ walkTo(23.0); use(); const a = H2[0].lit; walkTo(23.6); let o = leap(26.0); walkTo(26.8); use(); o += ' ' + leap(29.6); walkTo(30.55); use(); jump(null, 50); return st('r2 lit='+a+H2[1].lit+H2[2].lit+' '+o+' relic='+G.relic+' '+up([[30.5, 33.2], [34.0, 38]])+' f='+G.flies); });
  await snap('2a');
  await log(()=>{ walkTo(44.1); peel(SH('O')); waitFree(); fold('den'); walkTo(55.4); use(); const a = H3.lit; fold('dieu'); walkTo(51.0); const y = rise(51.5, 7.6); return st('r3 lit='+a+' rose='+y+' f='+G.flies+' '+steer(55.6, 6)+' '+up([[56.4, 60.5]])); });
  await snap('3a');
  await log(()=>{ walkTo(67.0); fold('quat'); let n=0; while(n++<6 && !dustGone){ walkTo(71.5 + n*.6); face('right'); use(); idle(50); } return st('r4 gone='+G.buis.filter(b=>b.gone).length); });
  await log(()=>{ fold('den'); walkTo(79.6); use(); return st('r4 lit='+H4.lit+' '+up([[77.6, 78.4], [79.2, 80.4], [81.2, 82.4], [83.2, 86.5]])); });
  await snap('4a');
  await log(()=>{ walkTo(91.3); peel(SH('P')); waitFree(); fold('den'); walkTo(95.6); use(); const a = H5.lit; idle(560); fold('thuyen'); use(); idle(20); const b = G.boat.on; const c = leap(97.4); walkTo(106.6); return st('r5 lit='+a+' boat='+b+' '+c+' f='+G.flies+' '+up([[106.6, 106.6], [107.2, 110.5]])); });
  await snap('5a');
  await log(()=>{ walkTo(115.3); peel(SH('L')); waitFree(); const L1 = SH('L').L; walkTo(115.4); peel(SH('L')); waitFree(); const L2 = SH('L').L; walkTo(115.8); R(); idle(10); return st('r6 L='+L1+','+L2+','+SH('L').L+' moon='+moonOn+' '+up([[120.2, 121], [121.8, 123.6], [124.4, 126.2], [127, 128.8], [129.6, 133.5]])); });
  await snap('6a');
  await log(()=>{ walkTo(139.5); peel(SH('A')); fold('maybay'); walkTo(141.8); face('right'); use(); idle(150); waitFree(); const a = h7; idle(120); walkTo(139.5); peel(SH('A')); fold('den'); walkTo(147.6); use(); idle(150); return st('r7 down='+a.toFixed(2)+' lit='+H7.lit+' '+up([[149.8, 150.6], [151.4, 152.8], [153.6, 155.0], [155.8, 159.5]])); });
  await snap('7a');
  await log(()=>{ walkTo(162.6); walkTo(163.4); idle(10); const rev = !SH('K').hid; peel(SH('K')); waitFree(); return st('r8 revealed='+rev+' parade='+parade.on); });
  await log(()=>{ const S = msteps.filter(q=>q.x > 167 && q.x < 180); let i = 0, n = 0, tr = [];
    while(i < S.length && n++ < 40){ let m=0; while(!S[i].solid && m++ < 900) G.tick(1); if(i > 0) walkTo(S[i-1].x + .5); let w=0; while(!S[i].solid && w++ < 900) G.tick(1); leap(S[i].x); tr.push(i+':'+G.P.y.toFixed(1));
      const on = S.findIndex(q=>Math.abs(G.P.y - q.y) < .15 && Math.abs(G.P.x - q.x) < q.w/2 + .5); i = on >= 0 ? on + 1 : 0; }
    walkTo(S[4].x + .6); const top = leap(184); return st('r8 climb '+tr.join(' ')+' top='+top+' f='+G.flies); });
  await snap('8a');
  await log(()=>{ walkTo(191.6); peel(SH('U')); waitFree(); fold('den'); walkTo(196.6); use(); const a = H9[0].lit; const o = up([[197.0, 197.8], [198.6, 199.8]]); walkTo(200.6); use(); return st('r9 lit='+a+H9[1].lit+' '+o+' '+up([[200.6, 201.8], [202.6, 203.6], [204.4, 206.6]])); });
  await log(()=>{ walkTo(206.0); peel(SH('F')); idle(60); return st('r9 peeled done='+SH('F').done+' won='+G.won); });
  await snap('9a');
  await log(()=>{ let n=0; while(!G.winReady && n++<3000) G.tick(1); idle(30); return st('end winReady='+G.winReady); });
  await snap('9b');
  if(errs.length) console.log('ERRORS\n'+errs.join('\n'));
})().then(()=>process.exit(0));
