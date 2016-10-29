var chops   = require('../build/index'),
    fm      = require('front-matter'),
    l       = require('../build/log').default,
    md      = require('markdown-it')();
    Path    = require('path'),
    pug     = require('pug');

var templates = chops
    .src('theme/jade/*.jade')
    .convert(tpl => pug.compile(tpl.content,    { pretty: '\t'
                                                ,filename: tpl.path.path}))
;

chops
    .src('**/*', {cwd: 'contents'})
    /* necessary defaults */
    .convert(page =>    Object.assign({
                            date: new Date(),
                            published: true,
                            title: 'Untitled'
                        }, page))
    /* processing yfm */
    .convert(page => {
        var yfm = fm(page.content);
        return yfm.body
            ? Object.assign({}, page, yfm.attributes, {content: yfm.body})
            : page;
    })
    /* markdown conversion */
    .convert(page => Object.assign({}, page, {
        content: md.render(page.content)
    }))
    /* destination url */
    .convert(page => Object.assign({}, page, {
        url: Path.join(
                page.url || Path.join( (page.category || page.path.dir), page.slug ),
                'index.html'
            ) || 'untitled/index.html'
    }))
    .render(templates, page => page.template || 'single')
    .write('build') // that’s test/build
;
