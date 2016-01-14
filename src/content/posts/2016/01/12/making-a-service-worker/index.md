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

ServiceWorker has been getting a lot of press.

Nod to Jeremy.

What does it do?

Lots of recipes, but it's helpful to have a case study focusing on one detail for normal devs.

Case study here is for app cache replacement, in essence.


Service Worker at first looks a little daunting. There's so much you can do with it—where to begin? The syntax can be intimidating, and there are numerous APIs related to it... Compared to Application Cache it looks...complicated. Yet AppCache's simple-looking syntax belied its underlying confounding nature and lack of flexibility.

There are a growing number of resources offering recipes for brewing up Service Workers, and there are tools like SW-precache to automate

But Service Worker is a concept, not a tool. It's something to learn and get one's head around. For me, the best way to do that is to actually walk through putting one together for an applied need—in this case, my simple, static personal web site—without tools that might serve as a crutch or blur the concept...

I turned my own site into a case study in hand-building a basic Service Worker.

Here's what I want to accomplish:

* Precache some assets
* Lean on the network for some assets, while optimizing by grabbing other things out of cache
* Be able to manage this sanely
* Keep cache sizes under control

## Learning about service worker

A service worker is a file with some JavaScript in it. Inside of that file you can write JavaScript as you know and love it, with a few important differences:

* Everything needs to be async-friendly. That means you can't use synchronous XHR or, e.g., LocalStorage (the LocalStorage API is synchronous).
* Service workers run in a context called the `ServiceWorkerGlobalScope`. You don't have access to the DOM, for example, of a page under its control. I visualize a service worker as sort of running in a separate tab from the page it affects; this is not at all _accurate_ but it is a helpful rough approximation for keeping myself out of confusion.

### Registering a service worker

You make a service worker take effect by **registering** it. This registration is done from outside the service worker, by another page or script on your site.

On my site, there is a global `site.js` script included in every HTML page. It contains this snippet for registration of my service worker:

```
navigator.serviceWorker.register('/serviceWorker.js', {
  scope: '/'
});
```

When you register a service worker, you (optionally) also tell it what **scope** it should apply itself to. You can instruct a service worker only to handle stuff for part of your site, e.g. `'/blog/'`, or you can register it for your whole site (`'/'`) like I do. As such, there's nothing stopping you from having multiple service workers on the same site—or even multiple service workers in the same scope, if you can think of some reason you'd want to do that.

### Service worker lifecycle and events

A service worker does the bulk of its work by listening for relevant events and responding to them in useful ways. Different events are triggered at different points in a service worker's **lifecycle**.

Once the service worker has been registered and downloaded, it gets _installed_ in the background. Your service worker can listen for the **`install` event** and perform tasks appropriate for this stage. In our case, we want to take advantage of the install state to pre-cache a bunch of assets we know we want available offline.

After the `install` stage is finished, the service worker is then _activated_. That means the service worker is now in control of things within its `scope` and can do its thing. The **`activate`** event isn't too exciting for a new service worker, but we'll see how it's useful when updating a service worker with a new version.

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

There's more to `Promises`, but I'll try to keep the examples here straightforward (or at least commented). I urge you to do some informative reading if you're still new to Promises.

**Note**: I use certain ES6/ES2015 features in the example code for service workers because browsers that support service workers also support these features. Specifically here I am using arrow functions and template strings.

### Other service worker necessities

It's also important to note that service workers **require HTTPS** to work. There is an important and useful exception to this rule: service workers work for `localhost`, which is a relief because setting up local SSL can sometimes be a slog.

At time of writing, these examples fully work in Chrome (what version, Lyza?) and (Firefox beta??). There's hope for other browsers shipping service worker in the near future.

## Building a service worker

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

You can also read more about the `cache` API...

### Registering our service worker

Now we need to tell the pages on our site to _use_ the service worker.

I gave a preview of `serviceWorkerContainer.register` above, but there's one more detail. Let's wrap this registration in a feature test to make sure service worker is supported in the browser loading this page.

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

The magic of our service worker is really going to happen when **fetch events** are triggered. We can _respond to_ fetches in different ways to improve performance or provide offline capabilities.

Whenever a browser wants to _fetch_ an asset that is within the _scope_ of this service worker, we can hear about it by, yep, adding an `eventListener` in `serviceWorker.js`:

```
self.addEventListener('fetch', event => {
  // ... do something useful?
});
```


#### Should we handle this fetch?

When a `fetch` event occurs for an asset, the first thing I want to determine is whether this service worker should handle responding to this request. Otherwise, it should do nothing and let the browser assert its default behavior.

We'll end up with basic logic like this in `serviceWorker.js`:

```
shouldHandleFetch(event, config)
  .then(event => onFetch(event, config))
  .catch(reason =>
    console.log(`I am not going to handle this fetch because ${reason}`)
  );
```

I wrote a `shouldHandleFetch` function to assess a given request and _resolve_ or _reject_ its returned `Promise`. In `serviceWorker.js`:

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
      reject(`${url} not from my origin (${self.location.origin})`);
    }
    if (request.method !== 'GET') {
      reject(`request method is not 'GET' (${request.method})`);
    }
    if (!(matchesPathPattern || matchesPreCache)) {
      reject(`path '${url.pathname}' does not match cache whitelist`);
    }
    resolve(event);
  });
}

