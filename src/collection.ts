/**
 * Created by hoichi on 04.11.2016.
 */
import {go, put, putAsync, take} from 'js-csp';
import * as csp from 'js-csp';
import {sortedLastIndexBy} from 'lodash';

import {ChopPage, ChopEvent, ChopData} from "./chops";
import l from './log';

import {ChainMaker} from "./chainmaker";
import {ChoppingBoard} from "./choppingBoard";
import {FsWriter} from "./fsWriter";
import {ChopRenderer, TemplateNameCb} from "./renderer";
import {Transmitter} from "./transmitter";

type SortValue = string | number;

type SortIteratee = (el: any) => SortValue; // todo: property shortcut

export interface SortOptions {
    by: SortIteratee;
    // descending?: boolean;
}

export class ChopsCollection extends ChainMaker {
    private _collector;

    constructor(options: SortOptions) {
        super('collection');
        this._collector = new Collector(options);
        this.addEmitter(this._collector);
    }

    get collector() {
        return this._collector;
    }

    get transmitter() {
        return this._collector;
    }

    patchCollection(cb) {
        this._collector.patchData(cb);
        return this;
    }

    filter(fltrFn: (ChopData) => boolean) {
        this._collector.filter = fltrFn;
        return this;
    }

    render(templates: ChoppingBoard<ChopPage>, tplName: string | TemplateNameCb, data = {}) {
        // hack: I think that’s what inheriting directly from Transmitter is
        const renderer = new ChopRenderer(tplName, 'collection', data);
        templates.addTransmitter(renderer); // direct templates to renderer
        this.addTransmitter(renderer);      // also send this collection its way
        return this;
    }

    write(dir: string) {
        l(`Writing collection to %s`, dir);
        this.addTransmitter(new FsWriter(dir, 'collection'));
        return this;
    }
}

export class Collector extends Transmitter {
    private _data = {};
    private _isFlushed = false;

    private _sortOptions: SortOptions;
    private _sortedList:  ChopPage[];

    private _pagesExpected = Infinity;
    private _pagesArrived  = 0;

    private _filter = (chop) => true;
    private _limit: Number | null = null;

    set filter(fltrFn) {
        this._filter = fltrFn;
    }

    constructor(options: SortOptions) {
        super();

        this.declareChannels({
            input: ['page'],
            output: ['page', 'collection']
        });

        this._sortOptions = {
            by: options.by
        };

        this._sortedList = [];
    }

    protected startTransmitting() {
        l('Collection is transmitting. Input channel is...');

        go(function *() {
            let event: ChopEvent<ChopPage>,
                page,
                chIn = this.chIn('page'),
                chOutPg = this.chOut('page');

            while ((event = yield take(chIn)) !== csp.CLOSED) {
                let {action} = event;

                if (action === 'flush') {
                    l('About to flush ’em pages');
                    // emit the pages. and don’t stop till we’ve sent ’em all
                    yield* this.flushAllPages();
                    yield* this.sendCollection();
                    this._isFlushed = true;
                    continue;
                }

                if (action === 'ready') {
                    this._pagesExpected = event.count;
                    this.flushIfAllPagesArrived();
                    continue;
                }

                if (action === 'add') {
                    this._pagesArrived++;
                    this.flushIfAllPagesArrived();
                }

                if (~['add', 'change'].indexOf(action)) {
                    l(`Collecting the page "${event.data && event.data.id}"`);
                    page = event.data;
                    if (!this._filter(page)) {
                        yield put(chOutPg, event);  // let it go, it’s not yours
                        continue;
                    }

                    page = this.addSorted(page);
                    this.flushIfAllPagesArrived();

                    if (this._isFlushed) { // green light, we can send it downstream
                        // emit the current page
                        yield put(chOutPg, {
                            action: action,
                            type: 'PAGE',
                            data: page
                        });
                        yield* this.sendCollection();
                    }
                }
            }
        }.bind(this));
    }

    protected addSorted(page: ChopPage) {
        // todo: check for dupes
        //       or just implement .replace() for the 'change' event

        return insertSorted(this._sortedList, page, this._sortOptions.by);
    }

    patchData(cb) {
        this._data = Object.assign({}, this._data, cb(this._data));
        return this;
    }

    protected flushIfAllPagesArrived() {
        if (this._pagesArrived >= this._pagesExpected) {
            putAsync(this.chIn('page'), {action: 'flush'});
        }
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

        // let’s pass it _after_ we’ve sent all the pages, just to lower the jitter`
        yield put(chOut, {
            action: 'ready',
            count: this._pagesArrived
        });

        return;
    }

    private *sendCollection() {
        // let’s keep the _sortedList private so it doesn’t get overridden
        // by ‘user space’ calls like `update` or `patchData`
        this.patchData(() => ({posts: this._sortedList}));

        yield put(this.chOut('collection'), {
            type: 'collection',
            action: 'change',
            data: this._data
        });
    }
}

function insertSorted(list, el, sortBy) {
    // todo: FP-ize
    let key = sortBy(el),
        idx = sortedLastIndexBy(list, key, sortBy);

    // insert in the sorted position
    list.splice(idx, 0, el);

    // return prev/next (link to a page or null)
    let idxPrev = idx - 1,
        idxNext = idx + 1,
        updatedPage = {
            ...el,
            prev: idxPrev >= 0 ? list[idxPrev] : null,
            next: idxNext < list.length ? list[idxNext] : null
        };

    return updatedPage;
}
