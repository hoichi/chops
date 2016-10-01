/// <reference path="chops.d.ts" />
import * as chokidar    from 'chokidar';
import * as fs          from 'fs';
import * as Path        from 'path';
import * as Rx          from '@reactivex/rxjs';
import {Observable}     from "@reactivex/rxjs";
import {ParsedPath}     from "path";
import {PageOpened, PagePath} from "./chops";

// fixme: declare those modules properly
const   csp = require('js-csp'),
        fm  = require('front-matter');


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

function SourceWatcherFabric(globs, options): any /* fixme: some channel type */ {
    let ch = csp.chan(),
        watcher = chokidar.watch(globs, options);   // that's not lazy

    watcher
        .on('all', (event, path) => {
            csp.putAsync(ch, packAChop(event, path, options.cwd));
        })
        .on('ready', () => {
            console.log(`And the first pass is done.`);
            // todo: ...
        })
        .on('error', err => {
            csp.putAsync(ch, new Error(`Chokidar error: ${err}`));
        })
    ;

    return ch;
}

function packAChop(event, path, cwd = '.') {
    let parsedPath = parsePath(path, cwd),
        data: PageOpened = {
            type: 'file',
            path: parsedPath,
            id: path,    // for primary key. I'll think about dealing with multiple cwds later.
            rawContent: undefined,
            yfm: {},
        };

    if (event === 'add' || event === 'change') {
        // gather some file data
        try {
            // fixme: always pass _some_ encoding here, but don’t hardcode it
            let rawCont = fs.readFileSync(path, 'utf-8');

            let {attributes: yfm, body: rawContent} = fm(rawCont);

            Object.assign(data, {yfm, rawContent});
        } catch (err) {
            throw Error(`Exception while reading ${path}, error message: ${err.message}`);
        }
    } else if (event === 'unlink') {
        // nothing to add to the result
    }

    return {
        event,
        data
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

