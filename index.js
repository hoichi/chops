'use strict';

import mPage from './modules/page.js';
import mSite, {init as siteInit} from './modules/site.js';

const u = require('./modules/utils.js');

export {
    mPage as Page,
    mSite as Site,
    u as utils
}