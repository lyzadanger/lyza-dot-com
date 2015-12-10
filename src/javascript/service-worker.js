/* global self, caches */
'use strict';

(function () {
  var version  = '8jkjk98-0000999shMe199898',
    preCache   = ['/lyza-2.gif',
                  '/css/styles.css'],
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
  //
  // var requestShouldCache = function (request) {
  //   // It's from my server
  //   // It's from one of the whitelisted paths
  //   // It's a GET request
  // };
  //
  // var fetchPrecedence = function (request) {
  //   // Default: network only
  //   // HTML: network, cache
  //   // ELSE, GET requests: cache, network
  // };

  ['static', 'pages', 'images']
    .forEach((cacheKey) => cacheNames[cacheKey] = `${version}${cacheKey}`);

  self.addEventListener('install', (event) => {
    event.waitUntil(updateStaticCache().then(() => self.skipWaiting()));
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(clearOldCaches().then(() => self.clients.claim()));
  });

  self.addEventListener('fetch', () => {
    return;
    // If we should do anything
    // try to fetch from appropriate precedence
    // fail (be offline) in appropriate way
    // cache appropriately
    // Validate request is cacheable
    // Get fetch precedence
    // Respond with correct fetch precedence
  });

}());
