/**
 * Markdown side of the docs build pipeline.
 *
 * Writes the docs tree as plain Markdown for LLMs and coding agents:
 * - One `.md` page per element, next to its HTML page (`/schema/BooleanSchema/` → `/schema/BooleanSchema.md`).
 * - `llms.txt` — a short index of the modules, in the [llms.txt](https://llmstxt.org/) format.
 * - `llms-full.txt` — every page in one file.
 *
 * Every link is relative, so the same output works on the docs site and inside the npm package (`node_modules/shelving/docs/`).
 */

import { mkdir } from "node:fs/promises";
import { dirname, join, posix } from "node:path";
import type { ImmutableArray } from "../modules/util/array.js";
import { walkElements } from "../modules/util/element.js";
import type { AbsolutePath } from "../modules/util/path.js";
import { type DocumentationElementProps, type DocumentationParam, flattenTree, type TreeElement } from "../modules/util/tree.js";

/** Child `kind`s listed on a page, in display order — the same groups as the HTML page. */
const KINDS = {
	module: "Modules",
	component: "Components",
	function: "Functions",
	class: "Classes",
	interface: "Interfaces",
	type: "Types",
	constant: "Constants",
	"static method": "Static methods",
	method: "Methods",
};

/** Kinds whose `properties` are an options bag, so a param of that type is flattened into one row per property. */
const FLATTEN_KINDS = new Set(["interface", "type"]);

/** Turn a site path into a function that makes a relative link from that page's `.md` file to another page's `.md` file. */
type MarkdownLinker = (path: AbsolutePath) => string;

/**
 * Write the Markdown docs for `tree` into `outdir`.
 *
 * @param tree The root of the docs tree (as returned by `PackageExtractor`).
 * @param outdir The folder to write into.
 * @returns The number of `.md` pages written.
 */
export async function renderMarkdown(tree: TreeElement, outdir: AbsolutePath): Promise<number> {
	const map = flattenTree(tree);
	const root = map.get("/");
	if (!root) throw new Error("Docs tree has no root");

	const pages: string[] = [];
	for (const [element, module] of _walkPages(root)) {
		const path = _requirePath(element);
		const file = _getMarkdownFile(path);
		await _write(join(outdir, file), formatMarkdownPage(element, map, module, _getLinker(file)));
		// The full file is one document at the root, so its links are relative to the root.
		pages.push(formatMarkdownPage(element, map, module, _getLinker("index.md")));
	}

	await _write(join(outdir, "llms.txt"), formatLLMsIndex(root));
	await _write(join(outdir, "llms-full.txt"), pages.join("\n\n---\n\n"));
	return pages.length;
}

/**
 * Format the `llms.txt` index for the docs tree.
 * - Lists every module with its description, and links to `llms-full.txt`.
 * - Kept short on purpose — each module page lists its own tokens.
 *
 * @param root The flattened (path-stamped) root element.
 */
export function formatLLMsIndex(root: TreeElement): string {
	const { title, name, description } = root.props;
	const link = _getLinker("index.md");
	const modules = Array.from(walkElements<TreeElement>(root.props.children)).filter(_hasDocs);
	return _join(
		`# ${title ?? name}`,
		description && `> ${description}`,
		[
			"Install with `npm install shelving`. Import each module from its own subpath, for example `shelving/schema` or `shelving/util/array`.",
			"",
			"Every page of the docs site is also Markdown: add `.md` to the page path (`https://shelving.cc/schema/StringSchema` → `https://shelving.cc/schema/StringSchema.md`). A module page lists every token in that module.",
		].join("\n"),
		[
			"## Docs",
			"",
			`- [Overview](${link("/")}): What Shelving is and how to install it.`,
			`- [Full docs](llms-full.txt): Every page in one file.`,
		].join("\n"),
		["## Modules", "", ...modules.map(el => _formatListItem(el, link, `shelving/${el.props.name}`))].join("\n"),
	);
}

