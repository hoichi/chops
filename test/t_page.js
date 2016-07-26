'use strict';
/**
 * Created by hoichi on 12.03.2016.
 */

import test from 'ava';
import path from 'path';
import page, {_innerFunctions as _if} from '../src/page.js';


test('page->converters', t => {
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
    /* todo: trim trailing spaces in multiline strings
     * see https://gist.github.com/zenparsing/5dffde82d9acef19e43c, for one
     * */
    t.same  ( _if.parseTextWithYfm(
`---
title: Hello World!
date: 2016-03-13
tags: tagged, tagadelic
---
Mama, why did you raise me this way?`
                )
            ,   { meta: { title: 'Hello World!'
                        , date: new Date('2016-03-13')
                        , tags: 'tagged, tagadelic'
                        }
                , body: 'Mama, why did you raise me this way?'
                }
            );

    // plainTextToHtml(s: string): string
    t.is(   _if.plainTextToHtml('First!\n\nSecond!'),
            '<p>First!</p>\n\n<p>Second!</p>',
            'The simplest case');
    t.is(   _if.plainTextToHtml('First!\n\nSecond!\nSecond and a half!'),
            '<p>First!</p>\n\n<p>Second!<br>\nSecond and a half!</p>',
            'Soft break');
    t.is(   _if.plainTextToHtml('First!\r\n\r\nSecond!\r\nSecond and a half!'),
            '<p>First!</p>\n\n<p>Second!<br>\nSecond and a half!</p>',
            'The return of the carriage');
    t.throws( () => _if.plainTextToHtml(8));
    t.throws( () => _if.plainTextToHtml(''));

    // runFileReader(path: string, reader(string):string, {encoding})
    t.same( _if.runFileReader('files/content1.md', s => {return {meta: {}, body: '-'}}, 'UTF-8'),
        { meta: {}
        , body: '-'
        }
    );
    t.throws(() => {
        _if.runFileReader('files/content1.md', s => { return {meta: {}, body: ''} })
    });
    // look ma, an integration test!
    t.same( _if.runFileReader('files/content1.md', _if.parseTextWithYfm, 'UTF-8'),
        { meta: { title: 'Hello World!'
                , date: new Date('2016-03-13')
                , tags: 'tagged, tagadelic'
                }
        , body: 'Mama, why did you raise me this way?'
        }
    );

    // runMarkupConverter(source: string, converter(string)): {markup: string, excerpt: string}
    t.same(_if.runMarkupConverter('', s => '<p>123</p>'), {content: '<p>123</p>', excerpt: '123'});
    t.same(_if.runMarkupConverter('', s => { return {content: '<p>123</p>', excerpt: '123'} }), {content: '<p>123</p>', excerpt: '123'});
    t.throws(() => _if.runMarkupConverter('', s => 2 ));
    t.throws(() => _if.runMarkupConverter('', []));
    // integration
    t.same(_if.runMarkupConverter('123', _if.plainTextToHtml), {content: '<p>123</p>', excerpt: '123'});


    // runMetaConverters(meta: Object, converters[](), includeUnconverted = true)): []
    t.same(_if.runMetaConverters({}, {}), {});
    t.same(_if.runMetaConverters({num: 1, str: 'wee', arr: [1, 2, 3]}, {num: n=>-1, str: s=>s+s}, false),
        {num: -1, str: 'weewee'}
    );
    t.same(_if.runMetaConverters({num: 1, str: 'wee', arr: [1, 2, 3]}, {num: n=>-1, str: s=>s+s}, true),
        {num: -1, str: 'weewee', arr: [1, 2, 3]}
    );
});
