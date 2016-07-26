'use strict';
/**
 * Created by hoichi on 12.03.2016.
 */

import test from 'ava';
import transmitter from '../src/transmitter';

test.cb('Transmitter should execute the expected number of callbacks', t => {
    t.plan(5);

    var tr = transmitter({
        checker: () => {
            t.pass();
            return true;
        },
        runner: () => {
            t.pass()
        },
        transformers: {
            in: {
                'data': (dIn, dNew, path) => {
                    t.pass();
                    return {data: 'dataIn'}
                }
            },
            out: dIn => {
                t.pass();
                return {data: 'dataOut'}
            }
        }
    });

    tr.on('data', (event, obj, path) => {
        t.pass();
        t.end();
    });

    tr.recieve('data', 'ignore me');
});

test('Transmitter should pass along whatever data is fed to it', t => {
    var tr = transmitter({
        checker: () => true,
        transformers: {
            in: {
                'data': (dIn, dNew) => {
                    t.is(dNew, 'phase 1');
                    return 'phase 2';
                }
            },
            out: dIn => {
                t.is(dIn, 'phase 2');
                return 'phase 3';
            }
        }
    });

    tr.on('data', (event, obj, path) => {
        t.is(obj, 'phase 3');
    });

    tr.recieve('data', 'phase 1')
});

// todo: pass some values
// todo: multicast
// todo: custom events
// todo: no casting until ready
// todo: defaults