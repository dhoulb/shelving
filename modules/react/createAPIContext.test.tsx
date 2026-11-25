import { describe, expect, test } from "bun:test";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { APICache, MockAPIProvider } from "shelving/api";
import { createAPIContext } from "shelving/react";

/** Render `element` and return the cache that `requireAPICache()` gave inside it. */
function getCache(
	context: ReturnType<typeof createAPIContext<unknown, unknown>>,
	element: (child: ReactElement) => ReactElement,
): APICache<unknown, unknown> {
	let found: APICache<unknown, unknown> | undefined;
	function Probe(): null {
		found = context.requireAPICache();
		return null;
	}
	renderToStaticMarkup(element(<Probe />));
	if (!found) throw new Error("No cache");
	return found;
}

describe("createAPIContext()", () => {
	test("makes a cache for the provider given when it is created", () => {
		const api = new MockAPIProvider();
		const context = createAPIContext(api);
		expect(getCache(context, child => <context.APIContext>{child}</context.APIContext>).provider).toBe(api);
	});
	test("a `provider` prop wins over the provider given when it is created", () => {
		const context = createAPIContext(new MockAPIProvider());
		const api = new MockAPIProvider();
		expect(getCache(context, child => <context.APIContext provider={api}>{child}</context.APIContext>).provider).toBe(api);
	});
	test("needs no provider when it is created", () => {
		const context = createAPIContext<unknown, unknown>();
		const api = new MockAPIProvider();
		expect(getCache(context, child => <context.APIContext provider={api}>{child}</context.APIContext>).provider).toBe(api);
	});
	test("a `cache` prop is used as it is, and wins over `provider`", () => {
		const context = createAPIContext<unknown, unknown>();
		const cache = new APICache(new MockAPIProvider());
		const element = (child: ReactElement) => (
			<context.APIContext provider={new MockAPIProvider()} cache={cache}>
				{child}
			</context.APIContext>
		);
		expect(getCache(context, element)).toBe(cache);
	});
	test("throws with no provider and no cache", () => {
		const context = createAPIContext<unknown, unknown>();
		expect(() => renderToStaticMarkup(<context.APIContext>x</context.APIContext>)).toThrow("<APIContext> needs a provider or a cache");
	});
	test("each tree gets its own cache", () => {
		const context = createAPIContext<unknown, unknown>();
		const api = new MockAPIProvider();
		const a = getCache(context, child => <context.APIContext provider={api}>{child}</context.APIContext>);
		const b = getCache(context, child => <context.APIContext provider={api}>{child}</context.APIContext>);
		expect(a).not.toBe(b);
	});
});
