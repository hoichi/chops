# IN

# NOW
### make it useful
- [ ] collections
    - [ ] fix:
        - [ ] update pages wit `prev/next`
        - [ ] `collect().render()`;
    - [ ] render collections themselves
    
### make it right
- [ ] types/interfaces/modules
- [ ] unit tests
    - [ ] look up that Ava/mock-fs recipe
    - [ ] or try to use tape
- [ ] docs

### make it good (AKA 'backlog')
- [ ] minimize unnecessary re-rendering
    - [ ] send `ready` from chokidar down the line (and send the number of files — or the whole fucking tree with it
    - [ ] wait for collections to fill up before emitting (or at least sanctioning) anything down the line. Maybe even `prev/next` setting should be lazy, so we shouldn’t emit `PageCollected`s before collection is go.
- [ ] watch for template partials
- [ ] optimize the `src().write()` case (use plain `cp`)
- [ ] check for sent/expected IDs mismatch (see templates). use timeouts, I guess.
    - [ ] 

### put it out
- [ ] publish typings for js-csp
- [ ] write some posts on js-csp
- [ ] publish (and publicize?) the engine

### Read up:
- [ ] https://medium.com/javascript-inside/generators-and-channels-in-javascript-594f2cf9c16e#.l8zqex5di
- [ ] https://medium.com/javascript-inside/introduction-into-channels-and-transducers-in-javascript-a1dfd0a09268#.6hw47nezr