# IN
- [ ] try and define levels for events (from upstream to downstream)
- [ ] chokidar   @net
- [ ] stampit   @net
- [ ] ES docs to Zeal
- [ ] noops obs link (that just passes data through)

# V0.1.0
- [ ] create event system
    - [ ] use EventEmitter
    - [ ] module
    - [ ] tests
// for templates and data, write pure function first. chainable calls are for v0.2
- [ ] TEMPLATES
    - [ ] compile
        - [ ] listen (to template changes)
        - [ ] template compilation cb
    - [ ] feed data to templates
        - [ ] listen (to data)
    - [ ] render
        - [ ] page rendering cb
        - [ ] emit (the rendered html)
    - [ ] tests
- [ ] PAGES
    - [ ] use fs-jetpack
    - [ ] use events
    - [ ] read and emit
    - [ ] watch for globs
    - [ ] listen and write
- [ ] COLLECTIONS
    - [ ] listen and add
        - [ ] fill prev/next
    - [ ] emit
- [ ] DATA transformation
    - [ ] path→meta→url
            that would be reducers, right?
- [ ] GLOBAL MODULE
    - [ ] import submodules
    - [ ] export stuff (try one thing for starters)
    - [ ] use with h.io
    - [ ] bundle on `prepublish`
  
# CLEAN UP
- [ ] move all things possible to different modules
- [ ] clean up func specs

# PAGE
- [ ] jekyll compatibility (.id etc.)
- [ ] separate meta validation
    - [ ] should necessary meta be configurable? or should meta validation use user callbacks?

# DATA FLOW
- [ ] transformations
- [ ] traffic lights

# TOOLING
- [ ] transpile to, say, node 4
    - [ ] check version compatibility

# maybe
- [ ] RxJS
    - [ ] install
    - [ ] rtfm
- [ ] Immutable.js
- [ ] stampit
