const static_cache = 'static_cache';

const assets = [
    '/',
]

self.addEventListener('install', function(event) {
    console.log('used to register the service worker')
      event.waitUntil(
      caches.open(static_cache)
      .then(function(cache) {
        cache.addAll(assets)
      })
      .then(self.skipWaiting())
      )
  })
  
  self.addEventListener('fetch', function(event) {

      event.respondWith(
      fetch(event.request)
        .catch(() => {
          console.log('fetching resource')
          return caches.open(static_cache)
            .then((cache) => {
              return cache.match(event.request)
            })
        })
    )
  })
  
  self.addEventListener('activate', function(event) {
      event.waitUntil(
          caches.keys()
            .then((keyList) => {
              return Promise.all(keyList.map((key) => {
                if (key !== static_cache) {
                  return caches.delete(key)
                }
              }))
            })
            .then(() => self.clients.claim())
        )
  })



  // self.addEventListener('install',function (event) {
  //   console.log('service worker installed')
  
  // })
  
  // self.addEventListener('fetch', function(event) {
 
  // })
  
  // self.addEventListener('activate', function(event) {
  //   console.log('new SW activated');
  //   
  // })