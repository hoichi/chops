/**
 * Created by hoichi on 22.10.2016.
 */

export default function log(...args: any[]) {
    let len = args.length;

    console.log.apply(null, args);

    return len ? args[len-1] : null;    // might come handy for inline calls
}