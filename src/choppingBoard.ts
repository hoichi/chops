///<reference path="chops.d.ts"/>
/**
 * Created by hoichi on 15.10.2016.
 */

import {ChopEvent, ChopPage, ChopData} from "./chops";
import {Convertable} from './convertable';
import {FsWriter} from './fsWriter';
import {ChopRenderer} from './renderer';
import {Channel, chan, go, put, take} from 'js-csp';
import * as csp from 'js-csp';
import {isString} from 'lodash/fp';

import l from './log';

interface TemplateNameCb {
    (p: ChopPage): string;
}

export class ChoppingBoard<T extends ChopData> extends Convertable {
    // fixme: maybe Convertable is better off as a decorator
    private _chOut: Channel;

    constructor(private _chIn: Channel) {
        super();

        this._chOut = chan();
    }

    get chOut() {
        return this._chOut;
    }

    render(templates: ChoppingBoard<ChopPage>, tplName: string | TemplateNameCb) {
        /**
         * Welp. Right now what we call is `templates.get('tplName')`. Meaning that .get() should wait on a channel and yield that specific template when it arrives.
         * (Of course the signature could be just `.render(templates, 'tplName')` or something).
         * Does CSP offer filtering out of the box? [Sure does](https://github.com/ubolonton/js-csp/blob/master/doc/advanced.md#filterfromp-ch-bufferorn)
         */

        // todo: check if it’s the right type of board (what if it’s not a ChopPage?)
        // todo: this method is for pages/collections, not for, say, templates

        const renderer = new ChopRenderer(templates.chOut, this._chOut, tplName);
        templates.startTransmitting();
        this.startTransmitting();

        return renderer;
    }

    write(dir: string) {
        l(`Writing to %s`, dir);
        const writer = new FsWriter(this._chOut, dir);
        this.startTransmitting();

        return writer;
    }

    startTransmitting() {   // q: do we need stopTransmitting? or some cleanup at all?
        this.lockConverters();

        go(function *(me) {
            let event: ChopEvent<T>;

            while ( (event = yield take(me._chIn))  !==  csp.CLOSED ) {
                let {type, data} = event;
                // todo: check for event type
                let eventOut = {
                    type,
                    data: me.runConverters(data)
                };

                l(`ch-ch-choppingBoard transmitting "${event.type}" for id "${event.data.id}"`);
                yield put(me._chOut, eventOut);
            }
        }, [this]);

        go(function *(me) {
            // l(yield take(this._chOut));
        }.bind(this));
    }
}

