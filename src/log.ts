/**
 * Created by hoichi on 22.10.2016.
 */

let _isOn = false;

export default function log(...args: any[]) {
    let len = args.length;

    _isOn &&
        console.log.apply(null, args);

    return len ? args[len-1] : null;    // might come handy for inline calls
}

export function on() {_isOn = true; };
export function off() {_isOn = false; };