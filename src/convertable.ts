///<reference path="chops.d.ts"/>
/**
 * Created by hoichi on 15.10.2016.
 */

import {isFunction} from 'lodash';

import {ChopData}   from './chops';
import l            from './log';

/*
* SourceWatcher.transform() (or Convertable.transform()) should:
* - add a transformer to a chain of converters
* - return PageEmitter or suchlike (maybe just `this`)
* - add a reference to the converters chain to every chop
*
*
* Ideally, any ChoppingBoard should listen to:
* - page add/change/remove ~> re-transform, re-collect and re-render a page
* - transformer added ~> re-transform all the pages (or add transformations to the under-transformed)
* - collector added ~> add all the existing pages to the new collection (but that mutates pages as well)
* - renderer added/changed ~> re-render all the existing pages
*
* The biggest questions (out of collections) is with adding converters on the fly. Should we allow that at all? Can we ensure a conservation point after which converters simply cannot be added (I think we can, and that’s where we should start).
* */

type ChopConverter = (data:ChopData) => ChopData;

export class Convertable {
    private convertersLocked = false;
    protected converters: ChopConverter = d=>d;

    constructor() {}

    /*
     * Adds a new converter to the end of the chain.
     * */
    convert(newC: ChopConverter): Convertable {
        if (this.convertersLocked) {
            throw new Error(`Converters has been locked. Adding new data transformations is impossible after a certain point, like when you’ve already ordered some further operations. Try putting your \`.convert()\` calls earlier.`);
        }

        if (!isFunction(newC)) {
            throw new Error(`Converter should be a function (think \`d => d\`), what’s been passed has type "${typeof newC}"`);
        }

        // let newChain = data => newT( this.converters(data) );
        let prevCs = this.converters;
        this.converters = (function converterPushIife() { return data => newC(prevCs(data)); })();
        return this;
    }

    patch(newC: ChopConverter): Convertable {
        // todo:    add a converter that uses something like Object.assign({}, d, newC(d))
        //          bonus points for patching with several objects
        //          (i.e. by returning an array of them)
        return this;
    }

    protected lockConverters(): void {
        this.convertersLocked = true;
    }

    protected runConverters(data: ChopData): ChopData {
        return this.converters(data);
    }
}

