'use strict';
/**
 * Created by hoichi on 12.03.2016.
 */

import test from 'ava';
import path from 'path';
import {_innerFunctions as _if} from '../src/page.js';


test('Page->converters', t => {
    // firsrParagraphOfHtml(html: string):string
    t.is(_if.firstParagraphOfHtml(`<p>first</p><p>second</p>`), `first`);
    t.is(_if.firstParagraphOfHtml(`<p>f<b>i</b>r<i>s</i>t</p><p>second</p>`), `first`);
    t.throws( () => _if.firstParagraphOfHtml(`Throwing up, throwing down, throwing forth and all around!`));
    t.throws( () => _if.firstParagraphOfHtml(null));
    t.throws( () => _if.firstParagraphOfHtml(400.5));

    //parsePath(path, cwd)
    t.same( _if.parsePath('/dev/hoio/package.json', '/dev/'),
            { dirs: [ 'hoio' ], ext: '.json', name: 'package', rel: 'hoio' });
    t.same( _if.parsePath('d:\\dev\\hoio\\package.json', 'd:\\dev\\'),
            { dirs: [ 'hoio' ], ext: '.json', name: 'package', rel: 'hoio' });
    t.same( _if.parsePath('d:\\dev\\hoio\\package.json', 'd:\\'),
            { dirs: [ 'dev', 'hoio' ], ext: '.json', name: 'package', rel: path.join('dev','hoio') });
    /* todo: try to break it */

    // parseTextWithYfm(path, {encoding = 'UTF-8'})
    t.same( _if.parseTextWithYfm('files/content1.md'),
            { meta: { title: 'Hello World!'
                    , date: new Date('2016-03-13')
                    , tags: 'tagged, tagadelic'
                    }
            , body: 'Mama, why did you raise me this way?'
            }
    );

    // plainTextToHtml(s: string): string
    t.is(   _if.plainTextToHtml('First!\n\nSecond!'),
            '<p>First!</p>\n\n<p>Second!</p>\n\n',
            'The simplest case');
    t.is(   _if.plainTextToHtml('First!\n\nSecond!\nSecond and a half!'),
            '<p>First!</p>\n\n<p>Second!<br>\nSecond and a half!</p>\n\n',
            'Soft break');
    t.is(   _if.plainTextToHtml('First!\r\n\r\nSecond!\r\nSecond and a half!'),
            '<p>First!</p>\n\n<p>Second!<br>\nSecond and a half!</p>\n\n',
            'The return of the carriage');
    t.throws( () => _if.plainTextToHtml(8));
    t.throws( () => _if.plainTextToHtml(''));
});