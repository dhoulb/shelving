import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";

// Checks that every UI CSS module follows the "declare hooks at root" rule in `AGENTS.md`.
// - Every `--x-*` hook a rule reads is declared in `@layer defaults` (or set in a rule, or owned by a token module).
// - Rules read hooks with no `var()` fallback.
// - Plain hooks go in `:root`. Tint hooks (defaults that read `--tint-*` or `--color-link`) go in `:root, :global(.tint)`.
// - A `-border` hook holds a colour, and a `-stroke` hook holds a width (no shorthand).

const UI = join(import.meta.dir, "..");

/** Get the custom properties declared in a CSS file. */
function getDeclaredNames(css: string): Set<string> {
	return new Set(Array.from(css.matchAll(/(--[\w-]+)\s*:/g), m => m[1] as string));
}

/** Read the custom properties declared in every token module in `style/`. */
const TOKENS = new Set<string>();
for (const file of new Bun.Glob("style/*.css").scanSync(UI))
	for (const name of getDeclaredNames(readFileSync(join(UI, file), "utf8"))) TOKENS.add(name);

/** Get the body of each `{ … }` block whose header matches a regular expression. */
function getBlocks(css: string, header: RegExp): string[] {
	const bodies: string[] = [];
	for (const match of css.matchAll(header)) {
		const start = css.indexOf("{", (match.index ?? 0) + match[0].length - 1);
		let depth = 0;
		for (let i = start; i < css.length; i++) {
			if (css[i] === "{") depth++;
			else if (css[i] === "}" && --depth === 0) {
				bodies.push(css.slice(start + 1, i));
				break;
			}
		}
	}
	return bodies;
}

/** Get the `--name: value;` declarations at the top level of a block body. */
function getDeclarations(body: string): Map<string, string> {
	return new Map(Array.from(body.matchAll(/^\s*(--[\w-]+)\s*:\s*([^;]+);/gm), m => [m[1] as string, (m[2] as string).trim()]));
}

/** Get the list of problems in one CSS module. */
function getProblems(file: string): string[] {
	const path = join(UI, file);
	const source = readFileSync(path, "utf8");
	const css = source.replace(/\/\*[\s\S]*?\*\//g, "");
	const known = new Set(TOKENS);
	for (const [, url] of css.matchAll(/@import url\("([^"]+)"\)/g)) {
		const imported = normalize(join(dirname(path), url as string));
		for (const name of getDeclaredNames(readFileSync(imported, "utf8"))) known.add(name);
	}

	const plain = new Map<string, string>();
	const tint = new Map<string, string>();
	for (const body of getBlocks(css, /^\t:root\s*\{/gm)) for (const [k, v] of getDeclarations(body)) plain.set(k, v);
	for (const body of getBlocks(css, /^\t:root,\s*:global\(\.tint\)\s*\{/gm)) for (const [k, v] of getDeclarations(body)) tint.set(k, v);
	const declared = new Map([...plain, ...tint]);

	let rules = css;
	for (const body of getBlocks(css, /@layer defaults\s*\{/g)) rules = rules.replace(body, "");
	const reads = new Set(Array.from(rules.matchAll(/var\(\s*(--[\w-]+)/g), m => m[1] as string));
	const setInRules = new Set(Array.from(rules.matchAll(/^\s*(--[\w-]+)\s*:/gm), m => m[1] as string));

	const problems: string[] = [];
	for (const name of reads) {
		if (known.has(name) || name.startsWith("--tint-")) continue;
		if (!declared.has(name) && !setInRules.has(name)) problems.push(`${name} is read but not declared at root`);
	}
	for (const [, name] of rules.matchAll(/var\(\s*(--[\w-]+)\s*,/g)) {
		if (!known.has(name as string)) problems.push(`${name} is read with a fallback`);
	}

	function isTint(name: string, seen: ReadonlySet<string> = new Set()): boolean {
		const value = declared.get(name) ?? "";
		if (/--tint-|--color-link/.test(value)) return true;
		for (const [, ref] of value.matchAll(/var\((--[\w-]+)/g)) {
			if (declared.has(ref as string) && !seen.has(ref as string) && isTint(ref as string, new Set([...seen, name]))) return true;
		}
		return false;
	}
	for (const name of plain.keys())
		if (isTint(name)) problems.push(`${name} reads the tint ladder, so it belongs in the \`:root, :global(.tint)\` block`);
	for (const name of tint.keys())
		if (!isTint(name)) problems.push(`${name} does not read the tint ladder, so it belongs in the \`:root\` block`);

	for (const [name, value] of declared) {
		if (/-border$/.test(name) && /\b(solid|dashed|dotted|none)\b|\d(px|rem|em)\b/.test(value))
			problems.push(`${name} must hold one colour, not "${value}"`);
		if (/-stroke$/.test(name) && /\b(solid|dashed|dotted|none)\b|#|rgb|hsl|oklch|--color-|--tint-/.test(value))
			problems.push(`${name} must hold one width, not "${value}"`);
	}
	return problems;
}

const FILES = Array.from(new Bun.Glob("**/*.module.css").scanSync(UI))
	.filter(file => !file.startsWith("style/"))
	.sort();

describe("UI CSS modules declare their hooks at root", () => {
	test("finds the modules", () => {
		expect(FILES.length).toBeGreaterThan(40);
	});
	for (const file of FILES) {
		test(file, () => {
			expect(getProblems(file)).toEqual([]);
		});
	}
});
