## IN
- `Transmitter` and all its descendants should pass unrecognized events along untouched and unhindered
-

## Needs

_What do we need for a running prototype?_

Frankly, not much. For a proof-of-concept, we can:
- read files;
// (read yfm, parse markdown)
- emit, observe
// (reduce, hardcodedly)
- emit, observe
// (collect)
- emit, observe
// (having template read and compiled beforehand, render pages)
- emit, observe
- write files

So we can start with a linear prototype that simply convert singles to singles and then add collections and templates as observables.

## Collections

Collection:
- accepts events
- counts `addSorted`s
- if a `.filter()` was set
    - immediately passes down the pages that don’t satisfy the filter
    - those that do, collects, hinders, mutates
- waits for `ready` and the required amount of `addSorted`s
- sorts and updates pages (it it wasn’t done in the process)
- passes down all the pages it collected
- passes down the collection
    - if there was a `.slice()` or `.takeN()`, slices the sorted list
    - passes the list down


A chainable `.collect()` (or something like `collectPrimary()`) passes down a page with (`prev`/`next`) set.

Page has to have a Collectable data to be collected. The page returned after collection is both a Collectable and a Collected, so it can be collected a few times over.

Any page has data of all the collections it’s added to, so you can use it in templates. Still better have basic `prev`/`next` for a primary collection.


### C. Data Flow

Listens: to source changes (`addSorted`/`change`/`remove`)


## Data

### From calls to actions

This:
```js
chops.src('content/blog/*.md')
    .convert(s => markdown(s))
    .set( (meta, path) => {
        slug: path.name;
        date: meta.date | new Date();
    })
    .collect(
        collections[blog],
        collections[rss]
    )
    .render(templates['blog'])
.dest('build/');
```
should result in these steps:

1. File gets read, its yfm, if present, parsed into `meta`, its path parsed into `path`.
2. All the transformations from `convert`, `set` &c happen here. If we add data from other sources, it happens here, too.
3. We check that all the necessary data is ready.
4. Collect: add to collections, set `prev/next`
5. Wait for collections to fill, ensuring we’re ready to render (including correct `prev/next` for singles).
6. Render pages and collections, write them to dest. I think it makes sense to start writing at once, so that

### Laziness
Things like reading files should run ASAP: it doesn’t depend on anything and it takes time, so the sooner we start, the better.

Things like parsing single files _can_ be lazy, I guess.

Things like rendering should definitely wait till the model is complete.

### Transformers

_(Not exactly transducers: we’re talking about the single pages &c, not collections—even though, technically, you **can** reduce objects as well.)_

Some minimal required transformations are always applied to ensure all the necessary meta for collections and rendering exists. Everything user-specified is run afterwards (unless we find a way to safely replace default transformations with user-specified transformations).

All the transformations are applied upon first collection*. Until then, we just hoard ’em.

* Maybe we should abstract that moment into something like `exporting`.



### Model completeness

Before certain steps can be run, we should make sure the model is ready. Two examples:

- Before collecting a page, we should make sure it has every meta needed for collections, all reducers applied to it.
- Before rendering collections (and pages, because their models partly depend on collections) we should make sure we’ve collected everything, so as not to re-render things too often.

Not sure both cases should use the same mechanism, because collections, as far as I can see, are asking for `Observable.onComplete()`, but a single page and its reducers are a single element, not an "array in time", and are rather asking for function composition, ramda-like(?).

### Split on meta
```js
chops.src('content/**/*.md')
    .convert(s => markdown(s))
    .set( (meta, path) => {return {
        slug: path.name,
        date: meta.date | new Date(),
    }})
    .collect( meta => {
        if (meta.category === 'blog')
            return [collections['blog'], collections['rss']];
        else
            return [];
    })
    .render(meta => meta.category === 'blog' ? templates['blog'] : templates['single'])
.write('build/');
```

### Data Flow

<chokidar (or its wrapper)>
    ↓           (chokidar _new_/_changed_; **path**)
<file reader>
    ↓           (**meta** (+path), **raw content**, **url**)
<markup converter>
    ↓           (**meta**, **html content**)
<url builder (default or configurable)>
        // Yes, it should be _set up_ chainably, but can be actually _executed_ at the same level as markup converter, whenever we have enough data available
    ↓           (**meta**, **html content**, **url**)
<combiners (maybe)>
    ↓           (**a page build of a few more**)
<collector> →   <collection>
    ↓           (**meta**, **html content**, **url**, **prev/next**)
<renderer>  ←   <template compiler>
    ↓           (**a built page**, **meta**, **url**)
<file writer>

