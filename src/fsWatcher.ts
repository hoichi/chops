/// <reference path="chops.d.ts" />
import * as chokidar    from 'chokidar';
import * as fs          from 'fs';
import * as Path        from 'path';

import {
    ChopEvent, ChopPage, PagePath
}       from "./chops";
import {ChoppingBoard}  from './choppingBoard';
import l                from './log';

// fixme: declare those modules properly
const   csp = require('js-csp');


export function SourceWatcherFabric(globs, options?: any): any /* fixme: channel type */ {
    let ch = csp.chan(),
        watcher = chokidar.watch(globs, options);   // that's not lazy

    l(`Watching for ${globs} inside ${process.cwd()}`);
    /* todo:
     * - options defaults
     * - an option to add pre-asterisk part of the globs to the cwd.
     *   or am I outsmarting `fs.watch()`, `node-glob` et. al?
     * */

    watcher
        .on('all', (event, path) => {
            if (event === 'add' || event === 'change') {
                l(`Emitting "${event}" for "${path}"`);
                csp.putAsync(ch, packAChop(event, path, options && options.cwd));
            }
        })
        .on('ready', () => {
            console.log(`And the first pass is done.`);
            // todo: ...
        })
        .on('error', err => {
            csp.putAsync(ch, new Error(`Chokidar error: ${err}`));
        })
    ;

    return new ChoppingBoard<ChopPage>(ch);
}

function packAChop(event, path, cwd = '.'): ChopEvent<ChopPage> {
    let parsedPath = parsePath(path, cwd),
        page: ChopPage = {
            type: 'file',
            path: parsedPath,
            id: path,    // for primary key. I'll think about dealing with multiple cwds later.
            content: '',
            url: 'unnamed/index.md'
        };

    if (event === 'add' || event === 'change') {
        // gather some file data
        try {
            // fixme: always pass _some_ encoding here, but don’t hardcode it
            page.content = fs.readFileSync(path, 'utf-8');
        } catch (err) {
            throw Error(`Exception while reading ${path}, error message: ${err.message}`);
        }
    } else if (event === 'unlink') {
        // nothing to add to the result
    }

    return {
        type: event,
        data: page
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
        {dir, ext, name} = Path.parse(path),
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