/**
 * Format one element of the docs tree as a Markdown page.
 *
 * @param element The (path-stamped) element to format.
 * @param map The flattened tree map, used to look up options-bag types.
 * @param module The name of the module the element is in (e.g. `"schema"` or `"util/array"`), if any.
 * @param link Function that makes a relative link to another page.
 */
export function formatMarkdownPage(
	element: TreeElement,
	map: ReadonlyMap<string, TreeElement>,
	module: string | undefined,
	link: MarkdownLinker,
): string {
	const props = element.props as DocumentationElementProps;
	const { name, title, kind, description, content, signatures, params, returns, throws, properties, types, examples } = props;
	const children = Array.from(walkElements<TreeElement>(props.children));
	return _join(
		`# ${kind === "module" ? `shelving/${name}` : (title ?? name)}`,
		// The content usually starts with the description, so only show the description when there is no content.
		!content && description && `> ${description}`,
		_formatFacts(props, module),
		content,
		signatures?.length && ["## Signatures", "", "```ts", ...signatures, "```"].join("\n"),
		params?.length && _formatTable("Parameters", ["Param", "Type", "Description"], _getParamRows(params, map)),
		returns?.length &&
			_formatTable(
				"Returns",
				["Type", "Description"],
				returns.map(r => [_code(r.type ?? "unknown"), r.description ?? ""]),
			),
		throws?.length &&
			_formatTable(
				"Throws",
				["Type", "Description"],
				throws.map(t => [_code(t.type ?? "unknown"), t.description ?? ""]),
			),
		properties?.length &&
			_formatTable(
				"Properties",
				["Property", "Type", "Description"],
				properties.map(p => _getParamRow(p)),
			),
		types?.length && ["## Types", "", ...types.map(t => _formatReference(t, map, link))].join("\n"),
		examples?.length && ["## Examples", "", ...examples.map(e => ["```ts", e.description ?? "", "```"].join("\n"))].join("\n"),
		...Object.entries(KINDS).map(([k, label]) => {
			const group = children.filter(el => (el.props as DocumentationElementProps).kind === k);
			return group.length && [`## ${label}`, "", ...group.map(el => _formatListItem(el, link))].join("\n");
		}),
	);
}

/** Walk every page under `root` (depth-first, `root` first), with the name of the module each page is in. */
function* _walkPages(element: TreeElement, module?: string): Iterable<[TreeElement, string | undefined]> {
	yield [element, module];
	const { kind, name } = element.props as DocumentationElementProps;
	for (const child of walkElements<TreeElement>(element.props.children)) yield* _walkPages(child, kind === "module" ? name : module);
}

/** Format the short facts list under the title — kind, how to import it, and what it belongs to or extends. */
function _formatFacts(
	{ kind, name, class: owner, extends: base, implements: impls }: DocumentationElementProps,
	module: string | undefined,
): string {
	const facts: string[] = [];
	if (kind) facts.push(`- Kind: ${kind}`);
	if (kind === "module") facts.push(`- Import: \`import { … } from "shelving/${name}";\``);
	else if (module && !owner) facts.push(`- Import: \`import { ${name} } from "shelving/${module}";\``);
	if (owner) facts.push(`- Member of: \`${owner}\``);
	if (base) facts.push(`- Extends: \`${base}\``);
	if (impls?.length) facts.push(`- Implements: ${impls.map(_code).join(", ")}`);
	return facts.join("\n");
}

/** Get the table rows for a parameter list — an options-bag parameter also gets one indented row per property. */
function _getParamRows(params: ImmutableArray<DocumentationParam>, map: ReadonlyMap<string, TreeElement>): string[][] {
	const rows: string[][] = [];
	for (const param of params) {
		rows.push(_getParamRow(param));
		const resolved = param.type ? (map.get(_getBareType(param.type))?.props as DocumentationElementProps | undefined) : undefined;
		if (resolved?.properties && FLATTEN_KINDS.has(resolved.kind ?? ""))
			for (const p of resolved.properties) rows.push(_getParamRow(p, "."));
	}
	return rows;
}

