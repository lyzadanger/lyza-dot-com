'use strict';
var highlight = require('highlight.js');

var dest = './dist',
  src    = './src',
  dirs   = {
    data     : src + '/data',
    drafts   : src + '/content/drafts',
    js       : src + '/javascript',
    pages    : src + '/content/pages',
    posts    : src + '/content/posts',
    scripts  : src + '/javascript',
    styles   : src + '/styles',
    partials : src + '/templates/partials',
    templates: src + '/templates'
  },
  srcs   = {
    css      : dirs.styles + '/**/*',
    drafts   : dirs.drafts + '/*/**/*.md',
    js       : dirs.js + '/**/*.js',
    pages    : dirs.pages + '/**/*.md',
    posts    : dirs.posts + '/**/*.md',
    styles   : dirs.styles + '/styles.css',
    templates: dirs.templates + '/**/*.hbs'
  };
srcs.content = [srcs.pages, srcs.posts];

module.exports = {
  dirs: dirs,
  srcs: srcs,
  src : src,
  dest: dest,
  blog: {
    author           : 'Lyza Danger Gardner',
    dataDir          : dirs.data,
    dateDisplayFormat: 'MMMM D, YYYY', // http://momentjs.com/docs/#/displaying/
    description      : 'Developer and Person',
    domain           : 'http://www.lyza.com',
    feedDir          : dest + '/feeds/',
    language         : 'en-US',
    permalinkPattern : 'YYYY/MM/DD',
    postFileName     : 'index',
    postExtension    : '.md',
    pageDir          : dirs.pages,
    postDir          : dirs.posts,
    title            : 'Lyza Danger Gardner',
    urlBase          : '/'
  },
  marked: { // Shared by several tasks
    gfm        : true,
    highlight  : function(code) {
      return highlight.highlightAuto(code).value;
    },
    smartypants: true
  }
};
