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
import {Transmitter} from "./transmitter";

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
    id: ChopId;
    key: any;
    page: ChopPage;
}

export class ChopsCollection extends Transmitter {
    private _sortOptions: SortOptions;
    private _sortedList: ChopPage[];

    private _filter = (chop) => true;
    private _filteredList: ChopPage[];

    private _limit: Number | null = null;

    private _isFlushed = false;

    private _data = {};

    constructor(options: SortOptions) {
        super();
        this._sortOptions = {
            by: options.by
        };
        this._sortedList = [];
        this._filteredList = [];
    }

    update(cb) {
        this._data = cb(this._data);

        return this;
    }

    patch(cb) {
        this._data = Object.assign({}, this._data, cb(this._data));

        return this;
    }

    filter(filterBy) {
        this._filter = filterBy;
        // todo: support more that one filter
        //       maybe we should inherit from ChainMaster after all
        //       and wrap the Transmitter
        // todo: check if it’s a function
        // todo: property shortcuts, lodash-style
    }

    limit(len: Number) {
        this._limit = len;
    }

    render(templates: ChoppingBoard<ChopPage>, tplName: string | TemplateNameCb) {
        // hack: I think that’s what inheriting directly from Transmitter is
        const renderer = new ChopRenderer(tplName, 'collection');
        templates.addTransmitter(renderer);         // direct templates to renderer
        this.addListener(renderer, 'collection');   // also send this collection its way
        return this;
    }


    protected add(page: ChopPage) {
        // todo: check for dupes
        //       or just implement .replace() for the 'change' event

        let sortBy = this._sortOptions.by,
            updatedPage = this.insertSorted(this._sortedList, page, sortBy);

        if (this._filter(updatedPage)) {
            // fixme: we just go and override prev/next.
            // might be fine for most of the cases. or not
            updatedPage = this.insertSorted(this._filteredList, page, sortBy);
        }

        return updatedPage;
    }

    private insertSorted(list, page, sortBy) {
        // todo: FP-ize
        let key = sortBy(page),
            idx = sortedLastIndexBy(list, key, sortBy);

        // insert in the sorted position
        list.splice(idx, 0, page);

        // return prev/next (link to a page or null)
        let idxPrev = idx - 1,
            idxNext = idx + 1,
            updatedPage = Object.assign({}, page, {
                prev: idxPrev >= 0 ? list[idxPrev] : null,
                next: idxNext < list.length ? list[idxNext] : null
            });

        return updatedPage;
    }

    protected flush() {
        putAsync(this.chIn('page'), {type: 'flush'});
    }

    protected startTransmitting() {
        l('Collection is transmitting. Input channel is...');
        setTimeout(this.flush.bind(this), 3000);

        go(function *() {
            let event: ChopEvent<ChopPage>,
                page,
                chIn = this.chIn('page'),
                chOutPg= this.chOut('page'),
                chOutColl = this.chOut('collection');

            while ((event = yield take(chIn)) !== csp.CLOSED) {
                if (event.action === 'flush') {
                    l('About to flush ’em pages');
                    // emit the pages. and don’t stop till we’ve sent ’em all
                    yield* this.flushAllPages();
                    this._isFlushed = true;
                    continue;
                }

                l(`Collecting the page "${event.data.id}"`);
                page = this.add(event.data);    // if collection is already sorted,
                                                // the page we get is updated with `prev/next`
                                                // and no, I don’t like how arcane it is

                if (this._isFlushed) { // green light, we can send it downstream
                    // emit the current page
                    yield put(chOutPg, {
                        action: event.action,
                        type: 'PAGE',
                        data: page
                    });

                    // emit the collection itself
                    // let’s keep the _sortedList private so it doesn’t get overridden
                    // by ‘user space’ calls like `update` or `patch`
                    this.patch(() => ({posts: this._sortedList}));
                    yield put( chOutColl, {
                        type: 'collection',
                        action: 'change',
                        data: this._data
                    });
                }
            }
        }.bind(this));
    }

    private *flushAllPages() {
        let pages = this._sortedList,
            len = pages.length,
            chOut = this.chOut('page');
        l(`Sending all the ${len} sorted pages downstream`);

        for (let i = 0; i < len; i++) {
            yield put(chOut, {
                action: 'add',
                type: 'PAGE',
                data: pages[i]
            });
        }

        return;
    }
}

