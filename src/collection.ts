/**
 * Created by hoichi on 04.11.2016.
 */
import {Channel, chan, go, put, putAsync, take} from 'js-csp';
import * as csp from 'js-csp';
import {map, sortBy, sortedLastIndexBy} from 'lodash';

import {ChopPage, Dictionary, ChopId, ChopEvent} from "./chops";
import {FsWriter} from "./fsWriter";
import l, * as log from './log';

log.on();

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
    private _dic: Dictionary<CollectionDicRecord>;
    private _isFlushing = false;
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
        this._dic = Object.create(null);

        this._chOutPages = chan();
    }

    write(dir: string): FsWriter {
        l(`Writing to %s`, dir);
        const writer = new FsWriter(this._chOutPages, dir);
        this.startTransmitting();

        return writer;
    }

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

    protected add(page: ChopPage) {

        // todo: check for dupes
        // or just implement .replace() for the 'change' event

        let record: CollectionDicRecord = {
            id: page.id,
            key: this._sortOptions.by(page),
            page: page
        };
        this._dic[record.id] = record;

        if (this._isFlushed) { // the sorted list already created
            let idx = sortedLastIndexBy( this._sortedList
                                       , record.key
                                       , this._sortOptions.by );
            this._sortedList.splice(idx, 0, page);
            // todo: update page with `prev/next`
        }

        return page;
    }

    protected flush() {
        let dic = this._dic;
        l(`Sorting the collection (length=${Object.keys(dic).length})`);

        this._sortedList = sortBy(
            map(Object.keys(dic), key => dic[key].page),
            this._sortOptions.by
        );

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

