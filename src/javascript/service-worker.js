/* global self, caches, URL, fetch, Response */
'use strict';

(function () {
  var version  = 'versionHash',
    preCache   = ['/lyza-2.gif',
                  '/css/styles.css',
                  '/site.js',
                  '/offline/',
                  '/'],
    cachePathPattern = /^\/(20[0-9]{2}|about|blog|css)/,
    cacheNames = {};

  var shouldHandleFetch = function (request) {
    let url = new URL(request.url),
      criteria = {
        'fromMyOwnServer':  url.origin === self.location.origin,
        'isAGETRequest':    request.method === 'GET',
        'inAValidPath':     checkCachePath(url)
      };
    var failingCriteria = Object.keys(criteria).filter((value) => !criteria[value]);
    return !failingCriteria.length;
  };

  var onInstall = function () {
    return caches.open(cacheNames.static)
      .then((cache) => cache.addAll(preCache));
  };

  var onActivate = function () {
    return caches.keys()
      .then((keys)       => Promise.all(keys
        .filter((key)      => key.indexOf(version) !== 0)
        .map((deleteKey)   => caches.delete(deleteKey)) )
    );
  };

  var checkCachePath = function (url) {
    var matchesPathPattern = cachePathPattern.exec(url.pathname);
    var matchesPreCache = preCache.filter((path) => path === url.pathname).length;
    return matchesPathPattern || matchesPreCache;
  };

  var resourceType = function (request) {
    let acceptHeader = request.headers.get('Accept');
    if (acceptHeader.indexOf('text/html') !== -1) {
      return 'content';
    } else if (acceptHeader.indexOf('image') !== -1)  {
      return 'image';
    }
    return 'other';
  };

  var trimCache = function (cacheName, maxItems) {
    caches.open(cacheNames[cacheName]).then((cache) => {
      cache.keys().then((keys) => {
        if (keys.length > maxItems) {
          cache.delete(keys[0]).then(trimCache(cacheName, maxItems));
        }
      });
    });
  };

  var addToCache = function (request, response) {
    var copy = response.clone(),
      cacheName = resourceType(request);
    caches.open(cacheNames[cacheName]).then((cache) => {
      cache.put(request, copy);
    });
    return response;
  };

  var getOffline = function (request) {
    let offlineType = resourceType(request);
    if (offlineType === 'image') {
      return new Response('<svg role="img" aria-labelledby="offline-title" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><title id="offline-title">Offline</title><g fill="none" fill-rule="evenodd"><path fill="#D8D8D8" d="M0 0h400v300H0z"/><text fill="#9B9B9B" font-family="Times New Roman,Times,serif" font-size="72" font-weight="bold"><tspan x="93" y="172">offline</tspan></text></g></svg>', {headers: {'Content-Type': 'image/svg+xml'}});
    } else if (offlineType === 'content') {
      return caches.match('/offline/');
    }
    return false;
  };

  var findInCache = function (request) {
    return new Promise((resolve, reject) => {
      caches.match(request).then((response) => {
        if (response !== undefined) {
          resolve(response);
        } else {
          reject();
        }
      });
    });
  };

  ['static', 'content', 'image', 'other']
    .forEach((cacheKey) => cacheNames[cacheKey] = `${version}${cacheKey}`);

  self.addEventListener('install', (event) => {
    event.waitUntil(onInstall().then(() => self.skipWaiting()));
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(onActivate().then(() => self.clients.claim()));
  });

  self.addEventListener('message', function(event) {
    if (event.data.command == 'trimCaches') {
      trimCache('image', 15);
      trimCache('content', 50);
    }
  });

  self.addEventListener('fetch', (event) => {
    var request = event.request,
      requestType = resourceType(request);
    if (!shouldHandleFetch(request)) { return; }

    if (requestType === 'content') {
      event.respondWith(
        fetch(request)
          .then((response) => addToCache(request, response))
          .catch(() => findInCache(request))
          .catch(() => getOffline(request))
      );
    } else {
      event.respondWith(
        findInCache(request)
          .catch(() => {
            return fetch(request)
              .then((response) => addToCache(request, response))
              .catch(() => getOffline(request));
          })
      );
    }
  });
}());
