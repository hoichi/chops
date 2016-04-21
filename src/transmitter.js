'use strict';
import ee           from 'events';
import loDefaults   from 'lodash/fp/defaults';
import loHas        from 'lodash/fp/has';
import loIsArray    from 'lodash/fp/isArray';
import loSet        from 'lodash/fp/set';
import util         from 'util';


/*
- cache the latest actual data
    (here's a case for pure functions/immutability)
- on data arrival, check if we have full set
- if we do, do our transformations and emit
- on `newListener`, if data is ready, fire it right off

Okay, so all the config data are part of the model. Destination path, for instance, is a part of the file writing nodes. So even if we have html content to write, we're still waiting for the path before we can actually emit anything.
Meaning we should somehow check whether the data is full, either by having a method that is called on any data arrival, or by checking off pieces of data. I mean, if we have different transformers for different data types, we might as well check that anything of this type loHas arrived.

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

export default function TransmitterFabric({
    checker = data => !!data,
    runner = null,
    transformers = {},
    outEvent = 'data',
    outPath = ''
}) {
    if ( !(this instanceof TransmitterFabric) ) {return new TransmitterFabric()}

    let isDataReady,
        dataIn,
        dataOut,
        dataListeners = [],
        transformersIn = Object.assign({},
            transformers.in || {},
            {all: assignByPath()}
        ),
        transformerOut = transformers.out || (d => d);

    if (loIsArray(checker)) {
        let checkerPaths = checker;

        checker = function dataPropertiesChecker(data) {
            checkerPaths.forEach(path => {
                if (!loHas(data, path)) { return false; }
            });

            return true;
        };
    }

    function DataTransmitter() {
        isDataReady = false;
        return this;
    }

    // util.inherits(DataTransmitter, ee); // ?

    Object.defineProperties(DataTransmitter.prototype, {
        emit: {
            enumerable: true,
            value: (event = outEvent, data) => {
                var dataListeners = listeners[event],
                    len = dataListeners && dataListeners.length,
                    moreArgs = [].slice.call(arguments, 2); // besides event and data

                if (!len) {return}

                for (let i = 0; i < len; i++) {
                    dataListeners[i](event, dataOut, ...moreArgs);
                }
            }
        },
        recieve: {
            enumerable: true,
            value: (event = 'data', newData, path = '') => {
                var transform = transformersIn[event] || transformersIn['all'];

                // transforming input
                dataIn = transform(dataIn, newData, path);
                //checking
                if (!checker(dataIn)) {
                    return;
                }

                isDataReady = true;
                // ready to transform output
                dataOut = transformers.out(dataIn);

                // anything to run?
                if (runner) {
                    runner(dataIn, dataOut);
                }

                this.emit(outEvent, dataOut);   // we should `emit` even if we don't have listeners.
                                                // they might be added later
                this.emit('ready');
            }
        },
        on: {
            enumerable: true,
            value: newListener => {
                var reciever = newListener.recieve ? newListener.recieve : newListener;

                dataListeners.push(reciever);

                if (isDataReady) {
                    reciever(outEvent, dataOut, outPath);  // That's coupled. But then making a function for calling
                                        // a single listener is extremely convoluted
                }
            }
        },
        hasListeners: {
            enumerable: true,
            value: () => true
        }
    });

    return new DataTransmitter();
}

function assignByPath(data, newData, path = '') {
    let pathedNew = loSet({}, path, newData);

    return Object.assign({}, data, pathedNew);
}