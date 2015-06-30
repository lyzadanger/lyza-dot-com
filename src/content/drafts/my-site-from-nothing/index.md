---
title: Building my Site from Nothing and Watching it Break
template: post
---

I want to build a new web site. No, strike that, it is *incumbent upon me* that I build a new web site. It's embarrassing and unacceptable the state of lyza.com at present. I can't talk about it. I can't. It's been years.

Before, I blogged. I had in some way blogged back until before the year 2000, before the term *blog* existed and I didn't in fact know what to call my homebrew, database-backed, reverse-chronological list of content. Then eventually I (complicatedly) used WordPress. And then there was languish.

And more languish. And more. Some false starts. Some denial.

It's time to fix this. I want to build the site I want, a site that is a quick-publishing vehicle for content that is likely not aggressively regular in date-spacing, but that does change from time to time. And needs to live forever (URLs, once created, are sacred, in my philosophy).

Times are simpler and more complex simultaneously.


## Set up Environment

This part really was slap-dash and nice and quick. We'll need some basic setup to get our `git` repo squared away, as well as some other basics. These steps really do represent every keystroke I made.

### Git repository

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

### Environment Basics

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

## Get Gulp Going

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

### Expanding on a basic template

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

## Prototyping as a content page; metadata

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

## Time to think about CSS

A few things to sort out:

* Vendor CSS asset management
* CSS pre-processor?
* CSS post-processing?
* At some point, concat and minify

I prefer to `npm install` and `require` all the things, so I'd like to go the `npm` route if possible for managing my CSS dependencies.

After thinking about this:

### Proposed CSS build approach, at least for now

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


#### Fonts

Starting to build up the font stack. Looking at Times New Roman, then Georgia...

Wow, that already looks so much better.

Now for the big leap. I want to use web fonts. Because typography style is so core to what I'm trying to exude (it is a high priority for me), I'm going to use some of my performance budget on nice fonts. I have a TypeKit account, and have selected for my fonts.

