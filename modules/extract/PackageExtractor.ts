import { type DirectoryElement, type DocumentationElement, type FileElement, type TreeElement, walkElements } from "../util/element.js";
import { type AbsolutePath, type Path, requirePath } from "../util/path.js";
import { Extractor } from "./Extractor.js";
import { ModuleExtractor } from "./ModuleExtractor.js";

/** Default source-file extensions used when resolving exports back to source elements. */
const DEFAULT_EXTENSIONS: readonly string[] = ["ts", "tsx", "js", "jsx"];

/** Subset of `package.json` we read — just the bits PackageExtractor uses. */
interface PackageJson {
	readonly name?: string;
	readonly description?: string;
	readonly exports?: { readonly [key: string]: unknown };
}

/** Options for a `PackageExtractor`. */
export interface PackageExtractorOptions {
	/**
	 * Pre-extracted source tree the `package.json` exports resolve against — typically the result of
	 * `IndexFileExtractor(MergingExtractor(DirectoryExtractor()))` over the source root.
	 */
	readonly tree: DirectoryElement;
	/**
	 * Source-file extensions tried when resolving an export's last segment to a source file (e.g. `./util/string` → `string.ts`, `string.tsx`, …).
	 * - Checked in declaration order; first match wins.
	 * - Defaults to `["ts", "tsx", "js", "jsx"]`.
	 */
	readonly extensions?: readonly string[];
	/** `ModuleExtractor` used to build each module element. Defaults to a fresh `new ModuleExtractor()`. */
	readonly module?: ModuleExtractor;
	/** Absolute base path used to resolve a relative `package.json` path passed to `extract()`. */
	readonly base?: AbsolutePath;
}

/**
 * Extractor that reads a `package.json` and produces a flat tree of modules — one `kind: "module"`
 * `DocumentationElement` per export entry, in declaration order.
 * - Static export keys (e.g. `"./api"`, `"./firestore/client"`) become one module each.
 * - Wildcard export keys (e.g. `"./util/*"`) expand against the source tree — one module per matching child file (with
 *   an extension in `extensions`) or subdirectory.
 * - The `"."` root export is skipped — its content is the root tree element itself.
 * - Throws if a static export key has no matching source element in the tree.
 */
export class PackageExtractor extends Extractor<Path, DirectoryElement> {
	private readonly _tree: DirectoryElement;
	private readonly _extensions: readonly string[];
	private readonly _module: ModuleExtractor;
	private readonly _base: AbsolutePath | undefined;

	constructor({ tree, extensions = DEFAULT_EXTENSIONS, module = new ModuleExtractor(), base }: PackageExtractorOptions) {
		super();
		this._tree = tree;
		this._extensions = extensions;
		this._module = module;
		this._base = base;
	}

	override async extract(packageJson: Path): Promise<DirectoryElement> {
		const pkgPath = requirePath(packageJson, this._base, this.extract);
		const pkg = (await Bun.file(pkgPath).json()) as PackageJson;
		const exports = pkg.exports ?? {};

		const modules: DocumentationElement[] = [];
		for (const key of Object.keys(exports)) {
			if (key === ".") continue;
			const subpath = key.startsWith("./") ? key.slice(2) : key;
			if (subpath.includes("*")) {
				modules.push(...this._expandWildcard(subpath));
			} else {
				const source = this._resolve(subpath);
				if (!source) throw new Error(`PackageExtractor: export "${key}" has no matching source in the tree`);
				modules.push(this._module.extract({ name: subpath, source }));
			}
		}

		const tree = this._tree;
		return {
			type: "tree-directory",
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

	/** Resolve a static export subpath (e.g. `"firestore/client"`) to a file or directory element in the tree. */
	private _resolve(subpath: string): FileElement | DirectoryElement | undefined {
		const segments = subpath.split("/");
		let current: TreeElement = this._tree;
		for (let i = 0; i < segments.length; i++) {
			const segment = segments[i] ?? "";
			const isLast = i === segments.length - 1;
			let found: TreeElement | undefined;
			for (const child of walkElements(current.props.children)) {
				const treeChild = child as TreeElement;
				if (treeChild.type === "tree-directory" && treeChild.key === segment) {
					found = treeChild;
					break;
				}
				if (isLast && treeChild.type === "tree-file") {
					if (this._extensions.some(ext => treeChild.key === `${segment}.${ext}`)) {
						found = treeChild;
						break;
					}
				}
			}
			if (!found) return undefined;
			current = found;
		}
		return current as FileElement | DirectoryElement;
	}

	/** Expand a wildcard export subpath (e.g. `"util/*"`) into one module per matching child. */
	private _expandWildcard(subpath: string): DocumentationElement[] {
		const wildcardIndex = subpath.indexOf("*");
		const prefix = subpath.slice(0, wildcardIndex);
		const suffix = subpath.slice(wildcardIndex + 1);
		if (suffix) throw new Error(`PackageExtractor: wildcard exports with a suffix are not supported ("${subpath}")`);
		if (subpath.indexOf("*", wildcardIndex + 1) >= 0) throw new Error(`PackageExtractor: multiple wildcards not supported ("${subpath}")`);

		// The parent directory of the wildcard.
		const prefixPath = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
		let parent: DirectoryElement;
		if (!prefixPath) {
			parent = this._tree;
		} else {
			const resolved = this._resolve(prefixPath);
			if (!resolved || resolved.type !== "tree-directory") {
				throw new Error(`PackageExtractor: wildcard parent "${prefixPath}" did not resolve to a directory`);
			}
			parent = resolved;
		}

		// One module per qualifying child of the parent directory.
		const modules: DocumentationElement[] = [];
		for (const child of walkElements(parent.props.children)) {
			const treeChild = child as TreeElement;
			let stem: string | undefined;
			if (treeChild.type === "tree-directory") {
				stem = treeChild.key;
			} else if (treeChild.type === "tree-file") {
				for (const ext of this._extensions) {
					if (treeChild.key.endsWith(`.${ext}`)) {
						stem = treeChild.key.slice(0, -(ext.length + 1));
						break;
					}
				}
			}
			if (!stem) continue;
			modules.push(this._module.extract({ name: `${prefix}${stem}`, source: treeChild as FileElement | DirectoryElement }));
		}
		return modules;
	}
}
