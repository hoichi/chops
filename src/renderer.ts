///<reference path="chops.d.ts"/>
/**
 * Created by hoichi on 29.10.2016.
 */
import {Channel, alts, chan, go, put, take} from 'js-csp';
import * as csp                             from 'js-csp';
import {isString}                           from 'lodash';

import {ChopData, ChopPage, Dictionary, ChopEvent} from "./chops";
import {FollowingList} from "./following";
import l from './log';
import * as u from "./utils";
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

const rendererCfg = { date_short: u.dateFormatter( // fixme: so hardcode
    'en-US', {year: 'numeric', month: 'short', day: 'numeric'}
)};

export class ChopRenderer extends Transmitter {
    private _tplNameExtractor: (page: ChopPage) => string | string;
    private _tplSubs = FollowingList<TemplateCompiled,ChopPage>();

    constructor ( tplNameOrExtractor: string | StringExtractor
                , private modelType = 'page'
                , private _commonData = {})
    {
        super();

        this.declareChannels({ input: [modelType, 'template']
                             , output: [modelType] });

        this._tplNameExtractor =    isString(tplNameOrExtractor)
                                    ? () => tplNameOrExtractor
                                    : tplNameOrExtractor;
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
                chIn = this.chIn(this.modelType),
                chOut = this.chOut(this.modelType);

            while ( (pageEvent = yield take(chIn)) !== csp.CLOSED ) {
                if (['add', 'change'].indexOf(pageEvent.action) === -1) {
                    put(chOut, pageEvent);
                    continue;
                }

                l(` > > I hear a page "${pageEvent.data && pageEvent.data.id}"...`);
                // get a tpl channel (or create a new one)
                page = pageEvent.data;
                tplName = this._tplNameExtractor(page);

                let tplSub = this._tplSubs.byName(tplName),
                    updates = tplSub.setFollower(page.id, page);
                // todo: error by timeout if template never comes`

                yield* this.sendPages(updates.map(page =>
                    applySingleTemplate(tplSub.leader, {...this._commonData, page})
                ));
            }
        }.bind(this));
    }

    private listenForTemplates() {
        go(function *() {
            let tplEvent: ChopEvent<TemplateCompiled>,
                template: TemplateCompiled;

            l(`Listening for templates`);
            while ( (tplEvent = yield take(this.chIn('template'))) !== csp.CLOSED ) {
                if (~[`add`, `change`].indexOf(tplEvent.action)) {
                    template = tplEvent.data as TemplateCompiled;
                    l(`  I hear a template "${template.id}"`);

                    let tplSub = this._tplSubs.byName(template.id),
                        updates = tplSub.setLeader(template);

                    yield* this.sendPages(updates.map(page =>
                        applySingleTemplate(tplSub.leader, {...this._commonData, page})
                    ));
                }

                // pass the event along
                if (this.subscriber('template')) {
                    yield put(this.chOut('template'), tplEvent);
                }
            }
        }.bind(this));
    }

    private *sendPages(pages: ChopPage[]) {
        let len = pages.length,
            chOut = this.chOut(this.modelType);

        for (let i = 0; i < len; i++) {
            yield put(chOut, {
                action: 'change',
                data: pages[i]
            });
        }

        return;
    }
}

function applySingleTemplate(template: TemplateCompiled, data: PageRendererData): ChopPage {
    if (!template.render) throw Error('Rendering pages without a template is way beyond my skills.');

    // todo: think through what should overwrite what
    let fullData =  {cfg: rendererCfg, ...data};

    l(`RRRRRendering a page "${data.page.id}"`);
    return {...data.page, content: template.render(fullData)};
}
