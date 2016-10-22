var chops   = require('../build/index'),
    fm      = require('front-matter'),
    l       = require('../build/log').default,
    Path    = require('path');

chops
    .src('contents/')
    /* necessary defaults */
    .convert(page =>    Object.assign({
                            date: new Date(),
                            published: true,
                            title: 'Untitled',
                            url: 'untitled/index.html'
                        }, page))
    /* processing yfm */
    .convert(page => {
        var yfm = fm(page.content);
        return yfm.body
            ? Object.assign({}, page, yfm.attributes, {content: yfm.body})
            : page;
    })
    .convert(page => Object.assign({}, {
                url: Path.join((page.path.rel), page.slug, 'index.html') || 'untitled/index.html'
            })
    )
    .write('build') // that’s test/build
;
