'use strict';
/**
 * Created by hoichi on 12.03.2016.
 */

import test from 'ava';
import transmitter from '../src/transmitter';

test.cb('transmitter->basics', t => {
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

    console.log(tr);

    tr.on('data', (event, obj, path) => {
        t.pass();
        t.end();
    });

    tr.recieve('data', 'ignore me');
});
