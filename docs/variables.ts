/**
 * Build the CSS variable index for the playground insert panel (see `DocumentationPlaygroundInsert`).
 *
 * It reads every `.module.css` file under `modules/ui/`:
 * - A `style/` token module (`Color.module.css`, …) gives one "tokens" group with each variable it declares, and
 *   the value it declares. A comment after the declaration is the description.
 * - A component module (`Card.module.css`) gives one group with each `--card-*` variable it reads, and the fallback
 *   value in its `var()`. The description comes from the Styling table in the sibling `.md` page (`Card.md`).
 */

import { basename, dirname, join } from "node:path";
import { Glob } from "bun";
import type { PlaygroundVariable, PlaygroundVariableGroup } from "../modules/ui/docs/playground.js";
import type { AbsolutePath } from "../modules/util/path.js";

/** Get the kebab-case variable prefix for a CSS module file name, e.g. `DocumentationFrame` → `--documentation-frame-`. */
function _getPrefix(name: string): string {
	return `--${name.replace(/(?<=[a-z0-9])(?=[A-Z])/g, "-").toLowerCase()}-`;
}

/** Read the fallback of each `var(--name, fallback)` in `css`, with balanced parentheses. */
function* _readFallbacks(css: string): Iterable<[name: string, fallback: string]> {
	for (const match of css.matchAll(/var\((--[\w-]+)\s*,\s*/g)) {
		const [whole, name = ""] = match;
		let depth = 0;
		let end = match.index + whole.length;
		for (; end < css.length; end++) {
			const c = css[end];
			if (c === "(") depth++;
			else if (c === ")" && !depth--) break;
		}
		yield [name, css.slice(match.index + whole.length, end).trim()];
	}
}

/** Read the descriptions in the Styling table of a `.md` page, e.g. `| \`--card-background\` | Surface fill | … |`. */
async function _readDescriptions(path: string): Promise<Map<string, string>> {
	const descriptions = new Map<string, string>();
	const file = Bun.file(path);
	if (!(await file.exists())) return descriptions;
	for (const [, name = "", description = ""] of (await file.text()).matchAll(/^\|\s*`(--[\w-]+)`\s*\|\s*([^|\n]*?)\s*\|/gm)) {
		descriptions.set(name, description.replaceAll("`", ""));
	}
	return descriptions;
}

/**
 * Build the CSS variable index for every CSS module in `uiDir`.
 *
 * @param uiDir The `modules/ui/` source directory.
 * @returns The variable groups: token groups first, then component groups, each sorted by name.
 */
export async function buildVariables(uiDir: AbsolutePath): Promise<PlaygroundVariableGroup[]> {
	const tokens: PlaygroundVariableGroup[] = [];
	const components: PlaygroundVariableGroup[] = [];

	for await (const file of new Glob("**/*.module.css").scan(uiDir)) {
		if (file.startsWith("docs/")) continue; // Docs site components, not part of an app.
		const path = join(uiDir, file);
		const name = basename(file, ".module.css");
		const css = await Bun.file(path).text();
		const variables = new Map<string, PlaygroundVariable>();

		if (dirname(file) === "style") {
			// Token module: each declared variable, with a comment after it as its description.
			for (const [, varName = "", value = "", description] of css.matchAll(
				/^\s*(--[\w-]+)\s*:\s*([^;]+);[^\S\n]*(?:\/\*\s*(.*?)\s*\*\/)?/gm,
			)) {
				if (!variables.has(varName)) variables.set(varName, { name: varName, value: value.trim(), description });
			}
			if (variables.size) tokens.push({ name, tokens: true, variables: Array.from(variables.values()) });
		} else {
			// Component module: each variable it owns, with its first fallback as its default.
			const prefix = _getPrefix(name);
			const descriptions = await _readDescriptions(join(uiDir, dirname(file), `${name}.md`));
			for (const [varName, value] of _readFallbacks(css)) {
				if (varName.startsWith(prefix) && !variables.has(varName))
					variables.set(varName, { name: varName, value, description: descriptions.get(varName) });
			}
			if (variables.size) components.push({ name, variables: Array.from(variables.values()).sort((a, b) => a.name.localeCompare(b.name)) });
		}
	}

	const byName = (a: PlaygroundVariableGroup, b: PlaygroundVariableGroup) => a.name.localeCompare(b.name);
	return [...tokens.sort(byName), ...components.sort(byName)];
}
