import { getUniqueArray, type ImmutableArray, isArray, type PossibleArray, requireArray } from "../../util/array.js";

const README_FILES = ["README.md"];

export interface BaseNode {
	readonly kind: NodeKind;
	readonly name: string;
	readonly description?: string;
}

/** Path nodes represent a file or directory in the source code. */
export interface PathNode extends BaseNode {
	readonly kind: PathNodeKind;
	readonly path: string;
	readonly children: PathNodes;
	readonly symbols?: SymbolNodes;
}
export type PathNodes = ImmutableArray<PathNode>;
export type PathNodeKind = "directory" | "file";

/** Symbol nodes are nodes that correspond to source code symbols, e.g. classes, functions, constants, types. */
export interface SymbolNode extends BaseNode {
	readonly kind: SymbolNodeKind;
	readonly type?: string | undefined;
	readonly params?: SymbolParams | undefined;
	readonly returns?: SymbolReturns | undefined;
	readonly examples?: ImmutableArray<string> | undefined;
	readonly signatures: SymbolSignatures;
	readonly static?: boolean | undefined;
	readonly readonly?: boolean | undefined;
	readonly children?: SymbolNodes;
}
export type SymbolNodes = ImmutableArray<SymbolNode>;
export type SymbolNodeKind = "function" | "class" | "interface" | "type" | "constant" | "method" | "property";

/** Represent a paramater passed into a function or class method symbol. */
export interface SymbolParam {
	name: string;
	type: string;
	description?: string;
}
export type SymbolParams = ImmutableArray<SymbolParam>;

/** Represent a value returned from a function or class method symbol. */
export interface SymbolReturn {
	type: string;
	description?: string;
}
export type SymbolReturns = ImmutableArray<SymbolReturn>;

/** Represent the full signature of a source code symbol. */
export type SymbolSignature = string;
export type SymbolSignatures = ImmutableArray<SymbolSignature>;

/** Any node, including files, directories, or source code symbols. */
export type Node = PathNode | SymbolNode;
export type Nodes = ImmutableArray<Node>;
export type NodeKind = PathNodeKind | SymbolNodeKind;

/**
 * Nest a set of path nodes by their path, creating a `"directory"` node above for any that share path segments.
 * - Recurses until the entire directory tree is nested.
 * - The contents of `README.md` files in the root of a directory are used as the `description` of that directory.
 *
 * @returns The root directory node.
 */
export function nestPathNodes(input: PossibleArray<PathNode>): PathNode {
	return requireArray(input).reduce<PathNode>(_reducePathNodes, { kind: "directory", name: "", path: "", children: [] });
}
function _reducePathNodes(root: PathNode, node: PathNode): PathNode {
	const segments = node.path.split("/");
	return _insertPathNode(root, segments, node);
}
function _insertPathNode(parent: PathNode, segments: string[], node: PathNode): PathNode {
	if (!isArray(segments, 1)) return parent;

	const [head, ...rest] = segments;

	if (rest.length === 0) {
		const isReadme = node.kind === "file" && README_FILES.includes(node.name);
		if (isReadme) {
			const description = node.description;
			return description ? { ...parent, description } : parent;
		} else {
			return { ...parent, children: [...parent.children, node] };
		}
	}

	const childPath = parent.path ? `${parent.path}/${head}` : head;
	const children = parent.children;
	const existingDir = children.find((c): c is PathNode => c.kind === "directory" && c.name === head);
	const updatedDir: PathNode = existingDir ?? {
		kind: "directory",
		name: head,
		path: childPath,
		children: [],
	};

	const nextDir = _insertPathNode(updatedDir, rest, node);
	const otherChildren = children.filter(c => !(c.kind === "directory" && c.name === head));
	return { ...parent, children: [...otherChildren, nextDir] };
}

/**
 * Merge duplicate symbol nodes by name and kind, combining signatures and returns.
 * - Examples, signatures, params, and returns are merged.
 * - Only the first description is kept.
 */
export function mergeSymbolNodes(input: PossibleArray<SymbolNode>): SymbolNodes {
	const output = requireArray(input).reduce(_reduceSymbolNodes, []);
	return isArray(input) && output.length === input.length ? input : output;
}
function _reduceSymbolNodes(acc: SymbolNode[], current: SymbolNode) {
	for (const [i, existing] of acc.entries())
		if (current.name === existing.name) {
			const examples =
				existing.examples && current.examples
					? getUniqueArray([...existing.examples, ...current.examples])
					: existing.examples || current.examples;
			const signatures = getUniqueArray([...existing.signatures, ...current.signatures]);
			const params =
				existing.params && current.params ? mergeSymbolParams([...existing.params, ...current.params]) : existing.params || current.params;
			const returns =
				existing.returns && current.returns
					? mergeSymbolReturns([...existing.returns, ...current.returns])
					: existing.returns || current.returns;
			acc[i] = { ...existing, ...current, examples, signatures, params, returns };
			return acc;
		}
	acc.push(current);
	return acc;
}

/**
 * Merge a list of `Param` information for a symbol node.
 * - Looks for params with a matching `name` and `type` and collapses them together.
 * - Only the first existing `description` is kept.
 */
function mergeSymbolParams(input: SymbolParams): SymbolParams {
	const output = input.reduce(_reduceSymbolParams, []);
	return output.length === input.length ? input : output;
}
function _reduceSymbolParams(acc: SymbolParam[], current: SymbolParam) {
	for (const [i, existing] of acc.entries())
		if (existing.name === current.name && existing.type === current.type) {
			acc[i] = { ...existing, ...current };
			return acc;
		}
	acc.push(current);
	return acc;
}

/**
 * Merge a list of `Return` information for a symbol node.
 * - Looks for returns with a matching `type` and collapses them together.
 * - Only the first existing `description` is kept.
 */
function mergeSymbolReturns(input: SymbolReturns): SymbolReturns {
	const output = input.reduce(_reduceSymbolReturns, []);
	return output.length === input.length ? input : output;
}
function _reduceSymbolReturns(acc: SymbolReturn[], current: SymbolReturn) {
	for (const [i, existing] of acc.entries())
		if (existing.type === current.type) {
			acc[i] = { ...existing, ...current };
			return acc;
		}
	acc.push(current);
	return acc;
}
