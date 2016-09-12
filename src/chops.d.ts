/**
 * Created by hoichi on 21.08.2016.
 */

/*
 * Mother of all chops
 * */
interface ChopData {
    id: number | string;
}

interface ChopEvent {
    event: string;
    id: number | string;
    data?: ChopData;
}

/*
 * PAGES THROUGH STAGES
 * */

/*
 *  1. As a mere chokidar event.
 *     Current implementation doesn’t need any types though.
 */

/*
 *  2. Page after reading a source file, ready for any reducing
 *     user might have ordered
 * */
export interface PageOpened extends ChopData {
    type: 'file';   // just in case
    path: PagePath;
    yfm: PageMeta;
    rawContent: undefined | string;
}

/*
 *  3. Page after applying all the reducers, added to all the collections,
 *     its model ripe and ready for rendering.
 * */
interface PageReady extends PageOpened, PageCollected {
}

/*
 * 4. Page have met its template, is rendered and ready to be written.
 * */
interface PageRendered {
    html: string;
    dest: string;
}

/*
 * A template file (as a chop).
 * */
interface TemplateCompiled extends ChopData {
    render: PageRenderer;
    // q: do we need anything from PageOpened? path, maybe?
}

/*
 * A template function for rendering pages
 */
interface PageRenderer {
    (page: PageReady, site?: Site, globals?: any): string;
}

/*
 * Source file path, parsed and ready for any reducing user might request
 * */
export interface PagePath {
    dir: string;
    dirs: string[];
    ext: string;
    name: string;
    path: string;
    rel: string;
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

interface PageMeta {
    [k: string]: any;
}

interface Site {
    [k: string]: any;
}

interface ChopsCollection {
    sortBy: (el) => boolean | string;
    order: 'asc' | 'desc';
    sortedList: PageCollected[];   // in
    dic: Dictionary<PageCollected>;
}

interface Dictionary<T> {
    [key:string]: T;
}
