const staticCache = "site-static";
const dyanamicCache = "site-dyanamic";
const assets = [
    'manifest.json',
    '/loginpage',
    '/userpage',
    '/',
    'LoginPage.ejs',
    'User.ejs',
    'index.ejs'
];

self.addEventListener('activate',(evt)=>{
    evt.waitUntil(
    caches.keys().then(keys=>{
        return Promise.all(keys.filter((key) =>{ key !== staticCache })
        .map(key => caches.delete(key))
        )
    })
    );
});

self.addEventListener('install',(evt)=>{
        evt.waitUntil(
        caches.open(staticCache).then(cache=>{
            cache.addAll(assets);
        })
        );
});



self.addEventListener('fetch',(evt)=>{
    evt.respondWith(
        caches.match(evt.request).then(cacheRes=>{
            return cacheRes || fetch(evt.request).then(fetchRes=>{
                return caches.open(dyanamicCache).then(cache =>{
                    cache.put(evt.request.url , fetchRes.clone());
                    return fetchRes;
                });
            });
        })
    )
})