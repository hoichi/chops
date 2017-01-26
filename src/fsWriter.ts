import * as fs              from 'fs';
import * as mkpath          from 'mkpath';
import * as path            from 'path';
import * as csp             from 'js-csp';
import {Channel, go, take}  from 'js-csp';

import {ChopEvent, ChopPage} from "./chops";
import l            from './log';
import {Transmitter} from "./transmitter";

export class FsWriter extends Transmitter {
    constructor(private dir: string, private modelType = 'page') {
        super();

        this.declareChannels({
            input: [modelType]
        });
    }

    protected startTransmitting() {
        // hack: that’s a dead-end transmitter, which is probably not good
        const {dir} = this,
            chIn = this.chIn(this.modelType);

        l(`Roger: writing to "${dir}"`);
        go(function *() {
            let event: ChopEvent<ChopPage>;

            while ( (event = yield take(chIn)) !== csp.CLOSED
                    && !(event instanceof Error) ) {     // ← do we even get here if we throw?

                if (['add', 'change'].indexOf(event.action) === -1) {
                    continue;
                    // todo: emit something so we can stop the non-watch build`
                }

                let page = event.data;
                page &&
                    writeAPage(path.resolve(dir, page.url), page.content)
            }
        }.bind(this));
    }

    protected startReceiving(subCh: string) {
        this.startTransmitting();
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