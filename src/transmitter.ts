/**
 * Created by hoichi on 22.11.2016.
 */

import {Channel, chan} from "js-csp";

export abstract class Transmitter {
    private _chIn: Channel[] = [];
    private _chOut: Channel[] = [];
    private _listeners: Transmitter[] = [];
    private _isTransmitting = false;

    protected chOut(subCh: string) {
        let ch = this._chOut[subCh];
        return ch || (this._chOut[subCh] = chan());
    }

    protected chIn(subCh: string) {
        return this._chIn[subCh];   // q: some tests?
    }

    addListener(listener: Transmitter, subCh: string) {
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

    listenOnChannel(chIn, subCh) {
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
