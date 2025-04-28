import { ValueError } from "../error/ValueError.js";

/** Detect if an unknown value is an `ArrayBuffer` (not a view like `Uint8Array` or `Float32Array` etc). */
export function isBuffer(value: unknown): value is ArrayBuffer {
	return value instanceof ArrayBuffer;
}

/** Detect if an unknown value is an `ArrayBuffer` view like `Uint8Array` or `Float32Array` etc. */
export function isBufferView(value: unknown): value is ArrayBufferView {
	return ArrayBuffer.isView(value);
}

/** Encode a string as a `Uint8Array` */
export function encodeBufferView(str: string): Uint8Array {
	return new TextEncoder().encode(str);
}

/** Encode `Uint8Array` to a string. */
export function decodeBufferView(buffer: ArrayBuffer | ArrayBufferView): string {
	try {
		return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
	} catch (thrown) {
		if (thrown instanceof TypeError) throw new ValueError(thrown.message, { received: buffer, caller: decodeBufferView });
		throw thrown;
	}
}
