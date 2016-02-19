## Agnosticity

We do retrieve meta, but we don't know what to do with it.

## What the engine does
- PAGES (and posts)
    - reads the files
    - reads the yfm, writes to pages’ `meta`
    - converts the contents (configurable via callbacks)
    - writes them (where? should be configurable as well, _and_ that config should depend on meta, so maybe callbacks again)
- COLLECTIONS
    - add pages to collections
    - sorting is optional (and configurable)
    ```js
        grdr.PageFromSource(file, site, {})
            .collect(/*...*/);
        // and
        page = grdr.PageFromSource(/**/);
        site.collections.blog.addPage(page, {sorted: {by: 'date', desc: true}});
    ```
- WATCH
    - update all dependable html _and_ collections
    - so we should know where all the sources and targets are
    - and there shouldn't be any detached collections. it's all one big Site object
    - and we should be able to react once a file is added or deleted
        - and update collections somehow