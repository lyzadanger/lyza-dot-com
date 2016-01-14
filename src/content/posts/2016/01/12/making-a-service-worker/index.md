---
title: Making a Service Worker
tags:
  - web
  - tech
blurb: A case study in making a Service Worker for simple site caching optimization
status: published
publish:
  slug: making-a-service-worker
  date: '2016-01-12T21:32:06.980Z'
  path: 2016/01/12/making-a-service-worker/index.md

---

TODO:

* Props to Jeremy
* Intro and explanation of WTF we're doing
* Compatibility details
* Cross-linking to specs, etc.
* The first version in action
* The second version in action
* Tips and gotchas


[Service Worker](https://www.w3.org/TR/service-workers/) ([Helpful MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)) at first looks a little daunting. There's so much you can do with it—where to begin? The syntax can be intimidating, and there are numerous APIs that are subservient to it or otherwise related: `cache`, `fetch`, etc.

Compared to Application Cache it looks...complicated. Yet AppCache's simple-looking syntax belied its [underlying confounding nature and lack of flexibility](http://alistapart.com/article/application-cache-is-a-douchebag).

## Learning about service worker

A service worker is a file with some JavaScript in it. Inside of that file you can write JavaScript as you know and love it, with a few important differences:

* Everything needs to be async-friendly. That means you can't use synchronous XHR or, e.g., LocalStorage (the LocalStorage API is synchronous).
* Service workers run in a context called the [`ServiceWorkerGlobalScope`](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope). You don't have access to the DOM, for example, of a page under its control. I visualize a service worker as sort of running in a separate tab from the page it affects; this is not at all _accurate_ but it is a helpful rough metaphor for keeping myself out of confusion.

### Registering a service worker

You make a service worker take effect by **registering** it. This registration is done from outside the service worker, by another page or script on your site. On my site, there is a global `site.js` script included in every HTML page. I register my service worker from there.

When you register a service worker, you (optionally) also tell it what **scope** it should apply itself to. You can instruct a service worker only to handle stuff for part of your site, e.g. `'/blog/'`, or you can register it for your whole site (`'/'`) like I do.

### Service worker lifecycle and events

A service worker does the bulk of its work by **listening for relevant events and responding to them in useful ways**. Different events are triggered at different points in a service worker's **lifecycle**.

#### Install

Once the service worker has been registered and downloaded, it gets _installed_ in the background. Your service worker can listen for the **install event** and perform tasks appropriate for this stage.

In our case, we want to take advantage of the install state to pre-cache a bunch of assets we know we want available offline.

#### Activate

After the `install` stage is finished, the service worker is then _activated_. That means the service worker is now in control of things within its `scope` and can do its thing. The **activate event** isn't too exciting for a new service worker, but we'll see how it's useful when updating a service worker with a new version.

Exactly when _activation_ occurs depends on whether this is a brand-new service worker or an updated version of a pre-existing service worker. If the browser does not have a previous version of a given service worker already registered,
_activation_ will happen immediately after _installation_ is complete.

Once _installation_ and _activation_ are complete, they won't occur again until an updated version of the service worker is downloaded and registered.

### Service worker's Promise-based API

The service worker API makes heavy use of `Promises`. A `Promise` represents the eventual result of an asynchronous operation, even if the actual value won't be known until the operation completes some time in the future.

```
getAnAnswerToADifficultQuestionSomewhereFarAway()
  .then(answer => {
    console.log(`I got the ${answer}!`);
  })
  .catch(reason => {
    console.log(`I tried to figure it out but couldn't because ${reason}`);
  });
```

The `getAnAnswer...` function returns a `Promise` that (we hope) will eventually be _fulfilled_ by, or _resolve_ to, the `answer` we're looking for. Then that `answer` can be fed to any chained `then` handler functions, or, in the sorry case of failure to achieve its objective, the `Promise` can be _rejected_—often with a _reason_—and `catch` handler functions can take care of these situations.

There's more to `Promises`, but I'll try to keep the examples here straightforward (or at least commented). I urge you to do some [informative reading](https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Promise) if you're still new to Promises.

**Note**: I use certain ES6/ES2015 features in the example code for service workers because browsers that support service workers also support these features. Specifically here I am using [arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) and [template strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/template_strings).

### Other service worker necessities

It's also important to note that service workers **require HTTPS** to work. There is an important and useful exception to this rule: service workers work for `localhost` on insecure `http`, which is a relief because setting up local SSL can sometimes be a slog.

**TODO** At time of writing, these examples fully work in Chrome (what version, Lyza?) and (Firefox beta??). There's hope for other browsers shipping service worker in the near future.

--------------

## Building a service worker

Now that we've taken care of some theory, we can start putting together our service worker.

### Installing and activating our service worker

To install and activate our service worker, we want to listen out for `install` and `activate` events and act on them. We can start with an empty file for our service worker and add a couple of `eventListeners`.

In `serviceWorker.js`:

```
self.addEventListener('install', event => {
  // Do install stuff
});

