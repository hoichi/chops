import test from 'ava';
import {watch} from './sourceWatcher';

var mock = require('mock-fs');

mock({
    'content': {
        'index.md':
`---
title: Behind the Frontend
date: 2016-09-22
---

Hello, world!`,
        'blog': {
            'day-01':
`---
title: Day 1
date: 2016-09-24
___

And so, I started to work.`,
            'day-02':
`---
title: Day 2
date: 2016-09-29
___

— Okay, back to work.
— Okay!`
        }
    },
});

test('Watching the watcher', async (t) => {
    watch('content/**/*.md', {})
        .subscribe({
            next: page => {
                console.log(page.path);
            },
            error: err => {},
            complete: () => {}
        })
});

mock.restore();