/* global self, caches, URL, fetch, Response */
'use strict';

// https://en.wikipedia.org/wiki/List_of_Greek_mythological_figures
var version  = 'artemis-',
  preCache   = ['/lyza-2.gif',
                '/css/styles.css',
                '/site.js',
                '/offline/',
                '/'],
  cachePathPattern = /^\/(20[0-9]{2}|about|blog|css)/,
  cacheNames = {};

/**
 * Should our fetch handler concern itself with this
 * particular request?
 *
 * @param request {Request}
 * @return {boolean}
 */
var shouldHandleFetch = function (request) {
  let url = new URL(request.url);
  var criteria = {
    fromMyOwnServer : url.origin     === self.location.origin,
    isGETRequest    : request.method === 'GET',
    inAValidPath    : checkCachePath(url)
  };
  // failingCriteria will the keys from any tests (values) in
  // criteria that did not pass. Having length > 0 means that
  // there is something about this request that makes it not
  // applicable for our fetch handling. Examining any keys here
  // could help for debug.
  var failingCriteria = Object.keys(criteria).filter((value) => !criteria[value]);
  return !failingCriteria.length;
};

/**
 * Utility function to check path of request (via url property)
 * to determine whether it's in a valid path for caching.
 *
 * @param url {URL}
 * @return {boolean}
 */
var checkCachePath = function (url) {
  var matchesPathPattern = cachePathPattern.exec(url.pathname);
  var matchesPreCache = preCache.filter((path) => path === url.pathname).length;
  return matchesPathPattern || matchesPreCache;
};

/**
 * What "type" of resource does this request represent?
 * This will affect which cache it may end up in and how
 * it is handled during fetch.
 * @param request {Request}
 * @return {String}
 */
var resourceType = function (request) {
  let acceptHeader = request.headers.get('Accept');
  if (acceptHeader.indexOf('text/html') !== -1) {
    return 'content';
  } else if (acceptHeader.indexOf('image') !== -1)  {
    return 'image';
  }
  return 'other';
};

/**
 * Add the given response (keyed by request) into
 * the appropriate cache.
 *
 * @param request {Request}
 * @param response {Response}
 * @return {Response}
 */
var addToCache = function (request, response) {
  var copy = response.clone(),
    cacheName = resourceType(request);
  caches.open(cacheNames[cacheName]).then((cache) => {
    cache.put(request, copy);
  });
  return response;
};

/**
 * Return the appropriate offline handling for this request. This is
 * used as a fallback if other methods of fetching do not succeed.
 * Returns undefined on failure to sorta mimic the behavior of `caches.match`
 *
 * @param request {Request}
 * @return {Promise} resolving to {Response} || {Response} || undefined
 */
var getOffline = function (request) {
  let offlineType = resourceType(request);
  if (offlineType === 'image') {
    return new Response('<svg role="img" aria-labelledby="offline-title" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><title id="offline-title">Offline</title><g fill="none" fill-rule="evenodd"><path fill="#D8D8D8" d="M0 0h400v300H0z"/><text fill="#9B9B9B" font-family="Times New Roman,Times,serif" font-size="72" font-weight="bold"><tspan x="93" y="172">offline</tspan></text></g></svg>', {headers: {'Content-Type': 'image/svg+xml'}});
  } else if (offlineType === 'content') {
    return caches.match('/offline/');
  }
  return undefined;
};

/**
 * Look for request in the caches. `caches.match` will resolve its
 * Promise with `undefined` on failure to find a matching cache entry.
 * Here I wrap that whole situation with another Promise such that it
 * rejects on failure to match
 *
 * @param request {Request}
 * @return {Promise} resolving to {Response} || rejecting on `undefined`
 */
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

/**
 * During install stage, do this:
 *   Add all items defined in preCache
 *   to the static cache.
 *
 * Invoked by eventListener on `install`.
 *
 * @return {Promise}
 */
var onInstall = function () {
  return caches.open(cacheNames.static)
    .then((cache) => cache.addAll(preCache));
};

/**
 * During activate stage, do this:
 *   Clean up old caches from previous version(s) of this SW.
 *   Look for any existing caches with keys that do not match our current
 *   version string. Delete the hell out of them.
 *
 * Invoked by eventListener on `activate` event.
 *
 * @return {Promise}
 */
var onActivate = function () {
  return caches.keys()
    .then((keys)       => Promise.all(keys
      .filter((key)      => key.indexOf(version) !== 0)
      .map((deleteKey)   => caches.delete(deleteKey)) )
  );
};

/**
 * Keep the caches a reasonable size by limiting the number of entries.
 * I wanted to be fancier and look, say, at cache Responses' Content-Length
 * headers to manage this on a size-based level, but that's inefficient with
 * current SW architecture.
 * @see https://github.com/slightlyoff/ServiceWorker/issues/587
 *
 * Recursively trim a given cache until its entry count is <= maxItems
 *
 * @param cacheName {String}    cache to stick this in
 * @param maxItems {Number}     max keys this cache should have
 * @return {Promise} || resolves to {Number} of entries in cache
 */
var trimCache = function (cacheName, maxItems) {
  return caches.open(cacheNames[cacheName]).then((cache) => {
    return cache.keys().then((keys) => {
      if (keys.length > maxItems) {
        cache.delete(keys[0]).then(trimCache(cacheName, maxItems));
      } else {
        return keys.length;
      }
    });
  });
};

// Set up cache names based on current version hash
['static', 'content', 'image', 'other']
  .forEach((cacheKey) => cacheNames[cacheKey] = `${version}${cacheKey}`);

// Handle install stage: pre-cache and skipWaiting to make this
// new SW activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(onInstall().then(() => self.skipWaiting()));
});

// Handle activate stage: clean up old SW caches and then
// "claim" clients to make this SW take effect in all tabs
self.addEventListener('activate', (event) => {
  event.waitUntil(onActivate().then(() => self.clients.claim()));
});

// Listen for the `trimCaches` message from the main thread
// and do so
self.addEventListener('message', function(event) {
  if (event.data.command == 'trimCaches') {
    trimCache('image', 15);
    trimCache('content', 50);
  }
});

// Handle fetches
self.addEventListener('fetch', (event) => {
  var request = event.request,
    requestType = resourceType(request);
  // Determine if we should handle this fetch at all...
  if (!shouldHandleFetch(request)) { return; }

  // For HTML content, try network first (and cache result)
  // Try cache second, and fall back to the offline page finally
  if (requestType === 'content') {
    event.respondWith(
      fetch(request)
        .then((response) => addToCache(request, response))
        .catch(() => findInCache(request))
        .catch(() => getOffline(request))
    );
  } else {
    // For other requests, try cache first, then network (and cache result)
    // Fall back to offline response
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
