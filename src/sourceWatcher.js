"use strict";
/// <reference path="../typings/index.d.ts" />
var chokidar = require('chokidar');
var fs = require('fs');
var Path = require('path');
var Rx = require('rxjs-es/Rx');
/*
RxJS
!! Observables are able to deliver values either synchronously or asynchronously.

- http://reactivex.io/rxjs/manual/overview.html#anatomy-of-an-observable`
- http://xgrommx.github.io/rx-book/content/guidelines/introduction/index.html#request-and-response
*/
/*
* .src() eats globs, rounds up the files and spits out their contents, together with path info.
*   - it provides bare file contents together with path info
*   - it should somehow understand partials and dependencies on ’em
*   - it should come before yfm parsing or template compilations, because it’s agnostic of all this.
*       so no `template().src()`
*
* what should it return? something very chainable. the mystery chop should:
* - watch globs (so have a chokidar watcher inside)
* - stream collections, transform collections, return more collections
* - channel site settings (that’s an advanced topic though)
* - do it all lazily (iterators? aren’t they kinda pull?)
*
* */
// mind: rx-book is about RxJS 4, but 5.0 is already in beta 10
function SourceWatcherFabric(globs, options) {
    return Rx.Observable.create(function (obs) {
        var watcher = chokidar.watch(globs, options)
            .on('all', function (event, path) {
            packageFileEvent(event, path, options.cwd, function (chop) { return obs.onNext(chop); });
        })
            .on('ready', function () {
            /* if we’re just building once, call obs.onCompleted()
            *  if we’re watching, say we’re ready and stay on guard;
            * */
        })
            .on('error', function (err) {
            throw Error(err);
        });
        return function () { return watcher.close(); };
    });
}
function packageFileEvent(event, path, cwd, cb) {
    if (cwd === void 0) { cwd = '.'; }
    var parsedPath = parsePath(path, cwd), chop = {
        path: parsedPath,
        id: path // for primary key. I'll think about dealing with multiple cwds later.
    };
    if (event === 'add' || event === 'change') {
        try {
            fs.readFile(path, function (err, rawCont) {
                chop.raw = rawCont;
                cb({
                    event: event,
                    chop: chop
                });
            });
        }
        catch (err) {
            throw Error("Exception while reading " + path + ", error message: " + err.message);
        }
    }
    else if (event === 'unlink') {
        cb({
            event: event,
            chop: chop
        });
    }
    else {
    }
}
/*
 * Returns an object in our standard format: {path, content, meta}
 * Or should we have `source` instead of `path`? For different types of source?`
 */
function readFileAsChop(path, _a) {
    var _b = _a.encoding, encoding = _b === void 0 ? 'UTF-8' : _b, _c = _a.cwd, cwd = _c === void 0 ? '.' : _c;
    // check if the path exists, maybe? oh, oh, chokidar
    fs.readFile(path, { encoding: encoding }, function (err, data) {
        if (err)
            throw err;
        return {
            content: data,
            path: parsePath(path, cwd),
            meta: {}
        };
    });
}
/*
 * Takes a path (and a working dir)
 * returns an object with:
 * - file base (sans extension)
 * - an arr of parent dirs
 * */
function parsePath(path, cwd) {
    // todo: check if file actually exists? or is senseless if we get it from Glob or smth? it kinda should fail gracefuly if it't removed by the time we get here
    var sep = Path.sep, _a = Path.parse(path), root = _a.root, dir = _a.dir, base = _a.base, ext = _a.ext, name = _a.name, rel = Path.relative(cwd, dir), dirs = rel.split(sep);
    return {
        dir: dir,
        dirs: dirs,
        ext: ext,
        name: name,
        path: path,
        rel: rel
    };
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SourceWatcherFabric;
