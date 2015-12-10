'use strict';

(function () {
  var version = 'hashMe',
    caches;
  ['static', 'pages', 'images']
    .forEach((cacheKey) => caches[cacheKey] = `${version}${cacheKey}`);
  console.log(caches);
}());
