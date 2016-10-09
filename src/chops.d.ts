/**
 * Created by hoichi on 21.08.2016.
 */

/*
 * Mother of all chops
 * */
interface ChopData {
    id: ChopId;     // q: or does it belong on a generic `ChopSortable` interface?
}

type ChopId = number | string;

interface ChopEvent<T extends ChopData> {
    type: string;  // todo: [string] enum
    data: T;
}

/*
 * PAGES THROUGH STAGES
 * */

/*
 *  1. As a mere chokidar type.
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
    content: string;     // todo: fix `string | undefined`
}

/*
 *  3. Page after applying all the reducers, ready to be collected.
 * */
/* q: still don’t know whether I should merge meta upon a Page or have a separate meta field as long as possible. It should be merged for a renderer though. */
interface PageReduced extends PageOpened, PageMeta, PageCollectable {
}

/*
 *  4. Page after adding it to all the collections,
 *     its model ripe and ready for rendering.
 * */
interface PageCollected extends PageReduced, PageMetaCollected {
}

/*
 * 4. Page have met its template, is rendered and ready to be written.
 * */
interface PageRendered extends ChopData /* at least */ {
    html: string;
    url: string;
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
    (page: PageCollected, site?: Site, globals?: any): string;
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
interface PageCollectable extends ChopData {
    slug: string;
    cwd: string;
    path: PagePath;
    excerpt: string;
}

/*
 * after adding the page to [primary] collection
 * */
interface PageMetaCollected {
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
    sortedList: PageMetaCollected[];   // in
    dic: Dictionary<PageMetaCollected>;
}

interface Dictionary<T> {
    [key:string]: T;
}
