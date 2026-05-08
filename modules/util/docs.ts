import { basename, extname } from "node:path";
import ts from "typescript";
import { type ImmutableArray, isArray } from "./array.js";
import { requireMatch } from "./regexp.js";

// ──────────────────────────────────────────────────────────────────────────────
// Public types
// ──────────────────────────────────────────────────────────────────────────────

/** Top-level documentation token tree produced by `parseDocs()` and consumed by `<DocsApp>`. */
export interface DocsTokens {
	/** Optional site title (e.g. `"shelving"`) — used as the `app` title in the document head. */
	readonly title?: string | undefined;
	/** Root directory node containing the parsed source tree. */
	readonly root: DocsNode;
	/** Non-source pages routed by `slot` (e.g. `"storybook"`). */
	readonly extras: readonly DocsExtra[];
}

/** A directory or file in the documented source tree. */
export interface DocsNode {
	readonly kind: "directory" | "file";
	readonly name: string;
	/** Logical path with no extension, e.g. `"ui/inline/Tag"`. Empty string for the root. */
	readonly path: string;
	/** Description: README body for directories, file-level docblock for source files, or full content for non-source files. */
	readonly description?: string | undefined;
	/** Exported symbols extracted from the file (source files only). */
	readonly symbols?: readonly DocsSymbol[] | undefined;
	/** Child nodes (directories only). */
	readonly children?: readonly DocsNode[] | undefined;
}

/** An exported symbol in a source file. */
export interface DocsSymbol {
	readonly kind: "function" | "class" | "interface" | "type" | "constant" | "method" | "property";
	readonly name: string;
	readonly description?: string | undefined;
	readonly type?: string | undefined;
	readonly signatures: readonly string[];
	readonly params?: readonly DocsParam[] | undefined;
	readonly returns?: readonly DocsReturn[] | undefined;
	readonly examples?: readonly string[] | undefined;
	readonly children?: readonly DocsSymbol[] | undefined;
	readonly static?: boolean | undefined;
	readonly readonly?: boolean | undefined;
}

/** A parameter on a function / method symbol. */
export interface DocsParam {
	readonly name: string;
	readonly type: string;
	readonly description?: string | undefined;
}

/** A return value on a function / method symbol. */
export interface DocsReturn {
	readonly type: string;
	readonly description?: string | undefined;
}

/** A non-source page rendered alongside the docs (e.g. the storybook). */
export interface DocsExtra {
	/** Logical path under the docs root, e.g. `"storybook"`. */
	readonly path: string;
	/** Page title shown in the sidebar and document head. */
	readonly title: string;
	/** Optional one-line lede shown under the title. */
	readonly lede?: string | undefined;
	/** Slot name the UI uses to dispatch (e.g. the `<DocsApp>` checks `slot === "storybook"`). */
	readonly slot: string;
}

/** Raw input file passed to `parseDocs()`. */
export interface DocsFile {
	/** Logical path including extension, e.g. `"ui/inline/Tag.tsx"`. */
	readonly path: string;
	/** File contents. */
	readonly content: string;
}

/** Options for `parseDocs()`. */
export interface ParseDocsOptions {
	readonly title?: string | undefined;
	readonly extras?: readonly DocsExtra[] | undefined;
}

// ──────────────────────────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Parse a list of source / markdown files into a `DocsTokens` tree.
 * - Source files (`.ts`/`.tsx`/`.js`/`.jsx`) are parsed via the TypeScript compiler API for symbols + JSDoc.
 * - Other files (notably `.md`) are stored as the file's `description`.
 * - `README.md` files become the `description` of their parent directory.
 *
 * Pure: no fs or network access. Caller passes file contents in.
 *
 * @example
 *   parseDocs([{ path: "util/array.ts", content: "..." }], { title: "shelving" });
 */
export function parseDocs(files: readonly DocsFile[], options: ParseDocsOptions = {}): DocsTokens {
	const fileNodes = files.map(_parseFile);
	const root = _nestNodes(fileNodes);
	return { title: options.title, root, extras: options.extras ?? [] };
}

