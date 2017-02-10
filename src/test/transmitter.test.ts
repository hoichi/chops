/**
 * Created by hoichi on 06.02.2017.
 */
///<reference path="../../node_modules/@types/mocha/index.d.ts"/>
import {chan, Channel, go, takeAsync} from 'js-csp';
import {sendTransformationData} from '../transmitter';
import {expect} from 'chai';

describe('sendTransformationData', () => {
    function arr2chSub(names: string[]) {
        let chans = Object.create(null);
        names.forEach(name => chans[name] = chan());

        function getChannel(name: string): Channel {
            return chans[name];
        }

        return Object.freeze({
            getChannel
        });
    }

    it('Should send whatever it’s given', (done) => {
        let subs = arr2chSub(['colors', 'shapes', 'shits']);

        go(function *() {
            yield* sendTransformationData(subs,
                {
                    colors: {
                        add: ['turquoise', 'beige', 'scarlet'],
                        change: ['blue', 'green', 'red']
                    },
                    shapes: {
                        behold: ['circle', 'ellipsis', 'triangle'],
                        abhor: ['square'],
                        ignore: ['irregular']
                    },
                    shits: {
                        "do": ['this', 'that']
                    }
                }
            );
        });

        // colors
        let chColors = subs.getChannel('colors');
        //  - add
        takeAsync(chColors, val => {
            expect(val).to.eql({action: 'add', data: 'turquoise'});
        });
        takeAsync(chColors, val => {
            expect(val).to.eql({action: 'add', data: 'beige'});
        });
        takeAsync(chColors, val => {
            expect(val).to.eql({action: 'add', data: 'scarlet'});
        });
        //  - change
        takeAsync(chColors, val => {
            expect(val).to.eql({action: 'change', data: 'blue'});
        });
        takeAsync(chColors, val => {
            expect(val).to.eql({action: 'change', data: 'green'});
        });
        takeAsync(chColors, val => {
            expect(val).to.eql({action: 'change', data: 'red'});
        });

        // shapes
        let chShapes = subs.getChannel('shapes');
        //  - behold: ['circle', 'ellipsis', 'triangle'],
        takeAsync(chShapes, val => {
            expect(val).to.eql({action: 'behold', data: 'circle'});
        });
        takeAsync(chShapes, val => {
            expect(val).to.eql({action: 'behold', data: 'ellipsis'});
        });
        takeAsync(chShapes, val => {
            expect(val).to.eql({action: 'behold', data: 'triangle'});
        });
        //  - abhor: ['square']
        takeAsync(chShapes, val => {
            expect(val).to.eql({action: 'abhor', data: 'square'});
        });

        //  - ignore: ['irregular']
        takeAsync(chShapes, val => {
            expect(val).to.eql({action: 'ignore', data: 'irregular'});
        });

        // shits
        let chShits = subs.getChannel('shits');
        //      - do: ['this', 'that']
        takeAsync(chShits, val => {
            expect(val).to.eql({action: 'do', data: 'this'});
        });
        takeAsync(chShits, val => {
            expect(val).to.eql({action: 'do', data: 'that'});
            done();
        });
    });

    it('Should simply skip channels with no subscribers', (done) => {
        let subs = arr2chSub(['one']);

        go(function *() {
            yield* sendTransformationData(subs, {
                one: {
                    up: [ {id: '1a'}
                        , {id: '1b'} ]
                },
                two: {
                    add: [ {id: '2a'}
                         , {id: '2b'} ]
                }
            });

            // and then some
            yield* sendTransformationData(subs, {
                one: {
                    up: [ {id: '1c'}
                        , {id: '1d'} ]
                }
            });
        });

        let chOne = subs.getChannel('one');
        takeAsync(chOne, val => {
            expect(val).to.eql( { action: 'up'
                                , data: {id: '1a'} });
        });
        takeAsync(chOne, val => {
            expect(val).to.eql( { action: 'up'
                                , data: {id: '1b'} });
        });

        takeAsync(chOne, val => {
            expect(val).to.eql( { action: 'up'
                                , data: {id: '1c'} });
        });
        takeAsync(chOne, val => {
            expect(val).to.eql( { action: 'up'
                                , data: {id: '1d'} });
            done();
        });
    });
});