```

Of course, the criteria here are my own and would vary from site to site.

#### Brief aside about importScripts

Aha! There has been an incursion of a `config` object, passed as an `opts` argument to handling functions. This is for my own sanity.

You can use the `importScripts` method in service worker files (available because we are in `WorkerGlobalScope`) to include JavaScript code from other files. Now I can create a new file, `serviceWorker.config.js` with the following contents initially:

```
var config = {
  staticCacheItems: [
    '/lyza-2.gif',
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
importScripts('/serviceWorker.config.js');
```

This allows me to keep my config-like values, which may change as we go, isolated from the main logic of my service worker. Just a personal-preference organization thing.

At this point, we've registered a service worker that installs some things in a static cache, and can determine when a fetch comes in that it should respond to. Here's what `serviceWorker.js` looks like right now.

#### Writing the fetch handler

The `onFetch` function needs to:

1. Review the `request` information and see what "kind" of asset this is
2. Figure out which `cache` to fetch from or store into
3. Execute the appropriate strategy for this asset type and actually respond to the request

First, I can look at the `HTTP Accept` header to get a hint as to what kind of asset is being requested.

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

  // ...
}
```

Then, I can figure out which `cache` is involved for this `fetch`. There are three caches in play here:

* A `static` cache, which holds pre-cached items and any other asset that is neither an image nor content
* A `content` cache, for HTML pages
* An `image` cache for images

For the moment, deriving the cache key is as simple as:

```
  function onFetch (event, opts) {
    // ...
    cacheKey = resourceType;
  }

```

(That will change later).

The third and final thing for `onFetch` to do is to execute the appropriate strategy for the asset.

### Strategy: _How_ should we handle this fetch?

Once I'm sure the `fetch` should be fulfilled by my service worker, and I know what kind of asset is being fetched, the next question is _how to deal with it_? Dealing with different kinds of _fetches_ involves choosing **strategies**.

#### HTML content: network-first strategy

When fetching HTML documents, I should check the network first. HTML content is the core concern of my site, and changes often. I always want to try to retrieve the newest version. If the network request fails (which may indicate the user is offline), try looking to see if I have a cached copy of this page and provide that, if so. If there's nothing available in the cache, show the user the offline fallback page.

#### Images and other content: cache-first strategy

Once images are in place on my site, they don't tend to change. For network performance optimization, I want to check for a cached copy _first_ when fetching images. If there is not a cached copy available, request from the network. If that network request fails, return instead an SVG image that has the text "Offline" in it.

For any content that is neither HTML nor an image, yet still meets criteria to be handled by this service worker, treat it like an image (i.e. cache-first) except that there is no offline fallback (page or offline image).

#### Pass-thru Caching

To be able to fetch things from cache as I want to in these strategies, those assets have to be put into cache in the first place. To do this I use a technique called _pass-thru caching_. Any time I request a handled asset from the network successfully, I subsequently stash a copy of the response in cache so it's available for later.

### Finishing `onFetch`

We can finish out the structure of `onFetch`, by sketching in the right strategies:

```
function onFetch (event, opts) {
  // 1. Determine what kind of asset this is...(above)
  // 2. Determine the cache involved...(above)

  if (resourceType === 'content') {
    event.respondWith(
      fetch(request)
          .then(response => addToCache(cacheKey, request, response))
        .catch(() => fetchFromCache(event))
        .catch(() => offlineResource(opts))
    );
  } else {
    event.respondWith(
      fetchFromCache(event)
        .catch(() => fetch(request))
          .then(response => addToCache(cacheKey, request, response))
        .catch(() => offlineResource(resourceType, opts))
    );
  }
}
```

We'll need to fill in functions for `addToCache`, `fetchFromCache` and `offlineResource`, but the shape of the strategy is in place.

### Implementing Fetch Strategies

Let's look more closely at one of the strategies. For HTML content (`resourceType === 'content'`), we first try to `fetch` the `request`ed asset from the network:

```
fetch(request)
   .then(response => addToCache(cacheKey, request, response))
```

If that works, subsequently call `addToCache` to store a cached copy of that resource. The `addToCache` function looks like:

```
function addToCache (cacheKey, request, response) {
  var copy = response.clone();
  caches.open(cacheKey).then( cache => {
    cache.put(request, copy);
  });
  return response;
}
```

*Note*: you need to `.clone` `Response` objects before caching them.

If retrieving the asset from the network succeeds, we're done, however, if it doesn't, try getting a previously-cached copy of the HTML from cache:


```
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

If we've made it this far, but there's nothing in the cache we can respond with an appropriate offline fallback, if possible:

```
    .catch(() => offlineResource(opts))
```

And here is the `offlineResource` function:

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

The non-content strategy (images and other) uses the same components, but in different order. It will try to fetch from the cache first, network with pass-through caching second, and offline fallback if both fail.

### Explaining fallback image and offline page

## Updating the service worker

### Activate handler

```
self.addEventListener('activate', event => {
  function onActivate (event, opts) {
    return caches.keys()
      .then(cacheKeys => {
        var oldCacheKeys = cacheKeys.filter(key => key.indexOf(opts.version) !== 0);
        return Promise.all(oldCacheKeys.map(oldKey => caches.delete(oldKey)));
      });
  }

  event.waitUntil(
    onActivate(event, config)
      .then( () => self.clients.claim() )
  );
});
```

### Update install handler

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