// ──────────────────────────────────────────────────────────────────────────────
// File → DocsNode
// ──────────────────────────────────────────────────────────────────────────────

const _SCRIPT_KINDS: { [ext: string]: ts.ScriptKind } = {
	".js": ts.ScriptKind.JS,
	".jsx": ts.ScriptKind.JSX,
	".ts": ts.ScriptKind.TS,
	".tsx": ts.ScriptKind.TSX,
};

function _parseFile({ path, content }: DocsFile): DocsNode {
	const ext = extname(path);
	const name = basename(path);
	const scriptKind = _SCRIPT_KINDS[ext];

	if (!scriptKind) return { kind: "file", name, path, description: content };

	const sourceFile = ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true, scriptKind);
	return {
		kind: "file",
		name,
		path,
		symbols: [..._extractSymbols(sourceFile)],
		...(_extractFileDocblock(sourceFile) ?? {}),
	};
}

// ──────────────────────────────────────────────────────────────────────────────
// Tree nesting
// ──────────────────────────────────────────────────────────────────────────────

const _README_FILES = ["README.md"];

function _nestNodes(input: readonly DocsNode[]): DocsNode {
	return input.reduce<DocsNode>(_reduceNode, { kind: "directory", name: "", path: "", children: [] });
}
function _reduceNode(root: DocsNode, node: DocsNode): DocsNode {
	const segments = node.path.split("/");
	return _insertNode(root, segments, node);
}
function _insertNode(parent: DocsNode, segments: string[], node: DocsNode): DocsNode {
	if (!isArray(segments, 1)) return parent;

	const [head, ...rest] = segments;

	if (rest.length === 0) {
		const isReadme = node.kind === "file" && _README_FILES.includes(node.name);
		if (isReadme) return node.description ? { ...parent, description: node.description } : parent;
		return { ...parent, children: [...(parent.children ?? []), node] };
	}

	const childPath = parent.path ? `${parent.path}/${head}` : head;
	const existing = (parent.children ?? []).find(c => c.kind === "directory" && c.name === head);
	const dir: DocsNode = existing ?? { kind: "directory", name: head ?? "", path: childPath, children: [] };
	const merged = _insertNode(dir, rest, node);
	const others = (parent.children ?? []).filter(c => !(c.kind === "directory" && c.name === head));
	return { ...parent, children: [...others, merged] };
}

// ──────────────────────────────────────────────────────────────────────────────
// TypeScript symbol extraction
// ──────────────────────────────────────────────────────────────────────────────

function* _extractSymbols(sourceFile: ts.SourceFile): Iterable<DocsSymbol> {
	for (const statement of sourceFile.statements) {
		if (!_hasModifier(statement, ts.SyntaxKind.ExportKeyword)) continue;

		if (ts.isFunctionDeclaration(statement)) {
			yield _functionSymbol(statement);
		} else if (ts.isClassDeclaration(statement)) {
			yield _classSymbol(statement);
		} else if (ts.isInterfaceDeclaration(statement)) {
			yield _interfaceSymbol(statement);
		} else if (ts.isTypeAliasDeclaration(statement)) {
			yield _typeSymbol(statement);
		} else if (ts.isVariableStatement(statement)) {
			for (const declaration of statement.declarationList.declarations) yield _constantSymbol(declaration);
		}
	}
}

function _functionSymbol(declaration: ts.FunctionDeclaration): DocsSymbol {
	const name = declaration.name?.getText() ?? "function ";
	return {
		kind: "function",
		name: `${name}()`,
		type: declaration.type?.getText(),
		..._callableProps(declaration),
		..._docblockOf(declaration),
	};
}

function _classSymbol(declaration: ts.ClassDeclaration): DocsSymbol {
	const name = declaration.name?.getText() ?? "anonymous";
	return {
		kind: "class",
		name,
		signatures: [`class ${name}`],
		children: [..._classMembers(declaration)],
		..._docblockOf(declaration),
	};
}

