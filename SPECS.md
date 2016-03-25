## Agnosticity

We do retrieve meta, but we don't know what to do with it.

## IN

It seems that all the source files have common traits. They:
- can be watched
- and read
- and parsed/compiled
- and fire some data to its subscribers.

Which means that a function that renders (and writes) observes both (compiled) template functions and its data.

(Duh.)

### Questions:
- How do we customize gathering all the data from single files into model(s)?
- How do we watch for template partials?
    1. Recompile all the templates if a single partials is changed
    2. Tell the engine how to look for partials in the templates (with regexps, for instance). Kinda sucks to do it for the template engine. Then again, Jade has `compileClientWithDependenciesTracked`. _And_ we could always fall back to 1. if 2. is not provided.


## What the engine does
- PAGES (and posts)
    - reads the files
    - reads the yfm, writes to pages’ `meta`
    - converts the contents (configurable via callbacks)
    - writes them (where? should be configurable as well, _and_ that config should depend on meta, so maybe callbacks again)
    - a page doesn't know its `url` until it's written (and we probably should allow using html without writing). and it doesn't know its `next` and `previous` until it's _collected_. so... object composition? callbacks again? or it just plain cannot be overly agnostic of them collections, site etc.
        - btw, `next` and `previous` easily default to `null` or smth. that said, should we give public methods to set it? or maybe these properties should have getters and setters, after all. their values in console.info() are not that important
    - that said, it would be nice to be able to use pages module per se, without collector
    
    ### Page module usage
    ```js
    let pages = require('silkworm/pages');
    pages.setConfig({/*...*/}); // reuses the same (reused) fabric
    pages.newConfig({/*...*/}); // returns a new fabric with different settings

    // should setConfig be lazy? so if we use only newConfigs, initial fabric doesn't go unused
    // but then `pages.Page()` should create a fabric as well
    ```
    

- COLLECTIONS
    - add pages to collections
    - sorting is optional (and configurable)
    ```js
        silkworm.pageFromSource(file, site, {})
            .collect(/*...*/);  // how does lodash combine chained calls with modularity?
        // or
        page = silkworm.PageFromSource(/**/);
        site.collections.blog.addPage(page, {sorted: {by: 'date', desc: true}});
    ```
    
- SITE
    - we need vars for templates
    - one site by default. multiple sites with constructor
    - settings like
    
- TEMPLATES
    - walk and compile
    - Helper/filters. I do believe we should just give a set of data and helpers to a callback and let it feed all that to underlying templates. we shouldn't have to figure out:
        - pure functions (Jade),
        - filters (`swig.setFilter('foobar', (input, idx) => {/* ... */});`)
        - wrappers (lambdas in Mustache)
    
- WATCH/FILEWALKER
    - update all dependable html _and_ collections
    - so we should know where all the sources and targets are
    - and there shouldn't be any detached collections. it's all one big Site object
    - and we should be able to react once a file is added or deleted
        - and update collections somehow