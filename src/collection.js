'use strict';

import isArray from 'lodash/fp/isArray';
import orderBy from 'lodash/fp/orderBy';
import stampit from 'stampit';

const CollectableStamp = stampit()
    .methods({
       collect: collection => {
           this.addListener('all', collection.onAll);
       }
    });


const CollectionStamp = stampit()
    .init(function CollectionInit (instance, stamp) {
        var dataReady = false,
            dataIn = {dic: {}},
            dataOut = null,
            listeners;

        function transform(input) {
            return {
                dic: input.dic,
                idx: orderBy(input.dic, this.sortIteratees, this.sortOrders)
            }
        }

        this.onReady = function onReady() {
            dataReady = true;
            this.flushWhenReady();
            // todo: emit `ready`
        };

        this.flushWhenReady = function flushWhenReady(toWhom = listeners['data'] || []) {
            if (!dataReady) return;

            dataOut = transform(dataIn);
            toWhom.forEach( listener => {
                listener(dataOut);       // todo: async
            });
        };

        this.addListener = function addListener(listener, events = 'data') {
            if (!isArray(events)) {
                events = [events];
            }

            events.forEach((event, idx) => {
                if (!isArray(listeners[event])) {
                    listeners[event] = [];
                }

                listeners[event].push(listener);
            });

            flushWhenReady([listener]);
        }
    })
    .refs({
        sortIteratees:  [],
        sortOrders:     []
    })
    .methods({
        onAddOrChanged: function onAddOrChanged(item) {
            var key = sortIteratees(item),
                dic = dataIn.dic;

            if (!dic[key]) {
                dataIn.counter++;
            }

            dic[key] = item;

            flushWhenReady();
        },
        onUnlink: function onUnlink(item) {
            var key = sortIteratees(item),
                dic = dataIn.dic;

            if (dic[key]) {
                delete dic[key];
                dataIn.counter--;
            }

            flushWhenReady();
        }
    });