self.addEventListener('activate', event => {
  // Do activate stuff
});
```

We won't need to elaborate on `activate` handling _just_ yet, but let's make the `install` handler actually do something.

### Pre-caching static assets during install

I want to use the _install_ stage to pre-cache some assets on my site:

* By pre-caching some static assets (images, CSS, JS) that are used by many pages on my site, I can speed up load times by grabbing these out of cache instead of fetching from the network on subsequent page loads.
* By pre-caching an offline fallback page, I can show a nice page when I can't fulfill a page request because the user is offline.

The steps to do this are:

1. Tell the `install` event to hang on and not complete until I've done what I need to do by using `event.waitUntil`.
2. Open the appropriate `cache` and stick the static assets inside of it by using `Cache.addAll`.

In `/serviceWorker.js`, expanding the `install` handler:

```
self.addEventListener('install', event => {

  function onInstall () {
    return caches.open('static')
      .then(cache =>
        cache.addAll([
          '/lyza.gif',
          '/site.js',
          '/css/styles.css',
          '/offline/'
        ])
      );
  }

  event.waitUntil(onInstall(event));
});
```

You can see `Promises` at work here: `caches.open` returns a `Promise` resolving to a `cache` object once it has successfully opened the `static` cache; `addAll` also returns a `Promise` that resolves when all of the items passed to it have been stashed in the cache.

I tell the `event` to wait until the `Promise` returned by my handler function is resolved successfully. Then we can be sure all of those pre-cache items get sorted before the _installation_ is complete.

You can [read more about the `cache` API](https://developer.mozilla.org/en-US/docs/Web/API/Cache) and its available methods if you like.

### Registering our service worker

Now we need to tell the pages on our site to _use_ the service worker.

Remember, this registration happens from outside the service worker—in my case, from within a script (`site.js`) that is included on every page of my site.

In my `site.js`:

```
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/serviceWorker.js', {
    scope: '/'
  });
}
```

### Handling Fetches

So far our service worker has a fleshed-out `install` handler, but doesn't _do_ anything beyond that. The magic of our service worker is really going to happen when **fetch events** are triggered. We can _respond to_ fetches in different ways to improve performance or provide offline capabilities.

Whenever a browser wants to _fetch_ an asset that is within the _scope_ of this service worker, we can hear about it by, yep, adding an `eventListener` in `serviceWorker.js`:

```
self.addEventListener('fetch', event => {
  // ... Perhaps respond to this fetch in a useful way?
});
```

Again, _every_ fetch that falls within this service worker's scope (i.e. path) will trigger this event—HTML pages, scripts, images, CSS, you name it. We can selectively handle the way the browser responds to any of those fetches.

### Should we handle this fetch?

When a `fetch` event occurs for an asset, the first thing I want to determine is whether this service worker should handle responding to this fetch. Otherwise, it should do nothing and let the browser assert its default behavior.

We'll end up with basic logic like this in `serviceWorker.js`:

```
shouldHandleFetch(event, config) // I'll explain config shortly
  .then(event => onFetch(event, config))
  .catch(reason =>
    console.log(`I am not going to handle this fetch because ${reason}`)
);
```

I wrote a `shouldHandleFetch` function to assess a given request and return a Promise that _resolves_, meaning yes, let's go ahead and do something specific for this fetch, or _rejects_, meaning no, I don't want to handle this specially, let the browser do its own thing. In `serviceWorker.js`:

```
function shouldHandleFetch (event, opts) {
  var request            = event.request;
  var url                = new URL(request.url);
  var matchesPathPattern = opts.cachePathPattern.exec(url.pathname);
  var matchesPreCache    = opts.staticCacheItems.filter(path =>
      path === url.pathname
    ).length;

  return new Promise(function (resolve, reject) {
    if (url.origin !== self.location.origin) {
      // I only want to process fetches that are on my own site
      reject(`${url} not from my origin (${self.location.origin})`);
    }
    if (request.method !== 'GET') {
      // I don't want to mess with non-GET requests
      reject(`request method is not 'GET' (${request.method})`);
    }
    if (!(matchesPathPattern || matchesPreCache)) {
      // I am using a path whitelist so I don't cache weird things
      // (e.g. browsersync injected stuff when developing locally)
      reject(`path '${url.pathname}' does not match cache whitelist`);
    }
    resolve(event);
  });
}

