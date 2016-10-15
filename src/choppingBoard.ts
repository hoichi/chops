///<reference path="chops.d.ts"/>
/**
 * Created by hoichi on 15.10.2016.
 */

import {FsWriter} from './fsWriter';
import {Transformable} from './transformer';
import {ChopEvent, PageOpened} from "./chops";

const   csp = require('js-csp'),
        {chan, go, put, take} = csp;

export class ChoppingBoard extends Transformable {
    // fixme: maybe Transformable is better of as a decorator
    private chOut: any;
    constructor(private chIn: any) {
        super();

        this.chOut = chan();
    }

    write(dir: string) {
        const writer = new FsWriter(this.chOut, dir);
        this.lockTransformers();
        this.startTransmitting();

        return writer;
    }

    private startTransmitting() {   // q: do we need stopTransmitting? or some cleanup at all?
        let event: ChopEvent<PageOpened>,
            me = this;

        go(function *() {
            while ( (event = yield take(me.chIn))  !==  csp.CLOSED ) {
                let {type, data} = event;
                // todo: check for event type
                let eventOut = {
                    type,
                    data: me.runTransformers(data)
                };

                put(me.chOut, eventOut);
            }
        });
    }
}

