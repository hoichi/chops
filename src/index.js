'use strict';
/**
 * Created by hoichi on 20.07.2016.
 */

import newSite from './site.js';

console.dir(`Is newSite a fabric? ${newSite.isFabric}`);
console.dir(`Is newSite a Site? ${newSite.isSite}`);
console.dir(`Is newSite() a fabric? ${newSite().isFabric}`);
console.dir(`Is newSite() a Site? ${newSite().isSite}`);

export {
    newSite
}