/**
 * Created by hoichi on 21.08.2016.
 */

interface ParsedPath {
    dir: string;
    dirs: string[];
    ext: string;
    name: string;
    path: string;
    rel: string;
}

/*
 * Mother of all chops
 * */
interface ChopData {
    id: number | string;    // q: here or in ChopEvent only?
}

interface ChopEvent {
    event: string;
    id: number | string;
    data?: ChopData;
}
// q: or should we have subtypes for different events?

interface AnyObj {
    [k: string]: any;
}

/*
 * After reading a source file
 * */
interface SourceContent extends ChopData {
    path?: ParsedPath;  // q: or does it belong to SourceFileContent? well, l8r
    rawContent: string;
}

/*
 * After compiling a template
 * */
interface TemplateFunction extends ChopData {
    render: PageRenderer;
    // q: do we need anything from SourceContent? path, maybe?
}

/*
 * A template compiled into a function for rendering pages
 */
interface PageRenderer {
    (page: PageParsed, site?: Site, globals?: any): string;
}

/*
 * After processing yfm from a content file
 * */
interface PageWithMeta extends SourceContent {
    meta: PageMeta;
    /*
    * Maybe meta (an empty meta) should exist for every piece of content, even if it’s empty.
    * Besides, why ask user to parse yfm implicitly when it’s safer to always try and parse it,
    * if it’s there. Better let him chose what takes precedence, yfm or path, for instance.
    * */
}

/*
 * after parsing
 */
interface PageParsed extends SourceContent, PageMeta, PageCollected {
    content: string;    // not sure we should lug `rawContent` around, but mixing parsed and non-parsed content is probably a bad idea.
}

/*
 * Everything we need for collections to work properly.
 * So before we collect, all this data should be ready.
 */
interface PageCollectable {
    slug: string;
    cwd: string;
    path: string;
    excerpt: string;
}

/*
 * after adding the page to [primary] collection
 * */
interface PageCollected {
    nextUrl?: string;
    prevUrl?: string;
    collection?: ChopsCollection;
}

/*
 * after rendering
 */

interface PageRendered {
    /*
     * q: Should we extend PageParsed? Do we need all that luggage?
     * A rendered page is a different beast: it combines a page obs and a template obs.
     * If all we use it for is writing single files, then all we need is really `html` and `dest`.
     * If we somehow use it to diff src and dest, then we need source info too.
     * */
    html: string;
    dest: string;   // let’s see what we need for `dest()`
}

interface PageMeta {
    [k: string]: any;
}

interface Site {
    [k: string]: any;
}

interface ChopsCollection {
    sortBy: (el) => boolean | string;
    order: 'asc' | 'desc';
    sortedList: PageParsed[];   // in
    dic: Dictionary<PageParsed>;
}

interface Dictionary<T> {
    [key:string]: T;
}
