const
    chops   = require('../build/index'),
    fm      = require('front-matter'),
    l       = require('../build/log').default,
    md      = require('markdown-it')(),
    Path    = require('path'),
    pug     = require('pug');

// templates
let templates = chops
    .templates
    .src('theme/jade/*.jade')
    .convert( tpl =>    Object.assign({}, {
                            id: tpl.path.name,
                            render: pug.compile(tpl.content,    { pretty: '\t'
                                                                , filename: tpl.path.path})
                        }) )
;

let testColl = chops.collection({
            by: p => (p.date || new Date())
        })
        .filter(page => page.category && (page.category === 'blog'))
        .patchCollection(() => ({
            url: 'blog/index.html'
        }))
        .render(templates, 'blog')
        .write('build')
    , allColl = chops.collection({
            by: p => (p.date || new Date())
        })
        .filter(page => true)
    , allColl2 = chops.collection({
            by: p => (p.date || new Date())
        })
        .filter(page => true)
    , noneColl = chops.collection({
            by: p => (p.date || new Date())
        })
        .filter(page => false)
    , noneColl2 = chops.collection({
            by: p => (p.date || new Date())
        })
        .filter(page => false)
    ;

// pages
chops
    .src('**/*', {cwd: 'contents'})
    /* necessary defaults */
    .convert(page =>    Object.assign({
                            date: new Date(),
                            published: true,
                            title: 'Untitled'
                        }, page))
    /* processing yfm */
    .convert(page =>    {
                            const yfm = fm(page.content);
                            return yfm.body
                                ? Object.assign({}, page, yfm.attributes, {content: yfm.body})
                                : page;
                        })
    /* markdown conversion */
    .convert(page =>    Object.assign({}, page, {
                            content: md.render(page.content)
                        }))
    /* destination url */
    .convert(page =>    Object.assign({}, page, {
                            url: Path.join(
                                    page.url || Path.join(
                                        page.category || page.path.dir,
                                        page.slug
                                    ),
                                    'index.html'
                                ) || 'untitled/index.html'
                        }))
    .convert(page =>    Object.assign({}, page, {
                            globalProperty: 'some global shit'
                        }))
    // .collect(allColl)
    // .collect(allColl2)
    // .collect(noneColl)
    // .collect(noneColl2)
    .collect(testColl)
    .render(templates, page => page.template || 'single')
    .write('build') // that’s test/build
;

