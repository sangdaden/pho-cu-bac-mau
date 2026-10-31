// Phố Cũ Bạc Màu · service worker: the game installs like an app and plays offline once opened
// Our own files go network-first so a new push shows up straight away, and fall back to the cache with no signal.
// Versioned CDN files (three.js r128) and fonts never change, so they come from the cache first.
const CACHE = 'phocu-1';
const CORE = ['/', '/index.html', '/manifest.webmanifest', '/chung/pho.js', '/chung/pho.css', '/anh/bia.jpg',
  '/icon/icon-192.png', '/icon/icon-512.png', '/icon/apple-touch-icon.png', '/favicon.ico',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'];
// every level that exists gets cached at install, so a level never opened still plays offline; missing ones just fail quietly
const LEVELS = [];
for(let n=1;n<=12;n++) LEVELS.push('/man-' + n + '/index.html', '/man-' + n + '/man.js');

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all([...CORE, ...LEVELS].map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k !== CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

function keep(req, res){
  if(res && (res.ok || res.type === 'opaque')){ const copy = res.clone(); caches.open(CACHE).then(c=>c.put(req, copy)); }
  return res;
}
// "/man-1/" and "/man-1/index.html" are the same page
function cached(req){
  return caches.match(req, {ignoreSearch:true}).then(r=>{
    if(r) return r;
    const u = new URL(req.url);
    if(u.origin === location.origin && u.pathname.endsWith('/')) return caches.match(u.pathname + 'index.html');
  });
}

self.addEventListener('fetch', e=>{
  const req = e.request;
  if(req.method !== 'GET') return;
  const u = new URL(req.url);
  if(u.origin === location.origin){
    e.respondWith(fetch(req).then(res=>keep(req, res)).catch(()=>cached(req).then(r=>r || Response.error())));
  } else if(/cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com/.test(u.host)){
    e.respondWith(cached(req).then(r=>r || fetch(req).then(res=>keep(req, res))));
  }
});
