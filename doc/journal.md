# April 8 '16

So, how it should look in hoio's case:

## gathering stones
- read all sources (`chokidar.on('ready')`, for instance)
- compile templates
- add sources to collections. also, set prev/next
- convert markup to html. that's somewhat eager, but if conversion is isolated (as in, doesn't require data outside of a single source markup), it doesn't matter much


## step 2
- render single pages
- render collections
- write both

So. We should wait for all the sources to be processed and collected. And how do we know?
1.  Say we wait for the `ready` event. We could event use `persistent: false`.
    Then we know **we've read all the sources**.
2.  Then we collect and convert all the sources. And compile templates (with chokidar as well).
    **Our stones are gathered.**
3.  Then we scatter the stones. Or at least we flush the gates, because the rest probably doesn't matter, unless
    we really expect watching the source to choke anything. So we flush the gates and then re-run chokidar with `persistent: true`.
    
Questions is. How do we know the step 2 is finished? Do we keep an index of all the paths fired by chokidar and stop when it's exhausted?
Say, if we use the whole 'full data' paradigm, every collection can have:
- a list (or a number) of source models that it should process
- and that list or number should be sent to it as well
  so before it gets it, it doesn't have full data anyway, and afterwards it checks what it has against that list (or a number)

That said.
1. We still need an index to know how much we need, don't we?
2. Does that model work when we collect things that have more than one source (which is not the problem hoio has right now, but still)?
3. Isn't it too expensive for every collection to have its own index? (Well, if it's an array of paths, maybe not).
4. How do we deal with `add` events? If we use the counter, we probably need to fire `(data, {counter: newVal})`. If we use the index, the new value can just get added.
    
So. We:
- run the initial watch and wait for `ready`
- send counters or index data downstream
- [then] send [converted] sources (and set prev/next somewhere) downstream as well
- and at that point (or even after we send counters) we're ready to watch. cause now every file on initial watch won't re-render all the collections and all the next/prev file

Or maybe our traffic guard should have a single index, and our collections (and prev/next) should report to that befor emitting anythig downstream.

(Could we also use that index for anything else?)



Or quite another approach would be to avoid sending anything downstream when there are any events upstream. If we can clearly define levels, that might be an easier/more universal solutions that wouldn't even require running chockidar twice. Like, until there's a queue of files being read and parsed, we don't even start collecting them, setting prev/next and shit. That way traffic guards might not be needed.
 
(Again, how likely it is that chokidar events would choke the whole thing so bad that we'll never get downstream? Not really, I'd hazard, but maybe we should take precaution.)

# April 11 '16

Over the last couple of days I've came up with a hybrid approach: our traffic guard sits before collections and keeps a queue of data packages. And when the queue is empty, if fires `ready` to collections (should single pages be subscribed?) et voila.

Still the t-guard probably needs to listen to `ready` from chokidar. I mean, watching (and reading and parsing) files might be slower than collecting them, so we may end up with an empty queue after parsers while file system still has something to say.

Well, the much easier alternative would be debouncing. Might just work, especially for simple cases like static builds. Maybe I should even add some logging and profiling and see for myself.

Anyway, first -- the basic stuff without any throttling, guards etc. Doesn't matter for my minuscule blog.