import { decodeBase64URLString, encodeBase64URL } from "../../util/base64.js";

/**
 * Code and CSS that the playground frame runs.
 *
 * @see https://shelving.cc/ui/PlaygroundCode
 */
export interface PlaygroundCode {
	/** TSX source to run. It can import from `shelving/*`, `react`, and `react-dom` only. */
	readonly code?: string | undefined;
	/** CSS to add after the shelving styles. */
	readonly css?: string | undefined;
}

/**
 * Path of the frame page that runs playground code, relative to the docs site root.
 *
 * @see https://shelving.cc/ui/PLAYGROUND_FRAME_PATH
 */
export const PLAYGROUND_FRAME_PATH = "frame.html";

/**
 * Path of the playground page, relative to the docs site root.
 *
 * @see https://shelving.cc/ui/PLAYGROUND_PAGE_PATH
 */
export const PLAYGROUND_PAGE_PATH = "playground";

/**
 * Type of the message that the frame page posts to its parent with its content height, e.g. `{ type: PLAYGROUND_HEIGHT_MESSAGE, height: 320 }`.
 *
 * @see https://shelving.cc/ui/PLAYGROUND_HEIGHT_MESSAGE
 */
export const PLAYGROUND_HEIGHT_MESSAGE = "shelving:playground-height";

/**
 * Format code and CSS as a URL hash for the playground page or its frame, e.g. `#code=…&css=…`.
 * - Each value is UTF-8 then Base64URL encoded, so the same input always gives the same hash (on the server and in the browser).
 * - Empty values are left out, and an empty input gives `""`.
 *
 * @returns The hash, with its leading `#`, or `""` if there is nothing to put in it.
 * @example formatPlaygroundHash({ code: "<Button>Hi</Button>" }) // "#code=PEJ1dHRvbj5IaTwvQnV0dG9uPg"
 * @see https://shelving.cc/ui/formatPlaygroundHash
 */
export function formatPlaygroundHash({ code, css }: PlaygroundCode): string {
	const params = new URLSearchParams();
	if (code) params.set("code", encodeBase64URL(code));
	if (css) params.set("css", encodeBase64URL(css));
	const hash = params.toString();
	return hash ? `#${hash}` : "";
}

/**
 * Parse a URL hash made by `formatPlaygroundHash()` back into code and CSS.
 * - Values that are missing or not valid Base64URL are left out.
 *
 * @param hash The hash to parse, with or without its leading `#`.
 * @returns The code and CSS in the hash.
 * @example parsePlaygroundHash("#code=PEJ1dHRvbj5IaTwvQnV0dG9uPg") // { code: "<Button>Hi</Button>" }
 * @see https://shelving.cc/ui/parsePlaygroundHash
 */