function* _classMembers({ members }: ts.ClassDeclaration): Iterable<DocsSymbol> {
	for (const member of members) {
		const memberName = member.name?.getText() || "anonymous";
		// Skip private / protected / `_`-prefixed members.
		const isPrivate = _hasModifier(member, ts.SyntaxKind.PrivateKeyword);
		const isProtected = _hasModifier(member, ts.SyntaxKind.ProtectedKeyword);
		if (isPrivate || isProtected || memberName.startsWith("_")) continue;

		if (ts.isMethodDeclaration(member) || ts.isConstructorDeclaration(member)) {
			yield _methodSymbol(member);
		} else if (ts.isGetAccessor(member)) {
			yield _accessorSymbol(member);
		} else if (ts.isPropertyDeclaration(member)) {
			yield _propertySymbol(member);
		}
	}
}

function _interfaceSymbol(declaration: ts.InterfaceDeclaration): DocsSymbol {
	const name = declaration.name.getText();
	return {
		kind: "interface",
		name,
		signatures: [`interface ${name}`],
		..._docblockOf(declaration),
	};
}

function _typeSymbol(declaration: ts.TypeAliasDeclaration): DocsSymbol {
	const name = declaration.name.getText();
	const type = declaration.type?.getText();
	return {
		kind: "type",
		name,
		type,
		signatures: [`type ${name}${type ? ` = ${type}` : ""}`],
		..._docblockOf(declaration),
	};
}

function _constantSymbol(declaration: ts.VariableDeclaration): DocsSymbol {
	const name = declaration.name.getText();
	const type = declaration.type?.getText() ?? declaration.initializer?.getText();
	return {
		kind: "constant",
		name,
		type,
		signatures: [`const ${name}${type ? `: ${type}` : ""}`],
		..._docblockOf(declaration),
	};
}

function _methodSymbol(declaration: ts.MethodDeclaration | ts.ConstructorDeclaration): DocsSymbol {
	const name = ts.isConstructorDeclaration(declaration) ? "constructor" : (declaration.name?.getText() ?? "function ");
	return {
		kind: "method",
		name: `${name}()`,
		static: _hasModifier(declaration, ts.SyntaxKind.StaticKeyword),
		readonly: _hasModifier(declaration, ts.SyntaxKind.ReadonlyKeyword),
		..._callableProps(declaration),
		..._docblockOf(declaration),
	};
}

function _accessorSymbol(declaration: ts.GetAccessorDeclaration): DocsSymbol {
	const name = declaration.name.getText();
	const type = declaration.type?.getText() ?? "unknown";
	const isReadonly = !(
		ts.isClassDeclaration(declaration.parent) && declaration.parent.members.some(n => ts.isSetAccessor(n) && n.name.getText() === name)
	);
	const isStatic = _hasModifier(declaration, ts.SyntaxKind.StaticKeyword);
	return {
		kind: "property",
		name,
		type,
		static: isStatic,
		readonly: isReadonly,
		signatures: [`${isStatic ? "static " : ""}${name}: ${type}`],
		..._docblockOf(declaration),
	};
}

function _propertySymbol(declaration: ts.PropertyDeclaration): DocsSymbol {
	const name = declaration.name.getText();
	const type = declaration.type?.getText() ?? declaration.initializer?.getText();
	const isStatic = _hasModifier(declaration, ts.SyntaxKind.StaticKeyword);
	const isReadonly = _hasModifier(declaration, ts.SyntaxKind.ReadonlyKeyword);
	return {
		kind: "property",
		name,
		type,
		static: isStatic,
		readonly: isReadonly,
		signatures: [`${isStatic ? "static " : ""}${name}${type ? `: ${type}` : ""}`],
		..._docblockOf(declaration),
	};
}

function _callableProps(declaration: ts.FunctionLikeDeclaration): Pick<DocsSymbol, "params" | "returns" | "signatures"> {
	const isStatic = _hasModifier(declaration, ts.SyntaxKind.StaticKeyword);
	const displayName = ts.isConstructorDeclaration(declaration) ? "constructor" : (declaration.name?.getText() ?? "anonymous");
	const params: DocsParam[] = declaration.parameters.map(({ name, type }) => ({
		name: name.getText(),
		type: type?.getText() ?? "unknown",
	}));
	const returns: DocsReturn[] = [{ type: declaration.type?.getText() || "unknown" }];
	const signatures = [
		`${isStatic ? "static " : ""}${displayName}(${params.map(p => `${p.name}: ${p.type}`).join(", ")}) => ${returns.map(r => r.type).join(" | ")}`,
	];
	return { params, returns, signatures };
}

