///<reference path="../node_modules/@types/mocha/index.d.ts"/>
import {SortedList} from '../src/sortedList';
import {expect} from 'chai';

describe('SortedList private methods', function sl_private() {
    let list: SortedList<any>,
        _4t_;

    before('Initializing with defaults (almost)', function sl_init() {
        list = SortedList<any>({debug: true});
        _4t_ = list.__4tests__;
    });

    it('`__4tests__` should exist', () => {
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
    });

    it('addSorted should throw when the list is not sorted', () => {
        expect( () => _4t_.addSorted(33), 'Should throw on unsorted lists' )
            .to.throw(Error);
    });

    it('addSorted returning prev and next', () => {
        let list = SortedList<string>({debug: true});

        list.add('Anthony');
        list.add('Christian');
        list.sort();

        expect( list.__4tests__ && list.__4tests__.addSorted('Benjamin'))
            .to.deep.eq(['Anthony', 'Benjamin', 'Christian']);
    });

    it('addSorted returning prev', () => {
        let list = SortedList<string>({debug: true});

        list.add('Anthony');
        list.sort();

        expect( list.__4tests__ && list.__4tests__.addSorted('Benjamin'))
            .to.deep.eq(['Anthony', 'Benjamin']);
    });

    it('addSorted returning next', () => {
        let list = SortedList<string>({debug: true});

        list.add('Christian');
        list.sort();

        expect( list.__4tests__ && list.__4tests__.addSorted('Benjamin'))
            .to.deep.eq(['Benjamin', 'Christian']);
    });

    it('addSorted returning prev and next, mutated', () => {
        interface Dic {
            [k: string]: any;
        }

        let list = SortedList<Dic>({
            debug: true,
            setPrev: (c, p) => ({...c, prev: p['name']}),
            setNext: (c, n) => ({...c, next: n['name']}),
            sortBy: o => o.name
        });

        list.add({name: 'Anthony'});
        list.add({name: 'Christian'});
        list.sort();

        expect( list.__4tests__ && list.__4tests__.addSorted({name: 'Benjamin'}))
            .to.deep.eq([
                {name:'Anthony', next: 'Benjamin'},
                {name: 'Benjamin', prev: 'Anthony', next: 'Christian'},
                {name: 'Christian', prev: 'Benjamin'}
            ]);
    });

    it('addSorted should add to the beginning', () => {
        let list = SortedList<string>({debug: true});

        list.add('Benjamin');
        list.add('Anthony');
        list.sort();

        expect( list.__4tests__ && list.__4tests__.addSorted('Christian'))
            .to.deep.eq(['Benjamin', 'Christian']);
    });

    it('addSorted should add to the end', () => {
        let list = SortedList<string>({debug: true});

        list.add('Benjamin');
        list.add('Christian');
        list.sort();

        expect( list.__4tests__ && list.__4tests__.addSorted('Anthony'))
            .to.deep.eq(['Anthony', 'Benjamin']);
    });

    it('addSorted should insert after the equal value', () => {
        let list = SortedList<string>({debug: true});

        list.add('Anthony');
        list.add('Benjamin');
        list.add('Benjamin');
        list.add('Christian');
        list.sort();

        expect( list.__4tests__ && list.__4tests__.addSorted('Benjamin'))
            .to.deep.eq(['Benjamin', 'Benjamin', 'Christian']);
    });

    it('checkLength for non-full lists should return nothing', () => {
        expect(_4t_.checkLength())
            .to.deep.eq([]);
    });

    /* No test for meetTheNeighbors so far. They’re so deep that maybe it’s to much manual labor. */
});

describe('SortedList public api', function sl_public() {
    let list: SortedList<any>,
        _4t_;

    beforeEach('Initializing with defaults', function sl_initWithDefaults() {
        list = SortedList<any>();
    });

    it('Should sort manually', () => {
        list.add(3);
        list.add(3.14);
        list.add(2);
        expect(list.isSorted, 'Should be unsorted until we sort it')
            .to.eq(false);

        expect(list.sort(), 'First sort should return the whole list')
            .to.deep.eq([2, 3, 3.14]);

        expect(list.isSorted, 'Should be sorted after we sort it')
            .to.eq(true);

        expect(list.sort(), 'Consecutive calls to .sort() should back up empty')
            .to.deep.eq([]);

        expect(list.sort(), 'One more empty .sort() to be sure')
            .to.deep.eq([]);
    });


    it('Should sort an empty list', () => {
        expect(list.sort())
            .to.deep.eq([]);

        expect(list.isSorted)
            .to.eq(true);

        expect(list.add('newVal'))
            .to.deep.eq(['newVal']);
    });

    /*
     TODO:
     * isSorted,
     * add,
     * sort,
     * setExpectedLength
     * prev/next
     * sortBy/indexBy
     */
});