> When in doubt, use Caslon. (Old Printers' Adage)

* Body main font: Adobe's Caslon Pro. I use Caslon a lot both digitally and tangibly. I have several Caslon fonts as real metal type in my letterpress collection. Also, I passionately love Caslon's italic ampersand.
* Heading font: I have a liking for Museo Sans, and will use a condensed variant to make my headings more narrow.

The unfortunate reality is that Adobe Caslon Pro is *enormous*. I'm not going to use the bold italic, but just getting regular, italic and bold weights weighs in at over 600k. I may need to revisit this in the future, and try to do some progressive performance enhancement.

I'm leaving my Museo Sans package with more weights than I may use for now. Once I determine the weights I'm using in my styles, I'll remove any unused weights.

I'm also doing some Post-component-specific overrides because I want to treat `h1` and `h2` elements differently inside of posts.

This is not the last of the work I'll do on fonts. I'll come back for performance and other reasons.

#### A few more tweaks before progressing

* Centering some headings
* Making some Post-component-specific adjustments to heading styles
* Putting some basic `pre` and `code` styles in place for the nonce

This isn't a complete layout by a sight, but I want to move on and work on some other areas now.

### Quickies as we move along

* Update watch task to watch for template changes as well as content changes.
* No need to have `<script>` tags in my template; browserSync will auto-inject.
* Noticed boneheaded naming misfire on `.jscsrc`

### Revisiting Templating

To start getting ready to make our `template.js` plugin less of a prototype, I added some error-handling and the ability to cache templates per task-run. I also added `test.md` which we'll use as we start expanding the system here.

#### A post template

Right now we're running a content file that feels post-like through a single template, `index.hbs`. Shouldn't this really be `post.hbs`?

I copied `index.hbs` to `post.hbs`, made a trivial change to the `title` tag and then edited the front matter of this content file to indicate I wanted to use the `post` template, e.g.:

```yaml
---
title: Building my Site from Nothing
template: post
---
```

The `template.js` plugin already has logic in place to look for `template` and, voila, now `index.md` gets processed with the `post.hbs` template.

#### Partials

OK, though, that's not very DRY, is it? We have a `post.hbs` and `index.hbs` template that are essentially copies of each other. Presumably `index.hbs` will go off in another direction and differ somewhat from `post.hbs` but both share, like, headers and footers and stuff. Partials would be nice.

* `$ npm install --save-dev recursive-readdir`

Added a `registerPartials` function to the `template` plugin. Now we can use a shared header and footer in our initial templates. Dried out again for now. Later I should expand on this documentation.

### Browserify

Like postcss allows me to do imports and dependency management via npm, so does Browserify support such a thing WRT client JavaScript. Setting this up with gulp is a *touch* complicated in that there are a number of things I'll need to touch and the gulp tasks themselves are a bit less than fully intuitive.

I'm using `gulp-starter`'s lead on this but am making some minor changes here and there to the approach.

First, I need `browserify` installed as a global npm module. I did this by updating my own `boxen` module (this is a sysadmin task).

There are a number of local npm modules I'll need, too.

#### Install dependencies

`$ npm install --save jquery`
`$ npm install --save-dev browserify browserify-shim vinyl-source-stream watchify`

#### Set up source and config

* Create `src/javascript/site.js` as JavaScript source.
* Edit `packages.json` to add entries for `browserify` and `browserify-shim`
* Add single bundle config to `config.js`
* Add `browserify` task
* Add `watchify` task
* Edit `watch` task
* Add output JS to template

### From Proto to Drafts

The idea all along is that we'll be able to have a publishing workflow. Something akin to bloggin without too much overhead.

One of the core concepts here is being able to work on _drafts_. In the next set of steps I'm going to start adapting the `proto-html` task to be able to work on blog post drafts.

Creating a new directory: `src/posts/drafts`.
Copying this file in, and renaming it to `my-site-from-nothing.md`.

#### New drafts task

I copied the `proto-html` task as a new task: `drafts`. I also edited `config.js` to add a section for `drafts`. Very similar to `proto-html` except I have drafts outputting to a `drafts` subfolder.

No longer will we `proto-html` from the default task, nor will those files be watched. It's drafts time.

Now that creates

`http://localhost:3000/drafts/my-site-from-nothing.html`

when I run gulp.

### Cleanup of proto-html

Don't need this task or its bits anymore. Removing the task, its config, and `src/proto`.

### The furies of gulp

There are points at which one starts banging one's head against walls. `gulp` is a fantastic tool, but it thinks entirely in streams. Which means the `template` plugin I wrote earlier thinks in streams. But what about when I want to process data that isn't "file-like?"

`npm install --save-dev gulp-file` for now

This allows me to "fake" the notion of an `index` file in the new `archive` task. I'd like to do this more elegantly later on, but this will suffice for a scaffold.

* Added new task `archive`, with dependency on `drafts`
* Added new simple template `archive.hbs`. Nothing really going on there for now.
* Added some config for the new task.

### The furies of gulp, redux

After hours (no really) of futzing, I found a vinyl-fs faker I like better. I'd like to swap it in.

* `npm install --save-dev vinyl-fs-fake`
* `npm uninstall --save-dev gulp-file`

Re-plumb the task...that'll do for now.

### Clean up

But the `build/index.html` file is still there from before! Long before! I should put the skeleton of a cleaning task in place. Right now I'll keep this nuclear and just wipe the `build` directory. Can build on this later.

`npm install --save-dev rimraf`

Create a `clean` task.

### The furies of gulp, the reckoning

Finally, I'm going to use a fork of `vinyl-fs-fake` that we worked on at Cloud Four. That means `npm uninstall --save` for `vinyl-fs-fake` then installing `vinyl-fs-fake` via `github` at a particular commit that I know is what I want.

## Design do-over

I hate the CSS I have. No, more specifically: I hate the way things look. I struggle with CSS; you'd never know that I have an undergraduate concentration in graphic design and enjoy letterpress printing as a hobby. Or maybe that's the problem.

I wanna start over.

### Type Do-Over

Back to the drawing board on typography and basic styling.

* I'm not going to deliver >600k of Caslon. Come on, it's just not happening. That would be cruel.
* I'm tired of faking small caps with CSS. It mucks with line-height and looks, frankly, hideous any time a non a-z glyph is rendered. I want to use a real SC font if I'm going to small-caps it.
* The rigorous vertical rhythm is a nice math trick, but I need to at least halve the units I'm working with. The gaps are making me crazy. I can still use a rhythm, but I'm going to allow myself to cut it in half.
* Getting rid of a lot of my `Post`-component-specific CSS by getting the main site `h1` and `h2` out of my face for now. Really, they're the oddballs, not every post.

I still don't love my list styling and some other tidbits, but I feel better about this foundation.

## But will it blog?

Screw design; it's tripping me up. Let's get what the site _does_ in place. I've been long noodling over the bloggy piece of this and for some reason this has given me the greatest technical pause of the whole project to this point. The particular sticky areas are:

* Promoting drafts to posts (and vice versa/unpublishing)
* Dates: determining and recording publish dates and updated dates
* Paths and URLs: Slugs and date involvement, oh my

Right now, I have a workflow that:

* Transforms drafts (`drafts` task)
* Generates a draft index (`archive` task)

### Drafts are also posts

First, let's make the `drafts` task reflect that it's acting on `posts` as well as `drafts`. It's going to be the same task, used by both drafts and posts.

In fact, we can take this further. Consider the transform task that is `drafts` currently. At its core, it's taking markdown, transforming it, compiling it against a `template`. This is certainly applicable for `posts`, but there's no reason it couldn't work subsequently for page content on the site. Assuming I want to write my pages in markdown, which, by the way, I generally do. So, woot.

Because of this, I want to rename the task `content`. I may rue this later, as I generally suck at naming things. Note that the `src` for this task has now been extended to any `.md` file under `content` overall.

### Collating some tasks

Sometimes my gulp tasks have a tendency to get far flung and dependencies tangled. I'm taking a moment here to consolidate several tasks under a `build` task, and invoking the `build` task from `default`.

I'm adding the `npm` module `run-sequence` because I'm tired of fighting gulp 3.x dependencies.

### "Publishing a Draft"

I need a task that will peruse the `drafts` folder, looking for drafts that should be published (turned into real `posts`). Let's use front matter as a way to denote the publishing status of a given piece of content. e.g.

`status: published`

This attribute isn't required in front matter in drafts, and when not there, nothing happens. But if it is set, and its value is `published`, we want something, a new task, to promote that content from `drafts` to `posts`.

In addition, I want to generate a path within `posts` that indicates what the final published URL will be. I like bloggy posts to follow the convention `YYYY/MM/slug/index.html`. To make this easier, I want to move a published draft from `drafts` to `YYYY/MM/slug/index.md` under `posts`.

Then the original draft should be deleted (as it has been copied to `posts`).

The goal of the `publish` task, then, is to move drafts marked as `published` out of `drafts` to the appropriate place under `posts`.

I'm going to be adding `npm` modules `gulp-ignore`, `del` and `vinyl-paths` to help me on this journey.

#### Dates and Paths

First, let's assume that we by default use the current date and time for a draft to determine its publish date. We'll build on this later.

I like to use `moment` for date-time manipulation.

I can see in my first prototyped variant a few places that _could_ be more elegant, but making them more elegant doesn't seem to benefit me too much (this _is_ my site after all). So I'm going to leave a few things more free-form in the `publish` task for now.

As it stands at this very point, the `publish` task will take a given draft that has `status: published` in its front matter and move it into `content/YYYY/MM/DD/post-filename.md`.

Having tested that, I am now going to move the draft _back_ into `drafts` before committing my changes.

#### Slugs and stuff

As of my last commit, `drafts` are moving into `content` in the right path (date-composed) but still maintaining the original filename. I'd like to use the `title` front matter to generate a URL-friendly slug, and also make that part of the path, renaming the resulting final file `index.md` for the directory at hand.

Time to `npm install` `node-slug`.

I'm going to make what I am currently coining a *tack commit*, sort of like when you put a tack-nail or two into something you're building but you haven't fully fine-tuned, aligned, glued or clamped. My task is messy but functional.

##### Cleanup

I'm feeling the need for a utility function to run post/draft front matter through to get a resultant `file.data` object with some consistent defaults. That's why I let `buildPostPath` get messy in the `publish` task: I'm starting to flesh out what I need in that utility function.

That means I'm going to create some gulp `utils`.

Another tack-commit with some additions to `utils/blog.js`.

##### Publish Date is killing me

All right, so this has been whacking me on the side of the head for some time. There are a couple of pieces of metadata that _could_ be hand-managed in front matter but likely will be defined by the build itself:

* Publish date (defaulting to when the publish task runs)
* Original publish URL and slug (in case later edits change the title; we want to keep the URL constant if possible)

After a considerable spate of hand-wringing (hours, wasted paragraphs, a few lame spikes) I've come to terms with doing something I'm mildly uncomfortable with because its simplicity is much higher than any immediately-obvious alternative. I'm going to modify the YAML front matter in certain circumstances during this publish step. I don't like this because YAML front matter feels like it should be managed by humans, not machines, but I am going to do this. I need to deal with my angst.

#### Publishing Step 1 Complete

The `gulp` publish task now does the following:

* Looks for posts in the `drafts` folder(s) that contain a value of `published` for the front matter attribute `status`.
* It figures out where that draft should go—what the publish date, path and slug should be—based on the publish date (either entered by hand in front matter, or, more likely, the current date and time), slug (derived from the title unless hand-entered) and path (derived from config permalink settings unless already extant in front matter).
* It copies the draft into the `content` folder under the appropriate path and slug.
* It deletes the original file out of drafts.

To accomplish this, part of the `buildPublishData` function in the `blogs.js` gulp utility module manages the existence of some `publish` data in front matter. If any of it is missing, it will extend and write additional YAML. It will not overwrite any existing `publish` YAML data and it will leave all other YAML alone. This felt like a good compromise.

You can run the `gulp publish` task as of commit `77a1555` to see what happens to the `test-publish-post.md` draft and the resulting metadata in the YAML front matter.

ONWARD. JESUS.

### Unpublishing

Unpublishing came with its share of complexities, also. Moving a post back into drafts leaves a trail of potentially empty directory trees. Writing a little module to traverse and remove empty directory structures took me a while (`prune-dirs`). Munging paths and making sure we don't over-nest also happened.

Then there was cleaning up and tightening of configs.

Now I can publish and unpublish to my heart's content by changing the `status` attribute's value (`published`, `draft`) and running `gulp publish` or `gulp unpublish`.

## Returning to content templating

I want to return my attention to the `gulp content` task, once again completely changing what it does for the time being. Let's ignore `drafts` for the moment and instead use `content` to promote template-able `src/content` out to the built area.

Now `content` will take all posts in the `src/content/posts` tree and template and build them out.

### Pages

Oh, my it is easy to drop in a `pages` directory, add an `index.md` file, set it to use the `index` template (see `templates/`) and add `pages` to the `src` globs for `content`. Now I can make pages for my site and I made a quick stand-in landing page.

## Other Assets

I want a basic asset pipeline for general images, and a way to easily associate images with posts (post-related images).

I want something simple and quick. Goals:

* Easy to drop images somewhere
* Easy to link to images from posts and pages
* Images optimized automatically to some extent
* Image directories possibly associated with a given post, for ease of naming. This part is more challenging.

## Requires a re-think

To make a sane asset pipeline, I'm going to need to associate posts/drafts with their assets, which means drafts and posts always need to be in their own directories, not just added under `drafts`. This required a refactor of the publish/unpublish tasks, as well as adding a new `move-files` utility to move a post's assets along with it. Using the `q` (for managing promises) and `mv` modules for this.
