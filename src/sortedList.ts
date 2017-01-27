/**
 * Created by hoichi on 18.01.2017.
 */
import {sortedLastIndexBy, sortBy} from 'lodash';

export interface SortedList<T> {
    isSorted: boolean;
    add(T): ReadonlyArray<T>;
    sort(): ReadonlyArray<T>;
    setExpectedLength(number): ReadonlyArray<T>;
    __4tests__?: SLPrivateFunctions<T>;
}

interface SLPrivateFunctions<T> {
    addSorted(T): ReadonlyArray<T>,
    checkLength(): ReadonlyArray<T>,
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
type SortIteratee = (el: any) => SortValue;
type PrevNextSetter<T> = (target: T, other: T) => T;

/*
* What does it do
* - adds value
* - sorts values on demand
* - reports length
* - returns list
* */

export function SortedList<T>(options: SLOptions<T> = {}): SortedList<T> {
    let _isSorted = false,
        _expectedLength = Infinity,
        _dic = Object.create(null),
        _list: T[] = [],
        _length = 0;

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

        if (!_dic[id]) {
            // adding, not replacing
            _length++;
        }
        _dic[id] = item;

        if (_isSorted) {
            // insert into a sorted position,
            // return the 2 or three updated items
            return addSorted(item);
        }

        return checkLength();
    }

    /**
     * Insert an item in a sorted position, returns every item mutated in the process
     * @param item
     * @returns {Array}
     */
    function addSorted(item: T) {
        if (!_isSorted) throw Error('Did someone just call `addSorted()` on an unsorted list?');

        // todo: FP-ize
        let by  = _options.sortBy,
            key = by(item),
            idx = sortedLastIndexBy(_list, key, by);

        // insert in the sorted position
        _list.splice(idx, 0, item);

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
            [curr, next] = setPrevNext(curr, next);
            result.push(next);
        }

        result.push(curr);  // q: I wonder if the order matters
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
     * Sorts and returns the whole list.
     * @returns {ReadonlyArray<T>}
     */
    function sort() {
        _list = sortBy(_dic, _options.sortBy);

        // and now the fun part: setting prev/next on the whole list
        let len = _list.length;

        for (let i = 0; i < len-1; i++) {
            let [first, second] = setPrevNext(_list[i], _list[i+1]);
            _list[i] = first;       // hack: we do these assignments twice
            _list[i+1] = second;
        }

        return Object.freeze(_list);
    }

    /**
     * Sets a finite expected list length and sorts the list if the list is already as long
     * @param len
     * @returns {ReadonlyArray<T>}
     */
    function setExpectedLength(len) {
        _expectedLength = len;
        return checkLength();
    }

    /**
     * Sorts and returns the list if it’s already as long as needed
     * @returns {ReadonlyArray<T>}
     */
    function checkLength(): ReadonlyArray<T> {
        return _length >= _expectedLength
                ? sort()
                : Object.freeze([]);
    }

    let api: SortedList<T> = {
        get isSorted() {return _isSorted},
        add,
        sort,
        setExpectedLength
    };

    if (_options.debug) {
        api.__4tests__ = {
            addSorted,
            checkLength,
            meetTheNeighbors,
            setPrevNext
        }
    }
    return Object.freeze(api);
}