/** Get one table row for a parameter or property — name, type, and a description with its optional / default / readonly notes. */
function _getParamRow({ name, type, description, optional, default: def, readonly }: DocumentationParam, prefix = ""): string[] {
	const notes = [description, readonly && "Read only.", def ? `Defaults to ${_code(def)}.` : optional && "Optional."].filter(Boolean);
	return [_code(`${prefix}${name}`), _code(type ?? "unknown"), notes.join(" ")];
}

/** Strip `| undefined` and generic arguments from a type, so `Foo<T> | undefined` looks up `Foo`. */
function _getBareType(type: string): string {
	return type.replace(/\s*\|\s*undefined$/, "").replace(/<.*>$/, "");
}

/** Format a referenced type name as a list item, linked when it is in the tree. */
function _formatReference(type: string, map: ReadonlyMap<string, TreeElement>, link: MarkdownLinker): string {
	const el = map.get(type);
	return el ? _formatListItem(el, link) : `- ${_code(type)}`;
}

/** Format an element as a list item that links to its page, with its description. */
function _formatListItem(element: TreeElement, link: MarkdownLinker, label = element.props.name): string {
	const { description } = element.props;
	const item = `- [${label}](${link(_requirePath(element))})`;
	return description ? `${item}: ${_getLine(description)}` : item;
}

/** Format a GFM table under a heading. */
function _formatTable(heading: string, header: ImmutableArray<string>, rows: ImmutableArray<ImmutableArray<string>>): string {
	const line = (cells: ImmutableArray<string>) => `| ${cells.map(_escapeCell).join(" | ")} |`;
	return [`## ${heading}`, "", line(header), line(header.map(() => "---")), ...rows.map(line)].join("\n");
}

/** Make a value safe for one table cell — no line breaks, and no bare pipes (GFM splits on them even in code). */
function _escapeCell(value: string): string {
	return value.replace(/\s*\n\s*/g, " ").replace(/\|/g, "\\|");
}

/** Wrap a value in a code span, with a longer fence when the value contains a backtick. */
function _code(value: string): string {
	return value.includes("`") ? `\`\` ${value} \`\`` : `\`${value}\``;
}

/** Get the first line of a value, for one-line list items. */
function _getLine(value: string): string {
	return value.split("\n")[0]?.trim() ?? "";
}

/** Join the parts of a page with blank lines, skipping empty parts. */
function _join(...parts: (string | number | false | undefined)[]): string {
	return `${parts.filter((p): p is string => typeof p === "string" && !!p.trim()).join("\n\n")}\n`;
}

/** Whether an element has anything to show — skips empty modules such as a bare `index`. */
function _hasDocs(element: TreeElement): boolean {
	const { description, content, children } = element.props;
	return !!(description || content || children);
}

/** Get the `.md` file (relative to the output folder) for a site path — `/` is `index.md`, `/schema/StringSchema` is `schema/StringSchema.md`. */
function _getMarkdownFile(path: AbsolutePath): string {
	return path === "/" ? "index.md" : `${path.slice(1)}.md`;
}

/** Make a linker for links from `file` (relative to the output folder). */
function _getLinker(file: string): MarkdownLinker {
	const dir = posix.dirname(file);
	return path => posix.relative(dir, _getMarkdownFile(path));
}

/** Get the canonical path that `flattenTree()` stamped on an element. */
function _requirePath(element: TreeElement): AbsolutePath {
	const { path } = element.props;
	if (!path) throw new Error(`Docs element "${element.props.name}" has no path`);
	return path;
}

/** Write a file, making its folder first. */
async function _write(file: string, text: string): Promise<void> {
	await mkdir(dirname(file), { recursive: true });
	await Bun.write(file, text);
}
