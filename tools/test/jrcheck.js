// JRCHECK=1 node playN.js … · while the bot plays, keep the newest run journal the game saves; when the bot is done,
// open the level again with "Chơi tiếp" from that journal and check the replay puts Tò back on the same spot with the same rooms solved
let last = null, url = null, page = null, done = false;
async function verify(){
  if(done) return; done = true;
  if(!last){ console.log('JRCHECK không có nhật ký nào được lưu'); process.exitCode = 1; return; }
  const j = JSON.parse(last);
  await page.close().catch(()=>{});  // the bot's page keeps rendering otherwise and slows the replay right down
  const ctx = await page.context().browser().newContext({viewport:{width:1280, height:720}}); const p2 = await ctx.newPage();
  const errs = []; p2.on('pageerror', e=>errs.push(e.message));
  await p2.route('https://fonts.googleapis.com/**', r=>r.abort());
  await p2.addInitScript(s=>{ try { localStorage.setItem('phocu.jr.' + JSON.parse(s).man, s); } catch(e){} }, last);
  const t0 = Date.now(); await p2.goto(url.split('#')[0] + '#tiep', {waitUntil:'commit'});
  await p2.waitForFunction(()=>window.__game && window.__game.jrResult, null, {timeout:180000}).catch(()=>{});
  const r = await p2.evaluate(()=>window.__game && window.__game.jrResult); const secs = ((Date.now() - t0)/1000).toFixed(1);
  const ok = r && r.ok && !errs.length;
  console.log(`JRCHECK ${ok ? 'ok' : 'LỆCH'} · ${j.n} bước chạy lại trong ${r && r.ms !== undefined ? (r.ms/1000).toFixed(1) : secs} s · lưu (${j.x}, ${j.y}) · mở lại ${r ? '(' + r.x.toFixed(3) + ', ' + r.y.toFixed(3) + ')' : 'không xong'}${errs.length ? ' · lỗi ' + errs.join(' | ') : ''}`);
  if(r && r.err) console.log('JRCHECK lỗi lúc chạy lại ở bước ' + r.at + ': ' + r.err);
  if(process.env.JRDUMP) require('fs').writeFileSync(process.env.JRDUMP, last);
  if(!ok) process.exitCode = 1;
}
exports.attach = async (p)=>{
  page = p;
  await p.exposeFunction('__jrSnap', s=>{ last = s; });
  await p.addInitScript(()=>{ const set = Storage.prototype.setItem; Storage.prototype.setItem = function(k, v){ if(/^phocu\.jr/.test(k)) window.__jrSnap(v); return set.call(this, k, v); }; });
  p.on('framenavigated', f=>{ if(f === p.mainFrame()) url = f.url(); });
  const b = p.context().browser(), close = b.close.bind(b);
  b.close = async ()=>{ await verify(); return close(); };
  const exit = process.exit.bind(process);
  process.exit = code=>{ verify().then(()=>exit(code || process.exitCode || 0)); };
};
