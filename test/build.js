var chops= require('../build/index');

chops
    .src('contents/')
    //  [2] .transform()
    //      .collect()
    //  [1] .render()
    .dest('build') // that’s test/build
;
