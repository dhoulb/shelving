import { describe, expect, test } from "bun:test";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DBCache, MemoryDBProvider } from "shelving/db";
import { createDBContext } from "shelving/react";

/** Render `element` and return the cache that `requireDBCache()` gave inside it. */
function getCache(
	context: ReturnType<typeof createDBContext<string, never>>,
	element: (child: ReactElement) => ReactElement,
): DBCache<string, never> {
	let found: DBCache<string, never> | undefined;
	function Probe(): null {
		found = context.requireDBCache();
		return null;
	}
	renderToStaticMarkup(element(<Probe />));
	if (!found) throw new Error("No cache");
	return found;
}

describe("createDBContext()", () => {
	test("makes a cache for the provider given when it is created", () => {
		const db = new MemoryDBProvider<string, never>();
		const context = createDBContext(db);
		expect(getCache(context, child => <context.DBContext>{child}</context.DBContext>).provider).toBe(db);
	});
	test("a `provider` prop wins over the provider given when it is created", () => {
		const context = createDBContext(new MemoryDBProvider<string, never>());
		const db = new MemoryDBProvider<string, never>();
		expect(getCache(context, child => <context.DBContext provider={db}>{child}</context.DBContext>).provider).toBe(db);
	});
	test("needs no provider when it is created", () => {
		const context = createDBContext<string, never>();
		const db = new MemoryDBProvider<string, never>();
		expect(getCache(context, child => <context.DBContext provider={db}>{child}</context.DBContext>).provider).toBe(db);
	});
	test("a `cache` prop is used as it is, and wins over `provider`", () => {
		const context = createDBContext<string, never>();
		const cache = new DBCache(new MemoryDBProvider<string, never>());
		const element = (child: ReactElement) => (
			<context.DBContext provider={new MemoryDBProvider<string, never>()} cache={cache}>
				{child}
			</context.DBContext>
		);
		expect(getCache(context, element)).toBe(cache);
	});
	test("throws with no provider and no cache", () => {
		const context = createDBContext<string, never>();
		expect(() => renderToStaticMarkup(<context.DBContext>x</context.DBContext>)).toThrow("<DBContext> needs a provider or a cache");
	});
	test("each tree gets its own cache", () => {
		const context = createDBContext<string, never>();
		const db = new MemoryDBProvider<string, never>();
		const a = getCache(context, child => <context.DBContext provider={db}>{child}</context.DBContext>);
		const b = getCache(context, child => <context.DBContext provider={db}>{child}</context.DBContext>);
		expect(a).not.toBe(b);
	});
});
