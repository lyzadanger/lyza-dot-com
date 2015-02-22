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

### Semantic post markup

Time to refine the markup in `index.hbs`, which will ultimately become our `post` page template.

TIL: With Chrome user-agent stylesheet, `h1` is rendered larger than an `h1` that is a descendent of `article`, `section`, `nav`, or `aside`.

### Time to think about CSS

A few things to sort out:

* Vendor CSS asset management
* CSS pre-processor?
* CSS post-processing?
* At some point, concat and minify

I prefer to `npm install` and `require` all the things, so I'd like to go the `npm` route if possible for managing my CSS dependencies.

After thinking about this:

#### Proposed CSS build approach, at least for now

* Use `gulp-postcss` as a workflow tool to run CSS through post-processors
* Use `cssnext` as a postcss-supported CSS postprocessor to do some transformations on my CSS, including the ability to `@import` from `node_modules`. Now we can install CSS utilities as node modules and import them.
* `npm install --save-dev gulp-postcss cssnext suitcss-base`
* Create `src/styles/styles.css` and add a simple test rule (making H1s red)
* Create `gulp/tasks/styles.js` and add config for the task.
* Add `css` task to `default` task.
* Add `css` to `watch` task.
* `@import suitcss-base`
* Add `link` tag to stylesheet in `index.hbs`

### Basic CSS Sculpting and Typography

Let's do a bit of what they call "Responsive Design", shall we? This is always a challenging part for me. Suddenly our world is very vast.

First I'll add some more semantic class names to the index.hbs template. I'm following the naming conventions of suit.css. These are new to me; the capitalized component naming scheme is going to take some getting used to. But at least the element/modifier naming is less underscore-happy than some.

I'm going to start, roughly, at a narrow screen and feel my way out. To do this, I set `max-width` on the `body` to `24em`, which is about 384px.

#### CSS 4 Stuff

* CSS variables
* CSS calc

(CSS Next transpilers).

#### Vertical Rhythm

Managed by setting some variables and using calculations on them. Basic, strict vertical rhythm carried through heading elements (`h1` through `h4`).

#### Vertical Rhythm for Medium-width screens

As we get wider, ultimately we'll want to introduce a bit more line-height. Narrow screens have a 1.4 line height rhythm, but medium screens will have 1.5.
Adding in a breakpoint and handling the calculations.

We'll use a custom media query (`--medium-viewport`) and adjust our vertical rhythm. Why no `--wide-viewport` or equivalent? Because I don't think I'm going to let text columns get much wider than `40em` anyway.

As an aside, I know I am going to want to re-tool _where_ on elements margins are. Right now most of them are `margin-top` but a few split the margin between top and bottom.

#### Other layout elements

> Block quo­ta­tions are some­times un­avoid­able. Some­times, ac­cu­racy de­mands ex­ten­sive quoting.

> But pay at­ten­tion to length. Writ­ers some­times put vo­lu­mi­nous ma­te­r­ial into a block quo­ta­tion in­tend­ing to sig­nal “Hey, I quoted a lot of this source be­cause it’s re­ally im­por­tant!” The ac­tual sig­nal a reader of­ten gets is “Hey, I didn’t write any of this, I just cribbed it from some­where else!” The reader’s next thought is usu­ally “Great, I can skip this,” or “How is this relevant?

1. I want to get a few other kinds of elements in place
2. Including ordered lists and block quotes
3. And make sure <small>small text</small> looks OK

These basic elements I'll take care of now. If there are additional elements that need styling, I'll style them as they come up.

#### Post component

I'm creating a very, very basic CSS file for the `Post` component so that I can get the text off the left wall for narrow screens. That's all I'm doing, and then using `@import` to get it in place.

#### Colors

Adding a few colors for: main text color, contrasting printer's red (which I'll use in moderation ultimately), a link color which I may end up adjusting. Also killing link styling for now; will re-address later.