export function parsePlaygroundHash(hash: string): PlaygroundCode {
	const params = new URLSearchParams(hash.replace(/^#/, ""));
	return { code: _decode(params.get("code")), css: _decode(params.get("css")) };
}

function _decode(value: string | null): string | undefined {
	if (!value) return undefined;
	try {
		return decodeBase64URLString(value);
	} catch {
		return undefined;
	}
}

/**
 * Path of the CSS variable index that the docs build writes, relative to the docs site root.
 * - It holds a list of `PlaygroundVariableGroup` objects.
 *
 * @see https://shelving.cc/ui/PLAYGROUND_VARIABLES_PATH
 */
export const PLAYGROUND_VARIABLES_PATH = "variables.json";

/**
 * One CSS variable that you can set to change the look of shelving components.
 *
 * @see https://shelving.cc/ui/PlaygroundVariable
 */
export interface PlaygroundVariable {
	/** Name of the variable, e.g. `"--card-background"`. */
	readonly name: string;
	/** Default value of the variable, e.g. `"var(--tint-90)"`. */
	readonly value: string;
	/** What the variable styles, e.g. `"Surface fill"`. */
	readonly description?: string | undefined;
}

/**
 * A group of CSS variables that one CSS module owns, e.g. the `--card-*` variables of `Card.module.css`.
 *
 * @see https://shelving.cc/ui/PlaygroundVariableGroup
 */
export interface PlaygroundVariableGroup {
	/** Name of the group, e.g. `"Card"`. */
	readonly name: string;
	/** Whether the group holds global design tokens (from the `style/` modules), not hooks for one component. */
	readonly tokens?: boolean | undefined;
	/** The variables in the group. */
	readonly variables: readonly PlaygroundVariable[];
}

/**
 * Format CSS variables as a `:root` rule that you can paste into the playground CSS and change.
 * - Each variable is set to its default value, with its description as a comment.
 *
 * @param variables The variables to put in the rule.
 * @returns The CSS rule, or `""` if there are no variables.
 * @example formatPlaygroundCSS([{ name: "--card-radius", value: "var(--radius-normal)" }]) // ":root {\n  --card-radius: var(--radius-normal);\n}\n"
 * @see https://shelving.cc/ui/formatPlaygroundCSS
 */
export function formatPlaygroundCSS(variables: readonly PlaygroundVariable[]): string {
	if (!variables.length) return "";
	const lines = variables.map(
		({ name, value, description }) => `  ${name}: ${value};${description ? ` /* ${description.replaceAll("*/", "* /")} */` : ""}`,
	);
	return `:root {\n${lines.join("\n")}\n}\n`;
}

/**
 * Path of the component index that the docs build writes, relative to the docs site root.
 * - It holds a list of `PlaygroundComponent` objects.
 *
 * @see https://shelving.cc/ui/PLAYGROUND_COMPONENTS_PATH
 */
export const PLAYGROUND_COMPONENTS_PATH = "components.json";

/**
 * One shelving component that you can insert into the playground code.
 *
 * @see https://shelving.cc/ui/PlaygroundComponent
 */
export interface PlaygroundComponent {
	/** Name of the component, e.g. `"Button"`. */
	readonly name: string;
	/** Name of the group the component is in, e.g. `"block"` or `"form"`. */
	readonly group: string;
	/** First line of the component's docblock. */
	readonly description?: string | undefined;
	/** TSX to insert, with its imports, e.g. `import { Button } from "shelving/ui";\n\n<Button>Save</Button>`. */
	readonly snippet: string;
}

/** Match one `import { … } from "…";` statement. */
const _IMPORT_REGEXP = /^import\s*\{([^}]*)\}\s*from\s*["']([^"']+)["'];?[^\S\n]*\n?/gm;

/** Get the names in an import list, e.g. `" A, B as C, "` gives `["A", "B as C"]`. */
function _getNames(list: string): string[] {
	return list
		.split(",")
		.map(name => name.trim())
		.filter(Boolean);
}

/**
 * Insert a TSX snippet into playground code, and merge the snippet's imports into the code's imports.
 * - The snippet body goes on its own lines at `at` (or at the end of the code).
 * - Each name in a snippet `import { … } from "…"` is added to the code's import from the same module, or a new import is added at the top.
 *
 * @param code The playground code.
 * @param snippet The TSX snippet to insert, e.g. `PlaygroundComponent.snippet`.
 * @param at The cursor position in `code`, e.g. the `selectionStart` of the text box.
 * @returns The new code.
 * @example insertPlaygroundSnippet("", 'import { Button } from "shelving/ui";\n\n<Button>Hi</Button>') // 'import { Button } from "shelving/ui";\n\n<Button>Hi</Button>\n'
 * @see https://shelving.cc/ui/insertPlaygroundSnippet
 */
export function insertPlaygroundSnippet(code: string, snippet: string, at?: number | undefined): string {
	const imports = Array.from(snippet.matchAll(_IMPORT_REGEXP), ([, list = "", from = ""]) => ({ from, names: _getNames(list) }));
	let output = insertPlaygroundText(code, snippet.replace(_IMPORT_REGEXP, "").trim(), at ?? code.length);
	for (const { from, names } of imports) {
		const existing = Array.from(output.matchAll(_IMPORT_REGEXP)).find(([, , f]) => f === from);
		if (existing) {
			const [whole, list = ""] = existing;
			const current = _getNames(list);
			const added = names.filter(name => !current.includes(name));
			if (!added.length) continue;
			// Add the names before the closing `}`, on their own line if the import is split over lines.
			const close = existing.index + whole.indexOf("}");
			const multiline = list.includes("\n");
			const head = output.slice(0, close).trimEnd();
			const insert = multiline ? `  ${added.join(", ")},\n` : `${head.endsWith(",") ? "" : ","} ${added.join(", ")} `;
			const before = multiline ? `${head}${head.endsWith(",") ? "" : ","}\n` : head;
			output = `${before}${insert}${output.slice(close)}`;
		} else {
			const line = `import { ${names.join(", ")} } from "${from}";\n`;
			const last = Array.from(output.matchAll(_IMPORT_REGEXP)).pop();
			const index = last ? last.index + last[0].length : 0;
			output = `${output.slice(0, index)}${line}${last ? "" : output.trim() ? "\n" : ""}${output.slice(index)}`;
		}
	}
	return output;
}

/**
 * Insert text on its own lines into playground code or CSS.
 * - With no `at`, CSS (text that ends with a `}`) gets the text before its last `}`, and other text gets it at the end.
 *
 * @param text The code or CSS.
 * @param insert The text to insert.
 * @param at The cursor position in `text`, e.g. the `selectionStart` of the text box.
 * @returns The new text.
 * @example insertPlaygroundText("a\n", "b") // "a\nb\n"
 * @see https://shelving.cc/ui/insertPlaygroundText
 */
export function insertPlaygroundText(text: string, insert: string, at?: number | undefined): string {
	let index = at ?? (text.trimEnd().endsWith("}") ? text.lastIndexOf("}") : text.length);
	index = Math.max(0, Math.min(text.length, index));
	// Move to the end of the line the cursor is on, so the insert does not split a line.
	const end = text.indexOf("\n", index);
	if (at !== undefined && text.slice(index, end < 0 ? undefined : end).trim()) index = end < 0 ? text.length : end;
	const before = text.slice(0, index);
	const after = text.slice(index);
	const head = !before || before.endsWith("\n") ? "" : "\n";
	const tail = after.startsWith("\n") ? "" : "\n";
	return `${before}${head}${insert}${tail}${after}`;
}
