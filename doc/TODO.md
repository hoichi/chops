# IN

# NOW
## Refactor!
- [ ] implement `ChainMaker`
- [ ] inherit from `ChainMaker`
    - [ ] so lose `Collectable`
- [ ] implement `convert()` through `addListener()`

### make it useful
- [ ] refactor Collection piped calls
    - [ ] `render` should return `this`
    - [ ] `write` should return `this`
- [ ] refactor ChoppingBoard piped calls
    - [ ] `render` should return `this`
    - [ ] `write` should return `this`
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
- [ ] watch for template partials
- [ ] optimize the `src().write()` case (use plain `cp`)
- [ ] check for sent/expected IDs mismatch (see waiting for templates). use timeouts, I guess.

### put it out
- [ ] publish typings for js-csp
- [ ] write some posts on js-csp
- [ ] publish (and publicize?) the engine

### Read up:
- [ ] https://medium.com/javascript-inside/generators-and-channels-in-javascript-594f2cf9c16e#.l8zqex5di
- [ ] https://medium.com/javascript-inside/introduction-into-channels-and-transducers-in-javascript-a1dfd0a09268#.6hw47nezr