/**
 * Created by hoichi on 22.11.2016.
 */

import {Channel, chan} from "js-csp";
import {Dictionary} from "./chops";

interface ChannelDeclaration {
    input?: string[];
    output?: string[];
}

export abstract class Transmitter {
    private _chIn: Dictionary<Channel> = {};
    private _chOut: Dictionary<Channel> = {};
    private _listeners: Transmitter[] = [];
    private _isTransmitting = false;

    protected declareChannels(lists: ChannelDeclaration) {
        (lists.input || []).forEach(s => this._chIn[s] = chan());
        (lists.output || []).forEach(s => this._chOut[s] = chan());
    }

    protected chOut(subCh: string) {
        let ch = this._chOut[subCh];
        if (!ch) throw Error(`Output channel for the type "${subCh}" is not declared`);
        return ch;
    }

    protected chIn(subCh: string) {
        let ch = this._chIn[subCh];
        if (!ch) throw Error(`Input channel for the type "${subCh}" is not declared`);
        return ch;
    }

    addListener(subCh: string, listener: Transmitter) {
        if (this._listeners[subCh]) {
            throw Error(`Subchannel "${subCh}" already has a listener. Them shits are not multicast, y’know.`);
        }

        let chOut = this.chOut(subCh);
        this._listeners[subCh] = listener;
        listener.listenOnChannel(chOut, subCh);

        if (!this._isTransmitting) {
            this._isTransmitting = true;
            this.startTransmitting();
        }
    }

    listenOnChannel(chIn: Channel, subCh: string) {
        if (this._chIn[subCh]) {
            throw Error(`Already listening on subchannel "${subCh}", this dupe is probably in error.`);
        }

        this._chIn[subCh] = chIn;
        this.startReceiving();
    }

    protected abstract startTransmitting(); // q: make it public?

    /*
     * By default, startReceiving does nothing.
     * It’s only needed in the minority of cases. Most of them shits should be lazy
     * and only run anything when there’s a listener.
     * */
    protected startReceiving() {}

}
