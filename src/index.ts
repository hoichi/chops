'use strict';
/**
 * Created by hoichi on 20.07.2016.
 */

import {FsWatcher}     from    './fsWatcher';
import {ChopsCollection, SortOptions} from './collection';
import {ChoppingBoard} from "./choppingBoard";

export function collection(options: SortOptions) {
    return new ChopsCollection(options);
}

export const src = makeASourcedBoard();

export const templates = {
    src: makeASourcedBoard('template')
};

function makeASourcedBoard(dataType = 'page') {
    return function genericSrc(globs, options) {
        let board = new ChoppingBoard(dataType);
        return board.src(globs, options);
    }
}
