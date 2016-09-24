---
permalink: false
published: false
title: Feeding JSON data to Jade templates via a Gulp script
slug: json-to-jade-via-gulp
---

Suppose you build something with Gulp using Jade templates. Suppose you have some data you've put to JSON. Lots of reason to do that. As succint as Jade is compared to HTML it's still not succint enough if you want to prototype a long list of remotely complex data. Any changes you want to make to the structure of your data or the presentation thereof, and you have to copy and paste all over again. And forget about storing big arrays in Jade itself, because Jade doesn't seem to support multi-line JavaScript (unless we're talking about output to `<script>` tags.

So. We have Gulp. We have [gulp-jade](https://www.npmjs.org/package/gulp-data). Its page mentions it's working with [gulp-data](https://www.npmjs.com/package/gulp-data) and even gives us a couple examples. Here's what we can write in our `gulpfile.js`:

```javascript
var gulp = require('gulp'),
    data = require('gulp-data'),
    jade = require('gulp-jade');

gulp.task('templates', function() {
  return gulp.src('./src/jade/*.jade')
    .pipe(data( function(file) {
                  return require('./src/jade/data/the-big-data.json');
                } ))
    .pipe(jade())
    .pipe(gulp.dest('./dest/'));
});
```

Right? But how do we access that big, big data from within Jade? Took me a while to figure out since I didn't really dive deep into Gulp or Node streams yet, and Jade documentation is not really helpful in that particular respect.

Luckily, turns out is pretty simple. Suppose this is your JSON:

```javascript
{
  "myVar1": "I AM A STRING!",
  "myVar2": "BUT NOT _THE_ STRING!",
  "myArray": [
    "key1": {"title": "Untitled", "tags": ["tags", "are", "so", "2005"]}
    "key2": {};
    // etc.
  ]
}
```

Here's what you do in Jade:

```jade
- var strings = [myVar1, myVar2]

//- or:
p.dialog=myVar1
p.dialog=myVar2

//- or
each val in MyArray
  +WorkThat(val)
```

You can use every variable from your JSON's root! Real simple. Unless your JSON looks like this (happens to the best of us):

```javascript
[
  { "title": "Title 1",
    "items": []
  },
  { "title": "Title 2",
    "items": []
  }
  // etc. etc.
]
```

How do you approach this suitcase without a handle? Damn if I know. Maybe there is some global variable, maybe there isn't. I don't even know whether it's legit JSON. But you can always change it to this:

```javascript
{ "myHugeBigMammothOfData" =  [
                                { "title": "Title 1",
                                  "items": []
                                },
                                { "title": "Title 2",
                                  "items": []
                                }
                                // etc. etc.
                              ]
}
```

And that's about it so far. Of course they say that going all `require()` on a po' JSON file wouldn't work in a `watch` task, but that's a whole other story, I guess.