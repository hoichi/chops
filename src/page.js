'use strict';

import merge from 'lodash/fp/merge';

const   fm = require('front-matter'),
        fs = require('fs'),
        _ = require('lodash'),    // todo: https://medium.com/making-internets/why-using-chain-is-a-mistake-9bc1f80d51ba#.azak8kbwc
        mPath = require('path'),
        u = require('./utils.js'),
        url = require('url');

/*
 Jekyll vars
 ===========

 todo: page.url
 The URL of the Post without the domain, but with a leading slash, e.g. /2008/12/14/my-post.html

 todo: page.id
 An identifier unique to the Post (useful in RSS feeds). e.g. /2008/12/14/my-post

todo: page.categories
 The list of categories to which this post belongs. Categories are derived from the directory structure above the _posts directory. For example, a post at /work/code/_posts/2008-12-24-closures.md would have this field set to ['work', 'code']. These can also be specified in the YAML Front Matter.

 todo: page.path
 The path to the raw post or page. Example usage: Linking back to the page or post’s source on GitHub. This can be overridden in the YAML Front Matter.
 */

let cfg = {
    sourceContentParser: parseTextWithYfm,
    cwd: process.cwd(),
    encoding: 'UTF-8',
    //extensions: '*',
    markupConverter: plainTextToHtml,
    metaConverters: {
        date: d => new Date(d),
        published: p => p === undefined || p,
        tags: t => ( t && t.split(/(,|\s)+/g) ) || [],
        categories: c => c && (c && c.split(/(,|\s)+/g)) || []
    },
    metaFromPath: (path, pathObj) => { return {};},
};

/*
* The module should have these methods:
* - setConfig()
* - newConfig()
* - Page()
*
* Or should the fabric be the fabric: recieve some config and return a constructor?
* */


function PageFabric() {
    /*
     * Page Constructor and prototype
     * */

    function Page(cfg) {
        if (!this instanceof Page) {
            return new Page();
        }

        return this;
    }

    Object.defineProperties(Page.prototype, {
        /*
        * Just setting a bunch of arbitrary page properties manually.
        * */
        setProperties: {
            enumerable: true,
            value: (data = {}) => {
                Object.keys(data).forEach((val, key) => {
                    this[key] = val;    // fixme: use defineProperty?
                });
            }
        },
        fromSourceSync: {
            enumerable: true,
            value: (path/*, cfg*/) => {
                try {
                    let pathParsed = parsePath(path, cfg.cwd),
                        {meta, body: srcBody} = runFileReader(path, cfg.sourceContentParser, {encoding: cfg.encoding}),
                        content, excerpt;

                    if (!meta.title || !meta.date || !srcBody) {
                        throw Error(`A page has to have at least a title, date and some content.
                                    Looking at ya, ${path}.`);
                    }

                    // convert content
                    ({content, excerpt} = runMarkupConverter(srcBody, cfg.markupConverter));

                    Object.assign(
                        this,
                        {excerpt},  // it's fine to redefine the excerpt in front-matter
                        cfg.metaFromPath(path, pathParsed), // todo: check if an object is returned
                        runMetaConverters(meta, cfg.metaConverters),
                        {content}   // but we're probably safer not redefining content
                    );
                } catch (e) {
                    throw Error(`Failed creating a page from ${path}.\nError message runs: ‘${e.message}’`);
                }

                // todo: use setProperties;

                return this;
            }
        },
        next: {
            get: () => {/* todo: or should it be a simple value set by .collect()? */
            }
        },
    });
}

Object.defineProperties(PageFabric.prototype, {
    setConfig: {
        enumerable: true,
        value: newCfg => { merge(cfg, newCfg); return this; },
    }
});

function firstParagraphOfHtml(html) {
    if (typeof html !== 'string') { html =''; }

    let paragraphs = /<p>(.*?)<\/p>/.exec(html);
    if(!paragraphs) { throw Error(`Not a single paragraph found, are you kidding me?`); }

    return paragraphs[1].replace(/<(.|\n)*?>/g, '');
}

/*
 * Takes a path (and a working dir)
 * returns an object with:
 * - file base (sans extension)
 * - an arr of parent dirs
 * */
function parsePath(path, cwd) {
// todo: should we move it to Utils?
// todo: check if file actually exists? or is senseless if we get it from Glob or smth? it kinda should fail gracefuly if it't removed by the time we get here
    let {root, dir, base, ext, name} = mPath.parse(mPath.resolve(path)),
        rel = mPath.relative(cwd, dir),
        dirs = rel.split(mPath.sep);

    return {
        dirs,
        ext,
        name,
        rel
    }
}

function parseTextWithYfm(path, {encoding = 'UTF-8'} = {encoding: 'UTF-8'}) {
    let content, meta, body;

    try {
        content = fs.readFileSync(path, {encoding});
    } catch (e) {
        throw Error(`Reading file failed: ${e.message}`);
    }

    ({attributes: meta, body} = fm(content));
    // todo: trim leading newlines

    if (!meta) {
        throw Error(`No metadata in file ${path}`);
    }
    if (!body) {
        throw Error(`No text in file ${path}`);
    }

    return {meta, body};
}

function plainTextToHtml(s) {
    let paragraphs = s.split(/(?:\s*\n){2,}/g);
    if (!paragraphs.length || !paragraphs[0]) {
        throw new Error(`You could’t even pass ONE paragraph? Wow. Just... wow.`);
    }

    return paragraphs.reduce(
        (article, paragraph) => article + `<p>${paragraph.replace(/\s*\n/g, '<br>\n')}</p>\n\n`,
        ``
    );
}

function runFileReader(path, reader, {encoding}) {
    let raw, parsed;

    try {
        raw = fs.readFileSync(path, {encoding});
    } catch (e) {
        throw Error(`Reading file failed: ${e.message}`);
    }

    parsed = reader(raw);

    if (!parsed.meta) {
        throw Error(`No metadata in file ${path}`);
    }
    if (!parsed.body) {
        throw Error(`No text in file ${path}`);
    }

    return parsed;
}

function runMarkupConverter(source, converter) {
    let content = converter(source),
        excerpt;

    if (content && content.content) {
        ({content, excerpt} = content);
    } else if (typeof content === `string`) {
        excerpt = firstParagraphOfHtml(content);
    } else {
        throw Error(`Wrong page content after convertions. Page source is ${path}, if it helps.`);
    }

    return {content, excerpt};
}

function runMetaConverters(meta, converters, includeUnconverted = true) {
    let result = {},
        conv;

    Object.keys(meta).forEach((val, key) => {
        if (conv = converters[key]) {
            result[key] = conv(val);
        } else if (includeUnconverted) {
            result[key] = val;
        }
    });

    return result;
}

let _innerFunctions = {  // you know, for unit tests
    firstParagraphOfHtml,
    parsePath,
    parseTextWithYfm,
    plainTextToHtml,
    runFileReader,
    runMarkupConverter,
    runMetaConverters,
};

export {
    PageFabric as default,
    _innerFunctions
}