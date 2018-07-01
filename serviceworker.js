importScripts('/js/Polyfills/idb.js');
importScripts('/js/idbs.js');

const STATIC_CACHE = 'head-static-v3';
const DYNAMIC_CACHE = 'head-dynamic';
const URL = 'https://free.currencyconverterapi.com/api/v5/currencies';
const STATIC_FILES = [
  '/',
  'https://fonts.googleapis.com/css?family=Lato:100,300,400,700,900',
  'https://free.currencyconverterapi.com/api/v5/currencies',
  '/index.html',
  '/css/queries.css',
  '/css/style.css',
  '/img/Optimized-environment.jpg',
  '/js/app.js',
  '/js/idbs.js',
  '/js/Polyfills/fetch.js',
  '/js/Polyfills/promise.js',
  '/js/Polyfills/idb.js'
];

function isInArray(val, arr) {
  arr.forEach(item => {
    if (val === item) {
      return true;
    } else {
      return false;
    }
  });
}

function trimCache(cacheName, maxItem) {
  caches.open(cacheName).then(cache => {
    return cache.keys().then(keys => {
      if (keys.length > maxItem) {
        cache.delete(keys[0]).then(trimCache(cacheName, maxItem));
      }
    });
  });
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(STATIC_FILES);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyval => {
      return Promise.all(
        keyval.map(key => {
          if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
            caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.url.indexOf(URL) > -1) {
    event.respondWith(
      fetch(event.request).then(res => {
        const val = res.clone();
        clearDataAll('currencies')
          .then(() => {
            return val.json();
          })
          .then(val => Object.values(val.results))
          .then(datas => {
            dbPromise.then(db => {
              const tx = db.transaction('currencies', 'readwrite');
              const store = tx.objectStore('currencies');
              datas.forEach(data => {
                store.put(data);
              });
            });
          });

        return res;
      })
    );
  } else if (isInArray(event.request.url, STATIC_FILES)) {
    event.respondWith(caches.match(event.request));
  } else {
    event.respondWith(
      caches.match(event.request).then(resp => {
        if (resp) {
          return resp;
        } else {
          return fetch(event.request)
            .then(res => {
              return caches.open(DYNAMIC_CACHE).then(cache => {
                trimCache(DYNAMIC_CACHE, 30);
                cache.put(event.request.url, res.clone());
                return res;
              });
            })
            .catch(err => {
              return caches.open(STATIC_CACHE).then(cache => {
                if (event.request.headers.get('accept').includes('text/html')) {
                  return cache.match('/img/offline.jpg');
                }
              });
            });
        }
      })
    );
  }
});
