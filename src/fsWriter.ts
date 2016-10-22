import * as fs      from 'fs';
import * as md      from 'mkpath';
import * as path    from 'path';

import {ChopEvent, ChopPage} from "./chops";
import l            from './log';

const
    csp = require('js-csp'),
    {go, take} = csp
;

export class FsWriter {
    constructor(private chIn: any, private dir: string) {
        this.startWriting();
    }

    startWriting(): void {
        let chIn = this.chIn,
            dir = this.dir;

        l(`Roger: writing to "${dir}"`);
        go(function *() {
            let event: ChopEvent<ChopPage>;

            while ( (event = yield take(chIn)) !== csp.CLOSED
                    && !(event instanceof Error) ) {     // ← do we even get here if we throw?
                let page = event.data;  // todo: check event.type

                l(event.data);
                try {
                    fs.writeFileSync(   // *Sync so we don’t try to write to the file we’re writing to already.
                        path.resolve(dir, page.url),
                        page.content,
                        {encoding: 'UTF-8'}
                    );
                } catch (err) {
                    if (err.message.includes('ENOENT')) {
                        md.sync(path.resolve(dir, path.dirname(page.url)));

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