'use strict';

function Collectable() {}

Object.defineProperties(Collectable.prototype, {
    addTo: {
        enumerable: true,
        value: collection => {
            this.addListener('all', collection.onAll);
        }
    }
});

function CollectionFabric() {
    var unsorted = [];

    function Collection() {}

    Object.defineProperties(Collection.prototype, {
        /* Add makes a collection listen to an emitter */
        addEmitter: {
            enumerable: true,
            value: emitter => {
                emitter.addListener('data');
            }
        },
        onAddOrChanged: {
            enumerable: true,
            value: (item) => {
                var key = sortOrder(item),
                    dic = dataIn.dic;

                if (!dic[key]) {
                    dataIn.counter++;
                }

                dic[key] = item;

                flushWhenReady();
            }
        },
        onUnlink: {
            enumerable: true,
            value: (item) => {
                var key = sortOrder(item),
                    dic = dataIn.dic;

                if (dic[key]) {
                    delete dic[key];
                    dataIn.counter--;
                }

                flushWhenReady();
            }
        },
        flushWhenReady: {
            enumerable: true,
            value: () => {
                if (!dataReady) return;

                this.transform();   // maybe. should we check if we're transformed already? _.orderBy is somewhat expensive

                /*
                    also, this is all boilerplate and belongs to transmitter
                */
            }
        },
        /*
        * on ready, transform and flush
        * on addListener, if ready, transform and send to the new one
        * */
    });
}