```

Of course, the criteria here are my own and would vary from site to site. `event.request` is a [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) object that has all kinds of data you can look at to assess how you'd like your fetch handler to behave.

#### Brief aside about importScripts

Aha! There has been an incursion of a `config` object, passed as an `opts` argument to handling functions. Where does `config` come from? I created it so I could factor out common config-like values for reuse.

You can use the [`importScripts`](https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/importScripts) method in service worker files (available because we are in `WorkerGlobalScope`) to include JavaScript code from other files. Now I can create a new file, `serviceWorker.config.js` with the following contents initially:

```
var config = {
  staticCacheItems: [
    '/lyza.gif',
    '/css/styles.css',
    '/site.js',
    '/offline/',
    '/'
  ],
  cachePathPattern: /^\/(20[0-9]{2}|about|blog|css)/
};
```

Then at the top of `serviceWorker.js`:

```
self.importScripts('/serviceWorker.config.js');
```

Now we have `config` in our scope. This allows me to keep my config-like values, which may change as we go, isolated from the main logic of my service worker. Just a personal-preference organization thing. Thanks for your patience.

### Our service worker so far

At this point, we've registered a service worker that installs some things in a static cache, and can determine when a fetch comes in that it should respond to.

**TODO**: You can review the contents of `serviceWorker.js` at this point.

### Writing the fetch handler

Now we're ready to pass applicable `fetch` requests on to a handler. The `onFetch` function needs to:

1. Review the `request` information and see what "kind" of asset this is. This helps to figure out what to do with it and what `cache` to put it in.
2. Execute the appropriate strategy for this asset type and actually respond to the request

#### 1. What kind of thing is being requested?

First, I can look at the `HTTP Accept` header to get a hint as to what kind of asset is being requested. This helps me figure out how I want to handle it.

```
function onFetch (event, opts) {
  var request      = event.request;
  var acceptHeader = request.headers.get('Accept');
  var resourceType = 'static';
  var cacheKey;

  if (acceptHeader.indexOf('text/html') !== -1) {
    resourceType = 'content';
  } else if (acceptHeader.indexOf('image') !== -1) {
    resourceType = 'image';
  }

  // {String} [static|image|content]
  cacheKey = resourceType;
}
```

For organization, I want to stick different kinds of things into different caches. That allows me to manage those caches later. These cache key `String`s are arbitrary—you can call your caches whatever you like; the cache API doesn't have opinions.

#### 2. Respond to the fetch

The next thing for `onFetch` to do is to execute the appropriate strategy for the asset and `respondTo` the `fetch` event with an intelligent `Response`.

```
function onFetch (event, opts) {
  // 1. Determine what kind of asset this is...(above)
  if (resourceType === 'content') {
    // Use a network-first strategy
    event.respondWith(
      fetch(request)
          .then(response => addToCache(cacheKey, request, response))
        .catch(() => fetchFromCache(event))
        .catch(() => offlineResource(opts))
    );
  } else {
    // Use a cache-first strategy
    event.respondWith(
      fetchFromCache(event)
        .catch(() => fetch(request))
          .then(response => addToCache(cacheKey, request, response))
        .catch(() => offlineResource(resourceType, opts))
    );
  }
}
```

### Fetch strategy for HTML content

Responding to fetch requests involves implementing an appropriate **network strategy**. Let's look more closely at the way we're responding to requests for HTML content (`resourceType === 'content'`).

```
if (resourceType === 'content') {
  // Respond with a network-first strategy
  event.respondWith(
    fetch(request)
        .then(response => addToCache(cacheKey, request, response))
      .catch(() => fetchFromCache(event))
      .catch(() => offlineResource(opts))
  );
}
```

The way we fulfill requests for content here is a **network-first strategy**. Because HTML content is the core concern of my site and it changes often, always try to get fresh HTML documents from the network.

These are the ordered steps for this strategy:

#### 1. Try fetching from the network

```
fetch(request)
   .then(response => addToCache(cacheKey, request, response))
