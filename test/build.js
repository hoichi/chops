var chops= require('../build/index');

chops
    .src('contents/**/*.md')
    .write('build') // that’s test/build
;
