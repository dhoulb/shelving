import type { ImmutableDictionary } from "../util/dictionary.js";
import { walkElements } from "../util/element.js";
import { type AbsolutePath, type Path, requirePath } from "../util/path.js";
import type { DocumentationElement, TreeElement } from "../util/tree.js";
import { Extractor } from "./Extractor.js";
import { ModuleExtractor } from "./ModuleExtractor.js";

/**
 * Default extension mapping: maps an export *target* file extension to the *source* extensions to resolve against, in order.
 * - `package.json` targets point at built output (e.g. `./util/*.js`), but the source tree holds source files (e.g. `string.ts`) — this bridges the two.
 * - A `.js` target finds its `.ts` / `.tsx` / `.js` / `.jsx` source (first match wins).
 */
const DEFAULT_EXTENSIONS: ImmutableDictionary<readonly string[]> = {
	js: ["ts", "tsx", "js", "jsx"],
};

/** Subset of `package.json` we read — just the bits PackageExtractor uses. */
interface PackageJson {
	readonly name?: string;
	readonly description?: string;
	readonly exports?: { readonly [key: string]: unknown };
}

/**
 * Options for a `PackageExtractor`.
 *
 * @see https://dhoulb.github.io/shelving/extract/PackageExtractor/PackageExtractorOptions
 */
export interface PackageExtractorOptions {
	/**
	 * Pre-extracted source tree the `package.json` exports resolve against — typically the result of
	 * `IndexExtractor(MergingExtractor(DirectoryExtractor()))` over the source root.
	 */
	readonly tree: TreeElement;
	/**
	 * Maps an export *target* file extension (the right-hand side of an `exports` entry) to the *source* extensions to look for, in order.
	 * - Bridges built output and source: `package.json` targets a `.js` file but the tree holds the `.ts` source.
	 * - The first source extension that exists in the tree wins; a target extension with no mapping falls back to itself.
	 * - Defaults to `{ js: ["ts", "tsx", "js", "jsx"] }`.
	 */
	readonly extensions?: ImmutableDictionary<readonly string[]>;
	/** `ModuleExtractor` used to build each module element. Defaults to a fresh `new ModuleExtractor()`. */
	readonly module?: ModuleExtractor;
	/** Absolute base path used to resolve a relative `package.json` path passed to `extract()`. */
	readonly base?: AbsolutePath;
}

/**
 * Extractor that reads a `package.json` and produces a flat tree of modules — one `kind: "module"`
 * `DocumentationElement` per export entry, in declaration order.
 * - Static export keys (e.g. `"./api"`, `"./firestore/client"`) become one module each.
 * - Wildcard export keys (e.g. `"./util/*"`) expand against the source tree — one module per matching child file or subdirectory.
 * - Each export's *target* extension (e.g. the `.js` in `"./util/*.js"`) is mapped to source extensions via `extensions`, so built `.js` paths resolve to their `.ts` sources.
 * - The `"."` root export is skipped — its content is the root tree element itself.
 * - Throws if a static export key has no matching source element in the tree.
 *
 * @example
 * ```ts
 * const tree = await new PackageExtractor({ tree: sourceTree }).extract("package.json");
 * ```
 *
 * @see https://dhoulb.github.io/shelving/extract/PackageExtractor
 */
export class PackageExtractor extends Extractor<Path, TreeElement> {
	private readonly _tree: TreeElement;
	private readonly _extensions: ImmutableDictionary<readonly string[]>;
	private readonly _module: ModuleExtractor;
	private readonly _base: AbsolutePath | undefined;

	/**
	 * Create a package extractor bound to a pre-extracted source tree.
	 *
	 * @param options Options including the source `tree`, `extensions` mapping, `module` extractor, and `base` path.
	 *
	 * @example
	 * ```ts
	 * const extractor = new PackageExtractor({ tree: sourceTree });
	 * ```
	 */
	constructor({ tree, extensions = DEFAULT_EXTENSIONS, module = new ModuleExtractor(), base }: PackageExtractorOptions) {
		super();
		this._tree = tree;
		this._extensions = extensions;
		this._module = module;
		this._base = base;
	}

