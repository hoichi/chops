## Agnosticity

We do retrieve meta, but we don't know what to do with it.

## What the engine does
- PAGES (and posts)
    - reads the files
    - reads the yfm, writes to pages’ `meta`
    - converts the contents (configurable via callbacks)
    - writes them (where? should be configurable as well, _and_ that config should depend on meta, so maybe callbacks again)
    - a page doesn't know its `url` until it's written (and we probably should allow using html without writing). and it doesn't know its `next` and `previous` until it's _collected_. so... object composition? callbacks again? or it just plain cannot be overly agnostic of them collections, site etc.
        - btw, `next` and `previous` easily default to `null` or smth. that said, should we give public methods to set it? or maybe these properties should have getters and setters, after all. their values in console.info() are not that important
    - that said, it would be nice to be able to use pages module per se, without collector
- COLLECTIONS
    - add pages to collections
    - sorting is optional (and configurable)
    ```js
        silkworm.PageFromSource(file, site, {})
            .collect(/*...*/);  // how does lodash combine chained calls with modulatiry?
        // or
        page = silkworm.PageFromSource(/**/);
        site.collections.blog.addPage(page, {sorted: {by: 'date', desc: true}});
    ```
- WATCH/FILEWALKER
    - update all dependable html _and_ collections
    - so we should know where all the sources and targets are
    - and there shouldn't be any detached collections. it's all one big Site object
    - and we should be able to react once a file is added or deleted
        - and update collections somehow