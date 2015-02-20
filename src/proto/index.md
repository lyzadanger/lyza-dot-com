---
title: Building my Site from Nothing
---

## Set up Environment

### Repo

```shell
$ npm init
$ echo 'node_modules' >> .gitignore
$ git init
$ git add package.json .gitignore
$ git commit -m "Initial commit"

```

### Gulp fundamentals

```shell
$ npm install --save-dev gulp require-dir
$ echo "'use strict';" >> gulpfile.js
$ mkdir gulp/tasks
$ git add gulpfile.js
$ git commit -m "Gulp fundamentals"
```

### Environment

* Added .jshintrc, .jscs, .editorconfig

```shell
$ git add .jshintrc .jscs .editorconfig
$ git commit -m "OCD amount of .config"
```

### Creating an area for prototyping

```shell
$ mkdir source/proto
$ touch source/proto/index.md
```

* Add some basic markdown content to `index.md`

```shell
$ git add source/proto/index.md
$ git commit -m "Proto directory and simple index markdown file"
```

### First Task(s) bones

* Establishing `gulpfile.js`: (inspired by [https://github.com/greypants/gulp-starter](https://github.com/greypants/gulp-starter) )

```shell
$ touch gulp/config.js
$ echo "'use strict';" >> gulp/tasks/pages-html.js
```

* Edit `config.js` to have a skeletal structure


```shell
$ git add gulp/config.js gulp/tasks/pages-html.js
$ git commit -m "Basic structure for first markdown/html task and gulp config"
```

### On second thought...

```shell
$ git mv gulp/tasks/pages-html.js gulp/tasks/proto-html.js
$ git commit -am "Rename pages-html -> proto-html because it makes more sense"
```

### On third thought...

* add `build` to `.gitignore`

```shell
$ git commit -am "Adding output build for now to .gitignore"
```

### Setting up prototype pages

```shell
$ npm install --save-dev gulp-markdown gulp-rename
```

* Edit `proto-html.js` task (marked, rename)
* Add required config to `gulp/config.js`

```shell
$ git commit -am "proto-html task to convert markdown, rename"
```

### Our first template/plugin

* `$  mkdir src/templates`
* `$ npm install --save-dev gulp-util through2`
* [gist base for first plugin](https://gist.github.com/lyzadanger/ef133432adfd30b7c9eb)

(Not committed)

### git history rewrite

```shell
$ git stash
```

* Make edits to `index.md`

```shell
$ git add src/proto/index.md
$ git commit --amend
```

### Back to our first template/plugin

```shell
$ git checkout -b feature-proto-templates
$ git stash pop
$ npm install --save-dev handlebars
```

* Plugin is a no-op for now with commenting
* Editing `proto-html.js` task to pipe to new `template` plugin

### Basic logic for template plugin

* See `gulp/plugins/template.js` at this commit
* Updates to `config.js`
* Added `src/templates/index.hbs`

### Merge back into master

Our templates plugin isn't done by any means, but it does what we need to proceed.

### Expanding template

* Edits to `index.hbs` to make it a real web page.

I think I don't need to be so descriptive about my commits; people can find them in history themselves! From here on assume that every subhead kind of breaks up commits.

### Default task and webserver

```shell
$ npm install --save-dev browser-sync
```

* Edit `config.js` to add basic config for `browserSync`.
* [gulp + browserSync](http://www.browsersync.io/docs/gulp/)
* Create `watch.js` task
* Create `default.js` task

### Prototyping as a content page; metadata

Let's start to morph the prototype index page into a page that represents some content. In certain kinds of parlance, a _post_. To do this, let's think about what represents a _post_. Content elements and chunks of a typical _post_ on the web include:

* Content (We've already got some of that)
* Title
* Date and time of posting
* Author
* Other metadata and metaclassification data like categories or tags

This is my own site, so I am going to assume myself as author. I'm not immediately concerned with metadata beyond date/time and title. So let's start small.

I like to use front matter.

`$ npm install --save-dev front-matter gulp-data`

* Edit `proto-html` task to pipe to `data` to grab front matter and remove it from markdown contents
* `lodash` for laziness: `npm install --save-dev lodash` (`lodash` for being cool and optimized; `underscore` for documentation)
* Reworking `template.js` gulp plugin to account for available `file.data`.
* Add `{{title}}` to `index.hbs`

(This is where I realize my `proto-html` task hasn't been working as expected for a step or two...debug! aha! Poorly-formed filename for template in `template.js`. Also understanding front-matter's data structure (`data.attributes`)).

Now we have the ability to add and retrieve data to our source content. Onward.
