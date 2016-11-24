///<reference path="chops.d.ts"/>
/**
 * Created by hoichi on 15.10.2016.
 */

import {ChopEvent, ChopPage, ChopData} from "./chops";
import {ChainMaker} from './chainmaker';
import {FsWriter} from './fsWriter';
import {ChopRenderer, TemplateNameCb} from './renderer';
import {Channel, chan, go, put, take} from 'js-csp';
import * as csp from 'js-csp';

import l from './log';
import {ChopsCollection} from "./collection";
import {Transmitter} from "./transmitter";

export class ChoppingBoard<T extends ChopData> extends ChainMaker {
    private _chOut;     // this is where the board is putting the values
    private _chOutLatest; // this is caching `.chOutPages` of the latest collection we’ve linked to
    private _isTransmitting = false;
    private _collections: ChopsCollection[] = [];
    private _transmitters: Transmitter[][] = [];

    constructor(private _chIn: Channel) {
        super('page');

        this._chOutLatest = this._chOut = chan();
    }

    get chOut() {
        return this._chOut;
    }

    render(templates: ChoppingBoard<ChopPage>, tplName: string | TemplateNameCb) {
        // fixme: this should render a collection
        /**
         * Welp. Right now what we call is `templates.get('tplName')`. Meaning that .get()
         * should wait on a channel and yield that specific template when it arrives.
         * (Of course the signature could be just `.render(templates, 'tplName')` or something).
         * Does CSP offer filtering out of the box? [Sure does](https://github.com/ubolonton/js-csp/blob/master/doc/advanced.md#filterfromp-ch-bufferorn)
         */

        // todo: check if it’s the right action of board (what if it’s not a ChopPage?)
        // todo: this method is for pages/collections, not for, say, templates

        const renderer = new ChopRenderer(templates.chOut, this._chOut, tplName);
        templates.startTransmitting();
        this.startTransmitting();

        return renderer;
    }

    write(dir: string): FsWriter {
        l(`Writing to %s`, dir);
        const writer = new FsWriter(this._chOut, dir);
        this.startTransmitting();

        return writer;
    }

    collect(collection: ChopsCollection) {
        l(`collecting to...some kinda collection`);
        collection.listen(this._chOutLatest);
        this._chOutLatest = collection.chOutPages;  // the next collection should get
                                                    // its pages from the previous one
        this._collections.push(collection);

        this.startTransmitting();

        return this;
    }

    startTransmitting() {   // q: do we need stopTransmitting? or some cleanup at all?
        if (this._isTransmitting) return;   // enough’s enough

        // can’t accept new converters once the shit gets a-flying
        this.lockConverters();

        // wait for a page, run converters on it, send downstream
        // rinse, repeat
        go(function *() {
            let event: ChopEvent<T>;

            while ( (event = yield take(this._chIn))  !==  csp.CLOSED ) {
                let {action, data} = event;
                // todo: check for event action
                let eventOut = {
                    action,
                    data: this.runConverters(data)
                };

                l(`ch-ch-choppingBoard transmitting "${event.action}" for id "${event.data.id}"`);
                yield put(this._chOut, eventOut);
            }
        }.bind(this));  // <- so that `this` works inside the generator
    }
}

