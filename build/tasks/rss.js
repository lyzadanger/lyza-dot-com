'use strict';

var gulp   = require('gulp');
var rss    = require('../utils/rss');

gulp.task('rss', function(cb) {
  rss(cb);
});
