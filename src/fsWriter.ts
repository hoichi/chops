import * as fs from 'fs';
import * as path from 'path';
import {PageRendered, ChopEvent} from "./chops";

const
    csp = require('js-csp'),
    {go, take} = csp
;

export class FsWriter {
    protected chIn;
    constructor(chIn: any) {
        this.chIn = chIn;
    }

    dest(dir: string): void {
        let chIn = this.chIn;

        go(function *() {
            let event: ChopEvent<PageRendered>;

            while ( (event = yield take(chIn)) !== csp.CLOSED
                    && !(event instanceof Error) ) {     // ← do we even get here if we throw?
                let page = event.data;  // todo: check event.type

                fs.writeFileSync(   // *Sync so we don’t try to write to the file we’re writing to already.
                    path.resolve(dir, page.url),
                    page.html,
                    {encoding: 'UTF-8'}
                );
            }
        });
    }
}