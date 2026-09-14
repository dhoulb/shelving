import { describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getClass, getModuleClass } from "shelving/ui";

describe("getClass", () => {
	test("joins strings, arrays, and true-valued variant keys", () => {
		expect(getClass("a", ["b", "c"], { d: true, e: false })).toBe("a b c d");
	});

	test("ignores `null` and `undefined`", () => {
		expect(getClass("a", null, undefined, "b")).toBe("a b");
	});
});

describe("getModuleClass", () => {
	test("maps class keys through the module dictionary", () => {
		expect(getModuleClass({ track: "abc123" }, "track")).toBe("abc123");
		expect(getModuleClass({ track: "abc123", spin: "def456" }, "track", "spin")).toBe("abc123 def456");
	});

	test("returns `undefined` when the module is a string (unprocessed CSS module)", () => {
		expect(getModuleClass("./Loading.module.css", "track")).toBeUndefined();
	});

	test('returns `undefined` when no classes match, so no empty `class=""` attribute renders', () => {
		// Some environments (e.g. `bun test` v1.4+) import a `.module.css` as an empty object.
		expect(getModuleClass({}, "track")).toBeUndefined();
		expect(getModuleClass({ track: "abc123" }, "missing")).toBeUndefined();
	});
});

/** Bundle a `.module.css` file with `Bun.build()` and return its CSS-modules exports and the emitted CSS. */
async function _bundle(path: string): Promise<{ readonly exports: Record<string, string | undefined>; readonly css: string }> {
	const dir = await mkdtemp(join(tmpdir(), "shelving-css-"));
	try {
		const entry = join(dir, "entry.ts");
		await Bun.write(entry, `export { default as styles } from ${JSON.stringify(path)};\n`);
		const { success, logs, outputs } = await Bun.build({ entrypoints: [entry], outdir: join(dir, "out"), target: "bun" });
		if (!success) throw new Error(logs.map(l => l.message).join("\n"));
		const js = outputs.find(o => o.kind === "entry-point");
		const css = outputs.find(o => o.path.endsWith(".css"));
		if (!js || !css) throw new Error("Bundle produced no JS entry or CSS asset");
		const { styles } = (await import(js.path)) as { styles: Record<string, string | undefined> };
		return { exports: styles, css: await css.text() };
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
}

// Bun bundler behaviour the `ui` module depends on, so a Bun change shows up here rather than silently in the browser.
describe("Bun CSS modules", () => {
	test("hashes `animation-name` to match its `@keyframes` declaration", async () => {
		const { css } = await _bundle(join(import.meta.dir, "../form/Progress.module.css"));
		const name = css.match(/@keyframes (progress-flow_[\w-]+)/)?.[1];
		expect(name).toBeString();
		expect(css).toContain(`animation-name: ${name};`);
	});

	// Canary: Bun hashes a class inside `::view-transition-*()` from the file basename but hashes exports from the path, so the two never match in a real build. When this test fails, Bun has fixed it — move the view-transition classes into their `.module.css` files (see dhoulb/shelving#325).
	test("does not yet hash a view-transition class to match its export", async () => {
		const dir = await mkdtemp(join(tmpdir(), "shelving-css-"));
		try {
			const path = join(dir, "sub", "canary.module.css");
			await Bun.write(path, ".plain { color: red; }\n.vt {}\n::view-transition-group(.vt) { z-index: 1; }\n");
			const { exports, css } = await _bundle(path);
			expect(exports.plain).toBeString();
			expect(exports.vt).toBeString();
			expect(css).toContain(`.${exports.plain}`);
			expect(css).not.toContain(`(.${exports.vt})`);
		} finally {
			await rm(dir, { recursive: true, force: true });
		}
	});
});
