/* global before, after */
/*eslint no-console: 0 */
'use strict';
var path = require('path');
var Promise = require('bluebird');

var copy   = Promise.promisify(require('fs-extra').copy);
var rimraf = Promise.promisify(require('rimraf'));

before (function () {
  var tempDir = path.join(__dirname, '../temp'),
    fixturesDir = path.join(__dirname, '../fixtures');
  return rimraf(tempDir).then(function () {
    return copy(fixturesDir, tempDir);
  });
});

after (function () {
  console.log('global teardown');
});
