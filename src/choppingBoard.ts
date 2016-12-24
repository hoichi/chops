///<reference path="chops.d.ts"/>
/**
 * Created by hoichi on 15.10.2016.
 */

import {ChopPage, ChopData} from "./chops";
import l from './log';

import {ChainMaker} from './chainmaker';

import {FsWatcher} from "./fsWatcher";
import {ChopsCollection} from "./collection";
import {ChopConversion, Converter} from "./converter";
import {FsWriter} from './fsWriter';
import {ChopRenderer, TemplateNameCb} from './renderer';


export class ChoppingBoard<T extends ChopData> extends ChainMaker {
    constructor(dataType = 'page') {
        super(dataType);
    }

    src(globs, options) {
        this.addEmitter(new FsWatcher(globs, options, this.subChan));
        return this;
    }

    convert(conversion: ChopConversion) {
        this.addTransmitter(new Converter(conversion, this.subChan));
        return this;
    }

    collect(collection: ChopsCollection) {
        l(`collecting to...some kinda collection`);
        this.addTransmitter(collection.transmitter);
        return this;
    }

    render(templates: ChoppingBoard<ChopPage>, tplName: string | TemplateNameCb, data = {}) {
        const renderer = new ChopRenderer(tplName, this.subChan, data);
        templates.addTransmitter(renderer); // listen for templates
        this.addTransmitter(renderer);      // and also for pages
        return this;
    }

    write(dir: string) {
        l(`Writing to %s`, dir);
        this.addTransmitter(new FsWriter(dir, this.subChan));
        return this;
    }
}

