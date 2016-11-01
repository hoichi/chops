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
                let page = event.data;  // todo: check event.type

                l(event);
                try {
                    l(`page: %o`, page);
                    fs.writeFileSync(   // *Sync so we don’t try to write to the file we’re writing to already.
                        path.resolve(dir, page.url),
                        page.content,
                        {encoding: 'UTF-8'}
                    );
                } catch (err) {
                    if (err.message.includes('ENOENT')) {
                        mkpath.sync(path.resolve(dir, path.dirname(page.url)));

                        l(`content: ${page.content}`);
                        // fixme: make it less wet
                        fs.writeFileSync(
                            path.resolve(dir, page.url),
                            page.content,
                            {encoding: 'UTF-8'}
                        );
                    } else {
                        throw err;
                    }
                }
            }
        });
    }
}