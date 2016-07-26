'use strict';
/**
 * Created by hoichi on 26.07.2016.
 */

function SiteFabric() {
    if (!(this instanceof SiteFabric)) { return new SiteFabric(); }

    /* privates */
    var cfg;

    function Site() {
        cfg = {};
        return this;
    }

    Object.defineProperties(Site.prototype, {
        setConfig: {
            enumerable: true,
            value:  (newCfg = {}) => {
                        cfg = {...cfg, ...newCfg};
                        return this;    // fixme: how about not muting the old Site?
                    }
        }
    });

    return Site();
}

export default SiteFabric;