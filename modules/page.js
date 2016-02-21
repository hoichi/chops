'use strict';

const   fm      = require('front-matter'),
        fs      = require('fs'),
        _       = require('lodash'),    // todo: https://medium.com/making-internets/why-using-chain-is-a-mistake-9bc1f80d51ba#.azak8kbwc
        path    = require('path'),
        u       = require('./utils.js'),
        url     = require('url');

/*
  Jekyll vars
  ===========

page.content
 The content of the Page, rendered or un-rendered depending upon what Liquid is being processed and what page is.

page.title

page.excerpt
 The un-rendered excerpt of the Page.

page.url
 The URL of the Post without the domain, but with a leading slash, e.g. /2008/12/14/my-post.html

page.date
 The Date assigned to the Post. This can be overridden in a Post’s front matter by specifying a new date/time in the format YYYY-MM-DD HH:MM:SS (assuming UTC), or YYYY-MM-DD HH:MM:SS +/-TTTT (to specify a time zone using an offset from UTC. e.g. 2008-12-14 10:30:00 +0900).

page.id
 An identifier unique to the Post (useful in RSS feeds). e.g. /2008/12/14/my-post

page.categories
 The list of categories to which this post belongs. Categories are derived from the directory structure above the _posts directory. For example, a post at /work/code/_posts/2008-12-24-closures.md would have this field set to ['work', 'code']. These can also be specified in the YAML Front Matter.

page.tags
 The list of tags to which this post belongs. These can be specified in the YAML Front Matter.

page.path
 The path to the raw post or page. Example usage: Linking back to the page or post’s source on GitHub. This can be overridden in the YAML Front Matter.

page.next
 The next post relative to the position of the current post in site.posts. Returns nil for the last entry.

page.previous

*/

/*
 function drawES6Chart({size = 'big', cords = { x: 0, y: 0 }, radius = 25} = {}) {
 console.log(size, cords, radius);
 // do some chart drawing
 }

 // In Firefox, default values for destructuring assignments are not yet implemented (as described below).
 // The workaround is to write the parameters in the following way:
 // ({size: size = 'big', cords: cords = { x: 0, y: 0 }, radius: radius = 25} = {})

 drawES6Chart({
 cords: { x: 18, y: 30 },
 radius: 30
 });
*/

function PageConstructorFabric() {
    function PageConstructor() {
        if (!this instanceof PageConstructor) {
            return new PageConstructor();
        }

        /*  fixme:
            Do we need a constructor separate from fromSource/fromSourceSync?
            Sure, we do need that [new] boilerplate and all that prototype stuff.
            But fromSource[...] is a constructor and should be a module property, pageFromSource or smth.
        */

        return this;
    }

    Object.defineProperties(PageConstructor.prototype, {
        fromSourceSync: {
            value:
            (   path,
                {   /* here be options */
                    converter = s => s,
                    fsOptions: {fsEncoding = 'UTF-8', fsFlag = 'r'}
                }
            ) => {
                try {
                    //    todo: normalize `path`
                    let {attributes: meta, body: raw} = fm(fs.readFileSync(path, {fsEncoding, fsFlag}));

                    if (!meta.title || !meta.date || !content) {
                        throw new Error(`A page has to have at least a title, a date and some content. Looking at ya, ${path}.`);
                    }

                    this.content = converter(raw);
                    this.date = new Date(meta.date);
                    this.excerpt = meta.excerpt || firstParagraph(content);
                    this.tags = (meta.tags && meta.tags.split(/(,|\s)+/g)) || [];
                    this.title = meta.title;
                    // this.url should probably set when we call page.render()

                    /* todo: Categories (Jekyll: /work/code/... -> ['work', 'code']. Should we need more flexibility?) */
                    //  todo: set getters for url, next etc. that says it's not initialized yet. and don't fucking freeze 'em
                    //    todo: site, prev/next, url (callback?)


                } catch(e) {
                    throw e;
                }

                (path, fsOptions, () => {
                });
            }
        },
        next: {
            get: () => {/* todo: or should it be a simple value set by .collect()? */}
        }
    });

    return PageConstructor;
}

function firstParagraph(html) {
    let [, paragraph] = /<p>(.*)?<\/p>/.exec(html);
    return paragraph.replace(/<(.|\n)*?>/g, '');
}