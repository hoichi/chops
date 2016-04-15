'use strict';

import ee       from 'events';
import has      from 'lodash/fp/has';
import isArray  from 'lodash/fp/isArray';
import util     from 'util';


/*
- cache the latest actual data
    (here's a case for pure functions/immutability)
- on data arrival, check if we have full set
- if we do, do our transformations and emit
- on `newListener`, if data is ready, fire it right off

Okay, so all the config data are part of the model. Destination path, for instance, is a part of the file writing nodes. So even if we have html content to write, we're still waiting for the path before we can actually emit anything.
Meaning we should somehow check whether the data is full, either by having a method that is called on any data arrival, or by checking off pieces of data. I mean, if we have different transformers for different data types, we might as well check that anything of this type has arrived.

But then we don't need separate transformers. Might make some sense for objects, so that every transformer merges its part, but makes zero sense for page rendering, for instance. We do have to discern sources or kinds of data though, so the events have to have _some_ signature. So we can still check the pieces type and check them off.
But can we know what pieces we need just by what we're listening to? Or should we state it explicitly? We probably need a second mechanism anyway: like, when we code a file writer, we know beforehand we gonna need a file path, whatever we listen to.

Then we can just send this: `emit('data', {model: {...}}), emit('data', {template: fnCompiled})`, and have our input model like this:
```js
{
    model: {...},
    template: fnCompiled
}
```
We could even transform and check for data completeness at the same time. Either we return an object to emit, or we return something falsy.

Also, we prob' need to fire 'ready' when we're ready. For our traffic guard and shit.

 var de = TransmitterFabric({
     checker: data => {data.hasAll(['p1', 'p2.p3'])},
     transformer: data => {data.content}
 });

 */

function TransmitterFabric({
    checker = data => !!data,
    transformer = input => input
}) {
    if ( !(this instanceof TransmitterFabric) ) {return new TransmitterFabric()}

    let isDataReady,
        dataIn,
        dataOut,
        dataListeners = [],
        onNewListener = (event, listener) => {
            if (event === 'data' && isDataReady) {
                listener(dataOut);
            }
        };

    if (isArray(checker)) {
        let checkerPaths = checker;

        checker = function dataPropertiesChecker(data) {
            checkerPaths.forEach(path => {
                if (!has(data, path)) { return false; }
            });

            return true;
        };
    }

    function DataTransmitter() {
        isDataReady = false;
        return this;
    }

    util.inherits(DataTransmitter, ee); // ?

    Object.defineProperties(DataTransmitter.prototype, {
        fireData: {
            enumerable: true,
            value: (data, dType) => {
                var ctx = this,
                    dataListeners = listeners['data'],
                    len = dataListeners.length;

                if (!len) {return}

                for (let i = 0; i < len; i++) {
                    dataListeners[i](dataOut);
                }
            }
        },
        onData: {
            enumerable: true,
            value: newData => {
                var ctx = this;

                Object.assign(dataIn, newData);
                if (!checker(dataIn)) {
                    return;
                }
                // $TODO: split reaction and action. as in, make pure writables. maybe fire `ready`?
                isDataReady = true;
                dataOut = transformer(dataIn);
                this.emit('ready');
                this.emit(data, dataOut);
            }
        },
        addDataListener: {
            enumerable: true,
            value: newListener => {
                let realListener = newListener.onData ? newListener.onData : newListener;

                dataListeners.push(realListener);

                if (isDataReady) {
                    realListener(dataOut);  // That's coupled. But then making a function for calling
                                            // a single listener is extremely convoluted
                }
            }
        }
    });

    return new DataTransmitter();
}


