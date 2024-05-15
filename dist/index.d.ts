/// <reference types="node" />
import { EventEmitter } from 'node:stream';
import { Options } from "./types";
export declare class F123UDP extends EventEmitter {
    private socket;
    port: number;
    address: string;
    constructor(options?: Options);
    start(): void;
    stop(): void;
}
