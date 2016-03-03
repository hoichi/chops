'use strict';

const fm = require('front-matter'),
    fs = require('fs'),
    _ = require('lodash'),    // todo: https://medium.com/making-internets/why-using-chain-is-a-mistake-9bc1f80d51ba#.azak8kbwc
    mPath = require('path'),
    u = require('./utils.js'),
    url = require('url');

/*
 Jekyll vars
 ===========

 page.content
 The content of the Page, rendered or un-rendered depending upon what Liquid is being processed and what page is.

 page.title

 page.excerpt
 The un-rendered excerpt of the Page.

 todo: page.url
 The URL of the Post without the domain, but with a leading slash, e.g. /2008/12/14/my-post.html

 page.date
 The Date assigned to the Post. This can be overridden in a Post’s front matter by specifying a new date/time in the format YYYY-MM-DD HH:MM:SS (assuming UTC), or YYYY-MM-DD HH:MM:SS +/-TTTT (to specify a time zone using an offset from UTC. e.g. 2008-12-14 10:30:00 +0900).

 todo: page.id
 An identifier unique to the Post (useful in RSS feeds). e.g. /2008/12/14/my-post

 page.categories
 The list of categories to which this post belongs. Categories are derived from the directory structure above the _posts directory. For example, a post at /work/code/_posts/2008-12-24-closures.md would have this field set to ['work', 'code']. These can also be specified in the YAML Front Matter.

 page.tags
 The list of tags to which this post belongs. These can be specified in the YAML Front Matter.

 todo: page.path
 The path to the raw post or page. Example usage: Linking back to the page or post’s source on GitHub. This can be overridden in the YAML Front Matter.

 page.next
 The next post relative to the position of the current post in site.posts. Returns nil for the last entry.

 page.previous

 */

const defaultMetaConverters = {
    date: d => new Date(d),
    published: p => p === undefined || p,
    tags: t => ( t && t.split(/(,|\s)+/g) ) || [],
    categories: c => c && (c && c.split(/(,|\s)+/g)) || []
};

/*
* Page Constructor and prototype
* */

function Page() {
    if (!this instanceof Page) {
        return new Page();
    }

    return this;
}

Object.defineProperties(Page.prototype, {
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
        value: (
            path,
            {   /* here be options */
                sourceContentParser = parseTextWithYfm,
                cwd = process.cwd(),
                encoding = 'UTF-8',
                extensions = '*',
                markupConverter = plainTextToHtml,
                metaConverters = {},
                metaFromPath = (path, pathObj) => {
                    return {};
                }
            }
        ) => {
            try {
                let pathParsed = parsePath(path, cwd),
                    {meta, body: srcBody} = runFileReader(path, sourceContentParser, {encoding}),
                    content, excerpt, combinedMetaConverters;

                if (!meta.title || !meta.date || !srcBody) {
                    throw Error(`A page has to have at least a title, date and some content.
                                    Looking at ya, ${path}.`);
                }

                // convert content
                ({content, excerpt} = runMarkupConverter(srcBody, markupConverter));

                combinedMetaConverters = Object.assign({}, defaultMetaConverters, metaConverters);

                Object.assign(
                    this,
                    {excerpt},  // it's fine to redefine the excerpt in front-matter
                    metaFromPath(path, pathParsed), // todo: check if an object is returned
                    runMetaConverters(meta, combinedMetaConverters),
                    {content}   // but we're probably safer not redefining content
                );
            } catch (e) {
                throw Error(`Failed creating a page from ${path}.\nError message runs: ‘${e.message}’`);
            }

            return this;
        }
    },
    next: {
        get: () => {/* todo: or should it be a simple value set by .collect()? */
        }
    }
});

function firstParagraphOfHtml(html) {
    let [, paragraph] = /<p>(.*)?<\/p>/.exec(html);
    return paragraph.replace(/<(.|\n)*?>/g, '');
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
        rel = path.relative(cwd, dir),
        dirs = rel.split(mPath.sep);

    return {
        dirs,
        ext,
        name,
        rel
    }
}

function parseTextWithYfm(path, {encoding = 'UTF-8'}) {
    let content, meta, body;

    try {
        content = fs.readFileSync(path, {encoding});
    } catch (e) {
        throw Error(`Reading file failed: ${e.message}`);
    }

    ({attributes: meta, body} = fm(content));

    if (!meta) {
        throw Error(`No metadata in file ${path}`);
    }
    if (!body) {
        throw Error(`No text in file ${path}`);
    }

    return {meta, body};
}

function plainTextToHtml(s) {
    let paragraphs = s.split(/(\s*\n){2,}/g);
    if (!paragraphs.length) {
        throw new Error(`You could’t even pass ONE paragraph? Wow. Just... wow.`);
    }

    let paragrAdder = (article, paragraph) => article + `<p>${paragraph.replace(/\s*\n/g, '<br>\n')}</p>\n\n`;

    return {
        content: paragraphs.reduce(paragrAdder, ``),
        excerpt: paragrAdder(``, paragraphs[0])
    };
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

let innerFunctions = {
    firstParagraphOfHtml,
    parsePath,
    parseTextWithYfm,
    plainTextToHtml,
    runFileReader,
    runMarkupConverter,
    runMetaConverters,
};

module.exports = {
    Page,
    innerFunctions
};
export {
    Page,
    innerFunctions
}