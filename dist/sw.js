const CACHE = 'chiikawa-tamagotchi-v6';
const NEW_ASSETS=['./v6.css','./village.js','./habitat-decor.js','./party.js',...['chiikawa','hachiware','usagi'].map(id=>`./assets/sprites/${id}-party-v6.png`),...['house-interior-v6','cave-interior-v6','rakko-car-v6'].map(id=>`./assets/habitats/${id}.png`),...['ramen','pancake','oden','radish','parfait'].map(id=>`./assets/food-clips/${id}.mp4`)];
const CORE = ['./', './index.html', './style.css', './room.css', './wardrobe.css', './game.js', './room.js', './wardrobe.js', './art.js', './art.css', './v5.css', './food-scenes.js', './assets/sprites/chiikawa-party-v5.png', './assets/sprites/mud-body.svg', './assets/sprites/mud-dressed.svg', './assets/sprites/chiikawa-hunt-v4.png', './assets/sprites/chiikawa-outfits-v4.png', ...['chiikawa','hachiware','usagi','momonga','kurimanju','shisa','rakko'].flatMap(c => ['vest','pajama','explorer','ribbon','party-pink','party-purple','party-mint','party-white'].map(o => `./assets/outfits/fitted/${c}-${o}.svg`)), './manifest.webmanifest', ...['vest','pajama','explorer','ribbon'].map(id => `./assets/outfits/${id}.svg`), ...['chiikawa','hachiware','usagi','momonga','kurimanju','shisa','rakko'].map(id => `./assets/characters/${id}.png`)];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll([...CORE,...NEW_ASSETS])).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => (key.startsWith('modumaru-') || key.startsWith('chiikawa-tamagotchi-')) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if(event.request.headers.has('range')){
    if(!new URL(event.request.url).pathname.endsWith('.mp4'))return;
    event.respondWith(caches.match(event.request.url).then(async cached=>{
      if(!cached)return fetch(event.request);
      const bytes=await cached.arrayBuffer(),size=bytes.byteLength,match=/^bytes=(\d*)-(\d*)$/.exec(event.request.headers.get('range'));
      if(!match)return fetch(event.request);
      const start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2])),end=match[1]&&match[2]?Math.min(size-1,Number(match[2])):size-1;
      if(start>=size||start>end)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});
      return new Response(bytes.slice(start,end+1),{status:206,headers:{'Content-Type':'video/mp4','Content-Range':`bytes ${start}-${end}/${size}`,'Accept-Ranges':'bytes','Content-Length':String(end-start+1)}});
    }));return;
  }
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) { const copy = response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy))); }
    return response;
  }).catch(() => caches.match(event.request).then(hit => hit || Response.error())));
});
