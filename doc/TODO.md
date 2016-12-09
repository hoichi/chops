# IN

# NOW
## Make it work
- [ ] where’s my `blog/index.html`?
- [x] make a Renderer transparent (emit all the templates)
- [ ] make multiple filterable Collections work

### make it right
- [ ] types/interfaces/modules
- [ ] fix:
    - [ ] `.patch()`
- [ ] unit tests (Jest or Ava?)
    - [ ] `Transmitter` and all descendants should pass unrecognized events along untouched and unhindered
    - [ ] adding a listener shouldn’t Error when some input channels are missing
- [ ] docs

### checks and debuggability
- [ ] check channel types
- [ ] abstract putting so it’s more debuggable
- [ ] more info on sending stack
- [ ] refactor subscriptions (combine chOuts and subscribers)
    - [ ] and maybe create channels on subscribers actually


### great idea: flow refactoring
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