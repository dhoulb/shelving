import type { Meta } from "../util/meta.js";

/** How many `<Page>` elements a meta is nested in. Internal: `<Page>` sets it, and `<Head>` reads it to find the deepest page. */
const _DEPTHS = new WeakMap<Meta, number>();

/** Save the depth of a page's meta: one more than its parent's. */
export function setMetaDepth(meta: Meta, parent: Meta): void {
	_DEPTHS.set(meta, (_DEPTHS.get(parent) ?? 0) + 1);
}

/** Get how many `<Page>` elements a meta is nested in (`0` outside any `<Page>`). */
export function getMetaDepth(meta: Meta): number {
	return _DEPTHS.get(meta) ?? 0;
}
