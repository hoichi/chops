'use strict';
/**
 * Created by hoichi on 20.07.2016.
 */

import {SourceWatcherFabric}     from    './fsWatcher';
import {ChopsCollection, SortOptions} from './collection';

export function collection(options: SortOptions) {
    return new ChopsCollection(options);
}

export {
    SourceWatcherFabric as src
};
