## IN

It seems that all the source files have common traits. They can:
- be watched
- be read
- be parsed/compiled
- fire some data to its subscribers.

Which means that a function that renders (and writes) observes both (compiled) template functions and its data.

(Duh.)

## Collections

A chainable `.collect()` can return a page with a (`prev`/`next`) set. otherwise it returns the same unchanged object.

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

### Data Flow

<chokidar (or its wrapper)>
    ↓           (chokidar _new_/_changed_; **path**)
<file reader>
    ↓           (**meta** (+path), **raw content**, **url**)
<markup converter>
    ↓           (**meta**, **html content**)
<url builder (default or configurable)>                 // That can be an RxJS-like, and not multicast at all.
                                                        // Yes, it should be _set up_ chainably, but can be actually _executed_ at the same level as markup converter, whenever we have enough data available 
    ↓           (**meta**, **html content**, **url**)
<combiners (maybe)>
    ↓           (**a page build of a few more**)
<collector> →   <collection>
    ↓           (**meta**, **html content**, **url**, **prev/next**)
<renderer>  ←   <template compiler>
    ↓           (**a built page**, **meta**, **url**)
<file writer>