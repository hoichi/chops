/**
 * Created by hoichi on 29.10.2016.
 */
import {Channel, alts, chan, go, put, take} from "js-csp";
import * as csp from "js-csp";
import {ChopData, ChopPage, ChopSite, Dictionary} from "./chops";

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
    (page: ChopPage, site?: ChopSite, globals?: Dictionary<any>): string;
}

interface TemplateSubscription {
    chTpl: Channel;
    chRefresh: Channel;
    pages: Dictionary<ChopPage>;    // todo: the keys should be of type `ChopId`
}

export class ChopRenderer {
    private chOut: Channel = chan();
    private tplPub;
    private tplSubscribers: Dictionary<TemplateSubscription> = Object.create(null);

    constructor ( private chTemplates: Channel
                , private chContent: Channel
                , private tplNameExtractor: (page: ChopPage) => string ) {
        this.tplPub = csp.operations.pub(chTemplates, tpl => tpl.id);
        this.startRendering()
    }

    startRendering() {
        this.listenToTemplates();
        this.listenToPages();
    }

    private listenToTemplates() {
        go(function *(me) {
            let template: TemplateCompiled;

            while ( (template = yield take(me.chTemplates)) !== csp.CLOSED ) {
                // todo: dedupe?
                let subscription: TemplateSubscription = me.addTplSubscription(template.id),
                    pages = subscription.pages;

                yield put(subscription.chRefresh, true);    /* maybe put it inside of reApplyTemplate? */
                this.reApplyTemplate(template, subscription);
            }
        }, this);
    }

    private reApplyTemplate(template: TemplateCompiled,
                            {pages, chRefresh}: TemplateSubscription ) {
        go(function *(me) {
            for (let key in pages) {
                let res = yield alts([
                    chRefresh,
                    [me.chOut, template.render(pages[key])]
                ], {priority: true});

                if (res.channel === chRefresh) break;   /*  or should we check for a value?
                                                            right now we just put `true` there */
            }

            return;
        }, this);
    }

    private listenToPages() {
        go(function *(me) {
            let page: ChopPage,
                tplName: string,
                tplSub: TemplateSubscription,
                template: TemplateCompiled;

            while ( (page = yield take(me.chContent)) !== csp.CLOSED ) {
                // get a tpl channel (or create a new one)
                tplName = me.tplNameExtractor(page);
                tplSub = me.addTplSubscription(tplName, page);

                // take a template itself (or wait for it) and render the page
                template = yield take(tplSub.chTpl);
                yield put(me.chOut, template.render(page));
            }
        }, this);
    }

    private addTplSubscription(topic: string, page?: ChopPage) {
        const {tplSubscribers, tplPub} = this;
        let subscription: TemplateSubscription = tplSubscribers[topic];

        if (!subscription) {
            // add a new template subscription
            tplSubscribers[topic] = subscription = {
                chTpl: chan(csp.buffers.sliding(1)),
                pages: Object.create(null),
                chRefresh: chan(1)
            };
            csp.operations.pub.sub(tplPub, topic, subscription.chTpl);
        }

        page &&
            (subscription.pages[page.id] = page);

        return subscription;
    }
}