/**
 * Created by hoichi on 27.11.2016.
 */
import {go, put, take} from "js-csp";
import * as csp from "js-csp";

import {ChopEvent, ChopData} from "./chops";
import {Transmitter} from "./transmitter";

export type ChopConversion = (data: ChopData) => ChopData;

export class Converter extends Transmitter {
    constructor(private conversion: ChopConversion, private modelType = 'page') {
        super();

        this.declareChannels({
            input: [modelType],
            output: [modelType]
        });
    }

    protected startTransmitting() {
        go(function *() {
            let event: ChopEvent<ChopData>,
                chIn = this.chIn(this.modelType),
                chOut = this.chIn(this.modelType);

            while ((event = yield take(chIn)) !== csp.CLOSED) {
                let {data} = event, // todo: check it it’s a data event
                    eventOut = Object.assign({}, event, {
                        data: this.conversion(data)
                    });

                yield put(chOut, eventOut);
            }
        }.bind(this));  // <- so that `this` works inside the generator
    }
}