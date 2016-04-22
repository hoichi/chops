'use strict';
import ee           from 'events';
import loDefaults   from 'lodash/fp/defaults';
import loHas        from 'lodash/fp/has';
import loIsArray    from 'lodash/fp/isArray';
import loSet        from 'lodash/fp/set';
import util         from 'util';


export default function TransmitterFabric({
    checker = data => {!!data},
    runner = null,
    transformers = {},
    outEvent = 'data',
    outPath = ''
}) {
    if ( !(this instanceof TransmitterFabric) ) {return new TransmitterFabric(arguments)}

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
                    let cb = dataListeners[i];
                    cb = cb.bind(this, event, dataOut, ...moreArgs);
                    setTimeout(cb, 0);
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