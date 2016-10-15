///<reference path="chops.d.ts"/>
/**
 * Created by hoichi on 15.10.2016.
 */

const isFunction = require('lodash/fp/isFunction').isFunction;

/*
* SourceWatcher.transform() (or Transformable.transform()) should:
* - add a transformer to a chain of transformers
* - return PageEmitter or suchlike (maybe just `this`)
* - add a reference to the transformers chain to every chop
*
*
* Ideally, any ChoppingBoard should listen to:
* - page add/change/remove ~> re-transform, re-collect and re-render a page
* - transformer added ~> re-transform all the pages (or add transformations to the under-transformed)
* - collector added ~> add all the existing pages to the new collection (but that mutates pages as well)
* - renderer added/changed ~> re-render all the existing pages
*
* The biggest questions (out of collections) is with adding transformers on the fly. Should we allow that at all? Can we ensure a conservation point after which transformers simply cannot be added (I think we can, and that’s where we should start).
* */

import {PageReduced, PageMeta, PageOpened} from "./chops";

type ChopTransformer = (data:PageOpened) => PageReduced;

export class Transformable {
    private transformersLocked = false;

    constructor(protected transformers: ChopTransformer = defaultTransformer) {}

    /*
    * Adds a new transformer to the end of the chain.
    * */
    transform(newT: ChopTransformer): Transformable {
        if (this.transformersLocked) {
            throw new Error(`Transformers has been locked. Adding new data transformations is impossible after a certain point, like when you’ve already ordered some further operations. Try putting your \`.transform()\` calls earlier.`);
        }

        if (!isFunction(newT)) {
            throw new Error(`Transformer should be a function (think \`d => d\`), what’s been passed has type "${typeof newT}"`);
        }

        this.transformers = data => newT( this.transformers(data) );
        return this;
    }

    protected lockTransformers(): void {
        this.transformersLocked = true;
    }

    protected runTransformers: ChopTransformer = data => this.transformers(data);
}

function defaultTransformer(data:PageOpened): PageReduced {
    const yfm = data.yfm;

    const metaDefaults: PageMeta = {
        published: !!( (data.title||yfm.title) && data.content),  // if it looks ready, it's ready by default
        // slug: u.slugify(yfm.title),
        template: 'single',     // fixme: that’s gonna break fo’ shizzle
        title: 'NO TITLE. Naming is hard.'
    };

    return Object.assign({}, data, metaDefaults, data.yfm); // q: should we implicitly merge yfm? here?
}