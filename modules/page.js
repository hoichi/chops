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

function PageConstructorFabric() {
    function PageConstructor() {
        if (!this instanceof PageConstructor) {
            return new PageConstructor();
        }

        //todo: freeze
    }

    Object.defineProperties(PageConstructor.prototype, {
        fromSource: {
            value: (file, options) => {
            //    todo: options defaults
            //    todo: read file (and fill .path)
            //    todo: yfm to meta
            //    todo: excerpt (meta || first paragraph), content conversion
            //    todo: site, prev/next, url (callback?)
            }
        },
        next: {
            get: () => {/* todo: or should it be a simple value set by .collect()? */}
        }
    });

    return PageConstructor;
}