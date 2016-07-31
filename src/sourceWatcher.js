/**
 * Created by hoichi on 28.07.2016.
 */

import * as chokidar from 'chokidar';
/*
* .src() eats globs, rounds up the files and spits out their contents, together with path info.
*   - it provides bare file contents together with path info
*   - it should somehow understand partials and dependencies on ’em
*   - it should come before yfm parsing or template compilations, because it’s agnostic of all this.
*       so no `template().src()`
*
* what should it return? something very chainable. the mystery chop should:
* - watch globs (so have a chokidar watcher inside)
* - channel site settings (that’s an advanced topic though)
* - stream collections, transform collections, return more collections
* - do it all lazily (iterators? aren’t they kinda pull?)
*
* */

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
                return this;
            }
        },
        compile: {  // should it be just a universal .map()?
            enumerable: true,
            value:  function() {
                return this;
            }
        },
        // todo: `this` should be an empty map
        // todo: test it
        // todo: use chokidar and fill the map asyncronously
    });

    /* todo: just create a chainable that*/

    return new SourceWatcher();
}

export default SourceWatcherFabric;