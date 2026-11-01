// Chép bản web (../prototype) sang www/ cho Capacitor.
// Trong app không cần service worker (file đã nằm sẵn trong máy) và không cần nút "Cài lên điện thoại".
const fs = require('fs'), path = require('path');
const SRC = path.resolve(__dirname, '../prototype'), OUT = path.resolve(__dirname, 'www');
const SKIP = new Set(['CNAME', 'sw.js', 'nhan-vat-3d']);
fs.rmSync(OUT, {recursive:true, force:true});
(function copy(from, to){
  fs.mkdirSync(to, {recursive:true});
  for(const f of fs.readdirSync(from)){
    if(SKIP.has(f)) continue;
    const a = path.join(from, f), b = path.join(to, f);
    if(fs.statSync(a).isDirectory()) copy(a, b); else fs.copyFileSync(a, b);
  }
})(SRC, OUT);
// game.js-side switches read this flag: no service worker, no install button, haptics through the native plugin
const idx = path.join(OUT, 'index.html');
fs.writeFileSync(idx, fs.readFileSync(idx, 'utf8').replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<script>window.PHOCU_APP = true;</script>'));
for(const d of fs.readdirSync(OUT)){
  const f = path.join(OUT, d, 'index.html');
  if(/^man-\d+$/.test(d) && fs.existsSync(f)) fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<script>window.PHOCU_APP = true;</script>'));
}
// fonts ship inside the app (chung/phong.css + chung/phong/*.woff2): no Google Fonts call, and the text keeps its fonts offline
function localFonts(f, css){
  if(!fs.existsSync(f)) return;
  const s = fs.readFileSync(f, 'utf8').replace(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\n?/g, '')
    .replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2[^"]*" rel="stylesheet">/g, '<link rel="stylesheet" href="' + css + '">');
  fs.writeFileSync(f, s);
}
localFonts(idx, 'chung/phong.css'); localFonts(path.join(OUT, 'rieng-tu.html'), 'chung/phong.css');
for(const d of fs.readdirSync(OUT)) if(/^man-\d+$/.test(d)) localFonts(path.join(OUT, d, 'index.html'), '../chung/phong.css');
console.log('www/ sẵn sàng:', fs.readdirSync(OUT).join(' '));