function _hasModifier(node: ts.Node, kind: ts.SyntaxKind): boolean {
	return "modifiers" in node && (node.modifiers as ImmutableArray<ts.Modifier> | undefined)?.some(mod => mod.kind === kind) === true;
}

// ──────────────────────────────────────────────────────────────────────────────
// JSDoc / docblock parsing
// ──────────────────────────────────────────────────────────────────────────────

interface _Docblock {
	description?: string | undefined;
	params?: readonly DocsParam[] | undefined;
	returns?: readonly DocsReturn[] | undefined;
	examples?: readonly string[] | undefined;
}

function _extractFileDocblock(sourceFile: ts.SourceFile): _Docblock | undefined {
	const text = sourceFile.getFullText();
	const ranges = ts.getLeadingCommentRanges(text, 0) ?? [];
	const block = ranges.map(range => text.slice(range.pos, range.end)).find(snippet => snippet.startsWith("/**"));
	return block ? _parseDocblock(block) : undefined;
}

function _docblockOf(node: ts.Node): _Docblock | undefined {
	const text = node.getSourceFile().getFullText();
	const ranges = ts.getLeadingCommentRanges(text, node.getFullStart());
	if (!ranges?.length) return undefined;
	const block = ranges
		.map(range => text.slice(range.pos, range.end))
		.filter(snippet => snippet.startsWith("/**"))
		.pop();
	return block ? _parseDocblock(block) : undefined;
}

/** Parse a `/** … *\/` JSDoc block into structured pieces. Exported for test coverage. */
export function _parseDocblock(raw: string): _Docblock {
	const inner = raw
		.trim()
		.replace(/^\/\*\*?/, "")
		.replace(/\*\/$/, "")
		.split(/\r?\n/)
		.map(line =>
			line
				.replace(/^\s*\*\/?$/, "")
				.replace(/^\s*\* ?/, "")
				.trimEnd(),
		);

	const lines: string[] = [];
	const params: DocsParam[] = [];
	const examples: string[] = [];
	const returns: DocsReturn[] = [];

	let current: { tag: string | undefined; lines: string[]; type?: string; name?: string } | undefined;

	const flush = () => {
		if (!current) return;
		const { name, lines: cl, tag, type = "unknown" } = current;
		const description = cl.join("\n").trim();
		if (tag === "example" && description) examples.push(description);
		else if (tag === "param" && name) params.push({ name, type, description });
		else if (tag === "returns" && type) returns.push({ type, description });
		current = undefined;
	};

	for (const line of inner) {
		const tagMatch = line.match(/^@(\w+)\s*(.*)$/);
		if (tagMatch) {
			flush();
			const [, tag = "", rest = ""] = tagMatch;
			if (tag === "param") {
				const [, type = "", name = "", description = ""] = requireMatch(rest, /^(?:\{([^}]+)\})?\s*(\S*)\s*(.*)$/);
				current = { tag: "param", lines: [description], type, name };
			} else if (tag === "returns" || tag === "return") {
				const [, type = "", description = ""] = requireMatch(rest, /^(?:\{([^}]+)\})?\s*(.*)$/);
				current = { tag: "returns", lines: description ? [description] : [], type };
			} else if (tag === "example") {
				current = { tag: "example", lines: rest ? [rest] : [] };
			} else {
				current = { tag, lines: rest ? [rest] : [] };
			}
			continue;
		}
		if (current) current.lines.push(line);
		else lines.push(line);
	}
	flush();

	return {
		...(lines.length ? { description: lines.join("\n").trim() } : undefined),
		...(params.length ? { params } : undefined),
		...(returns.length ? { returns } : undefined),
		...(examples.length ? { examples } : undefined),
	};
}
