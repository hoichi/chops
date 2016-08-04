/**
 * Created by hoichi on 28.07.2016.
 */

const   chokidar = require('chokidar'),
        Rx = require('rx');

// RxJS
// - https://github.com/Reactive-Extensions/RxJS/blob/master/doc/gettingstarted/creating.md
// - http://xgrommx.github.io/rx-book/content/guidelines/introduction/index.html#request-and-response

/*
* .src() eats globs, rounds up the files and spits out their contents, together with path info.
*   - it provides bare file contents together with path info
*   - it should somehow understand partials and dependencies on ’em
*   - it should come before yfm parsing or template compilations, because it’s agnostic of all this.
*       so no `template().src()`
*
* what should it return? something very chainable. the mystery chop should:
* - watch globs (so have a chokidar watcher inside)
* - stream collections, transform collections, return more collections
* - channel site settings (that’s an advanced topic though)
* - do it all lazily (iterators? aren’t they kinda pull?)
*
* */

// todo: `Rx` wrapper for `chokidar`

/* todo: try this:
var source = Rx.Observable
                .readTemplatesSomehow()
                .filter(function (tpl, idx, obs) {
                    return tpl.key === 'article';
                });

source.subscribe(
    nextVal => {console.log('the template is ready, how ’bout the contents?')},
    ...,
    ...
)

And see if the log is getting called when the template gets compiled (it should, shouldn’t it?).
 */

/*
* maybe something like:
* src(...)
*   .foo()
*   .buzz()
*   .rx( o => o
*       .map()
*       .filter()
*       .whicheverRxOperatorYouPlease()
*   )
*   .bar()
* */

// look into: addToObject && addToPrototype
// mind: rx-book is about RxJS 4, but 5.0 is already in beta 10
// todo: look into `ericelliot/Ogen`


function SourceWatcherFabric(globs, options) {   // exactly the thing that should return an observable, eh?
    let watcher = chokidar.watch(globs, options);

    return Rx.Observable.create(obs => {
        watcher
            .on('all', (event, path) => {
                obs.onNext(bundleFileEvent(event, path))
            })
            .on('ready', () => {
                /* if we’re just building one time, call obs.onCompleted()
                *  if we’re watching, say we’re ready and stay on guard;
                * */
            })
            .on('error', errMsg => {
                throw Error(errMsg);    // or Rx.Observable.throw? or what?
            });

        return Rx.Disposable.empty; // will we ever need to dispose of smth?
    });
}

function packageFileEvent(event, path) {
    return {event, path};
/*
    Possible file-related events:
        add, addDir, change, unlink, unlinkDir

    And all of them should sail right to the dest().
    So, even leaving aside the dirs for a sec, adding, changing and removing should exist across all of our nodes.

    Also, separation of concerns:
        - data flow (or is Rx so intrinsic to the whole thing there’s nothing to abstract?)
        - data interfaces and transformation logic
        - dealing with chokidar (which is what this file should do)

    I mean, just reacting to chokidar is fine, but what’s the standard contract this module should adhere to? And is there a standard contract?
    Man, I think I’m architecturally astronavigating once again.
 */
}

export default SourceWatcherFabric;