	/**
	 * Read a `package.json` and produce a flat tree of one module element per export entry.
	 *
	 * @param packageJson Path of the `package.json` to read — resolved against the configured `base`.
	 * @returns Promise of the root `tree-element` whose children are the module elements.
	 * @throws Error If a static export key has no matching source element in the tree, or a wildcard export is malformed.
	 *
	 * @example
	 * ```ts
	 * const tree = await new PackageExtractor({ tree: sourceTree }).extract("package.json");
	 * ```
	 *
	 * @see https://dhoulb.github.io/shelving/extract/PackageExtractor/extract
	 */
	override async extract(packageJson: Path): Promise<TreeElement> {
		const pkgPath = requirePath(packageJson, this._base, this.extract);
		const pkg = (await Bun.file(pkgPath).json()) as PackageJson;
		const exports = pkg.exports ?? {};

		const modules: DocumentationElement[] = [];
		for (const [key, value] of Object.entries(exports)) {
			if (key === ".") continue;
			// `value` is the target (e.g. `"./util/*.js"`); conditional-export objects aren't supported.
			if (typeof value !== "string") continue;
			const subpath = key.startsWith("./") ? key.slice(2) : key;
			const sourceExtensions = this._sourceExtensions(value);
			if (subpath.includes("*")) {
				modules.push(...this._expandWildcard(subpath, sourceExtensions));
			} else {
				const source = this._resolve(subpath, sourceExtensions);
				if (!source) throw new Error(`PackageExtractor: export "${key}" has no matching source in the tree`);
				modules.push(this._module.extract({ name: subpath, source }));
			}
		}

		const tree = this._tree;
		// Canonical URL `path`s aren't stamped here — they're derived from tree structure when the tree is flattened (`flattenTree()`) in the UI layer.
		return {
			type: "tree-element",
			key: pkg.name ?? tree.key,
			props: {
				source: tree.props.source,
				name: pkg.name ?? tree.props.name,
				title: pkg.name ?? tree.props.title,
				description: pkg.description ?? tree.props.description,
				content: tree.props.content,
				children: modules,
			},
		};
	}

	/** Source extensions to try for an export `target`, derived from the target's own extension via the `extensions` mapping. */
	private _sourceExtensions(target: string): readonly string[] {
		const dot = target.lastIndexOf(".");
		const ext = dot >= 0 ? target.slice(dot + 1) : "";
		return this._extensions[ext] ?? (ext ? [ext] : []);
	}

	/** Resolve a static export subpath (e.g. `"firestore/client"`) to a file or directory element in the tree. */
	private _resolve(subpath: string, sourceExtensions: readonly string[]): TreeElement | undefined {
		const segments = subpath.split("/");
		let current: TreeElement = this._tree;
		for (let i = 0; i < segments.length; i++) {
			const segment = segments[i] ?? "";
			const isLast = i === segments.length - 1;
			let found: TreeElement | undefined;
			for (const child of walkElements(current.props.children)) {
				const treeChild = child as TreeElement;
				// A directory's key is the bare segment name — match at any level.
				if (treeChild.key === segment) {
					found = treeChild;
					break;
				}
				// A file's key is `${segment}.${ext}` for one of the source extensions — only valid as the final segment.
				if (isLast && sourceExtensions.some(ext => treeChild.key === `${segment}.${ext}`)) {
					found = treeChild;
					break;
				}
			}
			if (!found) return undefined;
			current = found;
		}
		return current;
	}

	/** Expand a wildcard export subpath (e.g. `"util/*"`) into one module per matching child. */
	private _expandWildcard(subpath: string, sourceExtensions: readonly string[]): DocumentationElement[] {
		const wildcardIndex = subpath.indexOf("*");
		const prefix = subpath.slice(0, wildcardIndex);
		const suffix = subpath.slice(wildcardIndex + 1);
		if (suffix) throw new Error(`PackageExtractor: wildcard exports with a suffix are not supported ("${subpath}")`);
		if (subpath.indexOf("*", wildcardIndex + 1) >= 0) throw new Error(`PackageExtractor: multiple wildcards not supported ("${subpath}")`);

		// The parent element of the wildcard.
		const prefixPath = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
		let parent: TreeElement;
		if (!prefixPath) {
			parent = this._tree;
		} else {
			const resolved = this._resolve(prefixPath, sourceExtensions);
			if (!resolved) throw new Error(`PackageExtractor: wildcard parent "${prefixPath}" did not resolve to an element in the tree`);
			parent = resolved;
		}

		// One module per qualifying child. A child's `name` is already its extension-stripped module name (e.g. `string.ts` → `string`, the `util` directory → `util`).
		const modules: DocumentationElement[] = [];
		for (const child of walkElements(parent.props.children)) {
			const treeChild = child as TreeElement;
			if (treeChild.type !== "tree-element") continue;
			// Include directories (no extension) and source files (extension in the mapped list); skip other files (e.g. a standalone `.md`).
			const dot = treeChild.key.lastIndexOf(".");
			const ext = dot >= 0 ? treeChild.key.slice(dot + 1) : "";
			if (ext && !sourceExtensions.includes(ext)) continue;
			modules.push(this._module.extract({ name: `${prefix}${treeChild.props.name}`, source: treeChild }));
		}
		return modules;
	}
}
