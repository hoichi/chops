import {watch} from './sourceWatcher';

import test from 'ava';
import * as chokidar from 'chokidar';

// cwd can depend on whether the test is run through Ava or from Node directly
var log = console.log.bind(console);
log(`Initial cwd: ${process.cwd()}`);
process.chdir('D:\\dev\\chops');
log(`Changed dir to: ${process.cwd()}`);


watch('test/', {})  // ← todo: is it an observable?
    .subscribe(
        page => {
            console.log(`Got a page: ${page.data.path.path}`);
        },
        err => {
            console.log(`Got an error: ${err}`);
        },
        () => {
            console.log(`We’re done here`);
        }
    )
;



/*
    fixme: figure out the ava/chokidar issue later

var watcher  = chokidar.watch('test/', {
    ignored: /[\/\\]\./,
});


watcher
    .on('add', path => log(`File ${path} has been added`))
    .on('addDir', path => log(`Directory ${path} has been added`))
    .on('ready', () => log(`Initial scan complete. Ready for changes`))
;

// comment this out when not run from Ava
test('...', t => {
    console.log('AVA out, bye');
});
*/

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
