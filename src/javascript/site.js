/* global navigator, window */
'use strict';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/serviceWorker.js', {
    scope: '/'
  });
  window.addEventListener('load', function() {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({'command': 'trimCaches'});
    }
  });
}
