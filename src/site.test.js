'use strict';
/**
 * Created by hoichi on 28.07.2016.
 */

import test from 'ava';
import newSite from './site.js';

test('site object creation', t => {
    t.true(typeof newSite().setConfig === 'function');
    t.true(typeof newSite().setConfig().setConfig === 'function');
    // todo: Somehow test if setConfig() actually sets anything
});
