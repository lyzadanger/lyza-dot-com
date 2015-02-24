/* global Buffer */
'use strict';
var config    = require('../config').template;

var fs         = require('fs');
var _          = require('lodash');
var through    = require('through2');
var gutil      = require('gulp-util');
var recursive  = require('recursive-readdir');
var path       = require('path');
var Handlebars = require('handlebars');

module.exports = function wrapWithHandlebars() {
  var templates = {};

  var registerPartials = function() {
    recursive(config.partialDir, function (err, files) {
      // Files is an array of filename
      files.forEach(function(file) {
        var partialBits = [],
            relPath, partialKey;
        relPath = path.relative(config.partialDir, path.dirname(file));
        if (relPath !== '') {
          partialBits = relPath.split(path.sep);
        }
        partialBits.push(path.basename(file, '.hbs'));
        partialKey = partialBits.join(path.sep);
        try {
          Handlebars.registerPartial(partialKey, fs.readFileSync(file, 'utf8'));
        } catch (err) {
          this.emit('error', new gutil.PluginError('gulp-wrap-handlebars', err));
        }
      });
    });
  };

  registerPartials.call(this);
  return through.obj(function(file, enc, cb) {
    if (file.isNull()) {
      this.push(file);
      return cb();
    }

    if (file.isStream()) {
      cb(new gutil.PluginError('gulp-wrap-handlebars', 'Streaming not supported'));
      return;
    }

    if (file.isBuffer()) {
      var data = _.extend({
        template : 'index'
      }, file.data || {});

      var templatePath = config.templateDir + '/' + data.template + '.hbs';
      var template;
      if (typeof templates[templatePath] === 'undefined') {
          try {
            templates[templatePath] = Handlebars.compile(fs.readFileSync(templatePath, 'utf8'));
            template = templates[templatePath];
          } catch (err) {
            this.emit('error', new gutil.PluginError('gulp-wrap-handlebars', err));
          }
      } else {
        template = templates[templatePath];
      }

      data.content = file.contents.toString();
      var wrapped = template(data);
      file.contents = new Buffer(wrapped);
    }
    this.push(file);
    cb();
  });
};
