import { copy } from "@std/bytes";

/** A container class for more easily manipulating and storing binary data. */
export class Buffer {
    private _cursor = 0;
    private _internal: Uint8Array;
    /**
     * @param length Initial size of the internal buffer.
     */
    constructor(length: number = 0) {
        this._internal = new Uint8Array(length);
    }
    public static from(arr: Uint8Array): Buffer;
    public static from<T extends Iterable<number>>(arr: T): Buffer;
    /**
     * Make an instance of Buffer from a Uint8Array or other numeric Iterable.
     * @param arr Source buffer.
     * @returns A Buffer instance containing the source data.
     */
    public static from<T extends Iterable<number>>(
        arr: Uint8Array | T,
    ): Buffer {
        if (!(arr instanceof Uint8Array)) arr = new Uint8Array(arr);
        const buf = new Buffer(arr.byteLength);
        buf.put(arr);
        return buf;
    }
    /**
     * Clears the buffer and resets the cursor, maintaining the current capacity.
     */
    public clear() {
        this._internal = new Uint8Array(this._internal.byteLength);
        this._cursor = 0;
    }
    /**
     * Reserve `size` byte(s) of capacity for the internal buffer.
     * @param size The amount of bytes to reserve.
     */
    public reserve(size: number) {
        const temp = this._internal.slice(0, this._cursor);
        this._internal = new Uint8Array(this._internal.byteLength + size);
        copy(temp, this._internal);
    }
    /**
     * The capacity of the internal buffer.
     */
    public get capacity(): number {
        return this._internal.byteLength;
    }
    /**
     * The currently used amount of bytes.
     */
    public get length(): number {
        return this._cursor;
    }
    public put(src: Uint8Array): void;
    public put<T extends Iterable<number>>(src: T): void;
    /**
     * Read `src` into the internal buffer.
     *
     * Throws an exception if there is not enough capacity.
     * @param src The source to put into the internal buffer.
     */
    public put<T extends Iterable<number>>(src: Uint8Array | T) {
        if (!(src instanceof Uint8Array)) {
            src = new Uint8Array(src);
        }
        if (this._cursor + src.byteLength > this._internal.byteLength) {
            throw new Error("Insufficient capacity");
        }
        copy(src, this._internal, this._cursor);
        this._cursor += src.byteLength;
    }
    /**
     * Split off the current data to a separate instance, leaving this instance with any remaining capacity.
     * @returns A Buffer instance containing the current data.
     */
    public split(): Buffer {
        const temp = this._internal.slice(0, this._cursor);
        this._internal = new Uint8Array(
            this._internal.byteLength - this._cursor,
        );
        this._cursor = 0;
        return Buffer.from(temp);
    }
    /**
     * Resize the internal buffer to `size` byte(s).
     *
     * If sized down, will truncate bytes outside of the new capacity.
     *
     * This will grow or shrink the internal buffer to ensure capacity is >= the new size.
     * @param size The new size in bytes.
     */
    public resize(size: number) {
        if (size > this._internal.byteLength) {
            this.reserve(size - this._internal.byteLength);
        } else if (size < this._internal.byteLength) {
            const temp = this._internal.slice(0, size);
            this._internal = temp;
            if (this._cursor > this._internal.byteLength) {
                this._cursor = this._internal.byteLength;
            }
        }
    }
    /**
     * Get a raw `Uint8Array` copy of the internal buffer view.
     * @returns A copy of the internal buffer.
     */
    public freeze(): Uint8Array {
        return this._internal.slice(0, this._cursor);
    }
    /**
     * Create a copy of this instance.
     * @returns A new instance of Buffer containing the same internal data and capacity.
     */
    public clone(): Buffer {
        return Buffer.from(this._internal.slice());
    }
}
