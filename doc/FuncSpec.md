## Agnosticity

We do retrieve meta, but we don't know what to do with it.

## Feature audit

### What h.io gulpfile does right now
- walks over some Jade and compiles them to a list of functions
- walks over some .md w/yfm and create pages
    - markdown is converted to html
    - yfm is converted to meta
    - is things like source path converted to meta? not sure
- adds pages as posts (a total unconfigurable black box, just `site.addPost(page)`)
- for each added post, renders it with a template and writes the result to `post.path` (no control over that)
- renders the last 10 posts as a blog page and as rss

### What it completely lacks
- Pagination

### What can (and should) be done better

#### Configurability
- you can change the way yfm/source path is converted to meta
- you can (or maybe even should) explicitly add pages to collections
- you can changes where the files are written
- you can funnel a few source files into one output
    - [ ] api for that
- categories and tags can appear in pages' yfm and still have their own descriptions somewhere (maybe even in their own markdowns). meaning you can somehow marry one to another
    - [ ] now solving the api for that would be epic
- collections should have configurable destinations as well (they might not have any other, unlike posts)
    - are `collection.dest()` and `bunchaPages.dest()` necessary? gulp conventions probably say yes. so maybe yes, even if `dest()` has no parameters and just uses defaults from meta.
    - or maybe `.dest()` is just a config thing and the build process should be started by something else.
- any difference between pages/posts should be reproduced with api calls


#### Readability

How about:

```js
    silkworm.pages({/*cfg*/})
        .src(path)
            .parse(m => md.convert(m))  // is there a case for different markup parsers on different source paths?
            .meta((path, meta) => {
                // merge parameters, add your own. just deep merge by default
                // also, meta can be an object as well, and that is simply merged in    
            })
            .collect(collection1)  // Or vice versa. This (←) way means collections are already created, which might be ok.
            .collect(collection2)
            .render(templates[`basicpage`])
        dest(/* path/callback. the latter takes the meta and returns the path */);
```

Or:

```js
siteX = silkworm.config()
    .parse(m => md.convert(m))
    .meta(callbackX);
```

Collections:

```js
collection1 = silkworm
                .collection({/*config*/})
                .paginate()  /* is pagination a model concern or a template concern? what would Jekyll do? */ 
                .dest(/* path */); /* Maybe not much use for callback because there's no source meta this callback should process. Still we have to check if the dest. path is present for both pages and collections */
```

#### Whatchability

Implementing it is a story for another day, but we should still have it in mind.

## IN

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


### COLLECTIONS
- add pages to collections
- sorting is optional (and configurable)

```js
site.pageFromSource(file, {})
    .collect(blog);  // how does lodash combine chained calls with modularity?
// or
page = engine.pageFromSource(/**/);
site.collections.blog.addPage(page, {sorted: {by: 'date', desc: true}});
// or
siteA.readSource('blah')
    .render(/* */)
    .meta(/* */)
    .collect(siteB.collections['crossposts']);
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

## Data flow

Data can be:
- added;
- changed;
- removed.

On initial build, we should wipe the destination(s) clean ($todo: the ability to specify dirs to wipe explicitly). On watch, we can remove the dest files one by one.
(Or can we watch destinations too and remove all the files that are data-starved and all the empty dirs?)

Anyway, if one of several (obligatory) dependencies removed, the dependants down the chain should be removed too: we should check for data sufficiency every step of the way. 

If all the dest nodes are emitting file writes as soon as they're ready, the collections are gonna be written over and over as long as new files are read. Unless we're waiting for the reading queue to empty and then, after some debounce maybe, start writing [collections]. Or, for that matter, even rendering them.
And that makes our architecture more convoluted (and quite possibly more coupled). Now we have to not only check for the full model, we have wait for green light as well.
But that's optimisation, not for the proof-of-concept stage. I think I can tolerate collections rewrites for a while.

