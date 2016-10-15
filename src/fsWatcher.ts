/// <reference path="chops.d.ts" />
import * as chokidar    from 'chokidar';
import * as fs          from 'fs';
import * as Path        from 'path';
import {
    PageOpened,
    PagePath, PageRendered
}       from "./chops";
import {FsWriter}       from './fsWriter';
import {ChoppingBoard}  from './choppingBoard';

// fixme: declare those modules properly
const   csp = require('js-csp'),
        fm  = require('front-matter');


export function SourceWatcherFabric(globs, options = {cwd: '.'}): any /* fixme: channel type */ {
    let ch = csp.chan(),
        watcher = chokidar.watch(globs, options);   // that's not lazy

    /* todo:
     * - options defaults
     * - an option to add pre-asterisk part of the globs to the cwd. or am I outsmarting `fs.watch()`, `node-glob` et. al?
     * */

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

    return new ChoppingBoard(ch);
}

function packAChop(event, path, cwd = '.') {
    let parsedPath = parsePath(path, cwd),
        page: PageOpened = {
            type: 'file',
            path: parsedPath,
            id: path,    // for primary key. I'll think about dealing with multiple cwds later.
            content: undefined,
            yfm: {},
        };

    if (event === 'add' || event === 'change') {
        // gather some file data
        try {
            // fixme: always pass _some_ encoding here, but don’t hardcode it
            let rawCont = fs.readFileSync(path, 'utf-8');

            let {attributes: yfm, body: rawContent} = fm(rawCont);

            Object.assign(page, {yfm, rawContent});
        } catch (err) {
            throw Error(`Exception while reading ${path}, error message: ${err.message}`);
        }
    } else if (event === 'unlink') {
        // nothing to add to the result
    }

    // fixme: so hack. much temporary
    // I mean, PageRendered (or PageWritable, or something) shouldn’t be emitted from here
    let aPageAheadOfItsTime: PageRendered = {
        id:     page.id,
        url:    Path.join(page.path.rel, 'index.html'),
        html:   page.content
    };

    return {
        event,
        data: aPageAheadOfItsTime
        // page
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

