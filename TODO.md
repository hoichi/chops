# V0.1.0
- [ ] PAGES
    - [x] constructor
    - [x] abstract data setter
    - [x] fromSource
    - no validation
    - [x] export
        we should export something like Page()
        - [x] export pure functions
    - [x] configure common settings once, override what's necessary
    - [ ] tests
        - [ ] functions
        - [ ] constructor
        - [ ] setConfig
        - [ ] setProperties
        - [ ] fromSourceSync
    - [ ] make it work with h.io.
    - [ ] jekyll compatibility (.id etc.)
- [ ] COLLECTIONS
    - [ ] add
    - [ ] fill prev/next
    - [ ] feed them to templates
- [ ] TEMPLATES
    - [ ] compile
        - [ ] template compilation cb
    - [ ] render
        - [ ] page rendering cb
    - [ ] feed data to templates
- [ ] WRITE SHIT OUT
- [ ] GLOBAL MODULE
    - [ ] import submodules
    - [ ] export stuff (try one thing for starters)
    

# PAGE
- [ ] make an abstract constructor/fabric (boilerplate & _nesessary_ data, no file reading)
- [ ] separate meta validation
    - [ ] should necessary meta be configurable? or should meta validation use user callbacks?

# TEMPLATES

# VALIDATION
- [ ] check for compatibility w/some external validator (like [validate.js](http://validatejs.org/))


# TOOLING
- [ ] transpile to, say, node 4
    - [ ] check version compatibility
    
