# Chops
The lean mean static... builder... thing. NOT ready for production. Or for showing to anybody. But there it is.

## The what now?

**Chops** is 50% a learning project and 50% a Jekyll killer. Well, it’s not supposed to replace Jekyll. On a code-configuration scale it’s much closer to Gulp than to, say, [Brunch](http://brunch.io/). Here’s an idea of its API:

```js
 let collections = {
    blog: chops.collection()
        .order('created_at', 'desc')
        .render(templates['blog'])
        .dest('blog/index.html')
    ,
    rss: chops.collection()
        .order('created_at', 'desc')
        .first(10)
        .render(templates['rss'])
        .dest('feed.xml')
    };

    site.src(`blog/!**!/!*.@(md|mdown|markdown`)    // this returns empty meta and raw content
        .yfm()  // this strips yfm and fills meta
        .parse(s => md.convert(s))
        .meta((meta, path) => {})
        .collect([
            collections.blog,
            collections.rss
        ])
        .render(templates['single'])
    .dest('blog/');

    site.src('...')
        .patch(
            ({content}) => {
                 let {attributes, body} = fm(content);
                 return {meta: attributes, content: body}
            },
            ({content}) => {
                return {content: md.convert(content)};
            }
        )
        .collect(coll['blog'])
        .render(jade['post'])
    .dest();
```

Meaning the engine should give you as much manual control as humanly possible. Whether or not I should write something that uses the engine but works right out of the box is a story for another day. First I should write the engine itself.