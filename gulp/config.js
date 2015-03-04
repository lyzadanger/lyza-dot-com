'use strict';
var dest = './build';
var src  = './src';

module.exports = {
  browserSync: {
    server: {
      baseDir: dest
    }
  },
  browserify: {
  // A separate bundle will be generated for each
  // bundle config in the list below
    bundleConfigs: [{
        entries: src + '/javascript/site.js',
        dest: dest,
        outputName: 'site.js',
        // Additional file extentions to make optional
        //extensions: ['.coffee', '.hbs'],
        // list of modules to make require-able externally
        require: ['jquery']
    }]
  },
  css: {
    importDir: src + '/styles',
    src: src + '/styles/styles.css',
    dest: dest + '/css'
  },
  drafts: {
    src: src + '/posts/drafts/**/*.md',
    dest: dest + '/drafts'
  },
  protoHTML: {
    src: src + '/proto/**/*.md',
    dest: dest
  },
  template: {
    partialDir: src + '/templates/partials',
    templateDir: src + '/templates'
  }
};
