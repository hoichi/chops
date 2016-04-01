## IN

It seems that all the source files have common traits. They can:
- be watched
- be read
- be parsed/compiled
- fire some data to its subscribers.

Which means that a function that renders (and writes) observes both (compiled) template functions and its data.

(Duh.)

## Collections

```js
site.collections === {
    rss: {/**/},
    tags: {
        'js': {/*all the posts*/},
        'oop': {/**/},
        'brainfart of the day': {/**/}
    },
    blog: {/**/},
    categories: {
        'blog': {/**/},
        'projects': {/**/}
    }    
}
```

```js
    site.collections['blog']
        .render(/**/)
        .dest();
```

## Data
We can basically merge any data any way. Like, take a few files and some config and build a page out of it.

I do believe all those mergers are not the v0.1 stuff, though.

- [ ] integrate (some) lodash