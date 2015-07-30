---
title: "Lyza's Index: July 30"
tags:
  - life
  - til
template: post
status: published
blurb: In which I mention a few things I learned.
publish:
  slug: lyzas-index-july-30
  date: '2015-07-30T23:12:59.176Z'
  path: 2015/07/30/lyzas-index-july-30/index.md

---

* [Aerogel](https://en.wikipedia.org/wiki/Aerogel) is so not-dense that it's hard to see the edges of it, which tend to diffuse into nothingness subtly. (for more, read: [*Stuff Matters: Exploring the Marvelous Materials that Shape our Man-Made World*](http://www.amazon.com/Stuff-Matters-Exploring-Marvelous-Materials/dp/0544236041) )
* In Naples, there are DOC-designated pizzas. If you make a margherita pizza with the wrong kind of tomatoes or mozzarella, you're not in the club.
* Perhaps Charles Lindbergh's greatest feat in his first transatlantic flight was that he found the airfield in Paris after flying from New York using *dead reckoning*. Imagine that. (for more, read: [*One Summer: America, 1927*](http://www.amazon.com/One-Summer-America-Bill-Bryson-ebook/dp/B00C8S9VKM/ref=sr_1_4?s=books&ie=UTF8&qid=1438297354&sr=1-4&keywords=bill+bryson) )

The following is nifty ES6/JS 2015 goodness:

```javascript
class Whatever {
  constructor({
    foo = 'bar',
    baz = 'bing'
  } = {}) {
    // Yeah, baby
    console.log(foo); // => 'bar' by default
  }
}
```

Hat-tip to [@tylersticka](https://twitter.com/tylersticka) on that one!
