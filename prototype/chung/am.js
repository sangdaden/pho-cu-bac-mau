// Phố Cũ Bạc Màu · âm thanh và cài đặt
// Every sound is synthesised with Web Audio, so the game needs no audio files and stays small and offline.
// The game calls AM.* from its step code; AM never changes the game's state, so a replayed run ("Chơi tiếp") stays exact.
// Settings live in localStorage 'phocu.set': {nhac, tieng} 0..1, rung (vibrate), chu (big text), trai (pads swapped).
const AM = (()=>{
  const SET_KEY = 'phocu.set';
  const DEF = {nhac:.6, tieng:.8, rung:true, chu:false, trai:false};
  let set = Object.assign({}, DEF);
  try { Object.assign(set, JSON.parse(localStorage.getItem(SET_KEY) || '{}') || {}); } catch(e){}
  let ctx = null, master, sfxG, musG, noiseBuf, tearN = null, mute = false, chapter = 1, colourK = 0, rainK = 0;
  let mus = {next:0, beat:0, timer:null, rain:null};

  function save(){ try { localStorage.setItem(SET_KEY, JSON.stringify(set)); } catch(e){} }
  // browsers only let sound start from a tap or a key press
  function start(){
    if(ctx){ if(ctx.state === 'suspended') ctx.resume().catch(()=>{}); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if(!AC) return;
    try { ctx = new AC(); } catch(e){ ctx = null; return; }
    master = ctx.createGain(); master.gain.value = 1; master.connect(ctx.destination);
    sfxG = ctx.createGain(); sfxG.gain.value = set.tieng; sfxG.connect(master);
    musG = ctx.createGain(); musG.gain.value = set.nhac*.55; musG.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate*2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for(let i=0;i<d.length;i++) d[i] = Math.random()*2 - 1;
    musicStart();
  }
  for(const ev of ['pointerdown', 'keydown', 'touchend']) addEventListener(ev, start, {passive:true});
  document.addEventListener('visibilitychange', ()=>{ if(!ctx) return; if(document.hidden) ctx.suspend().catch(()=>{}); else ctx.resume().catch(()=>{}); });

  const now = ()=>ctx.currentTime;
  const on = ()=>ctx && !mute && ctx.state === 'running';
  function env(g, t, a, peak, dec){ g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); }
  function noise(t, dur, f, q, peak, type, out){
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.playbackRate.value = .7 + Math.random()*.6;
    const fl = ctx.createBiquadFilter(); fl.type = type || 'bandpass'; fl.frequency.value = f; fl.Q.value = q || 1;
    const g = ctx.createGain(); env(g, t, .004, peak, dur);
    s.connect(fl); fl.connect(g); g.connect(out || sfxG); s.start(t, Math.random()*1.5); s.stop(t + dur + .05);
    return fl;
  }
  function tone(t, f, dur, peak, type, out, a){
    const o = ctx.createOscillator(); o.type = type || 'sine'; o.frequency.value = f;
    const g = ctx.createGain(); env(g, t, a || .006, peak, dur);
    o.connect(g); g.connect(out || sfxG); o.start(t); o.stop(t + (a || .006) + dur + .05);
    return o;
  }
  // a plucked string (đàn tranh): a bright attack, a soft octave, a slow decay
  function pluck(t, f, peak, out, dur){
    dur = dur || 1.6;
    tone(t, f, dur, peak, 'triangle', out);
    tone(t, f*2.005, dur*.45, peak*.35, 'sine', out);
    tone(t, f*3.01, dur*.2, peak*.15, 'sine', out);
  }

  // ---------- sound effects ----------
  const FX = {
    jump(){ const t = now(); const o = tone(t, 330, .16, .18, 'triangle'); o.frequency.exponentialRampToValueAtTime(560, t + .12); },
    land(v){ const t = now(); noise(t, .08, 260, .8, Math.min(.35, .08 + v*.02), 'lowpass'); },
    step(){ const t = now(); noise(t, .045, 900 + Math.random()*500, 1.4, .05); },
    grab(){ const t = now(); noise(t, .06, 2600, 2, .12); },
    layer(){ const t = now(); noise(t, .22, 3200, .7, .22, 'highpass'); tone(t + .02, 784, .25, .05, 'sine'); },
    paste(){ const t = now(); noise(t, .05, 1200, 1, .14); noise(t + .07, .06, 900, 1, .12); },
    fold(){ const t = now(); noise(t, .07, 1800, 3, .1); noise(t + .09, .07, 2400, 3, .1); },
    use(){ const t = now(); noise(t, .14, 1500, 1.2, .1, 'bandpass'); },
    fly(){ const t = now(); [1047, 1319, 1568].forEach((f, i)=>tone(t + i*.06, f, .35, .07, 'sine')); },
    relic(){ const t = now(); [523, 659, 784, 1047].forEach((f, i)=>pluck(t + i*.11, f, .12, sfxG, 1.2)); },
    colour(){ const t = now(); const sc = SCALES[chapter] || SCALES[1]; [0, 2, 4, 5].forEach((d, i)=>pluck(t + i*.09, sc[d]*2, .1, sfxG, 1.8)); },
    wake(){ const t = now(); const o = tone(t, 392, .5, .08, 'sine', sfxG, .08); o.frequency.exponentialRampToValueAtTime(587, t + .4); },
    splash(){ const t = now(); noise(t, .35, 700, .6, .3, 'lowpass'); noise(t + .05, .25, 2400, .8, .1); },
    win(){ const t = now(); const sc = SCALES[chapter] || SCALES[1]; [0, 1, 2, 4, 5, 7].forEach((d, i)=>pluck(t + i*.13, sc[d % sc.length]*(d >= sc.length ? 4 : 2), .13, sfxG, 2.2)); },
    say(){ const t = now(); tone(t, 520 + Math.random()*180, .05, .025, 'square'); }
  };
  function play(n, v){ if(on() && FX[n]) try { FX[n](v); } catch(e){} }
  // tearing paper follows how fast the page is being peeled: 0 = silent
  function tear(v){
    if(!on()){ if(tearN){ try { tearN.s.stop(); } catch(e){} tearN = null; } return; }
    if(v > .02 && !tearN){
      const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2200; f.Q.value = .9;
      const g = ctx.createGain(); g.gain.value = 0;
      s.connect(f); f.connect(g); g.connect(sfxG); s.start(); tearN = {s, f, g};
    }
    if(!tearN) return;
    const t = now();
    tearN.g.gain.setTargetAtTime(v > .02 ? .16*v*(.75 + Math.random()*.5) : 0, t, .03);
    tearN.f.frequency.setTargetAtTime(1600 + v*1800 + Math.random()*500, t, .02);
    if(v <= .02){ const n = tearN; tearN = null; setTimeout(()=>{ try { n.s.stop(); } catch(e){} }, 250); }
  }

  // ---------- music: a slow pentatonic phrase per chapter that grows as the street gets its colour back ----------
  // chương 1 chiều Trung thu (điệu Bắc, sáng), chương 2 mưa và nước (điệu Oán, buồn hơn, có tiếng mưa), chương 3 gió tới Tết (sáng, có trống)
  const SCALES = {1:[196, 220, 262, 294, 330, 392, 440, 523], 2:[196, 233, 262, 294, 349, 392, 466, 523], 3:[220, 247, 294, 330, 370, 440, 494, 587]};
  const TEMPO = {1:.62, 2:.78, 3:.5};
  let melo = 2;
  function musicStart(){
    if(mus.timer || !ctx) return;
    mus.next = ctx.currentTime + .4;
    mus.timer = setInterval(schedule, 120);
  }
  function schedule(){
    if(!ctx || ctx.state !== 'running') return;
    const sc = SCALES[chapter], beat = TEMPO[chapter];
    while(mus.next < ctx.currentTime + .5){
      const t = mus.next, b = mus.beat++;
      // a drone on the root every two bars; more voices join as colour comes back
      if(b % 8 === 0) tone(t, sc[0]/2, beat*7, .07 + .05*colourK, 'sine', musG, .4);
      const dens = .28 + colourK*.5;
      if(Math.random() < dens){ melo = Math.max(0, Math.min(sc.length - 1, melo + [-2, -1, -1, 1, 1, 2, 0][Math.floor(Math.random()*7)])); pluck(t, sc[melo], .09 + colourK*.05, musG, beat*3); }
      if(colourK > .35 && b % 4 === 2 && Math.random() < .7) pluck(t, sc[(melo + 2) % sc.length]/2, .06, musG, beat*2.5);
      if(colourK > .7 && b % 2 === 1 && Math.random() < .5) tone(t, sc[(melo + 4) % sc.length]*2, beat*1.5, .025, 'sine', musG, .01);
      if(chapter === 3 && colourK > .2 && b % 8 === 0){ noise(t, .25, 120, .7, .18, 'lowpass', musG); }
      mus.next += beat;
    }
    // rain bed for chapter 2 levels that have rain
    if(rainK > .05 && !mus.rain){
      const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1500;
      const g = ctx.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(musG); s.start(); mus.rain = {s, g};
    }
    if(mus.rain) mus.rain.g.gain.setTargetAtTime(rainK*.12, ctx.currentTime, .5);
  }

  function apply(){
    if(sfxG) sfxG.gain.setTargetAtTime(set.tieng, ctx.currentTime, .05);
    if(musG) musG.gain.setTargetAtTime(set.nhac*.55, ctx.currentTime, .1);
    document.documentElement.classList.toggle('chu-to', !!set.chu);
    document.documentElement.classList.toggle('tay-trai', !!set.trai);
  }
  apply();

  return {
    get set(){ return set; },
    change(k, v){ set[k] = v; save(); apply(); },
    play, tear, start,
    // short buzz on phones (Android; iPhone browsers ignore it)
    buzz(ms){ if(set.rung && !mute && navigator.vibrate) try { navigator.vibrate(ms); } catch(e){} },
    level(n){ chapter = Math.min(3, Math.max(1, Math.ceil(n/3))); },
    colour(k){ colourK = k; },
    rain(k){ rainK = k; },
    mute(m){ mute = !!m; if(m) tear(0); }
  };
})();
window.AM = AM;
