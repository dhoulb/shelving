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
