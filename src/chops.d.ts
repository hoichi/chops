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

interface ChopEvent<T extends ChopData> {   // do we actually use it anywhere?
    type: string;  // todo: [string] enum
    data: T;
}

export interface ChopPageWritable {
    url: string;
}

/**
 * An abstract source file. Might be a content file, might be, say, a template.
 */
export interface ChopPage extends ChopData, ChopPageWritable {
    type: 'file';   // just in case
    path: PagePath;
    content: string;     // todo: fix `string | undefined`
}


/*
 * A template file (as a chop).
 * */
interface TemplateCompiled extends ChopData {
    render: PageRenderer;
    // q: do we need anything from ChopPage? path, maybe?
}

/*
 * A template function for rendering pages
 */
interface PageRenderer {
    (page: ChopPage, site?: Site, globals?: any): string;
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

interface ContentMeta {
    // We should have defaults for everything
    title?: string;
    date?: Date;
    url?: string;
    published?: boolean;
    template?: string;  // does it belong here?
    [k: string]: any;
}

/*
 * after adding the page to [primary] collection
 * */
interface PageMetaCollected {
    nextUrl?: string;
    prevUrl?: string;
    collection?: ChopsCollection;
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
