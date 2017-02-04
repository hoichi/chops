/**
 * Created by hoichi on 04.11.2016.
 */
import {go, put, putAsync, take} from 'js-csp';
import * as csp from 'js-csp';
import {pick, sortedLastIndexBy} from 'lodash';

import {ChopPage, ChopEvent, ChopData, Dictionary} from "./chops";
import l from './log';

import {ChainMaker} from "./chainmaker";
import {ChoppingBoard} from "./choppingBoard";
import {FsWriter} from "./fsWriter";
import {ChopRenderer, TemplateNameCb} from "./renderer";
import {SortedList, SortIteratee} from "./sortedList";
import {Transmitter} from "./transmitter";


export interface CollectionOptions {
    sortBy?: SortIteratee;
    indexBy?: SortIteratee;
    // descending?: boolean;
}

type PatchCallback = (data: Dictionary<any>) => Dictionary<any>;

type PageToEvent = (p: ChopPage) => ChopEvent<ChopPage>;

export class ChopsCollection extends ChainMaker {
    private _collector;

    constructor(options: CollectionOptions) {
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
    private _list: SortedList<ChopPage>;

    private _data: Dictionary<any> = {};

    private _filter = (chop) => true;
    private _limit: Number | null = null;

    set filter(fltrFn) {
        this._filter = fltrFn;
    }

    constructor(options: CollectionOptions) {
        super();

        this.declareChannels({
            input: ['page'],
            output: ['page', 'collection']
        });

        let listOptions = { indexBy: p => p.id },
            sortBy = options.sortBy;
        if (sortBy) {
            listOptions['sortBy'] = sortBy;
            // because things like destructuring result in undefined properties instead of missing ones
        }
        this._list = SortedList<ChopPage>(listOptions);
    }

    protected startTransmitting() {
        l('Collection is transmitting. Input channel is...');

        go(function *() {
            let event: ChopEvent<ChopPage>,
                page,
                chIn = this.chIn('page'),
                chOutPg = this.chOut('page');


            function pageToEvent(action: string): PageToEvent {
                return page => ({
                    action,
                    data: page
                });
            }

            while ((event = yield take(chIn)) !== csp.CLOSED) {
                let {action, data: page} = event,
                    pages: ChopEvent<any>[] = [];

                if (action === 'ready') {
                    pages = this._list.sort()
                            .map(pageToEvent('add'));
                    pages.push({action: 'ready'});  // sending `ready` once
                } else if (~['add', 'change'].indexOf(action)) {
                    l(`Collecting the page "${page && page.id}"`);
                    if (!this._filter(page)) {
                        yield put(chOutPg, event);  // let it go, it’s not yours
                        continue;
                    }

                    pages = this._list.add(page)
                            .map(pageToEvent(action));
                }

                if (pages.length) {
                    yield* this.sendPages(pages);
                    yield* this.sendCollection(this._list.all);
                }
            }
        }.bind(this));
    }

    patchData(cb: PatchCallback) {
        this._data = Object.assign({}, this._data, cb(this._data));
        return this;
    }

    private *sendPages(pages: ChopPage[]) {
        let len = pages.length,
            chOut = this.chOut('page');
        l(`Sending all the ${len} sorted pages downstream`);

        for (let i = 0; i < len; i++) {
            yield put(chOut, pages[i]);
        }

        return;
    }

    private *sendCollection(posts: ChopPage[]) {
        // let’s keep the _sortedList private so it doesn’t get overridden
        // sortBy ‘user space’ calls like `update` or `patchData`
        this.patchData(() => ({posts}));

        yield put(this.chOut('collection'), {
            type: 'collection',
            action: 'change',
            data: this._data
        });

        return;
    }
}

/*
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
*/
