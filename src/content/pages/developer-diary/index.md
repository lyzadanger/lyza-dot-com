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
