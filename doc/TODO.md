# IN

# NOW
## better issue planning

- [ ] move issues to GH
- [ ] probably use [gh-board](https://github.com/philschatz/gh-board)

## make it right
### refactorings

- [ ] refactor subscriptions (combine chOuts and subscribers)
    - [ ] and maybe create channels on subscribers actually
- [ ] abstract putting so it’s more debuggable

## Fixes for later

- [ ] does `filter` introduces race conditions? what if we call it after we’ve started transmitting.
- [ ] use real events, like `add`, `change` and `remove`
- [ ] `.patch()`

### more

- [ ] unit tests
    - [ ] Transmitter transparency (pass unrecognized events right away)
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

- [ ] watch for template partials
- [ ] optimize the `src().write()` case (use plain `cp`)
- [ ] check for sent/expected IDs mismatch (see waiting for templates). use timeouts, I guess.
