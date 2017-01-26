///<reference path="../node_modules/@types/mocha/index.d.ts"/>
import {SortedList} from '../src/sortedList';
import {expect} from 'chai';

describe('SortedList private methods', function sl_main() {
    let list: SortedList<any>,
        _4t_;

    before('Initializing with defaults', function sl_init() {
        list = SortedList<any>();
    });

    it('`__4tests__` should exist', () => {
        _4t_ = list.__4tests__;
        expect(_4t_).to.not.be.undefined;
    });

    it('', () => {
        let setPrevNext = _4t_.setPrevNext;

        expect(setPrevNext(null, null),'Shouldn’t break on nulls')
            .to.deep.equal([null, null]);

        expect(setPrevNext({a: 2, b: 5}, ['x', 18]),'Shouldn’t mutate values by default')
            .to.deep.equal([{a: 2, b: 5}, ['x', 18]]);
    })
});