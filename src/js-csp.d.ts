// Type definitions for js-csp 0.7.4
// Project: https://github.com/ubolonton/js-csp/
// Definitions by: Sergey Samokhov <https://github.com/hoichi/>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
declare module "js-csp" {
    type Channel = any;         // todo:
    type BufferType<T> = any;   // todo:
    type TakeInstructionType = any;  //todo:
    type PutInstructionType = any;  //todo:


    export const CLOSED: null;  /* 1 */
    export const NO_VALUE: string;

    export function alts(operations: any, options?: any): any;
    export function chan<T>(bufferOrNumber?: BufferType<T> | number, xform?: Function, exHandler?: Function): Channel;  /* 1 */
    export function go(f: Function, ...args: any[]): Channel; /* 1 */
    export function offer(channel: any, value: any): any;
    export function poll(channel: any): any;
    export function put(channel: Channel, value: Object): PutInstructionType; /* 1 */
    export function putAsync(channel: any, value: any, callback: any): void;
    export function sleep(msecs: any): any;
    export function spawn(gen: any, creator: any): any;
    export function take(channel: Channel): TakeInstructionType; /* 1 */
    export function takeAsync(channel: any, callback: any): void;
    export function timeout(msecs: any): any;

    export namespace DEFAULT {
        function toString(): any;
    }

    export namespace buffers {
        function dropping(n: any): any;
        function fixed(n: any): any;
        function sliding(n: any): any;
    }


    export namespace operations {
        function filterFrom(p: any, ch: any, bufferOrN: any): any;
        function filterInto(p: any, ch: any): any;
        function fromColl(coll: any): any;
        function into(coll: any, ch: any): any;
        function map(f: any, chs: any, bufferOrN: any): any;
        function mapFrom(f: any, ch: any): any;
        function mapInto(f: any, ch: any): any;
        function mapcatFrom(f: any, ch: any, bufferOrN: any): any;
        function mapcatInto(f: any, ch: any, bufferOrN: any): any;
        function merge(chs: any, bufferOrN: any): any;
        function mix(out: any): any;
        function mult(ch: any): any;
        function onto(ch: any, coll: any, keepOpen: any): any;
        function partition(n: any, ch: any, bufferOrN: any): any;
        function partitionBy(f: any, ch: any, bufferOrN: any): any;
        function pipe(src: any, dst: any, keepOpen: any): any;
        function pipeline(to: any, xf: any, from: any, keepOpen: any, exHandler: any): any;
        function pipelineAsync(n: any, to: any, af: any, from: any, keepOpen: any): any;
        function pub(ch: any, topicFn: any, ...args: any[]): any;
        function reduce(f: any, init: any, ch: any): any;
        function removeFrom(p: any, ch: any): any;
        function removeInto(p: any, ch: any): any;
        function split(p: any, ch: any, trueBufferOrN: any, falseBufferOrN: any): any;
        function take(n: any, ch: any, bufferOrN: any): any;
        function unique(ch: any, bufferOrN: any): any;

        namespace mix {
            function add(m: any, ch: any): void;
            function remove(m: any, ch: any): void;
            function removeAll(m: any): void;
            function setSoloMode(m: any, mode: any): void;
            function toggle(m: any, updateStateList: any): void;
        }

        namespace mult {
            function tap(m: any, ch: any, keepOpen: any): any;
            function untap(m: any, ch: any): void;
            function untapAll(m: any): void;
        }

        namespace pub {
            function sub(p: any, topic: any, ch: any, keepOpen?: any): any;
            function unsub(p: any, topic: any, ch: any): void;
            function unsubAll(p: any, topic: any): void;
        }

    }
}
