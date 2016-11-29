# IN

# NOW
## Refactor!
- [ ] Test’n’fix what I’ve refactored
    - [ ] 'Page' is hardcoded for FsWatcher (but I use it to watch templates)

### make it right
- [ ] types/interfaces/modules
- [ ] unit tests (Jest?)
    - [ ] `Transmitter` and all descendants should pass unrecognized events along untouched and unhindered
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