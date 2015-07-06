'use strict';
// TODO Dry out repetitive src and dest values
var dest = './build';
var src  = './src';

module.exports = {
  assets: {
    src: [ src + '/content/pages/**/*.*',
           '!' + src + '/content/pages/**/*.md',
           src + '/content/posts/**/*.*',
           '!' + src + '/content/posts/**/*.md'],
    dest: dest
  },
  blog: {
    permalinkPattern: 'YYYY/MM/DD',
    postFileName: 'index',
    postExtension: '.md',
    pageDir: src + '/content/pages',
    postDir: src + '/content/posts',
    urlBase: '/'
  },
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
  clean: {
    out: dest
  },
  css: {
    importDir: src + '/styles',
    src: src + '/styles/styles.css',
    dest: dest + '/css'
  },
  content: {
    src: [ src + '/content/posts/**/*.md',
           src + '/content/pages/**/*.md'],
    dest: dest
  },
  publish: {
    dest: src + '/content/posts',
    drafts: src + '/content/drafts',
    prune: src + '/content/drafts/',
    src: src + '/content/drafts/*/**/*.md'
  },
  unpublish: {
    src: src + '/content/posts/**/*.md',
    prune: src + '/content/posts/',
    dest: src + '/content/drafts'
  },
  template: {
    partialDir: src + '/templates/partials',
    templateDir: src + '/templates'
  }
};
