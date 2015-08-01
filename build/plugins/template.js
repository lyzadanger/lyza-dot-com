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

var buildContext = require('../utils/context').shared;
var localContext = require('../utils/context').local;

module.exports = function wrapWithHandlebars(opts) {
  opts = opts || {};
  var templates = {};
  var sharedContext;

  var registerPartials = function() {
    recursive(config.partialDir, function (err, files) {
      // @TODO Note that I'm hard-coding options for now
      // ideally this would take options
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

  if (opts.helpers) {
    for (var helperKey in opts.helpers) {
      Handlebars.registerHelper(helperKey, opts.helpers[helperKey]);
    }
  }

  // Retrieve shared context. If it's already
  // set, invoke cb with it. Else go get it.
  var getSharedContext = function(cb) {
    if (sharedContext) {
      cb(sharedContext);
    } else {
      buildContext(function (context) {
        sharedContext = context;
        cb(context);
      }, function (err) {
        throw new Error(err);
      });
    }
  };

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
      }, localContext(file.path, file.data) || {}),
        self = this;
      var templatePath = config.templateDir + '/' + data.template + '.hbs';
      var template, wrapped;
      if (typeof templates[templatePath] === 'undefined') {
        try {
          templates[templatePath] = fs.readFileSync(templatePath, 'utf8');
          template = Handlebars.compile(templates[templatePath]);
        } catch (err) {
          this.emit('error', new gutil.PluginError('gulp-wrap-handlebars', err));
        }
      } else {
        template = Handlebars.compile(templates[templatePath]);
      }

      data.content = file.contents.toString();
      try {
        getSharedContext(function (context) {
          data = _.extend({}, context, data);
          file.contents = new Buffer(template(data));
          self.push(file);
          cb();
        });
      } catch (err) {
        this.emit('error', new gutil.PluginError('gulp-wrap-handlebars', err));
      }
    }
  });
};
