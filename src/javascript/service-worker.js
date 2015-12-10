/* global self, caches, URL, fetch */
'use strict';

(function () {
  var version  = 'sally-forth',
    preCache   = ['/lyza-2.gif',
                  '/css/styles.css',
                  '/site.js',
                  '/'],
    cacheNames = {};

  var updateStaticCache = function () {
    return caches.open(cacheNames.static)
      .then((cache) => cache.addAll(preCache));
  };

  var clearOldCaches = function () {
    return caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.indexOf(version) !== 0)
        .map((deleteKey) => caches.delete(deleteKey)) )
    );
  };

  var shouldHandleFetch = function (request) {
    let url = new URL(request.url),
      criteria = {
        'fromMyOwnServer': url.origin === self.location.origin,
        'isAGETRequest': request.method === 'GET',
        'inAValidPath': (function () {
          var matchesWhitelist =  /^\/(20[0-9]{2}|about|blog|css)/.exec(url.pathname);
          var matchesPreCache = preCache.filter((path) => path === url.pathname);
          return matchesWhitelist || matchesPreCache.length;
        }())
      };
    var failingCriteria = Object.keys(criteria).filter((value) => !criteria[value]);
    return !failingCriteria.length;
  };

  var fetchType = function (request) {
    let acceptHeader = request.headers.get('Accept');
    if (acceptHeader.indexOf('text/html') !== -1) {
      return 'content';
    } else if (acceptHeader.indexOf('image') !== -1)  {
      return 'image';
    }
    return 'static';
  };

  var addToCache = function (request, response) {
    var copy = response.clone(),
      cacheName = fetchType(request);
    caches.open(cacheNames[cacheName])
      .then((cache) => {
        cache.put(request, copy);
      });
    return response;
  };

  var findInCache = function (request) {
    return new Promise((resolve, reject) => {
      caches.match(request)
        .then((response) => {
          if (response !== undefined) {
            resolve(response);
          } else {
            reject();
          }
        });
    });
  };


  ['static', 'content', 'image']
    .forEach((cacheKey) => cacheNames[cacheKey] = `${version}${cacheKey}`);

  self.addEventListener('install', (event) => {
    event.waitUntil(updateStaticCache().then(() => self.skipWaiting()));
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(clearOldCaches().then(() => self.clients.claim()));
  });

  self.addEventListener('fetch', (event) => {
    var request = event.request,
      requestType = fetchType(request);
    if (!shouldHandleFetch(request)) { return; }

    if (requestType === 'content') {
      event.respondWith(
        fetch(request)
          .then((response) => addToCache(request, response))
          .catch(() => findInCache(request))
          .catch(() => {
            console.log('need to fall back content', request);
          })
      );
    } else {
      event.respondWith(
        findInCache(request)
          .catch(() => {
            fetch(request)
              .then((response) => addToCache(request, response))
              .catch(() => console.log('need to fall back static'));
          })
      );
    }
    return;

  });

}());