```

If the network request is successful (the Promise resolves), go ahead and stash a copy of the HTML document in the appropriate cache (`content`). This is called **read-through caching**:

```
function addToCache (cacheKey, request, response) {
  var copy = response.clone();
  caches.open(cacheKey).then( cache => {
    cache.put(request, copy);
  });
  return response;
}
```

*Note*: you need to clone `Response` objects before caching them.

#### 2. Try to retrieve from cache

If retrieving the asset from the network succeeds, we're done, however, if it doesn't, we might be offline or otherwise network-compromised. Try retrieving a previously-cached copy of the HTML from cache:

```
fetch(request)
  .then(response => addToCache(cacheKey, request, response))
  .catch(() => fetchFromCache(event))
```

Here is the `fetchFromCache` function:

```
function fetchFromCache (event) {
  return new Promise((resolve, reject) => {
    caches.match(event.request).then((response) => {
      if (response !== undefined) {
        resolve(response);
      } else {
        reject(`${event.request.url} not found in cache`);
      }
    });
  });
}
```

*Note*: `caches.match` returns a `Promise` that resolves to `undefined` (instead of rejecting) if there is no match for the thing we're trying to find. I wrap this in another `Promise` so I can manually reject it if there is no match, allowing for logical chaining in the fetch handler.

*Another Note*: You don't indicate which cache you wish to check with `caches.match`; you check all of 'em at once.

#### 3. Provide an offline fallback

If we've made it this far, but there's nothing in the cache we can respond with, return an appropriate offline fallback, if possible. For HTML pages, this is the page cached from `/offline/`. It's a reasonably well-formatted page that lets the user know they're offline and I can't fulfill what they're after.

```
fetch(request)
  .then(response => addToCache(cacheKey, request, response))
  .catch(() => fetchFromCache(event))
    .catch(() => offlineResource(opts))
