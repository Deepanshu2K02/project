const staticCache = "site-static";
const dyanamicCache = "site-dyanamic";
const assets = [
    '/loginpage'
];

self.addEventListener('install',(evt)=>{
    evt.waitUntil(
    caches.open(staticCache).then(cache=>{
        cache.addAll(assets);
    })
    );
});
 

self.addEventListener('activate',(evt)=>{
    evt.waitUntil(
    caches.keys().then(keys=>{
        return Promise.all(keys.filter((key) =>{ key !== staticCache })
        .map(key => caches.delete(key))
        )
    })
    );
});


self.addEventListener('fetch',(evt)=>{
    evt.respondWith(
        caches.match(evt.request).then(cacheRes=>{
            return cacheRes || fetch(evt.request).then(fetchRes=>{
                return fetchRes;
            });
        })
    )
})