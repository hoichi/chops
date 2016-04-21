'use strict';

import loIsArray    from 'lodash/fp/isArray';
import loIsFunction from 'lodash/fp/isFunction';
import loIteratee   from 'lodash/fp/iteratee';
import loOrderBy    from 'lodash/fp/orderBy';

export default function CollectionFabric({
    sortIteratee = obj => obj.toString(),
    sortOrders
}) {
    if ( !(this instanceof CollectionFabric) ) {return new CollectionFabric()}

    let dataReady = false,
        dataIn = {dic: {}},
        dataOut = null,
        listeners;

    if (!loIsFunction(sortIteratee)) {
        sortIteratee = loIteratee(sortIteratee);
    }

    let Collection = TransmitterFabric({
            checker: d => d.ready,
            transformers: {
                in: {
                    add:        inAddOrChange,
                    changed:    inAddOrChange,
                    unlink:     inUnlink
                },
                out: outSort
            }
        });

    return TransmitterFabric;
}

function inAddOrChange(dataIn, newData) {
    var key = sortIteratee(newData),
        newRecord = Object.create(null);

    newRecord[key] = newData;

    return {...dataIn, newRecord}
}

function inUnlink(dataIn, newData) {
    var key = sortIteratee(newData);

    if (dataIn[key]) {
        let result = {...dataIn};
        delete result[key];
        return result;
    }

    return dataIn;
}

function outSort(dataIn) {
    return {
        dic: input.dic,
        idx: loOrderBy(input.dic, [this.sortIteratee], [this.sortOrder])
    }
};
