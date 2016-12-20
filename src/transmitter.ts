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
    private _subscribers: Transmitter[] = [];
    private _isTransmitting = false;

    protected declareChannels(lists: ChannelDeclaration) {
        (lists.output || []).forEach(s =>
            this._chOut[s] = chan()  // these ones we create right away
        );

        (lists.input || []).forEach(s => {
            this._chIn[s] = 'standby';  // ready to accept a channel
            this._chOut[s] || (this._chOut[s] = chan()); // we’re transparent to all the inputs`
        });
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

    protected subscriber(subCh: string) {
        return this._subscribers[subCh];    // undefined is falsy enough for now
    }

    subscribe(subCh: string, subscriber: Transmitter) {
        if (this._subscribers[subCh]) {
            throw Error(`Subchannel "${subCh}" already has a listener. Them shits are not multicast, y’know.`);
        }

        let chOut = this.chOut(subCh);
        this._subscribers[subCh] = subscriber;
        subscriber.listenOnChannel(chOut, subCh);

        this.shallWeStart();
    }

    private shallWeStart() {
        for (let k in this._chIn) {
            if (this._chIn[k] === 'standby') {
                // not receiving yet
                return;
            }
        }

        if (!this._isTransmitting) {
            this._isTransmitting = true;
            this.startTransmitting();
        }
    }

    listenOnChannel(chIn: Channel, subCh: string) {
        let ch = this._chIn[subCh];
        if (!ch)
            throw Error(`Input channel for the type "${subCh}" is not declared`);
        if (ch !== 'standby')
            throw Error(`Already listening on subchannel "${subCh}", this dupe is probably in error.`);

        this._chIn[subCh] = chIn;
        this.startReceiving(subCh);
        this.shallWeStart();
    }

    protected abstract startTransmitting(); // q: make it public?

    /*
     * By default, startReceiving does nothing.
     * It’s only needed in the minority of cases. Most of them shits should be lazy
     * and only run anything when there’s a listener.
     * */
    protected startReceiving(subCh: string) {}
}


class Subscription {
    private _chOut: Channel;
}