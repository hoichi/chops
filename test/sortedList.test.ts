///<reference path="../node_modules/@types/mocha/index.d.ts"/>
import {SortedList} from '../src/sortedList';
import {expect} from 'chai';

describe('SortedList private methods', function sl_main() {
    let list: SortedList<any>,
        _4t_;

    before('Initializing with defaults (almost)', function sl_init() {
        list = SortedList<any>({debug: true});
    });

    it('`__4tests__` should exist', () => {
        _4t_ = list.__4tests__;
        expect(_4t_).to.not.be.undefined;
    });

    it('setPrevNext should work with defaults', () => {
        let setPrevNext = _4t_.setPrevNext;

        expect(setPrevNext(null, null),'Shouldn’t break on nulls')
            .to.deep.equal([null, null]);

        expect(setPrevNext({a: 2, b: 5}, ['x', 18]),'Shouldn’t mutate values by default')
            .to.deep.equal([{a: 2, b: 5}, ['x', 18]]);
    });

    it('setPrevNext with actual setters should work too', () => {
        let list = SortedList<any>({
                debug: true,
                setPrev: (first, second) => ({...first, prev: second.title}),
                setNext: (first, second) => ({...first, next: second.title}),
            })
        ,   setPrevNext = list.__4tests__ && list.__4tests__.setPrevNext;

        if (!setPrevNext) return;

        expect( setPrevNext({title: 'first', next: 'to none'}, {title: 'second', next: 'to anyone'}),
                'Should set `prev`/`next` for these callbacks' )
            .to.deep.equal([
                {title: 'first', next: 'second'},
                {title: 'second', next: 'to anyone', prev: 'first'}
            ]);
    })

    /*
     TODO:
     * addSorted(T): T[] - should throw
     * checkLength(len): T[]
     * meetTheNeighbors(idx, T): []
     */
});

/*
 TODO:
 * isSorted,
 * add,
 * sort,
 * setExpectedLength
 */
