'use strict';
/**
 * Created by hoichi on 12.03.2016.
 */

import test from 'ava';
import {_innerFunctions as _if} from '../lib/page.js'

test('Page->converters', t => {
    // firsrParagraphOfHtml
    t.is(_if.firstParagraphOfHtml(`<p>first</p><p>second</p>`), `first`);
    t.is(_if.firstParagraphOfHtml(`<p>f<b>i</b>r<i>s</i>t</p><p>second</p>`), `first`);
    t.throws( () => _if.firstParagraphOfHtml(`Throwing up, throwing down, throwing forth and all around!`));
});