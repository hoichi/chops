## Feature audit

### What hoichi.io gulpfile does right now
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
- watching

### What can (and should) be done better

#### Configurability
You should be able to:
- change the way yfm/source path is converted to meta
- (or maybe even just should) explicitly add pages to collections
- change where the files are written
- funnel a few source files into one output
    - [ ] api for that
- marry categories/tags’ descriptions with categories and tags from pages’ yfm
    - [ ] now solving the api for that would be epic
- configure collections’ destinations
- reproduce any difference between pages and posts with api calls. Like, those are posts, index them, sort by date, add to rss feed. Those are pages, sort them by title and leave them be.

##### Preconfiguration
- yes, you can go:
```js
chops
    .src(path)
    .convert(d => { return {title: d.yfm.title || 'UNTITLED'} /* ... */})
    .convert(d => { return {content: md.convert(d.content)}})
;
```
or suchlike, managing everything manually.

But you can also go:
```js
chops.content
    .src(path)
    /* ... */
;
```
And at least ensure some defaults for content. (Also, `chops.content.src()` should probably return `ChoppingBoard<ContentPage>`, not `ChoppingBoard<AbstractChop>`.)

Or maybe `chops.src()` should default to `chops.content.src()`.

#### Readability

How about:

```js
    chops.pages({/*cfg*/})
        .src(path)
            .parse(m => md.convert(m))  // is there a case for different markup parsers on different source paths?
            .meta((path, meta) => {
                // merge parameters, add your own. just deep merge by default
                // also, meta can be an object as well, and that is simply merged in    
            })
            .collect(collection1)  // Or vice versa. This (←) way means collections are already created, which might be ok.
            .collect(collection2)
            .render(templates[`basicpage`])
        write(/* path/callback. the latter takes the meta and returns the path */);
```

Or:

```js
siteX = chops.config()
    .parse(m => md.convert(m))
    .meta(callbackX);
```

Collections:

```js
collection1 = chops
    .collection({/*config*/})
    .paginate()  /* is pagination a model concern or a template concern? what would Jekyll do? */
    .write(/* path */); /* Maybe not much use for callback because there's no source meta this callback should process. Still we have to check if the dest. path is present for both pages and collections */
```

## IN

### Questions:
- How do we customize gathering all the data from single files into model(s)?
- How do we watch for template partials?
    1. Recompile all the templates if a single partials is changed
    2. Tell the engine how to look for partials in the templates (with regexps, for instance). Kinda sucks to do it for the template engine. Then again, Jade has `compileClientWithDependenciesTracked`. _And_ we could always fall back to 1. if 2. is not provided.


### Page module usage

```js
let pages = require('silkworm/pages');
pages.setConfig({/*...*/}); // reuses the same (reused) fabric
pages.newConfig({/*...*/}); // returns a new fabric with different settings

// should setConfig be lazy? so if we use only newConfigs, initial fabric doesn't go unused
// but then `pages.Page()` should create a fabric as well
```


###  TEMPLATES
    - walk and compile
    - Helper/filters. I do believe we should just give a set of data and helpers to a callback and let it feed all that to underlying templates. we shouldn't have to figure out:
        - pure functions (Jade),
        - filters (`swig.setFilter('foobar', (input, idx) => {/* ... */});`)
        - wrappers (lambdas in Mustache)

## Data flow

Data can be:
- added;
- changed;
- removed.

On initial build, we should wipe the destination(s) clean. On watch, we can remove the dest files one by one.
(Or can we watch destinations too and remove all the files that are data-starved and all the empty dirs?)

Anyway, if one of several (obligatory) dependencies removed, the dependants down the chain should be removed too: we should check for data sufficiency every step of the way.

If all the dest nodes are emitting file writes as soon as they're ready, the collections are gonna be written over and over as long as new files are read. Unless we're waiting for the reading queue to empty and then, after some debounce maybe, start writing [collections]. Or, for that matter, even rendering them.
And that makes our architecture more convoluted (and quite possibly more coupled). Now we have to not only check for the full model, we have wait for green light as well.
But that's optimisation, not for the proof-of-concept stage. I think I can tolerate collections rewrites for a while.
