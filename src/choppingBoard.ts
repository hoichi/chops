///<reference path="chops.d.ts"/>
/**
 * Created by hoichi on 15.10.2016.
 */

import {ChopEvent, ChopPage, ChopData} from "./chops";
import {Convertable} from './convertable';
import {FsWriter} from './fsWriter';
import l from './log';

const   csp = require('js-csp'),
        {chan, go, put, take} = csp;

export class ChoppingBoard<T extends ChopData> extends Convertable {
    // fixme: maybe Convertable is better off as a decorator
    private chOut: any;

    constructor(private chIn: any) {
        super();

        this.chOut = chan();
    }

    write(dir: string) {
        l(`Writing to %s`, dir);
        const writer = new FsWriter(this.chOut, dir);
        this.lockConverters();
        this.startTransmitting();

        return writer;
    }

    private startTransmitting() {   // q: do we need stopTransmitting? or some cleanup at all?
        let event: ChopEvent<T>,
            me = this;

        go(function *() {
            while ( (event = yield take(me.chIn))  !==  csp.CLOSED ) {
                let {type, data} = event;
                // todo: check for event type
                let eventOut = {
                    type,
                    data: me.runConverters(data)
                };

                // l(`Original: ${event.data.content}`);
                // l(`Convered: `, eventOut.data);
                yield put(me.chOut, eventOut);
            }
        });
    }
}

