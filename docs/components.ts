/**
 * Build the component index for the playground's insert panel (see `DocumentationPlaygroundInsert`).
 *
 * It reads every `.tsx` file under `modules/ui/` for functions with a `@kind component` docblock:
 * - The description is the first line of the docblock.
 * - The snippet is the first `live` example in the sibling `.md` page (`Card.md`) that starts with the component, because
 *   live examples run as they are. Other components get `<Name>Name</Name>`, or `<Name />` if they take no children.
 */

import { basename, dirname, join } from "node:path";
import { Glob } from "bun";
import type { PlaygroundComponent } from "../modules/ui/docs/playground.js";
import type { AbsolutePath } from "../modules/util/path.js";

/** Folders whose components need an app around them, so they are not useful to insert. */
const SKIP_FOLDERS = ["app", "dialog", "docs", "layout", "page", "router", "style", "transition", "tree"];

/** Components that need an app around them, so they are not useful to insert. */
const SKIP_NAMES = [
	"Catcher",
	"Clickable",
	"ErrorPage",
	"FullscreenButton",
	"InputWrapper",
	"Loader",
	"PageCatcher",
	"PageLoader",
	"RetryButton",
];

/** Match a docblock with `@kind component`, then the exported function it documents. */
const COMPONENT_REGEXP = /\/\*\*((?:(?!\*\/)[\s\S])*?@kind component(?:(?!\*\/)[\s\S])*?)\*\/\s*export function (\w+)/g;

/** Match each `tsx live` fence in a `.md` page. */
const LIVE_REGEXP = /^```tsx live[^\n]*\n([\s\S]*?)^```/gm;

/** Get the first live example in `md` whose body (after its imports) starts with `<Name`. */
function _getExample(md: string, name: string): string | undefined {
	for (const [, code = ""] of md.matchAll(LIVE_REGEXP)) {
		const body = code.replace(/^import[^;]*;\s*/gm, "").trim();
		if (body.startsWith(`<${name} `) || body.startsWith(`<${name}>`)) return code.trim();
	}
}

/** Components that take no children. */
const EMPTY_NAMES = [
	"Ago",
	"EmailAddress",
	"ErrorNotice",
	"Icon",
	"Image",
	"Loading",
	"Notices",
	"PhysicalAddress",
	"Progress",
	"Until",
	"Video",
];

/** Get a small snippet for a component, e.g. `<Button>Button</Button>`. */
function _getSnippet(group: string, name: string): string {
	const empty = EMPTY_NAMES.includes(name) || name.startsWith("Form") || (group === "input" && !name.startsWith("Popover"));
	const element = empty ? `<${name} />` : `<${name}>${name}</${name}>`;
	return `import { ${name} } from "shelving/ui";\n\n${element}`;
}

/** Get the first line of a docblock body. */
function _getDescription(docblock: string): string | undefined {
	return docblock
		.split("\n")
		.map(line => line.replace(/^\s*\*\s?/, "").trim())
		.find(Boolean);
}

/**
 * Build the component index for every component in `uiDir`.
 *
 * @param uiDir The `modules/ui/` source directory.
 * @returns The components, sorted by group then name.
 */
export async function buildComponents(uiDir: AbsolutePath): Promise<PlaygroundComponent[]> {
	const components: PlaygroundComponent[] = [];
	for await (const file of new Glob("**/*.tsx").scan(uiDir)) {
		const group = dirname(file);
		if (SKIP_FOLDERS.includes(group) || file.endsWith(".test.tsx")) continue;
		const source = await Bun.file(join(uiDir, file)).text();
		for (const [, docblock = "", name = ""] of source.matchAll(COMPONENT_REGEXP)) {
			if (SKIP_NAMES.includes(name) || name.endsWith("SchemaInput") || name.endsWith("Context")) continue;
			const md = Bun.file(join(uiDir, group, `${name}.md`));
			const example = (await md.exists()) ? _getExample(await md.text(), name) : undefined;
			const snippet = example ?? _getSnippet(group, name);
			components.push({ name, group: basename(group), description: _getDescription(docblock), snippet });
		}
	}
	return components.sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));
}
