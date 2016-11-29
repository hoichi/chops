///<reference path="chops.d.ts"/>
/**
 * Created by hoichi on 29.10.2016.
 */
import {Channel, alts, chan, go, put, take} from 'js-csp';
import * as csp                             from 'js-csp';
import {isString}                           from 'lodash';

import {ChopData, ChopPage, Dictionary, ChopEvent}  from "./chops";
import l                                            from './log';
import {FsWriter}                                  from "./fsWriter";
import * as u                                       from "./utils";
import {Transmitter} from "./transmitter";

/*
 * A template file (as a chop)
 */
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
    cfg?: Dictionary<any>;
    [k: string]: any;
}

/*
 * extracts a template name from a ChopPage
 * */
export interface TemplateNameCb {
    (p: ChopPage): string;
}

export interface StringExtractor {
    (page: ChopPage): string;
}

interface TemplateSubscription {
    chTpl: Channel;
    chRefresh: Channel;
    pages: Dictionary<ChopPage>;    // todo: the keys should be of action `ChopId`
    latest: TemplateCompiled;
}

const rendererCfg = { date_short: u.dateFormatter( // fixme: so hardcode
    'en-US', {year: 'numeric', month: 'short', day: 'numeric'}
)};

export class ChopRenderer extends Transmitter {
    private _tplNameExtractor: (page: ChopPage) => string | string;
    private _tplSubscribers = [];

    constructor (tplNameOrExtractor: string | StringExtractor, private modelType = 'page') {
        super();

        this.declareChannels({ input: [modelType]
                             , output: [modelType, 'template'] });

        this._tplNameExtractor =    isString(tplNameOrExtractor)
                                    ? () => tplNameOrExtractor
                                    : tplNameOrExtractor;
    }

    private listenForTemplates() {
        go(function *() {
            let tplEvent: ChopEvent<TemplateCompiled>,
                template: TemplateCompiled;

            l(`Listening for templates`);
            while ( (tplEvent = yield take(this.chIn('template'))) !== csp.CLOSED ) {
                template = tplEvent.data;
                l(`  I hear a template "${template.id}"`);

                let subscription = this.addTplSubscription(template.id);
                subscription.latest = template; // todo:
                                                // - put it on a [generic] Subscription class?
                                                // - or create an fp-style latest(chan): Channel?
                                                //   probably more expensive, but

                yield put(subscription.chTpl, template);    // q: and do we need this channel at all?
                this.reApplyTemplate(template, subscription);   // fixme: race conditions
                                                                // maybe just delegate to a generator, like in Collection
            }
        }.bind(this));
    }

    private reApplyTemplate(template: TemplateCompiled,
                            {pages, chRefresh}: TemplateSubscription ) {
        l(`--- reapplying template ${template.id}`);
        go(function *() {
            let chOut = this.chOut(this.modelType);

            for (let key in pages) {
                let pageRendered = this.applySingleTemplate(template, {page: pages[key]}),
                    res = yield alts([
                        chRefresh,
                        [chOut, pageRendered]
                    ], {priority: true});

                if (res.channel === chRefresh) break;   /*  or should we check for a value?
                                                            right now we just put `true` there */
            }

            return;
        }.bind(this));
    }

    protected startTransmitting() {
        this.listenForPages();
        this.listenForTemplates();
    }

    private listenForPages() {
        go(function *() {
            let pageEvent: ChopEvent<ChopPage>,
                page,
                tplName: string,
                tplSub: TemplateSubscription,
                template: TemplateCompiled,
                chIn = this.chIn(this.modelType),
                chOut = this.chOut(this.modelType);

            while ( (pageEvent = yield take(chIn)) !== csp.CLOSED ) {
                l(` > > I hear a page "${pageEvent.data.id}"...`);
                // get a tpl channel (or create a new one)
                page = pageEvent.data;
                tplName = this._tplNameExtractor(page);
                tplSub = this.addTplSubscription(tplName, page);
                // todo: error by timeout if template never comes`

                // take a template itself (or wait for it) and render the page
                l(` >> >> ...yielding a template "${tplName}"...`);
                template = tplSub.latest || (yield take(tplSub.chTpl));
                l(` >>> >>> ...and getting a template "${template.id}"`);
                let pageRendered = this.applySingleTemplate(template, {page});
                yield put(chOut, pageRendered);
            }
            l(`NOT LISTENING TO PAGES ANYMORE`);
        }.bind(this));
    }

    protected static applySingleTemplate(template: TemplateCompiled, data: PageRendererData): ChopEvent<ChopPage> {
        // todo: make it a pure function. and maybe separate rendering from data flow
        let fullData = Object.assign({}, {cfg: rendererCfg}, data);
        l(`RRRRRendering a page "${data.page.id}"`);
        return {
            action: 'add',    // fixme: event flow doesn’ belong here at all
            data: Object.assign({}, data.page, {content: template.render(fullData)})
        };
    }

    private addTplSubscription(topic: string, page?: ChopPage): TemplateSubscription {
        const subscribers = this._tplSubscribers;
        let subscription = subscribers[topic];

        if (!subscription) {
            // add a new template subscription
            subscribers[topic] = subscription = {
                chTpl: chan(csp.buffers.sliding(1)),
                pages: Object.create(null),
                chRefresh: chan(1),
                latest: undefined
            };
        }

        page &&
            (subscription.pages[page.id] = page);

        return subscription;
    }
}