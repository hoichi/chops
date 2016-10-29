///<reference path="chops.d.ts"/>
/**
 * Created by hoichi on 15.10.2016.
 */

import {ChopEvent, ChopPage, ChopData} from "./chops";
import {Convertable} from './convertable';
import {FsWriter} from './fsWriter';
import {ChopRenderer} from './renderer';
import {chan, go, put, take} from 'js-csp';
import * as csp from 'js-csp';
import {isString} from 'lodash/fp';

import l from './log';

interface TemplateNameCb {
    (p: ChopPage): string;
}

export class ChoppingBoard<T extends ChopData> extends Convertable {
    // fixme: maybe Convertable is better off as a decorator
    private chOut: any;

    constructor(private chIn: any) {
        super();

        this.chOut = chan();
    }

    render(templates: ChoppingBoard<ChopPage>, tplName: string | TemplateNameCb) {
        /**
         * Welp. Right now what we call is `templates.get('tplName')`. Meaning that .get() should wait on a channel and yield that specific template when it arrives.
         * (Of course the signature could be just `.render(templates, 'tplName')` or something).
         * Does CSP offer filtering out of the box? [Sure does](https://github.com/ubolonton/js-csp/blob/master/doc/advanced.md#filterfromp-ch-bufferorn)
         */

        // todo: check if it’s the right type of board (maybe _not_ ChopPage)
        // todo: this method is for pages/collections, not for, say, templates

        if (!isString(tplName)) {
            tplName = tplName(page);    // this should run on chops, not on boards
        }

        const renderer = new ChopRenderer
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

