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

// mind: rx-book is about RxJS 4, but 5.0 is already in beta 10


function SourceWatcherFabric(globs, options) {

    return Rx.Observable.create(obs => {
        let watcher = chokidar.watch(globs, options);
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
                throw Error(errMsg);    // that should work. but what is Observable.throw, anyway?
            })
        ;

        return Rx.Disposable.empty; // will we ever need to dispose of smth?
    });
}

function packageFileEvent(event, path) {
    // todo: read content
    // todo: parse path
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

