///<reference path="chops.d.ts"/>
/**
 * Created by hoichi on 15.10.2016.
 */

import {isFunction} from 'lodash';
import {Channel} from "js-csp";

import {ChopData}   from './chops';
import l            from './log';
import {Transmitter} from "./transmitter";

/*
* Ok, plan is: we replace the Convertable ancestry with ChainMaker ancestry, re-implement converters with channel linking and then probably lose those .converts on ancestor (unless we need them everywhere).
* */

type ChopConverter = (data:ChopData) => ChopData;

export class ChainMaker {
    private _convertersLocked = false;
    private _isTransmitting = false;
    private _transmitters: Transmitter[][] = [];
    protected converters: ChopConverter = d=>d;

    constructor(private subChan: string) {};

    protected addTransmitter(transmitter:Transmitter) {
        let chain = this._transmitters[this.subChan],
            prevTrtr;

        if (!chain || !(prevTrtr = chain[chain.length - 1])) {
            throw Error('Cannot add a transmitter: no emitter present to start with.');
        }

        prevTrtr.addListener(this.subChan, transmitter);
        chain.push(transmitter);
    }

    protected addEmitter(emitter:Transmitter) {
        let chain = this._transmitters[this.subChan];

        if (!chain) {
            this._transmitters[this.subChan] = chain = [];
        } else if (chain.length) {
            throw Error('You can only add an emitter to a start of the chain.');
        }

        chain.push(emitter);
    }

    /*
     * Adds a new converter to the end of the chain.
     * */
    convert(newC: ChopConverter): ChainMaker {
        if (this._convertersLocked) {
            throw new Error(`Converters has been locked. Adding new data transformations is impossible after a certain point, like when you’ve already ordered some further operations. Try putting your \`.convert()\` calls earlier.`);
        }

        if (!isFunction(newC)) {
            throw new Error(`Converter should be a function (think \`d => d\`), what’s been passed has type "${typeof newC}"`);
        }

        let prevCs = this.converters;
        this.converters = (function converterPushIife() { return data => newC(prevCs(data)); })();
        return this;
    }

    patch(newC: ChopConverter): ChainMaker {
        // todo:    add a converter that uses something like Object.assign({}, d, newC(d))
        //          bonus points for patching with several objects
        //          (i.e. by returning an array of them)
        return this;
    }

    protected lockConverters(): void {
        this._convertersLocked = true;
    }

    protected runConverters(data: ChopData): ChopData {
        return this.converters(data);
    }
}

