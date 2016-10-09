# IN

# NOW
### proof of concept
- [x] create a test build script
- [ ] FIX:
    - [ ] when you do `.src('contents/')`, paths are not relative to `contents/`;
        - [ ] by the by, options defaults would fail if we’d actually pass something; 
    - [ ] dirs are not auto-created (use `mkdirp`);
    - [ ] we don’t discern between dir events and file events from chokidar;
  
- [ ] make it work
    - [ ] run default transformers
        - _put opinionated hardcode in one place_
    - [ ] csp.put()
    - [x] `dest() {csp.take(); fs.writeFile();}`

### make it useful
- [ ] templates
    - [ ] watch
    - [ ] compile
    - [ ] render pages w/templates
- [ ] collections
    - [ ] collect pages
    - [ ] csp.put()
    - [ ] render collections
    
### make it right
- [ ] types/interfaces/modules
- [ ] unit tests
    - [ ] look up that Ava/mock-fs recipe
    - [ ] or try to use tape
- [ ] docs

### make it good
- [ ] minimize unnecessary re-rendering
    - [ ] send `ready` from chokidar down the line (and send the number of files — or the whole fucking tree with it
    - [ ] wait for collections to fill up before emitting (or at least sanctioning) anything down the line. Maybe even `prev/next` setting should be lazy, so we shouldn’t emit `PageCollected`s before collection is go.
- [ ] watch for template partials
- [ ] optimize the `src().dest()` case (plain `cp`)

### put it out
- [ ] publish typings for js-csp
- [ ] write some posts on js-csp
- [ ] maybe contribute to js-csp
- [ ] publish (and publicize?) the engine

### Read up:
- [ ] https://medium.com/javascript-inside/generators-and-channels-in-javascript-594f2cf9c16e#.l8zqex5di
- [ ] https://medium.com/javascript-inside/introduction-into-channels-and-transducers-in-javascript-a1dfd0a09268#.6hw47nezr