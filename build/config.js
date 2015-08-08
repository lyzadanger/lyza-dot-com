'use strict';

var dest = './dist',
  src  = './src',
  dirs = {
    drafts: src + '/content/drafts',
    pages: src + '/content/pages',
    posts: src + '/content/posts',
    scripts: src + '/javascript',
    styles: src + '/styles',
    templates: src + '/templates'
  },
  srcs = {
    drafts: dirs.drafts + '/*/**/*.md',
    pages: dirs.pages + '/**/*.md',
    posts: dirs.posts + '/**/*.md',
    styles: dirs.styles + '/styles.css'
  };

module.exports = {
  assets: {
    // Everything in pages/* and posts/*
    // but NOT markdown files
    src: [ dirs.pages + '/**/*.*',
           '!' + srcs.pages,
           dirs.posts + '/**/*.*',
           '!' + srcs.posts
         ],
    dest: dest
  },
  blog: {
    author: 'Lyza Danger Gardner',
    dateDisplayFormat: 'MMMM D, YYYY', // http://momentjs.com/docs/#/displaying/
    description: 'Developer and Person',
    domain: 'http://www.lyza.com',
    feedDir: dest + '/feeds/',
    language: 'en-US',
    permalinkPattern: 'YYYY/MM/DD',
    postFileName: 'index',
    postExtension: '.md',
    pageDir: dirs.pages,
    postDir: dirs.posts,
    title: 'Lyza Danger Gardner',
    urlBase: '/'
  },
  browserSync: {
    open: false,
    server: {
      baseDir: dest
    }
  },
  browserify: {
  // A separate bundle will be generated for each
  // bundle config in the list below
    bundleConfigs: [{
        entries: dirs.scripts + '/site.js',
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
    importDir: dirs.styles,
    src: srcs.styles,
    dest: dest + '/css'
  },
  content: {
    src: [ srcs.pages, srcs.posts ],
    dest: dest
  },
  marked: { // Shared by several tasks
    gfm: true,
    highlight: function(code) {
        return require('highlight.js').highlightAuto(code).value;
    },
    smartypants: true
  },
  publish: {
    dest: dirs.posts,
    drafts: dirs.drafts,
    prune: dirs.drafts,
    src: srcs.drafts
  },
  unpublish: {
    src: srcs.posts,
    prune: dirs.posts,
    dest: dirs.drafts
  },
  template: {
    partialDir: dirs.templates + '/partials',
    templateDir: dirs.templates,
    src : dirs.templates + '/**/*.hbs'
  }
};
