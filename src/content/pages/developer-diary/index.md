---
title: "Lyza's Developer Diary"
blurb: "A no-holds-barred record of stuff I did, broke, learned and mastered."
template: article
---

## Background

*January 7, 2016*: Perusing my RSS feeds today, I stumbled upon an article called [Four Ways to Improve Your Code in 2016](http://thenewcode.com/349/Four-Ways-To-Improve-Your-Code-In-2016). I was both compelled (I can't resist listicles) and skeptical (listicles are manipulative). I found a gem in it that made me stop and think, and I'm going to quote it in entirety here because I think it's good and useful:

> Developers tend to be so busy hacking on code that it’s easy to take for granted the immense progress made in a year. Unfortunately, doing that also inevitably means forgetting a portion of what we’ve achieved. To act against this, **keep a log of the discoveries** you’ve made while developing. The best possible way to do this is to blog it: doing so shares your work with the community, but many developers hesitate in doing so, as writing up a good blog post can take a considerable amount of time, and not everyone wants to put their work in public. But many alternatives exist: you could save interesting code as a gist, or in a simple blogging platform like the offering provided by CodePen.

> It’s also very useful to keep note of _mistakes_: assumptions made and confusions encountered. While often wince-inducing, writing them down allows you to _acknowledge_ the errors and learn from them, rather than brushing them under the rug.

The value of this idea is in its risk, in the way it could push me into a challenging vulnerable state. To put something in a list means that it is something _I did not know before_ and means admitting ignorance when it happens. Admitting mistakes I'm less nervy about. We'll see how this goes.

As an escape mechanism, I plan to keep this under wraps for a few weeks until I'm certain I'm adding content regularly. I don't want to create an immediately-abandoned list.

## January 2016

### Week of January 4-8, 2016

This week I have gone from 0 to...something functioning with **[vagrant](https://www.vagrantup.com/)**. I've had some exposure to `puppet` via [boxen](https://github.com/cloudfour/cloudfour-boxen) but `devops` sure isn't my bag, overall. I was able to work with another colleague and get an environment spun up for some internal WordPress development (I know! Remember WordPress? Turns out it's still a peculiar development environment).

As part of this, I've gotten to know **`brewcask`** quite a bit better, and have been switching some things I previously managed with standalone boxen/puppet modules over to use the `brewcask` provider because, duh. Before, `brewcask` was something I'd heard of, but for whatever reason I hadn't processed it as "the `brew` way to manage binaries."

For some work related to the book I'm writing: for the first time in a year or two I got nerdy with **[`pandoc`](http://pandoc.org/)**, which is still pretty amazing for a lot of stuff. I wrote a node script to auto-convert some markdown source to PDF so editors could read it more easily. [This post by Georgiana](http://www.tekkie.ro/blogging/create-pdf-files-from-markdown-sources-in-osx/) was super helpful for the last mile. I also learned that installing `pandoc` via `brewcask` takes, like, a minute or two compared to using the boxen/puppet module which could take, I am not exaggerating, hours.

Adding a new `helper` for **`handlebars`** on my own site sent me running back to handlebars' site to try to find documentation on `options.hash`, which took me a while to find because it's on the  [Expressions](http://handlebarsjs.com/expressions.html) page. I wonder if the organization for handlebars' documentation trips anyone else up or if I'm just unique in my mental model of things.

As the week goes on, I am tiring of fighting `boxen` and other provisioning-related things. I am running up against [sudo issues](https://github.com/boxen/puppet-brewcask/issues/22) with `brewcask` and spent a while troubleshooting `ruby` and `bundler` versions vis-a-vis `boxen` for a co-worker. I feel tired and uninspired with that.

I have clued in on the [Generator Coroutine](https://github.com/thalesmello/exploring-async/blob/master/exploring_async.md#generator-coroutines) as a possible balm for my occasional tangle of Promise piles.

I have spent some time reading and thinking about [AirBnB's JavaScript Style Guide](https://github.com/airbnb/javascript). The _default_ and _emphatic_ use of `const` floored me at first; I'm still coming to terms with it. A few gems in here, like a link to [why `typeof` is no longer a safe operation](http://es-discourse.com/t/why-typeof-is-no-longer-safe/15) (bah).

This led me to re-reading style guides by [Google](https://google.github.io/styleguide/javascriptguide.xml), Rick Waldron's [Idiomatic JS](https://github.com/rwaldron/idiomatic.js) and a few other, and re-assessing a couple of my own inconsistencies. Is it dorky to find this stuff kind of inspiring?

### Week of January 9 -

Learned about better ways to manage multiple git users and SSH keys, in my case pertinent to a private instance of gitlab not connected to my github user or email. [This gist](https://gist.github.com/jexchan/2351996) helped.

#### Service Workers

I am doing much research and tinkering with **Service Worker** this week.

I found a hitherto-unfound-by-me [debug resource from Chromium](https://www.chromium.org/blink/serviceworker/service-worker-faq).

I stumbled onto a [`console.log` staleness bug](https://code.google.com/p/chromium/issues/detail?id=543104&q=service%20worker%20event&colspec=ID%20Pri%20M%20Stars%20ReleaseBlock%20Cr%20Status%20Owner%20Summary%20OS%20Modified#makechanges), or, if not bug, at least...confusion. I'm glad to find that it is probably this `console` issue, not how it was suggesting itself to me initially, which was a more severe problem with `addEventListener` behavior in service worker lifecycles.

I realized one cannot rename the file that is an installed service worker on a given site, at least not without massive pain, because it doesn't uninstall.

### Week of February 15

Trying out generating `.eslintrc` using a Yeoman generator: `npm install -g generator-eslint` (assuming I have `yo` installed globally as well). Ended up having trouble installing...onward.
