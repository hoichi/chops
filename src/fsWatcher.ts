/// <reference path="chops.d.ts" />
import * as chokidar    from 'chokidar';
import * as fs          from 'fs';
import * as Path        from 'path';

import {
    ChopEvent, ChopPage, PagePath, Dictionary
}       from "./chops";
import {ChoppingBoard}  from './choppingBoard';
import l                from './log';
import {Transmitter} from "./transmitter";

// fixme: declare those modules properly
const   csp = require('js-csp');

export class FsWatcher extends Transmitter {
    constructor(private globs, private options: Dictionary<any> = {}, private modelType = 'page') {
        super();

        this.declareChannels({
            output: [this.modelType]
        });
    }

    protected startTransmitting() {
        let ch = this.chOut(this.modelType),
            {globs, options} = this,
            watcher = chokidar.watch(globs, options);   // that's not lazy

        l(`Watching for ${this.globs} inside ${process.cwd()}`);
        /* todo:
         * - options defaults
         * - an option to add pre-asterisk part of the globs to the cwd.
         *   or am I outsmarting `fs.watch()`, `node-glob` et. al?
         * */

        watcher
            .on('all', (event, path) => {
                if (event === 'add' || event === 'change') {
                    l(`Emitting "${event}" for "${path}"`);
                    csp.putAsync(ch, packAChop(event, path, options && options['cwd']));
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
    }
}

function packAChop(event, path, cwd = '.'): ChopEvent<ChopPage> {
    let parsedPath = parsePath(path),
        page: ChopPage = {
            type: 'file',
            path: parsedPath,
            id: path,       // for primary key. I'll think about dealing with multiple cwds later.
            content: '',
            url: ''         // fixme: do we need that value here at all?
                            // it bitten me in the ass with the default.
                            // also, does a source watcher really needs
                            // to know of those things?
        };

    if (event === 'add' || event === 'change') {
        let xCwd = process.cwd();
        // gather some file data
        try {
            // fixme: always pass _some_ encoding here, but don’t hardcode it
            process.chdir(cwd);
            page.content = fs.readFileSync(path, 'utf-8');
        } finally {
            process.chdir(xCwd);
        }
    } else if (event === 'unlink') {
        // nothing to add to the result
    }

    return {
        action: event,
        data: page
    }
}

/*
 * Takes a path (and a working dir)
 * returns an object with:
 * - file base (sans extension)
 * - an arr of parent dirs
 * */
function parsePath(path: string): PagePath {
    let sep = Path.sep,
        {dir, ext, name} = Path.parse(path),
        dirs = dir.split(sep);

    return {
        dir,
        dirs,
        ext,
        name,
        path
    };
}
