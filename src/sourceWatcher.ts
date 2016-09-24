/// <reference path="chops.d.ts" />
import * as chokidar    from 'chokidar';
import * as fs          from 'fs';
import * as Path        from 'path';
import * as Rx          from '@reactivex/rxjs';
import {Observable} from "@reactivex/rxjs";
import {ParsedPath} from "path";
import {PageOpened, PagePath} from "./chops";

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

function SourceWatcherFabric(globs, options): Observable<any> {
    return Rx.Observable.create(obs => {

        console.log(`Creating an observable. Trying to watch ${globs}`);

        let watcher = chokidar.watch(globs/*, options*/);

        console.dir(watcher.getWatched());
        console.log(`cwd is: ${process.cwd()}`);

        watcher
            .on('all', (event, path) => {

                console.log(`Processing ${path}`);

                packAChop(
                    event, path, options.cwd,
                    chop => obs.onNext(chop)
                );
            })
            .on('ready', () => {
                console.log(`And the first pass is done.`);
                /* if we’re just building once, call obs.onCompleted()
                *  if we’re watching, say we’re ready and stay on guard;
                * */
            })
            .on('error', err => {
                throw Error(`Chokidar error: ${err}`);
            })
        ;

        return function unsubscribe() {watcher.close()};
    });

    //todo: we should probably return a multi-cast observable
}

function packAChop(event, path, cwd = '.', cb: (ChopEvent) => void) {
    let parsedPath = parsePath(path, cwd),
        data: PageOpened = {
            type: 'file',
            path: parsedPath,
            id: path,    // for primary key. I'll think about dealing with multiple cwds later.
            rawContent: undefined,
            yfm: {},
        };

    if (event === 'add' || event === 'change') {
        try {
            fs.readFile(path, 'utf-8', (err, rawCont) => {
                // fixme: always pass _some_ encoding here, but don’t hardcode it
                data.rawContent = rawCont;

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
 * Takes a path (and a working dir)
 * returns an object with:
 * - file base (sans extension)
 * - an arr of parent dirs
 * */
function parsePath(path: string, cwd: string = '.'): PagePath {
    let sep = Path.sep,
        {root, dir, base, ext, name} = Path.parse(path),
        rel:string = Path.relative(cwd, dir),
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


export {SourceWatcherFabric as watch};

