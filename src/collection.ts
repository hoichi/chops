/**
 * Created by hoichi on 04.11.2016.
 */
import {Channel, chan, go, put, putAsync, take} from 'js-csp';
import * as csp from 'js-csp';
import {map, sortBy, sortedLastIndexBy} from 'lodash';

import {ChopPage, Dictionary, ChopId, ChopEvent} from "./chops";
import {FsWriter} from "./fsWriter";
import l, * as log from './log';
import {ChoppingBoard} from "./choppingBoard";
import {ChopRenderer, TemplateNameCb} from "./renderer";

export interface Collectable {
    collect(collection: ChopsCollection): Collectable;
}

type SortValue = string | number;

type SortIteratee = (el: any) => SortValue; // todo: property shortcut

export interface SortOptions {
    by: SortIteratee;
    // descending?: boolean;
}

interface CollectionDicRecord {
    id:     ChopId;
    key:    any;
    page:   ChopPage;
}

export class ChopsCollection {
    private _sortOptions: SortOptions;

    private _sortedList: ChopPage[];
    private _isFlushed = false;

    private _chIn: Channel;
    private _isListening    = false;
    private _isTransmitting = false;
    private _chOutPages: Channel;

    constructor (options: SortOptions) {
        this._sortOptions = {
            by: options.by
        };
        this._sortedList = [];

        this._chOutPages = chan();
    }

/*
    write(dir: string): FsWriter {
        l(`Writing to %s`, dir);
        const writer = new FsWriter(this._chOutPages, dir);
        this.startTransmitting();

        return writer;
    }
*/

    collect(collection: ChopsCollection) {
        l(`collecting to...some kinda collection`);
        collection.listen(this._chOutPages);
        this.startTransmitting();
        return collection;
    }

    listen(chIn: Channel) {
        if (this._isListening) {
            throw Error(`I’m listening! Why call \`.listen()\` twice on the same collection?`);
        }

        this._chIn = chIn;
        this._isListening = true;
        this.startTransmitting();
    }

    render(templates: ChoppingBoard<ChopPage>, tplName: string | TemplateNameCb) {
        /**
         * Welp. Right now what we call is `templates.get('tplName')`. Meaning that .get() should wait on a channel and yield that specific template when it arrives.
         * (Of course the signature could be just `.render(templates, 'tplName')` or something).
         * Does CSP offer filtering out of the box? [Sure does](https://github.com/ubolonton/js-csp/blob/master/doc/advanced.md#filterfromp-ch-bufferorn)
         */

            // todo: check if it’s the right type of board (what if it’s not a ChopPage?)
            // todo: this method is for pages/collections, not for, say, templates

        const renderer = new ChopRenderer(templates.chOut, this._chOutPages, tplName);
        templates.startTransmitting();
        this.startTransmitting();

        return renderer;
    }


    protected add(page: ChopPage) {

        // todo: check for dupes
        // or just implement .replace() for the 'change' event

        let list = this._sortedList,
            sortBy = this._sortOptions.by,
            key = sortBy(page);

        let idx = sortedLastIndexBy(list, key, sortBy ),
            idxPrev = idx-1,
            idxNext = idx+1,
            updatedPage = Object.assign({}, page, {
                prev: idxPrev >= 0 ? list[idxPrev] : null,
                next: idxNext < list.length ? list[idxNext] : null
            });

        list.splice(idx, 0, updatedPage);
        return updatedPage;
    }

    protected flush() {
        // todo: update page with `prev/next` &c
        putAsync(this._chIn, {type: 'flush'});
    }

    private startTransmitting() {
        if (this._isTransmitting) return;
        this._isTransmitting = true;

        l('Collection is transmitting. Input channel is...');
        setTimeout(this.flush.bind(this), 3000);

        go(function *() {
            let event: ChopEvent<ChopPage>,
                page;

            while ( (event = yield take(this._chIn)) !== csp.CLOSED) {
                if (event.type === 'flush') {
                    l('About to flush ’em pages');
                    yield* this.flushAllPages(); // don’t stop till we’ve sent ’em all
                    this._isFlushed = true;
                    continue;
                }

                l(`Collecting the page "${event.data.id}"`);
                page = this.add(event.data);    // if collection is already sorted,
                                                // the page we get is updated with `prev/next`
                                                // and no, I don’t like how arcane it is

                if (this._isFlushed) { // green light, we can send it downstream
                    yield put(this._chOutPages, {
                        type: event.type,
                        data: page
                    });
                }
            }
        }.bind(this));
    }

    private *flushAllPages() {
        let pages = this._sortedList,
            len = pages.length;
        l(`Sending all the ${len} sorted pages downstream`);

        for (let i=0; i<len; i++) {
            yield put(this._chOutPages, {
                type: 'add',
                data: pages[i]
            });
        }

        return;
    }
}

