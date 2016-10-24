var chops   = require('../build/index'),
    fm      = require('front-matter'),
    l       = require('../build/log').default,
    md    = require('markdown-it')();
    Path    = require('path');

chops
    .src('**/*', {cwd: 'contents'})
    /* necessary defaults */
    .convert(page =>    Object.assign({
                            // category: 'blog',
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
    .convert(page => Object.assign({}, page, {
        url: Path.join(
                page.url || Path.join( (page.category || page.path.dir), page.slug ),
                'index.html'
            ) || 'untitled/index.html'
    }))
    .convert(page => Object.assign({}, page, {
        content: md.render(page.content)
    }))
    .write('build') // that’s test/build
;
