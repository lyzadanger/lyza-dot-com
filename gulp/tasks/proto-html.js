/**
 * For now, a prototyped "site" I can use
 * to design and test things. Just marked
 * any .md files in a proto directory
 * and move/rename them simply
 */
'use strict';
var gulp     = require('gulp');
var config   = require('../config').protoHTML;

var markdown = require('gulp-markdown');
var rename   = require('gulp-rename');
var template = require('../plugins/template');

gulp.task('proto-html', function() {
  return gulp.src(config.src)
    .pipe(markdown({
      gfm: true,
      smartypants: true
    }))
    .pipe(template())
    .pipe(rename({
      extname: '.html'
    }))
    .pipe(gulp.dest(config.dest));
});
