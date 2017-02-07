/**
 * Created by hoichi on 06.02.2017.
 */
///<reference path="../../node_modules/@types/mocha/index.d.ts"/>
import {FollowingList} from '../following';
import {expect} from 'chai';

/*
* -
* - Tpl updates should return all the corresponding pages.
* - .latest() should throw when called prematurely
* */

describe('FollowingList public api', () => {
    let list: FollowingList<any,any>;
    beforeEach('Initializing with defaults', () => {
        list = FollowingList<any,any>();
    });

    it('Single page updates should return single pages', () => {
        let tplA = list.byName('A');

        tplA.setLeader(tplA);
        expect(tplA.setFollower('A', 'pageA'))
            .to.eql(['pageA']);
        expect(tplA.setFollower('X', 'pageX'))
            .to.eql(['pageX']);
        expect(tplA.setFollower('A', 'pageA2'))
            .to.eql(['pageA2']);
    });

    it('No updates for followers before leader is set', () => {
        let tplA = list.byName('A');

        expect(tplA.setFollower('a', 'pageA'))
            .to.eql([]);
        expect(tplA.setFollower('b', 'pageB'))
            .to.eql([]);

        expect(tplA.setLeader('whatever'))
            .to.have.members(['pageA', 'pageB']);

        expect(tplA.setFollower('c', 'pageC'))
            .to.eql(['pageC']);
        expect(tplA.setFollower('a', 'pageA'))
            .to.eql(['pageA']);
    });

    it('Single followings should work independently', () => {
        let tplA = list.byName('A'),
            tplB = list.byName('B');

        tplA.setLeader('lA');
        expect(tplA.setFollower('a1', 'af1'))
            .to.have.members(['af1']);
        expect(tplA.setFollower('a2', 'af2'))
            .to.have.members(['af2']);

        expect(tplB.setFollower('b1', 'bf1'))
            .to.eql([]);
        expect(tplB.setFollower('b2', 'bf2'))
            .to.eql([]);

        expect(tplB.setLeader('lB'))
            .to.have.members(['bf1', 'bf2']);

        expect(tplA.setLeader('lA'))
            .to.have.members(['af1', 'af2']);
    });

    it('.latest should return whatever is set —— or throw', () => {
        let tplA = list.byName('A');

        expect(() => tplA.leader)
            .to.throw(Error);

        tplA.setLeader({name: 'Brian Tracy', wisdom: 'Eat that Frog'});

        expect(tplA.leader)
            .to.eql({name: 'Brian Tracy', wisdom: 'Eat that Frog'});
    });
});