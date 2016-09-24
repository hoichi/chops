import {watch} from './sourceWatcher';

import test from 'ava';
import * as chokidar from 'chokidar';

var watcher  = chokidar.watch('test/', {
    ignored: /[\/\\]\./,
});

var log = console.log.bind(console);
log(`Initial cwd: ${process.cwd()}`);
process.chdir('D:\\dev\\chops');
log(`Changed dir to: ${process.cwd()}`);

watcher
    .on('add', path => log(`File ${path} has been added`))
    .on('addDir', path => log(`Directory ${path} has been added`))
    .on('ready', () => log(`Initial scan complete. Ready for changes`))
;

test('...', t => {
    console.log('AVA out, bye');
});

/*
 test('Watching the watcher', async (t) => {
    watch('d:/dev/chops', {})
        .subscribe({
            next: page => {
                console.log(`Got a page: ${page.path}`);
            },
            error: err => {
                console.log(`Got an error: ${err}`);
            },
            complete: () => {
                console.log(`We’re done here`);
            }
        })
    ;
 });
*/
