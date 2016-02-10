/**
 * Created by hoichi on 07.11.15.
 */
'use strict';

import test                 from 'ava';
import {slugify, tplToPath} from '../utils';

test('Slugify should return correct URIs' , function t_slugifyCorrectURI (t) {
    t.is(
        slugify('Once upon a wintry winter?'),
        'once-upon-a-wintry-winter-'
    );
    t.is(
        slugify('_The # of $'),
        '_the---of--'
    );
    t.throws(
        () => slugify(null),
        'You cannot slugify it if it\'s not a string.'
    );
    t.throws(
        () => slugify(''),
        'What\'s your business passing an empty string? No such thing as an empty slug.'
    );
    t.end();
});