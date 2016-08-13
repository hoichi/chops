/**
 * Created by hoichi on 28.07.2016.
 */

import * as chokidar    from 'chokidar';
import * as fj          from 'fs-jetpack';
import * as Path        from 'path';
import * as Q           from 'q';
import * as Rx          from 'rxjs/Rx';

var     readFile = Promise.promisify(require("fs").readFile);

/*
RxJS
!! Observables are able to deliver values either synchronously or asynchronously.

- http://reactivex.io/rxjs/manual/overview.html#anatomy-of-an-observable`
- http://xgrommx.github.io/rx-book/content/guidelines/introduction/index.html#request-and-response
*/

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
        let watcher = chokidar.watch(globs, options)
            .on('all', (event, path) => {
                packageFileEvent(event, path, options.cwd)
                .then(chop => obs.onNext(chop));
            })
            .on('ready', () => {
                /* if we’re just building once, call obs.onCompleted()
                *  if we’re watching, say we’re ready and stay on guard;
                * */
            })
            .on('error', err => {
                throw Error(err);
            })
        ;

        return Rx.Disposable.create(() => watcher.stop());
    });
}

function packageFileEvent(event, path, cwd = '.', cb) {
    let parsedPath = parsePath(path, cwd),
        chop = {
            path: parsedPath,
            id: path    // for primary key. I'll think about dealing with multiple cwds later.
        };

    if (['add', 'change'].includes(event)) {
        return  fj.readAsync(path)
                .then(rawCont => {
                    chop.raw = rawCont;

                    return {
                        event: event,
                        chop
                    }
                })
                .catch(err => {
                    throw Error(`Exception while reading ${path}, error message: ${err.message}`)
                });
    } else if (event === 'unlink') {
        return Q.fcall(() => {
            return {
                event: event,
                chop
            }
        });
    } else {
        // todo: reject?
    }
}

/*
 * Returns an object in our standard format: {path, content, meta}
 * Or should we have `source` instead of `path`? For different types of source?`
 */
function readFileAsChop(path, {encoding = 'UTF-8', cwd='.'}) {
    // check if the path exists, maybe? oh, oh, chokidar
    fs.readFile(path, {encoding}, (err, data) => {
        if (err) throw err;

        return {    // async as fuck
            content: data,
            path: parsePath(path, cwd),
            meta: {}
        }
    });
}

/*
 * Takes a path (and a working dir)
 * returns an object with:
 * - file base (sans extension)
 * - an arr of parent dirs
 * */
function parsePath(path, cwd) {
// todo: check if file actually exists? or is senseless if we get it from Glob or smth? it kinda should fail gracefuly if it't removed by the time we get here
    let sep = Path.sep,
        {root, dir, base, ext, name} = Path.parse(path),
        rel = Path.relative(cwd, dir),
        dirs = rel.split(sep);

    return {
        dir,
        dirs,
        ext,
        name,
        path,
        rel
    }
}


export default SourceWatcherFabric;

