/**
 * Created by hoichi on 18.01.2017.
 */
import {sortedLastIndexBy, sortBy} from 'lodash';

export interface SortedList<T> {
    isSorted: boolean;
    add(T): ReadonlyArray<T>;
    all: ReadonlyArray<T>;
    sort(): ReadonlyArray<T>;
    __4tests__?: SLPrivateFunctions<T>;
}

interface SLPrivateFunctions<T> {
    addSorted(T): ReadonlyArray<T>,
    meetTheNeighbors(number, T): ReadonlyArray<T>,
    setPrevNext(a:T,b:T): [T,T]
}

interface SLOptions<T> {
    debug?: boolean,
    indexBy?: SortIteratee,
    sortBy?: SortIteratee,
    setPrev?: PrevNextSetter<T>,
    setNext?: (target: T, other: T) => T,
    unique?: boolean,
}

type SortValue = string | number;
export type SortIteratee = (el: any) => SortValue;
type PrevNextSetter<T> = (target: T, other: T) => T;

/*
* What does it do
* - adds value
* - sorts values on demand
* - reports length
* - returns all
* */

export function SortedList<T>(options: SLOptions<T> = {}): SortedList<T> {
    let _isSorted = false,
        _dic = Object.create(null),
        _list: T[] = [];

    function PrevNextNoOp(target: T, other: T) {
        return target;
    }

    /* options defaults */
    let _options = {
            debug: false,
            indexBy: options.sortBy || (el => el.toString()),
            setNext: PrevNextNoOp,
            setPrev: PrevNextNoOp,
            sortBy: options.indexBy || (el => el.toString()),
            unique: true,
            ...options
        };

    /**
     * Adds an item and returns whatever we’re ready to return
     * @param item
     * @returns {any}
     */
    function add(item: T) {
        let id = _options.indexBy(item);

        _dic[id] = item;

        if (_isSorted) {
            // insert into a sorted position,
            // return the 2 or three updated items
            return addSorted(item);
        }

        return [];
    }

    /**
     * Insert an item in a sorted position, returns every item mutated in the process
     * @param item
     * @returns {Array}
     */
    function addSorted(item: T) {
        if (!_isSorted) throw Error('Did someone just call `addSorted()` on an unsorted all?');

        // todo: FP-ize
        let by  = _options.sortBy,
            idx = sortedLastIndexBy(_list, item, by);

        // insert in the sorted position
        _list = [ ..._list.slice(0, idx)
                , item
                , ..._list.slice(idx) ];
        // _list.splice(idx, 0, item);

        // mutate and return the item and its neighbors
        return meetTheNeighbors(idx, item);
    }

    /**
     * Sets prev/next on the item and its neighbors and returns an [] of everyone affected
     * @param idx
     * @param curr
     * @returns {ReadonlyArray<T>}
     */
    function meetTheNeighbors(idx: number, curr: T) {
        let idxPrev = idx - 1,
            idxNext = idx + 1,
            result: T[] = [];

        if (idxPrev >= 0) {
            let prev = _list[idxPrev];
            [prev, curr] = setPrevNext(prev, curr);
            result.push(prev);
        }

        if (idxNext < _list.length) {
            let next = _list[idxNext];
            result = [ ...result
                     , ...setPrevNext(curr, next)]; // adding `curr` and `next` at once
        } else {
            result.push(curr);
        }

        return Object.freeze(result);
    }

    /**
     * Sets a next element link on the previous one and vice versa
     * @param first
     * @param second
     * @returns {[T|any,T|any]}
     */
    function setPrevNext(first: T, second: T): [T, T] {
        return [
            _options.setNext(first, second),
            _options.setPrev(second, first),
        ]
    }

    /**
     * Sorts and returns the whole all.
     * @returns {ReadonlyArray<T>}
     */
    function sort() {
        if (_isSorted) return Object.freeze([]); // no changes to return

        _list = sortBy(_dic, _options.sortBy);
        _isSorted = true;

        // and now the fun part: setting prev/next on the whole all
        let len = _list.length;

        for (let i = 0; i < len-1; i++) {
            let [first, second] = setPrevNext(_list[i], _list[i+1]);
            _list[i] = first;       // hack: we do these assignments twice per item
            _list[i+1] = second;    // hack: we do these assignments twice per item
        }

        return Object.freeze(_list);
    }

    let api: SortedList<T> = {
        get isSorted() {return _isSorted},
        get all() {return _list},
        add,
        sort
    };

    if (_options.debug) {
        api.__4tests__ = {
            addSorted,
            meetTheNeighbors,
            setPrevNext
        }
    }
    return Object.freeze(api);
}
