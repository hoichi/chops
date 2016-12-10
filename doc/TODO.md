# IN

# NOW
## Make it work
- [ ] test if multiple filterable collections work
    - [ ] at least check that they don’t break anything
    - [ ] does `filter` introduces race conditions?
- [ ] use real events, like `addSorted`, `change` and `remove`
- [ ] flush Collectors on `ready`

### Fixes
- [x] where’s my `blog/index.html`?
- [ ] update and send neighboring pages on sortedInsert


## make it right
### refactorings
- [ ] abstract putting so it’s more debuggable
- [ ] refactor subscriptions (combine chOuts and subscribers)
    - [ ] and maybe create channels on subscribers actually
- [ ] abstract flushing
    - [ ] render pages on flushing a renderer
    - [ ] update 'prev/next' on flushing a collector

### fixes
- [ ] fix:
    - [ ] `.patch()`

### more
- [ ] types/interfaces/modules
- [ ] unit tests (Jest or Ava?)
    - [ ] `Transmitter` and all descendants should pass unrecognized events along untouched and unhindered
    - [ ] adding a listener shouldn’t Error when some input channels are missing
- [ ] docs

### checks and debuggability
- [ ] check channel types
- [ ] more info on sending stack


### great idea: flow refactoring`
- every transmitter has its input and output channels declared
- if it has zero inputs it’s added at the beginning
- if it hase some inputs the outputs for which aren’t there yet, it waits for them
- if an output is there, it’s added as a subscriber. and, if it outputs the same type, it gets subsribed to next. So `Renderer("coll")` always subscribes to `coll` and `tplc`, `FsWriter` always subscribes to pageR &c.


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