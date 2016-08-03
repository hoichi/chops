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



function SourceWatcherFabric(globs) {
    if (!(this instanceof SourceWatcherFabric)) { return new SourceWatcherFabric(); }

    /* privates */
    var _globs,
        watcher;

    function SourceWatcher() {
        _globs = globs;
        watcher = chokidar.watch(globs);
        return this;
    }

    Object.defineProperties(SourceWatcher.prototype, {
        src: {
            enumerable: true,
            value:  function() {
                var source = Rx.Observable.create(
                    function (observer) {
                        observer.onNext(/* some chokidar values */);
                        // observer.onCompleted();
                        // observer.onError();

                        return Rx.Disposable.empty; // or do we need to dispose of smth?
                    }
                );
                return this;    // return Observable?
            }
        }
        // todo: test it
        // todo: use chokidar and fill the map asyncronously
    });

    return new SourceWatcher();
}

export default SourceWatcherFabric;