/**
 * Created by hoichi on 07.11.15.
 */
'use strict';

const   _   = require('lodash'),
        fm  = require('front-matter'),
        fs  = require('fs'),
        path = require('path'),
        u = require('./utils.js');

// $FIXME: make it all private (see page.js)

const api = {
    get categories()    {return ifReady(_category)},
    get collections()   {return ifReady(_content)},
    get data()          {return ifReady(_data)},
    get description()   {return ifReady(_description)},
    get domain()        {return ifReady(_domain)},
    get pages()         {return ifReady(_pages)},
    get posts()         {return ifReady(_posts)},
    get time()          {return ifReady(_time)},
    get title()         {return ifReady(_title)},
    get tags()          {return ifReady(_tags)},

    addPost
};

var _isReady = false,
    _categories,
    _data,
    _description,
    _domain,
    _pages,
    _posts,
    _tags,
    _time,
    _title;

function init() {
    // $TODO: read site config
    _categories = ['blog'];
    _data = {};
    _description = '';
    _domain = 'www.hoichi.io';
    _pages = [];
    _posts = [];
    _tags = [];
    _time = new Date();
    _title = 'Burogu desu';

    _isReady = true;

    return api;
}

function ifReady(val) {
    if (!_isReady) {
        throw new Error(`Object Site should be properly filled before you can consume it's data. Use \`fromSource\` or something.`);
    } else {
        return val;
    }
}

function addPost(post) {
    ifReady(null);
    if (!post.published) {
        return;
    }

    if ( !Array.isArray(_posts) ) {
        _posts = [];
    }

    let pos = _.sortedIndex(_posts, post, p => -p.date.getTime());
    _posts.splice(pos, 0, post);
}

export {
    init as default,
    init
}