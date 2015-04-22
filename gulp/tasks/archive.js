/* global Buffer */
'use strict';

var gulp    = require('gulp');
var config  = require('../config').archive;
var fs      = require('fs');
var data    = require('gulp-data');
var fakeSrc = require('vinyl-fs-fake');
var template = require('../plugins/template');

/* @TODO: Move me somewhere utilitarian */
var readDrafts = function() {
  // Right now this is super flat and basic
  var drafts = fs.readdirSync(config.drafts.dest);
  var links = [];
  drafts.forEach(function(filename) {
    if (filename.indexOf('index.html') < 0) {
      links.push(filename);
    }
  });
  return links;
};

gulp.task('archive', ['drafts'], function() {
  var links = readDrafts();
  return fakeSrc.src([{
    path: 'index.html'
  }])
    .pipe(data(function(file) {
      // @TODO Build context/data elsewhere
      return {
        template: 'archive',
        archiveName: 'Drafts',
        postLinks: links
      };
    }))
    .pipe(template())
    .pipe(gulp.dest(config.drafts.dest));
});
