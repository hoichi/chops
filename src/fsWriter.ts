import * as fs              from 'fs';
import * as mkpath          from 'mkpath';
import * as path            from 'path';
import * as csp             from 'js-csp';
import {Channel, go, take}  from 'js-csp';

import {ChopEvent, ChopPage} from "./chops";
import l            from './log';

export class FsWriter {
    constructor(private chIn: Channel, private dir: string) {
        this.startWriting();
    }

    startWriting(): void {
        let {chIn, dir} = this;

        l(`Roger: writing to "${dir}"`);
        go(function *() {
            let event: ChopEvent<ChopPage>;

            while ( (event = yield take(chIn)) !== csp.CLOSED
                    && !(event instanceof Error) ) {     // ← do we even get here if we throw?
                // todo: check event type
                let page = event.data;
                writeAPage(path.resolve(dir, page.url), page.content);
            }
        });
    }
}

function writeAPage(destPath: string, content: string): void {
    try {
        tryWritingOnce();
    } catch (err) {
        if (err.message.includes('ENOENT')) {
            mkpath.sync( path.dirname(destPath) );
            tryWritingOnce();
        } else {
            throw err;
        }
    }

    function tryWritingOnce(): void {
        fs.writeFileSync(   // It’s sync so we don’t try to write
                            // to the file we’re writing to already.
                            // (No idea if it works, maybe i need better safeguards)
            destPath,
            content,
            {encoding: 'UTF-8'}
        );
    }
}