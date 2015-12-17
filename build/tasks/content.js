/* global Buffer */
'use strict';

var gulp         = require('gulp');
var data         = require('gulp-data');
var markdown     = require('gulp-markdown');

var frontMatter  = require('front-matter');

var config       = require('../config');
var helpers      = require('../handlebars-helpers');
var template     = require('../plugins/handlebars');
var localContext = require('../template-data-local');
var templateData = require('../template-data');

var opts = {
  src           : config.srcs.content,
  dest          : config.dest,
  partialDir    : config.dirs.partials,
  templateDir   : config.dirs.templates,
  localContextFn: localContext
};

gulp.task('content', function (done) {
  templateData.all(config.blog).then(function (context) {
    return gulp.src(opts.src)
      .pipe(data(function(file) {
        var content = frontMatter(String(file.contents));
        // Replace file's contents with just the body
        // of the current contents (sans front matter)
        file.contents = new Buffer(content.body);
        // This gets added to file.data
        return content.attributes;
      }))
      .pipe(markdown({
        highlight: function(code) {
          return require('highlight.js').highlightAuto(code).value;
        },
        gfm: true,
        smartypants: true
      }))
      .pipe(template({
        partialDir    : opts.partialDir,
        templateDir   : opts.templateDir,
        helpers       : helpers,
        context       : context,
        localContextFn: opts.localContextFn
      }))
      .pipe(gulp.dest(opts.dest))
      .on('finish', function () {
        done();
      });
  });
});