```

And here is the `offlineResource` function:

```
function offlineResource (resourceType, opts) {
  if (resourceType === 'image') {
    // ... return an offline image
  } else if (resourceType === 'content') {
    return caches.match('/offline/');
  }
  return undefined;
}
```

### Fetch strategy for other resources

The fetch logic for resources other than HTML content use a **cache-first strategy**. Images and other static content on the site rarely change, so check the cache first.

```
event.respondWith(
  fetchFromCache(event)
    .catch(() => fetch(request))
      .then(response => addToCache(cacheKey, request, response))
    .catch(() => offlineResource(resourceType, opts))
);
```

The steps here are:

1. Try to retrieve the asset from cache;
2. If that fails, try retrieving from network (with read-through caching);
3. If that fails, provide a offline fallback resource if possible.


#### Offline image

We can return an SVG image with the text "Offline" as an offline fallback by completing the `offlineResource` function:

```
function offlineResource (resourceType, opts) {
  if (resourceType === 'image') {
    return new Response(opts.offlineImage,
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  } else if (resourceType === 'content') {
    return caches.match(opts.offlinePage);
  }
  return undefined;
}
```

And relevant updates to `serviceWorker.config.js`:

```
var config = {
  // ...
  offlineImage: '<svg role="img" aria-labelledby="offline-title"'
    + ' viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">'
    + '<title id="offline-title">Offline</title>'
    + '<g fill="none" fill-rule="evenodd"><path fill="#D8D8D8" d="M0 0h400v300H0z"/>'
    + '<text fill="#9B9B9B" font-family="Times New Roman,Times,serif" font-size="72" font-weight="bold">'
    + '<tspan x="93" y="172">offline</tspan></text></g></svg>',
  offlinePage: '/offline/'
};
```

### Completing the first version

The first version of our service worker is now done. We have an install handler, and a fleshed-out `fetch` handler that can respond to applicable fetches with optimized responses, as well as provide cached resources and an offline page when offline.

You can see the current state of `serviceWorker.js` here.

------------

## Updating the service worker

If nothing were ever going to change on our site again, we could ostensiby say we're done, but service workers do need to be updated from time to time. Maybe I want to add more cache-able paths. Maybe I want to evolve the way my offline fallbacks work. Maybe there's something slightly buggy in my service worker I want to fix.

I want to stress that there are automated tools for making service-worker management part of your workflow, like [`sw-precache`](https://github.com/GoogleChrome/sw-precache) from Google. You don't _need_ to do this by hand. However, the complexity on my site is low enough, and my desire strong enough, that I use a human versioning strategy to manage changes to my service worker. This consists of:

* A simple version string to indicate versions
* Fleshing out the `activate` handler to clean up after old versions
* Updating the `install` handler to make updated service workers `activate` faster

### Versioning cache keys

I can add a `version` property to my `config` object:

```
version: 'aether'
```

This should change any time I want to deploy an updated version of my service worker. I use the names of Greek dieties because they're more interesting to me than random strings or numbers.

We can use this version string to prefix the names of our caches—in other words, the keys for our caches will change each time we have a new version. Here's a utility function to make working with that easier:

```
function cacheName (key, opts) {
  return `${opts.version}-${key}`;
}
```

Then, instead of using cache keys directly, like we did before, e.g.:

```
return caches.open('static')
```

we use the version-prefixing function:

```
var cacheKey = cacheName('static', opts);
return caches.open(cacheKey)
```

### Adding an activate handler

The purpose of having version-specific cache names is so that we can clean up caches from previous versions. If there are caches around during activation that are _not_ prefixed with the current version string, we know that they should be deleted because they are crufty.

#### Cleaning up old caches

We can use a function to clean up after old caches:

```
function onActivate (event, opts) {
  return caches.keys()
    .then(cacheKeys => {
      var oldCacheKeys = cacheKeys.filter(key =>
        key.indexOf(opts.version) !== 0
      );
      var deletePromises = oldCacheKeys.map(oldKey =>
        caches.delete(oldKey)
      );
      return Promise.all(deletePromises);
    });
}
```

This function:

1. Gets all of the keys for all of the caches that currently exist in the scope of this service worker;
2. Filters that `Array` of keys to get a new `Array` of keys that don't match the new version name—that is, cache keys representing caches that are old and should be deleted;
3. Generates an `Array` of `Promises` by mapping all of the keys for deletion over `cache.delete`—this fires off the actual deletion of these caches;
4. Returns a `Promise` that will resolve once all of the delete promises are resolved.

#### Speeding up install and activate

An updated service worker will get downloaded and will `install` in the background. It is now a **worker in waiting**. By default, the updated service worker will not _activate_ while there are any pages loaded that are still using the old service worker. However, we can speed that up by making a small change to our `install` handler:

```
self.addEventListener('install', event => {
  function onInstall (event, opts) {
    // ...
  }

  event.waitUntil(
    onInstall(event, config)
      .then( () => self.skipWaiting() )
  );
});
```

`skipWaiting` will cause `activate` to happen immediately.

Then, one last change to the `activate` handler:

```
self.addEventListener('activate', event => {
  function onActivate (event, opts) {
    // ... as above
  }

  event.waitUntil(
    onActivate(event, config)
      .then( () => self.clients.claim() )
  );
});
```

`self.clients.claim` will make the new service worker take effect immediately in any open pages in its scope.

## Tips and gotchas

### CDNs

Watch out for CDNs if you are restricting fetch handling to your origin. When constructing my first service worker, I forgot that my hosting provider sharded assets (images, scripts) out onto its CDN, so that they no were no longer served from my site's origin (lyza.com). Whoops. That didn't work. I ended up disabling the CDN.

### Console.log and console errors

Maybe not a bug, but certainly a confusion: if you `console.log` from service workers, Chrome will continue to re-display (not clear) those log message in subsequent page requests. This can make it _seem_ like events are firing too many times or code is executing over and over. [Chromium issue here](https://code.google.com/p/chromium/issues/detail?id=543104&q=service%20worker%20event&colspec=ID%20Pri%20M%20Stars%20ReleaseBlock%20Cr%20Status%20Owner%20Summary%20OS%20Modified#makechanges).

Another odd thing is that once a service worker is installed and activated, subsequent page loads for any page within its scope will always cause a single error in the console:

[Here's a Chromium issue thread about that](https://code.google.com/p/chromium/issues/detail?id=541797).

### Don't rename your service worker

At one point I was futzing around with naming conventions for the service worker's file name. Don't do this. The browser will register the new service worker but the old service worker will stay installed, too. This is a messy state of affairs. There's probably a workaround, but I'd say: don't rename your service worker.
