'use strict';
import ee           from 'events';
import loDefaults   from 'lodash/fp/defaults';
import loHas        from 'lodash/fp/has';
import loIsArray    from 'lodash/fp/isArray';
import loIsFunction from 'lodash/fp/isFunction';
import loSet        from 'lodash/fp/set';
import util         from 'util';


export default function TransmitterFabric({
    checker = data => {!!data},
    reducers = {all: assignByPath},
    output = {
        type: 'data',
        path: ''
    }
    // todo: real defaults
}) {
    if ( !(this instanceof TransmitterFabric) ) {return new TransmitterFabric(...arguments)}

    let isDataReady,
        data,
        dataOut,
        listeners = [];

    // todo: function
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

    function callListener(listener, context, action) {
        listener = listener.bind(context, action);
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
            value: function recieve(action) {
                var type = action.type,
                    reduce = reducers[type] || reducers['all'],
                    outAction;

                if (!reduce) {
                    throw Error(`No reducer for action type "${type}"`);
                }

                data = reduce(data, action);
                if (!checker(data)) {
                    return;
                }

                isDataReady = true;
                this.emit({...output, data});   // to all current and/or future listeners
                this.emit({type: 'ready'});
            }
        },
        on: {
            enumerable: true,
            value: function on(type, newListener, context) {
                var reciever = newListener.recieve ? newListener.recieve : newListener;
                if (!loIsFunction(reciever)) {
                    throw TypeError(`Listener is neither a function nor has a valid \`recieve\` method.`);
                }

                if (!listeners[type]) {
                    listeners[type] = [reciever];
                } else {
                    listeners[type].push(reciever);
                }

                if (isDataReady) {
                    callListener(reciever, context || this, {...output, data});
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