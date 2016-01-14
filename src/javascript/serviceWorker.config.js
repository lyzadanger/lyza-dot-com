'use strict';

var config = {
  version: 'achilles',
  staticCacheItems: [
    '/lyza-2.gif',
    '/css/styles.css',
    '/site.js',
    '/offline/',
    '/'
  ],
  cachePathPattern: /^\/(20[0-9]{2}|about|blog|css)/,
  offlineImage: '<svg role="img" aria-labelledby="offline-title"'
    + ' viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">'
    + '<title id="offline-title">Offline</title>'
    + '<g fill="none" fill-rule="evenodd"><path fill="#D8D8D8" d="M0 0h400v300H0z"/>'
    + '<text fill="#9B9B9B" font-family="Times New Roman,Times,serif" font-size="72" font-weight="bold">'
    + '<tspan x="93" y="172">offline</tspan></text></g></svg>',
  offlinePage: '/offline/'
};
