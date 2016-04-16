# IN

# V0.1.0
- [ ] create event system
    - [ ] make collections
        - [ ] create api
        - [ ] write tests
        - [ ] make it work
        - [ ] and only then move boilerplate to transmitter
    - [ ] basic stuff, without any throttling, queues etc.
        - [ ] data transmitting
            - [x] write
            - [ ] test
    - [ ] implement 
    - [ ] module
    - [ ] tests
// for templates and data, write pure function first. chainable calls are for v0.2 at least
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
