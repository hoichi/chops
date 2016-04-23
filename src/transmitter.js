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
    if ( !(this instanceof TransmitterFabric) ) {return new TransmitterFabric(...arguments)}

    let isDataReady,
        dataIn,
        dataOut,
        listeners = [],
        transformersIn = Object.assign({},
            transformers.in || {},
            {all: assignByPath}
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

    function callListener(listener, context, args) {
        listener = listener.bind(context, ...args);
        setTimeout(listener, 0);
    }

    Object.defineProperties(DataTransmitter.prototype, {
        emit: {
            enumerable: true,
            value: function emit(event = outEvent, data) {
                var theListeners = listeners[event],
                    len = theListeners && theListeners.length;

                if (!len) {return}

                for (let i = 0; i < len; i++) {
                    callListener(theListeners[i], this, arguments);
                }
            }
        },
        recieve: {
            enumerable: true,
            value: function recieve(event = 'data', newData, path = '') {
                var transform = transformersIn[event] || transformersIn['all'];

                dataIn = transform(dataIn, newData, path);
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

                console.log(this);

                this.emit(outEvent, dataOut, outPath);   // to all current and/or future listeners
                this.emit('ready');
            }
        },
        on: {
            enumerable: true,
            value: function on(event, newListener, context) {
                var reciever = newListener.recieve ? newListener.recieve : newListener;

                if (!listeners[event]) {
                    listeners[event] = [reciever];
                } else {
                    listeners[event].push(reciever);
                }

                if (isDataReady) {
                    callListener(reciever, context || this, [outEvent, dataOut, outPath]);
                }
            }
        },
        hasListeners: {
            enumerable: true,
            value: function hasListeners() {
                return true;
            }
        }
    });

    return new DataTransmitter();
}

function assignByPath(data, newData, path = '') {
    let pathedNew = loSet({}, path, newData);

    return Object.assign({}, data, pathedNew);
}