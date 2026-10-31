// usage: node run-all.js [level...] · runs each level's bot (playN.js) without screenshots; every level must reach its win card with no page errors
const { spawn } = require('child_process');
const path = require('path'), os = require('os');
const levels = process.argv.slice(2).map(Number).filter(Boolean);
const list = levels.length ? levels : [1,2,3,4,5,6,7,8,9];
function run(n){
  return new Promise(res=>{
    const file = path.resolve(__dirname, '../../prototype/man-' + n + '/index.html');
    const c = spawn(process.execPath, [path.join(__dirname, 'play' + n + '.js'), file, path.join(os.tmpdir(), 'pho-' + n), '0'], {env:Object.assign({}, process.env, {NOSHOT:'1'})});
    let out = ''; c.stdout.on('data', d=>out += d); c.stderr.on('data', d=>out += d);
    const kill = setTimeout(()=>c.kill('SIGKILL'), 8*60*1000);
    c.on('close', code=>{ clearTimeout(kill);
      const won = /(winReady|ready)=true/.test(out);
      // bots print their own state as JSON lines; anything else except known noise (a blocked font or favicon, headers) is a page error
      const errors = out.split('\n').map(l=>l.trim()).filter(l=>l && !l.startsWith('{') && !/^(info |no errors|LOAD ERRORS|ERRORS)/.test(l) && !/ERR_FAILED|THREE\.Material|"flies":/.test(l));
      res({n, ok: won && !errors.length, out, errors, code}); });
  });
}
(async()=>{
  // three at a time: nine software-rendered browsers at once starve each other into timeouts
  const results = [];
  for(let i=0;i<list.length;i+=3) results.push(...await Promise.all(list.slice(i, i+3).map(run)));
  let bad = 0;
  for(const r of results){
    const lastLine = r.out.trim().split('\n').filter(l=>l.startsWith('{')).pop() || '';
    console.log(`Màn ${r.n}: ${r.ok ? 'thắng' : 'HỎNG'}  ${lastLine.slice(0, 160)}`);
    if(!r.ok){ bad++; console.log(r.errors.join('\n') || r.out.slice(-1500)); }
  }
  process.exit(bad ? 1 : 0);
})();
