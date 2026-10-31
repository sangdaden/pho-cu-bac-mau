// usage: node play3.js <html> <outprefix> · plays Màn 3 through and screenshots each room
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const THREE = fs.readFileSync(path.join(__dirname,'../../prototype/chung/three.min.js'));
(async()=>{
  const [,, file, out, upto] = process.argv;
  const b = await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  if(process.env.JRCHECK) await require('./jrcheck').attach(p);
  const errs=[]; p.on('pageerror', e=>errs.push(e.message)); p.on('console', m=>{ if(m.type()==='error' && !/ERR_FAILED/.test(m.text())) errs.push(m.text()); });
  await p.route('**/three.min.js', r=>r.fulfill({body:THREE, contentType:'application/javascript'}));
  await p.route('https://fonts.googleapis.com/**', r=>r.abort());
  await p.goto('file://'+path.resolve(file));
  await p.waitForTimeout(2500); if(errs.length){ console.log('LOAD ERRORS\n'+errs.join('\n')); }
  const stage = await p.$('#stage');
  const snap = async n=>{ if(process.env.NOSHOT) return; await p.evaluate(()=>{ __game.pause=false; }); await p.waitForTimeout(350); await p.evaluate(()=>{ __game.pause=true; }); await stage.screenshot({path:`${out}-${n}.png`}); };
  await p.evaluate(()=>{
    const g = window.__game; window.G = g;
    g.pause = true;
    window.idle = n=>{ g.keys.left = g.keys.right = false; g.tick(n||1); };
    window.waitFree = ()=>{ let n=0; while(g.busy && n++<4000) g.tick(1); g.tick(10); };
    window.walkTo = (x, max)=>{ let n=0; while(Math.abs(g.P.x - x) > .12 && n++ < (max||2000)){ g.keys.right = g.P.x < x; g.keys.left = g.P.x > x; g.tick(1); } g.keys.left = g.keys.right = false; g.tick(4); let m=0; while(!g.P.ground && m++<120) g.tick(1); return g.P.x; };
    window.peel = (s, dir)=>{ g.grab(); g.tick(2); let n=0; while(g.P.grab && n++ < 3000){ g.keys[dir||'right'] = true; g.tick(1); } g.keys.left = g.keys.right = false; g.tick(2); };
    window.jump = (dir, hold)=>{ g.jump(); if(dir) g.keys[dir] = true; g.tick(hold||50); g.keys.left = g.keys.right = false; g.tick(20); };
    window.st = (l)=>({l, x:+g.P.x.toFixed(2), y:+g.P.y.toFixed(2), obj:g.objective, flies:g.flies, relic:g.relic});
    window.use = ()=>{ G.grab(); G.tick(3); };
    window.fold = f=>{ let n=0; while(G.held.form !== f && n++<6){ G.fold(); } G.tick(2); };
    window.SH = id=>G.sheets.find(s=>s.id===id);
  });
  const log = async s=>{ try { console.log(JSON.stringify(await p.evaluate(s))); } catch(e){ console.log('EVAL ERR', e.message.slice(0,300)); } };
  await p.evaluate(()=>{ G.introTick(60*6); }); await snap('0-intro');
  await p.evaluate(()=>{ G.skipIntro(); idle(30); });
  await snap('1a');
  await log(()=>{ walkTo(4.0); jump('right',30); walkTo(6.0); jump(null,40); walkTo(8.5); return st('r1 ff1'); });
  await log(()=>{ walkTo(10.3); peel(SH('C')); waitFree(); idle(80); return st('r1 gate'); });
  await snap('1b');
  await log(()=>{ walkTo(15.3); peel(SH('K')); waitFree(); return st('r2 lantern'); });
  await snap('2a');
  await log(()=>{ walkTo(16.4); let n=0; while(n++<12){ const ph = G.LV ? 0 : 0; use(); idle(20); if(window.__ph0) break; } return st('r2 toggled'); });
  await log(()=>{ // stop the lantern at the ascending phase
    const lv = window.__game; let n=0; use(); idle(5);
    // spin and stop until steps ascend: check plats heights via jump test isn't simple; read objective
    while(!/Leo lên bóng/.test(G.objective) && n++<10){ use(); idle(30 + n*7); use(); idle(10); }
    return st('r2 stopped'); });
  await snap('2b');
  await log(()=>{ walkTo(19.4); jump('right',22); idle(10); walkTo(20.6); jump('right',24); idle(10); walkTo(23.0); jump('right',26); idle(10); walkTo(25.4); jump('right',30); idle(20); walkTo(28.4); return st('r2 wall top'); });
  await snap('2c');
  await log(()=>{ walkTo(31.4); return st('r3 down'); });
  await log(()=>{ walkTo(31.4); peel(SH('Q')); waitFree(); return st('r3 fan learned='+G.learned+' held='+G.held.on); });
  await snap('3a');
  await log(()=>{ fold('quat'); walkTo(35.0); G.keys.right=true; G.tick(1); G.keys.right=false; use(); idle(40); walkTo(37.0); G.keys.right=true; G.tick(1); G.keys.right=false; use(); idle(40); walkTo(39.0); use(); idle(40); walkTo(40.5); use(); idle(60); waitFree(); return st('r3 buis gone='+G.buis.filter(b=>b.gone).length); });
  await log(()=>{ walkTo(35.4); jump(null,40); idle(10); jump(null,40); return st('r3 ff2'); });
  await snap('3b');
  // room 4
  await log(()=>{ walkTo(46.5); waitFree(); walkTo(50.6); peel(SH('L')); waitFree(); return st('r4 bloc'); });
  await log(()=>{ walkTo(53.5); peel(SH('D1')); walkTo(55.1); peel(SH('D2')); idle(140); return st('r4 wrong order D1 L='+SH('D1').L); });
  await log(()=>{ walkTo(53.5); peel(SH('D1')); walkTo(56.7); peel(SH('D3')); walkTo(55.1); peel(SH('D2')); waitFree(); idle(80); return st('r4 fan on'); });
  await snap('4');
  if(upto==='4'){ await b.close(); return; }
  // room 5
  await log(()=>{ walkTo(62.5); waitFree(); walkTo(66.9); peel(SH('G')); waitFree(); walkTo(66.9); peel(SH('G')); waitFree(); idle(60); return st('r5 gear L='+SH('G').L); });
  await snap('5a');
  await log(()=>{ walkTo(73.3); idle(30); let n=0; while(G.P.y < 3.4 && n++<300) G.tick(1); G.keys.left = true; G.jump(); G.tick(30); G.keys.left=false; idle(30); return st('r5 shelf relic'); });
  await snap('5b');
  await log(()=>{ walkTo(70.0); G.keys.right=true; G.tick(10); G.keys.right=false; idle(60); walkTo(73.2); idle(200); walkTo(74.9); jump('right',20); walkTo(76.1); jump(null,40); walkTo(77.3); return st('r5 up, ff3'); });
  // room 6
  await log(()=>{ waitFree(); walkTo(77.9); peel(SH('O0')); waitFree(); walkTo(77.9); peel(SH('O0')); waitFree(); idle(80); walkTo(82.8); return st('r6 door1'); });
  await log(()=>{ walkTo(83.3); peel(SH('O1')); waitFree(); idle(80); walkTo(88.0); return st('r6 door2'); });
  await snap('6');
  await log(()=>{ walkTo(88.7); peel(SH('O2')); waitFree(); walkTo(89.0); peel(SH('O2')); waitFree(); idle(80); walkTo(95.5); return st('r6 door3'); });
  // room 7
  await log(()=>{ waitFree(); walkTo(98.9); G.grab(); G.tick(2); let n=0; while(SH('V').p < 1.6 && n++<400){ G.keys.left=true; G.tick(1);} G.keys.left=false; G.grab(); G.tick(4); return st('r7 half peel p='+SH('V').p.toFixed(2)); });
  await snap('7a');
  await log(()=>{ walkTo(98.2); jump(null,40); idle(10); jump('right',36); idle(20); return st('r7 shelf->corridor'); });
  await log(()=>{ walkTo(100.1); peel(SH('W')); waitFree(); walkTo(101.3); use(); waitFree(); idle(30); return st('r7 wind pasted='+G.slots[0].filled); });
  await log(()=>{ walkTo(105.2); jump(null,40); return st('r7 ff4'); });
  await snap('7b');
  await log(()=>{ walkTo(105.0); peel(SH('X')); waitFree(); fold('maybay'); walkTo(107.3); G.keys.right=true; G.tick(1); G.keys.right=false; use(); idle(120); waitFree(); return st('r7 pulley hit='+G.targets[0].hit); });
  await log(()=>{ idle(120); walkTo(109.2); idle(150); return st('r7 basket up'); });
  await snap('7c');
  await log(()=>{ walkTo(111.0); walkTo(110.6); peel(SH('T')); waitFree(); idle(60); walkTo(111.6); jump('right',30); idle(10); jump('right',35); idle(20); return st('r7 stairs -> top'); });
  // room 8
  await log(()=>{ waitFree(); walkTo(116.1); use(); waitFree(); use(); waitFree(); return st('r8 face soft='+!SH('F').locked); });
  await snap('8a');
  await log(()=>{ walkTo(116.1); peel(SH('F')); waitFree(); return st('r8 face peeled'); });
  await snap('8b');
  await log(()=>{ walkTo(126.4); peel(SH('R')); return st('r9 wound busy='+G.busy); });
  const shots = [['9a',220],['9b',200],['9c',300],['e1',360],['e2',460],['e3',420],['e4',520]];
  for(const [n, k] of shots){ await p.evaluate(k=>{ G.tick(k); }, k); await snap(n); }
  await log(()=>{ waitFree(); idle(60); return st('end won='+G.won+' ready='+G.winReady); });
  await p.evaluate(()=>{ __game.pause=false; }); await p.waitForTimeout(1500);
  await stage.screenshot({path:`${out}-win.png`});
  if(errs.length) console.log('ERRORS\n'+errs.join('\n'));
  console.log('info', JSON.stringify(await p.evaluate(()=>G.info)));
  await b.close();
})();
