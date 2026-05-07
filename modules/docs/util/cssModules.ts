import { readFile } from "node:fs/promises";
import { type BunPlugin, plugin } from "bun";

/**
 * Registry that collects every transformed CSS module loaded during a docs build.
 * Each entry holds the path of the original CSS file and the transformed CSS
 * source where local class names have been rewritten to file-unique versions.
 */
const _registry = new Map<string, string>();

/** Yield the unique transformed CSS chunks collected so far. */
export function getCollectedCss(): string {
	return Array.from(_registry.values()).join("\n\n");
}

/** Reset the collected CSS. */
export function resetCollectedCss(): void {
	_registry.clear();
}

/**
 * Bun plugin that resolves `*.module.css` imports at runtime.
 * - Replaces every `.local-name` class selector with a file-unique `.local-name__hash` form.
 * - Returns a JS module whose default export maps original → hashed names.
 * - Stashes the transformed CSS in `_registry` so the docs build can write it to a single stylesheet.
 */
export const CSS_MODULES_PLUGIN: BunPlugin = {
	name: "shelving-css-modules",
	setup(build) {
		build.onLoad({ filter: /\.module\.css$/ }, async args => {
			const source = await readFile(args.path, "utf8");
			const hash = _hashPath(args.path);

			// Find every `.classname` declaration in the file (declarations only, not selectors that reference upstream classes).
			const localNames = new Set<string>();
			for (const match of source.matchAll(/\.([a-zA-Z_][\w-]*)/g)) {
				const name = match[1];
				if (name) localNames.add(name);
			}

			// Build the original→hashed mapping.
			const mapping: Record<string, string> = {};
			for (const name of localNames) mapping[name] = `${name}__${hash}`;

			// Rewrite the CSS body so every reference to a local class name uses the hashed form.
			const transformed = source.replace(/\.([a-zA-Z_][\w-]*)/g, (full, name: string) => (mapping[name] ? `.${mapping[name]}` : full));
			_registry.set(args.path, transformed);

			return {
				contents: `export default ${JSON.stringify(mapping)};`,
				loader: "js",
			};
		});
	},
};

/** Register the plugin globally so any `import "*.module.css"` is intercepted. */
export function registerCssModulesPlugin(): void {
	plugin(CSS_MODULES_PLUGIN);
}

/**
 * Generate a short stable hash for a file path.
 * - Uses a simple djb2-style accumulator for compactness; collision risk is acceptable for our class-name scoping.
 */
function _hashPath(path: string): string {
	let h = 5381;
	for (let i = 0; i < path.length; i++) h = (h * 33) ^ path.charCodeAt(i);
	return (h >>> 0).toString(36);
}
