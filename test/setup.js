/* global before, after */
'use strict';

before (function () {
  // Rimraf temp
  // cp fixtures into temp
});

after (function () {
  console.log('global teardown');
});
