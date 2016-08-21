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

interface DropData {
    id: number | string;
    path?: ParsedPath;
    raw?: string;
}

interface DropEvent {
    event: string;
    data: DropData;
}

interface AnyObj {
    [key: string]: any;
}