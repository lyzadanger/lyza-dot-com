/* global self, caches */
'use strict';

(function () {
  var version  = '898hashMe199898',
    preCache   = ['/lyza-2.gif',
                  '/css/styles.css'],
    cacheNames = {};

  var updateStaticCache = function () {
    return caches.open(cacheNames.static)
      .then((cache) => cache.addAll(preCache));
  };

  var clearOldCaches = function () {
    return caches.keys()
      .then(     (keys) => Promise.all(keys
        .filter( (key) => key.indexOf(version) !== 0 )
        .map(    (deleteKey) => caches.delete(deleteKey) ) )
    );
  };

  ['static', 'pages', 'images']
    .forEach((cacheKey) => cacheNames[cacheKey] = `${version}${cacheKey}`);

  self.addEventListener('install', (event) => {
    event.waitUntil(updateStaticCache()
      .then(() => self.skipWaiting())
    );
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(clearOldCaches()
      .then(() => self.clients.claim())
    );
  });

}());
