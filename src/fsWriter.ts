import * as fs      from 'fs';
import * as md      from 'mkpath';
import * as path    from 'path';
import {PageRendered, ChopEvent} from "./chops";

const
    csp = require('js-csp'),
    {go, take} = csp
;

export class FsWriter {
    protected chIn;
    constructor(chIn: any, dir: string) {
        this.chIn = chIn;
    }

    write(dir: string): void {
        let chIn = this.chIn;

        go(function *() {
            let event: ChopEvent<PageRendered>;

            while ( (event = yield take(chIn)) !== csp.CLOSED
                    && !(event instanceof Error) ) {     // ← do we even get here if we throw?
                let page = event.data;  // todo: check event.type

                try {
                    fs.writeFileSync(   // *Sync so we don’t try to write to the file we’re writing to already.
                        path.resolve(dir, page.url),
                        page.html,
                        {encoding: 'UTF-8'}
                    );
                } catch (err) {
                    if (err.message.includes('ENOENT')) {
                        md.sync(path.resolve(dir, path.dirname(page.url)));

                        // fixme: make it less wet
                        fs.writeFileSync(
                            path.resolve(dir, page.url),
                            page.html,
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