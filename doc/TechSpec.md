## IN

## Collections

A chainable `.collect()` (or something like `collectPrimary()`) passes down a page with (`prev`/`next`) set.

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
2. All the transformations from `convert`, `set` &c happens here. If we add data from other sources, it happens here, too.
3. We check that all the necessary data is ready.
4. Collect: add to collections, set `prev/next`
5. Wait for collections to fill, ensuring we’re ready to render (including correct `prev/next` for singles).
6. Render pages and collections, write them to dest. I think it makes sense to start writing at once, so that

### Split on meta
```js
chops.src('content/**/*.md')
    .convert(s => markdown(s))
    .set( (meta, path) => {
        slug: path.name;
        date: meta.date | new Date();
    })
    .collect( meta => {
        if (meta.category === 'blog')
            return [collections['blog'], collections['rss']];
        else
            return [];
    })
    .render(meta => meta.category === 'blog' ? templates['blog'] : templates['single'])
.dest('build/');
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

### Data chains

Every...basically every chop sent down the chains can be...
    - .put()
    - .patch()’ed
    - .delete()’d

Although... how we do delete? Do we index by source paths? Seems like it, but what if we don’t use `.src()`? Maybe that means that src() should kindly state the primary index.

