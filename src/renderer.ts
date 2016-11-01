///<reference path="chops.d.ts"/>
/**
 * Created by hoichi on 29.10.2016.
 */
import {Channel, alts, chan, go, put, take} from 'js-csp';
import * as csp                             from 'js-csp';
import {isString}                           from 'lodash/fp';

import {ChopData, ChopPage, ChopSite, Dictionary, ChopEvent}   from "./chops";
import l                                            from './log';
import {FsWriter} from "./fsWriter";

/*
 * A template file (as a chop).
 * */
export interface TemplateCompiled extends ChopData {
    render: PageRenderer;
    // q: do we need anything from ChopPage? path, maybe?
}

/*
 * A template function for rendering pages
 */
export interface PageRenderer {
    (data: PageRendererData): string;
}

export interface PageRendererData {
    page: ChopPage;
    [k: string]: any;
}

export interface StringExtractor {
    (page: ChopPage): string;
}

interface TemplateSubscription {
    chTpl: Channel;
    chRefresh: Channel;
    pages: Dictionary<ChopPage>;    // todo: the keys should be of type `ChopId`
}

export class ChopRenderer {
    private _chOut: Channel = chan();
    private _tplPub;
    private _tplSubscribers: Dictionary<TemplateSubscription> = Object.create(null);
    private _tplNameExtractor: (page: ChopPage) => string | string;

    constructor ( private _chTemplates: Channel
                , private _chContent: Channel
                , tplNameOrExtractor: string | StringExtractor) {

        this._tplNameExtractor = isString(tplNameOrExtractor)
            ? () => tplNameOrExtractor
            : tplNameOrExtractor
        ;
        // todo: runtime check for a function

        // l('Publishing template channels by id');
        // this._tplPub = csp.operations.pub(_chTemplates, tpl => tpl.id);

        l('Now hark!');
        this.listenForTemplates();
        this.listenForPages();
    }

    write(dir: string) {
        l(`Writing to %s`, dir);
        return new FsWriter(this._chOut, dir);
    }

    private listenForTemplates() {
        go(function *() {
            let tplEvent: ChopEvent<TemplateCompiled>,
                template: TemplateCompiled;

            l(`Listening for templates`);
            while ( (tplEvent = yield take(this._chTemplates)) !== csp.CLOSED ) {
                // todo: dedupe?
                template = tplEvent.data;
                l(`  I hear a template "${template.id}"`);
                let subscription = this.addTplSubscription(template.id);
                yield put(subscription.chTpl, template);
                this.reApplyTemplate(template, subscription);   // q: race condition anyone?`
            }
        }.bind(this));
    }

    private reApplyTemplate(template: TemplateCompiled,
                            {pages, chRefresh}: TemplateSubscription ) {
        go(function *(me) {
            for (let key in pages) {
                l(`RRRRRendering a page "${key}"`);
                let pageRendered = me.applySingleTemplate(template, {page: pages[key]}),
                    res = yield alts([
                        chRefresh,
                        [me._chOut, pageRendered]
                    ], {priority: true});

                l(`pageRendered.url while reapplying template = ${pageRendered.url}`);
                if (res.channel === chRefresh) break;   /*  or should we check for a value?
                                                            right now we just put `true` there */
            }

            return;
        }, [this]);
    }

    private listenForPages() {
        go(function *(me) {
            let pageEvent: ChopEvent<ChopPage>,
                page,
                tplName: string,
                tplSub: TemplateSubscription,
                template: TemplateCompiled;

            while ( (pageEvent = yield take(me._chContent)) !== csp.CLOSED ) {
                // get a tpl channel (or create a new one)
                page = pageEvent.data;
                tplName = me._tplNameExtractor(page);
                tplSub = me.addTplSubscription(tplName, page);
                // todo: error by timeout if template never comes`

                // take a template itself (or wait for it) and render the page
                template = yield take(tplSub.chTpl);
                let pageRendered = me.applySingleTemplate(template, {page});
                l(`pageRendered.url = ${pageRendered.url}`);``
                yield put(me._chOut, pageRendered);
            }
        }, [this]);
    }

    private applySingleTemplate(template: TemplateCompiled, data: PageRendererData): ChopEvent<ChopPage> {
        // todo: make it a pure function. and maybe separate rendering from data flow
        // console.dir(data);
        return {
            type: 'add',    //fixme
            data: Object.assign({}, data.page, template.render(data))
        };``
    }

    private addTplSubscription(topic: string, page?: ChopPage): TemplateSubscription {
        const {_tplSubscribers, _tplPub} = this;
        let subscription = _tplSubscribers[topic];

        if (!subscription) {
            // add a new template subscription
            _tplSubscribers[topic] = subscription = {
                chTpl: chan(csp.buffers.sliding(1)),
                pages: Object.create(null),
                chRefresh: chan(1)
            };
            // csp.operations.pub.sub(_tplPub, topic, subscription.chTpl);
        }

        page &&
            (subscription.pages[page.id] = page);

        return subscription;
    }
}