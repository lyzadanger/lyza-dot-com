'use strict';

var fs         = require('fs');
var path       = require('path');

var Promise    = require('bluebird');
var gutil      = require('gulp-util');
var through    = require('through2');
var recursive  = Promise.promisify(require('recursive-readdir'));
var Handlebars = require('handlebars');
var _          = require('lodash');

module.exports = function buildTemplates(opts) {
  var templates = {};

  opts = _.defaults(opts || {}, {
    context         : {},
    defaultTemplate : 'index',
    localContextFn  : _.noop,
    helpers         : {},
    partialDir      : '',
    extension       : '.hbs',
    templateDir     : ''
  });

  var getTemplate = function (file) {
    if (typeof(templates[file]) === 'undefined') {
      templates[file] = fs.readFileSync(file, 'utf8');
    }
    return templates[file];
  };

  var registerPartial = function (file) {
    var pathBase = path.relative(opts.partialDir, path.dirname(file)),
      pathElements = (pathBase !== '') ? [pathBase] : [],
      partialKey;
    pathElements.push(path.basename(file, opts.extension));
    partialKey = pathElements.join(path.sep);
    Handlebars.registerPartial(partialKey, getTemplate(file));
  };

  var registerPartials = function () {
    return new Promise (function (resolve) {
      if (opts.partialDir) {
        recursive(opts.partialDir)
          .then(function (files) {
            files.forEach(registerPartial);
            resolve();
          });
      } else {
        resolve();
      }
    });
  };

  var registerHelpers = function () {
    return new Promise(function (resolve) {
      for (var helperKey in opts.helpers) {
        Handlebars.registerHelper(helperKey, opts.helpers[helperKey]);
      }
      resolve();
    });
  };

  var registerTemplates = function () {
    return new Promise (function (resolve) {
      if (opts.templateDir) {
        recursive(opts.templateDir)
          .then(function (files) {
            files.forEach(getTemplate);
            resolve();
          });
      } else {
        resolve();
      }
    });
  };

  var prepReady = Promise.all([registerHelpers(), registerPartials(), registerTemplates()]);

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
      prepReady.then(function () {
        var context = _.extend(
          { template: opts.defaultTemplate,
            content: file.contents.toString() },
          opts.context,
          opts.localContextFn(file.path, file.data) || {}
        );

        try {
          var template  = getTemplate(opts.templateDir + '/' + context.template + opts.extension);
          var templateFn = Handlebars.compile(template);
          file.contents = new Buffer(templateFn(context));
        } catch (err) {
          this.emit('error', new gutil.PluginError('gulp-wrap-handlebars', err));
        }
        this.push(file);
        cb();
      }.bind(this));
    }
  });
};
