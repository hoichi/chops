/// <reference path="../typings/index.d.ts" />
/// <reference path="streaks.d.ts" />
import * as chokidar    from 'chokidar';
import * as fs          from 'fs';
import * as Path        from 'path';
import * as Rx          from 'rxjs-es/Rx';


/*
RxJS
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

function SourceWatcherFabric(globs, options): AnyObj {
    return Rx.Observable.create(obs => {
        let watcher = chokidar.watch(globs, options)
            .on('all', (event, path) => {
                packageFileEvent(
                    event, path, options.cwd,
                    chop => obs.onNext(chop)
                );
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

        return function unsubscribe() {watcher.close()};
    });

    //todo: we should probably return a multi-cast observable
}

function packageFileEvent(event, path, cwd = '.', cb: (DropEvent) => void) {
    let parsedPath = parsePath(path, cwd),
        data: DropData = {
            path: parsedPath,
            id: path    // for primary key. I'll think about dealing with multiple cwds later.
        };

    if (event === 'add' || event === 'change') {
        try {
            fs.readFile(path, 'utf-8', (err, rawCont) => {
                // fixme: always pass _some_ encoding here, but don’t hardcode it
                data.raw = rawCont;

                cb({
                    event: event,
                    data
                });
            });
        } catch (err) {
            throw Error(`Exception while reading ${path}, error message: ${err.message}`);
        }
    } else if (event === 'unlink') {
        cb({
            event: event,
            data
        });
    } else {
        // todo: reject?
    }
}

/*
 * Returns an object in our standard format: {path, content, meta}
 * Or should we have `source` instead of `path`? For different types of source?`
 */
function packAChop(path, {encoding = 'UTF-8', cwd='.'}) {
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
function parsePath(path: string, cwd: string = '.'): ParsedPath {
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

