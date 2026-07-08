import {
	type ClassDeclaration,
	type ConstructorDeclaration,
	getTextOfJSDocComment,
	isArrayBindingPattern,
	isBindingElement,
	isClassDeclaration,
	isConstructorDeclaration,
	isEnumDeclaration,
	isFunctionDeclaration,
	isGetAccessorDeclaration,
	isIdentifier,
	isInterfaceDeclaration,
	isJSDoc,
	isJSDocParameterTag,
	isJSDocReturnTag,
	isJSDocSeeTag,
	isJSDocThrowsTag,
	isJSDocTypeExpression,
	isMethodDeclaration,
	isMethodSignatureDeclaration,
	isObjectBindingPattern,
	isPropertyDeclaration,
	isPropertySignatureDeclaration,
	isSetAccessorDeclaration,
	isTypeAliasDeclaration,
	isTypeLiteralNode,
	isTypeReferenceNode,
	isVariableStatement,
	type Modifier,
	type ModifierLike,
	type Node,
	type NodeArray,
	type ParameterDeclaration,
	type SourceFile,
	type Statement,
	SyntaxKind,
	type TypeElement,
	type TypeNode,
} from "typescript/unstable/ast";
import { API } from "typescript/unstable/async";
import type { FileSystem } from "typescript/unstable/fs";
import { ValueError } from "../error/ValueError.js";
import type { ImmutableArray } from "../util/array.js";
import { BLACKHOLE } from "../util/function.js";
import type {
	DocumentationElement,
	DocumentationElementProps,
	DocumentationExample,
	DocumentationParam,
	DocumentationReturn,
	DocumentationThrow,
	TreeElementProps,
} from "../util/tree.js";
import { FileExtractor } from "./FileExtractor.js";
import { extractMarkdownProps } from "./MarkupExtractor.js";

/**
 * File extractor that parses a TypeScript source file into a tree element.
 * - Uses the native TypeScript compiler's API (`typescript/unstable/async` — TypeScript 7+) to parse the AST.
 * - Parsing runs on a shared native compiler server, spawned on demand into a virtual filesystem and closed again after a short idle — callers never manage its lifecycle.
 * - Extracts exported, public, non-`_`-prefixed declarations as `tree-documentation` children.
 * - Overloaded declarations sharing a name are merged into a single `tree-documentation` with multiple `signatures`. When a function (or constructor) is overloaded, the implementation declaration (the "base definition") is dropped entirely — only the overload signatures are documented.
 * - A `@param name {Type}` (or `@returns {Type}`) whose `{Type}` is given is canonical: it supersedes the inferred type from the base definition and any overloads. Multiple `@param name` tags for one parameter each emit a row, letting a single parameter be documented as several typed variants.
 * - Class declarations synthesise their `signatures`, `params`, and `returns` from the constructor — `new ClassName<…>(…)` including generics, one signature per constructor overload, with `returns` set to the class type. Param descriptions come from the constructor's `@param` first, then the class's `@param`.
 * - A `@kind` tag in a symbol's JSDoc overrides the inferred kind — e.g. `@kind component` relabels a React component (otherwise a `function`) so the docs site groups and colours it as a component. The override also drops the trailing `()` from the title, since a non-function kind reads as a bare name.
 * - Sets `description` (a plain-text summary from the first JSDoc paragraph) on every `tree-documentation` child.
 * - Sets `title` on every `tree-documentation` child — `name()` for functions, `Class.name()` for methods, bare `name` for other kinds. (Data members are not child elements — see `properties` below.)
 * - Records relational metadata as raw strings for render-time linking: `class` (owning class), `readonly`, `extends` / `implements` (full heritage type text including generic arguments, e.g. `AbstractStore<string>` or `Omit<StringSchemaOptions, "value">`), and `types` (the type names a `type` alias's body references, e.g. `OtherType` in `string | OtherType`).
 * - Records a structured `properties` list for classes, interfaces, and object-literal `type` aliases — each data member's (property/getter/setter) name, type, optionality, default, and description. This is the single source for a type's data members: they render as the type's Properties table and flatten into an options-bag parameter's fields at render time, rather than each becoming its own child element. Methods stay as child elements.
 * - Names a destructured (binding-pattern) parameter for the Param column — which has no name of its own — from an explicit `@param`, else its rest element (`...options`), else a type-derived fallback (`props` / `options`). The signature still shows the full `{ … }`.
 * - Pretty-prints object-literal signatures (interfaces and object-literal `type` aliases) as multi-line `{ … }` blocks, one member per line; other type bodies (`string | null`, mapped types, …) are emitted verbatim.
 * - Members declared with the `override` or `declare` modifier are skipped — the base class already documents overrides, and `declare` members are ambient type-only re-declarations rather than new API.
 * - Keys are the raw declared `name` (case-preserving) so case-distinct exports like `Collection` and `COLLECTION` stay separate.
 * - The file element itself has no `title` — a TS source file has no confident title source; renderers fall back to `name`.
 *
 * @example const element = await new TypescriptExtractor().extractProps("string.ts", sourceText);
 *
 * @see https://shelving.cc/extract/TypescriptExtractor
 */
export class TypescriptExtractor extends FileExtractor {
	/** Parses the TypeScript source into one `tree-documentation` child per exported public declaration. */
	override async extractProps(name: string, text: string): Promise<Partial<TreeElementProps> & { name: string }> {
		const source = await _parseSourceFile(text);

		// Names with one or more overload signatures (bodyless function declarations). When a function is overloaded, the
		// implementation declaration (the one with a body — the "base definition") is dropped entirely; only the overloads are documented.
		const overloaded = new Set<string>();
		for (const statement of source.statements)
			if (isFunctionDeclaration(statement) && !statement.body && statement.name) overloaded.add(statement.name.text);

		// Collect elements by key, merging overloads (same name) by appending signatures.
		const byKey = new Map<string, DocumentationElement>();
		for (const statement of source.statements) {
			// Skip the implementation of an overloaded function — overloads supersede the base definition.
			if (isFunctionDeclaration(statement) && statement.body && statement.name && overloaded.has(statement.name.text)) continue;
			const element = _extractStatement(statement, source);
			if (!element) continue;
			const existing = byKey.get(element.key);
			byKey.set(element.key, existing ? _mergeOverloads(existing, element) : element);
		}

		// The file element itself gets no `title` (a TS source file has no confident title source — the filename isn't one) and no
		// `description` / `content`: file-level prose lives in the sibling README / `.md`, which the merge step folds onto this element.
		return { name, children: Array.from(byKey.values()) };
	}
}

// Constants.
const _DIR = "/shelving-typescript-extractor";
const _TSCONFIG_PATH = `${_DIR}/tsconfig.json`;
const _TSCONFIG_JSON = JSON.stringify({ compilerOptions: { noEmit: true }, include: ["**/*.ts"] });
const _IDLE_CLOSE_MS = 500;

/** Shared native compiler server plus the virtual files it can see. */
interface _Server {
	readonly api: API;
	readonly files: Map<string, string>;
}

let _server: _Server | undefined;
let _queue: Promise<unknown> = Promise.resolve();
let _timer: ReturnType<typeof setTimeout> | undefined;
let _count = 0;
let _previous: string | undefined;

/** Is a path inside the virtual directory the compiler server is rooted in? */
function _isVirtual(path: string): boolean {
	return path === _DIR || path.startsWith(`${_DIR}/`);
}

/** Get the shared compiler server, spawning it on demand with a virtual filesystem rooted at `_DIR`. */
function _getServer(): _Server {
	if (_server) return _server;
	const files = new Map<string, string>([[_TSCONFIG_PATH, _TSCONFIG_JSON]]);
	// Paths outside the virtual directory return `undefined` so the server falls back to the real filesystem (e.g. bundled libs).
	const fs: FileSystem = {
		fileExists: f => (_isVirtual(f) ? files.has(f) : undefined),
		readFile: f => (_isVirtual(f) ? (files.get(f) ?? null) : undefined),
		directoryExists: d => (d === _DIR ? true : _isVirtual(d) ? false : undefined),
		getAccessibleEntries: d =>
			d === _DIR
				? { files: Array.from(files.keys(), f => f.slice(_DIR.length + 1)), directories: [] }
				: _isVirtual(d)
					? { files: [], directories: [] }
					: undefined,
		realpath: p => (_isVirtual(p) ? p : undefined),
	};
	_server = { api: new API({ cwd: _DIR, fs }), files };
	return _server;
}

/** Close the shared compiler server after a short idle, so the process can exit without callers managing the lifecycle. */
function _scheduleClose(): void {
	if (_timer) clearTimeout(_timer);
	_timer = setTimeout(() => {
		const server = _server;
		_server = undefined;
		_previous = undefined;
		_timer = undefined;
		try {
			server?.api.close();
		} catch {
			// Closing can reject in-flight bookkeeping requests — harmless on shutdown.
		}
	}, _IDLE_CLOSE_MS);
}

/**
 * Parse TypeScript source text into a `SourceFile` via the shared native compiler server.
 * - Each call writes the text as a fresh virtual file, snapshots the project, and materialises the file's AST.
 * - Calls are serialised through a queue so concurrent extractions don't interleave snapshot updates.
 *
 * @throws `ValueError` If the server fails to produce a source file for the text.
 */
function _parseSourceFile(text: string): Promise<SourceFile> {
	const task = async (): Promise<SourceFile> => {
		if (_timer) clearTimeout(_timer);
		const { api, files } = _getServer();
		const path = `${_DIR}/${_count++}.ts`;
		files.set(path, text);
		// Drop the previous parse's file so the virtual project stays a single file (keeps snapshots cheap).
		const deleted = _previous;
		if (deleted) files.delete(deleted);
		_previous = path;
		const snapshot = await api.updateSnapshot({
			openProjects: [_TSCONFIG_PATH],
			fileChanges: { created: [path], ...(deleted ? { deleted: [deleted] } : {}) },
		});
		try {
			const source = await snapshot.getProject(_TSCONFIG_PATH)?.program.getSourceFile(path);
			if (!source) throw new ValueError("Unable to parse TypeScript source", { received: text });
			return source;
		} finally {
			snapshot.dispose();
			_scheduleClose();
		}
	};
	const result = _queue.then(task, task);
	_queue = result.catch(BLACKHOLE);
	return result;
}

/** Read a node's modifiers (excluding decorators), or `undefined` when it has none. */
function _getModifiers(node: Node): readonly Modifier[] | undefined {
	const modifiers = (node as Node & { modifiers?: NodeArray<ModifierLike> }).modifiers;
	const filtered = modifiers?.filter((m): m is Modifier => m.kind !== SyntaxKind.Decorator);
	return filtered?.length ? filtered : undefined;
}

/** Get a member's declared identifier name, or `undefined` for computed / private / missing names. */
function _getMemberName(member: Node): string | undefined {
	// Class/type member bases don't surface `name` structurally — read it off the node and narrow.
	const { name } = member as Node & { name?: Node | undefined };
	return name && isIdentifier(name) ? name.text : undefined;
}

/** Get the text of a JSDoc tag's `{Type}` expression — unwraps a `JSDocTypeExpression` to its inner type. */
function _getJSDocTypeText(typeExpression: TypeNode | undefined, source: SourceFile): string | undefined {
	if (!typeExpression) return;
	const type = isJSDocTypeExpression(typeExpression) ? typeExpression.type : typeExpression;
	return type.getText(source);
}

/** Merge a newly-extracted overload into the existing documentation element with the same key. */
function _mergeOverloads(existing: DocumentationElement, next: DocumentationElement): DocumentationElement {
	const a = existing.props;
	const b = next.props;
	const merged: DocumentationElementProps = {
		...a,
		// Keep first content encountered; fill in if `existing` had none.
		content: a.content ?? b.content,
		// Append incoming entries, skipping any already present (by field identity), preserving insertion order.
		// Identity: signatures/examples/throws by rendered string; params by (name, type, description, optional, default); returns by (type, description).
		signatures: _concatUnique(a.signatures, b.signatures, s => s),
		params: _concatUnique(a.params, b.params, p => `${p.name}\0${p.type}\0${p.description}\0${p.optional}\0${p.default}`),
		returns: _concatUnique(a.returns, b.returns, r => `${r.type}\0${r.description}`),
		throws: _concatUnique(a.throws, b.throws, t => `${t.type}\0${t.description}`),
		examples: _concatUnique(a.examples, b.examples, e => e.description ?? ""),
	};
	return { ...existing, props: merged };
}

function _concat<T>(a: readonly T[] | undefined, b: readonly T[] | undefined): readonly T[] | undefined {
	if (!a) return b;
	if (!b) return a;
	return [...a, ...b];
}

/** Concatenate `b` onto `a`, skipping entries whose identity already appears, preserving insertion order. */
function _concatUnique<T>(
	a: readonly T[] | undefined,
	b: readonly T[] | undefined,
	identity: (item: T) => string,
): readonly T[] | undefined {
	if (!a) return b;
	if (!b) return a;
	const seen = new Set(a.map(identity));
	const result = [...a];
	for (const item of b) {
		const key = identity(item);
		if (seen.has(key)) continue;
		seen.add(key);
		result.push(item);
	}
	// Preserve the original reference when nothing new was added.
	return result.length === a.length ? a : result;
}

/** Extract an element from a top-level statement, or return undefined if it should be skipped. */
function _extractStatement(statement: Statement, source: SourceFile): DocumentationElement | undefined {
	// Skip non-exported statements.
	if (!_isExported(statement)) return;

	// Skip statements without a name.
	const name = _getStatementName(statement);
	if (!name) return;

	// Skip private/internal names.
	if (name.startsWith("_")) return;

	const jsDoc = _getJSDoc(statement, source);
	// A `@kind` tag overrides the AST-inferred kind (e.g. `@kind component` for a React component declared as a function).
	const kind = jsDoc?.kind ?? _getKind(statement);
	if (!kind) return;

	const signatures = _getSignatures(statement, source, name);
	const params = _getParams(statement, source, jsDoc?.params);
	const returns = _getReturns(statement, source, jsDoc?.returns, name);
	const throws = jsDoc?.throws;
	const examples = jsDoc?.examples;
	// Heritage (`extends` / `implements`) is only meaningful for classes and interfaces.
	const heritage = _getHeritage(statement, source);
	// Referenced type names (type aliases) and structured property lists (interfaces / object-literal types) — both resolved to links at render time.
	const types = _getReferencedTypes(statement, source);
	const properties = _getProperties(statement, source);
	const children = _getClassMembers(statement, source, name);

	return {
		type: "tree-documentation",
		key: name,
		props: {
			name,
			// Functions read as callable with `()`; other kinds use the bare name.
			title: kind === "function" ? `${name}()` : name,
			kind,
			description: extractMarkdownProps(jsDoc?.description ?? "").description,
			content: _buildJSDocContent(jsDoc?.description, jsDoc?.unhandled),
			signatures,
			params,
			returns,
			throws,
			examples,
			extends: heritage?.extends,
			implements: heritage?.implements,
			types,
			properties,
			children,
		},
	};
}

/** Extract the `extends` (single base type) and `implements` (interface list) heritage from a class or interface declaration, as full type text including any generic arguments (e.g. `AbstractStore<string>`, `Omit<StringSchemaOptions, "value">`). */
function _getHeritage(
	statement: Statement,
	source: SourceFile,
): { extends: string | undefined; implements: ImmutableArray<string> | undefined } | undefined {
	if (!isClassDeclaration(statement) && !isInterfaceDeclaration(statement)) return;
	let extendsName: string | undefined;
	const implementsNames: string[] = [];
	for (const clause of statement.heritageClauses ?? []) {
		// Full text — keep generic arguments (`Foo<T>`) and wrappers (`Omit<…>`) intact; render-time lookup trims them to the bare name to resolve a link.
		const names = clause.types.map(t => t.getText(source));
		// `extends` keeps the first base type; an interface extending several still surfaces its primary base.
		if (clause.token === SyntaxKind.ExtendsKeyword) extendsName ??= names[0];
		else if (clause.token === SyntaxKind.ImplementsKeyword) implementsNames.push(...names);
	}
	if (!extendsName && !implementsNames.length) return;
	return { extends: extendsName, implements: implementsNames.length ? implementsNames : undefined };
}

/**
 * Collect the type names a `type` alias's body references (e.g. `OtherType` in `type X = string | OtherType`), for render-time linking.
 * - Walks the whole type expression so names nested inside generics, unions, arrays, etc. are all caught.
 * - Primitive keyword types (`string`, `number`, …) aren't type references so they're naturally excluded; the alias's own generic parameters are filtered out explicitly.
 * - Order-preserving and de-duplicated. Unresolved names (builtins like `Record`, externals) simply stay as plain text at render time.
 */
function _getReferencedTypes(statement: Statement, source: SourceFile): ImmutableArray<string> | undefined {
	if (!isTypeAliasDeclaration(statement)) return;
	const generics = new Set(statement.typeParameters?.map(t => t.name.text) ?? []);
	const names: string[] = [];
	const seen = new Set<string>();
	const visit = (node: Node): void => {
		if (isTypeReferenceNode(node)) {
			const name = node.typeName.getText(source);
			if (!generics.has(name) && !seen.has(name)) {
				seen.add(name);
				names.push(name);
			}
		}
		node.forEachChild(visit);
	};
	visit(statement.type);
	return names.length ? names : undefined;
}

/**
 * Extract structured property entries from a class, interface, or object-literal `type` alias, mirroring the `DocumentationParam` shape.
 * - This is the single source of truth for a type's data members: properties (and getters/setters) are documented here as a structured list, not as their own child elements. Methods stay as child elements (see `_getClassMembers`).
 * - Used both to render the type's own Properties table and to flatten an options-bag parameter into its individual fields at render time (resolve the param's type in the tree map, then list these).
 * - Skips private/protected, `_`-prefixed, `override`, and `declare` members. Optionality comes from a `?` token; defaults from a class-field initializer or a member's `@default` JSDoc; descriptions from each member's own JSDoc.
 * - Getters/setters fold into a single entry per name (the getter's type wins for a get/set pair).
 */
function _getProperties(statement: Statement, source: SourceFile): ImmutableArray<DocumentationParam> | undefined {
	const members =
		isInterfaceDeclaration(statement) || isClassDeclaration(statement)
			? statement.members
			: isTypeAliasDeclaration(statement) && isTypeLiteralNode(statement.type)
				? statement.type.members
				: undefined;
	if (!members) return;
	const properties: DocumentationParam[] = [];
	for (const member of members) {
		const name = _getMemberName(member);
		if (!name || name.startsWith("_")) continue;
		const modifiers = _getModifiers(member);
		// Skip private/protected (not public API), `override` (documented on the base class), and `declare` (ambient re-declarations).
		if (modifiers?.some(m => m.kind === SyntaxKind.PrivateKeyword || m.kind === SyntaxKind.ProtectedKeyword)) continue;
		if (modifiers?.some(m => m.kind === SyntaxKind.OverrideKeyword || m.kind === SyntaxKind.DeclareKeyword)) continue;
		const jsDoc = _getJSDoc(member, source);
		if (isPropertySignatureDeclaration(member) || isPropertyDeclaration(member)) {
			// A class field's initializer is its default; otherwise fall back to an explicit `@default` tag.
			const def = (isPropertyDeclaration(member) ? member.initializer?.getText(source) : undefined) ?? jsDoc?.default;
			properties.push({
				name,
				type: member.type?.getText(source),
				description: jsDoc?.description,
				// Optionality is a `?` postfix token (the postfix slot also carries `!` definite-assignment, which isn't optionality).
				optional: member.postfixToken?.kind === SyntaxKind.QuestionToken,
				default: def,
				readonly: modifiers?.some(m => m.kind === SyntaxKind.ReadonlyKeyword) || undefined,
			});
		} else if (isGetAccessorDeclaration(member) || isSetAccessorDeclaration(member)) {
			const type = isGetAccessorDeclaration(member) ? member.type?.getText(source) : member.parameters[0]?.type?.getText(source);
			const index = properties.findIndex(p => p.name === name);
			const found = index >= 0 ? properties[index] : undefined;
			// Fold a get/set pair into one entry: the getter's declared type wins, and the matching setter clears read-only.
			if (found) {
				properties[index] = { ...found, type: isGetAccessorDeclaration(member) && type ? type : found.type, readonly: undefined };
			} else {
				// A lone getter is read-only until a setter is seen; a lone setter is writable.
				properties.push({
					name,
					type,
					description: jsDoc?.description,
					optional: false,
					default: jsDoc?.default,
					readonly: isGetAccessorDeclaration(member) || undefined,
				});
			}
		}
	}
	return properties.length ? properties : undefined;
}

/**
 * Combine the JSDoc leading-description text and any unhandled `@rule` blocks into a single markup content string.
 * - Unhandled rules (anything not `@param`/`@returns`/`@throws`/`@example`/`@see`) are appended after the description, separated by blank lines, with their `@name` preserved.
 * - Returns `undefined` if both are empty.
 */
function _buildJSDocContent(description: string | undefined, unhandled: string | undefined): string | undefined {
	if (!description) return unhandled;
	if (!unhandled) return description;
	return `${description}\n\n${unhandled}`;
}

/** Check if a statement has an `export` modifier. */
function _isExported(statement: Statement): boolean {
	return !!_getModifiers(statement)?.some(m => m.kind === SyntaxKind.ExportKeyword);
}

/** Get the declared name of a statement. */
function _getStatementName(statement: Statement): string | undefined {
	if (
		isFunctionDeclaration(statement) ||
		isClassDeclaration(statement) ||
		isInterfaceDeclaration(statement) ||
		isTypeAliasDeclaration(statement) ||
		isEnumDeclaration(statement)
	) {
		return statement.name?.text;
	}
	if (isVariableStatement(statement)) {
		const declaration = statement.declarationList.declarations[0];
		if (declaration && isIdentifier(declaration.name)) return declaration.name.text;
	}
}

/** Map a statement to its documentation kind. */
function _getKind(statement: Statement): string | undefined {
	if (isFunctionDeclaration(statement)) return "function";
	if (isClassDeclaration(statement)) return "class";
	if (isInterfaceDeclaration(statement)) return "interface";
	if (isTypeAliasDeclaration(statement)) return "type";
	if (isVariableStatement(statement)) return "constant";
}

/** Get the text signature(s) of a statement — complete, name-prefixed declarations usable as headings. */
function _getSignatures(statement: Statement, source: SourceFile, name: string): readonly string[] | undefined {
	if (isFunctionDeclaration(statement)) {
		const params = statement.parameters.map(p => p.getText(source)).join(", ");
		const ret = statement.type ? statement.type.getText(source) : "void";
		return [`${name}(${params}): ${ret}`];
	}
	if (isClassDeclaration(statement)) {
		// Synthesise `new ClassName<…>(…)` constructor signatures so a class page reads like a function's.
		return _getConstructorSignatures(statement, source, name);
	}
	if (isInterfaceDeclaration(statement)) {
		// Emit a pretty-printed `{ member; member }` block — the same shape a `type` object body produces, distinguished only by the `kind` badge.
		return [_formatObjectSignature(statement.members, source)];
	}
	if (isTypeAliasDeclaration(statement)) {
		// Pretty-print object-literal aliases multi-line like an interface; emit other bodies (`string | null`, mapped types, …) verbatim. The alias name is already the page title.
		if (isTypeLiteralNode(statement.type)) return [_formatObjectSignature(statement.type.members, source)];
		return [statement.type.getText(source)];
	}
	if (isVariableStatement(statement)) {
		const declaration = statement.declarationList.declarations[0];
		if (declaration?.type) return [`${name}: ${declaration.type.getText(source)}`];
	}
}

/** Pretty-print object-type members as a multi-line `{ … }` block — one member per tab-indented line ending in `;` — or `{}` when empty. */
function _formatObjectSignature(members: readonly TypeElement[], source: SourceFile): string {
	if (!members.length) return "{}";
	const lines = members.map(m => `\t${m.getText(source).replace(/;\s*$/, "").trim()};`);
	return `{\n${lines.join("\n")}\n}`;
}

/** Render a class's generic parameter names as `<P, R>` (names only, no constraints), or `""` when non-generic. */
function _getTypeParamNames(statement: ClassDeclaration, source: SourceFile): string {
	const { typeParameters } = statement;
	if (!typeParameters?.length) return "";
	return `<${typeParameters.map(t => t.name.getText(source)).join(", ")}>`;
}

/** Get a class's constructor declarations in source order — when overloaded, only the overload signatures (the implementation, i.e. the base definition, is dropped). */
function _getConstructors(statement: ClassDeclaration): readonly ConstructorDeclaration[] {
	const constructors = statement.members.filter(isConstructorDeclaration);
	// When overload signatures exist, drop the implementation constructor (the one with a body) — overloads supersede the base definition.
	return constructors.some(c => !c.body) ? constructors.filter(c => !c.body) : constructors;
}

/**
 * Synthesise `new ClassName<…>(…)` signatures from a class's constructor declaration(s).
 * - Generics are included so the reader sees how they're inferred from the arguments (e.g. `new MockAPIProvider<P, R>(…)`).
 * - Multiple constructor overloads each become a signature, same as function overloads.
 * - A class with no explicit constructor yields a single degenerate `new ClassName()` signature.
 */
function _getConstructorSignatures(statement: ClassDeclaration, source: SourceFile, name: string): readonly string[] {
	const generics = _getTypeParamNames(statement, source);
	const constructors = _getConstructors(statement);
	if (!constructors.length) return [`new ${name}${generics}()`];
	return constructors.map(c => `new ${name}${generics}(${c.parameters.map(p => p.getText(source)).join(", ")})`);
}

/** Extract parameters from a function or class declaration, enriched with JSDoc `@param` descriptions. */
function _getParams(
	statement: Statement,
	source: SourceFile,
	jsDocParams: readonly DocumentationParam[] | undefined,
): readonly DocumentationParam[] | undefined {
	if (isClassDeclaration(statement)) return _getConstructorParams(statement, source, jsDocParams);
	if (!isFunctionDeclaration(statement)) return;
	const params = _buildParams(statement.parameters, source, jsDocParams);
	return params.length ? params : undefined;
}

/**
 * Build documentation params from a declaration's AST parameters, applying JSDoc `@param` overrides.
 * - A `@param name {Type}` whose `{Type}` is given is canonical: it supersedes the parameter's inferred type from the base definition and any overloads.
 * - Multiple `@param name` tags for the same parameter each emit a row, so a single parameter can be documented as several typed variants.
 * - A `@param name` with no `{Type}` only supplies the description; the inferred type stands.
 * - `primaryJsDocParams` win over `fallbackJsDocParams` per name (used by constructors: the constructor's own `@param` beats the class-level `@param`).
 * - A destructured (binding-pattern) param has no name of its own — its display name resolves as an "orphan" `@param` (one not matching any identifier param, in source order), else the rest element (`...options`), else a type-derived fallback (see `_getBindingName`). This keeps the Param column readable (`options`) while the signature still shows the full `{ … }`.
 */
function _buildParams(
	parameters: readonly ParameterDeclaration[],
	source: SourceFile,
	primaryJsDocParams: readonly DocumentationParam[] | undefined,
	fallbackJsDocParams?: readonly DocumentationParam[] | undefined,
): DocumentationParam[] {
	const params: DocumentationParam[] = [];
	// Identifier (non-destructured) parameter names — used to spot "orphan" `@param` tags that name a destructured bag.
	const named = new Set<string>();
	for (const p of parameters) if (isIdentifier(p.name)) named.add(p.name.getText(source));
	// Top-level `@param` names not matching any identifier parameter, in declared order (constructor's own first, then class-level), de-duplicated — these let an author name a destructured param (`@param options`). Sub-tags (`options.min`) are excluded.
	const orphans: string[] = [];
	for (const d of [...(primaryJsDocParams ?? []), ...(fallbackJsDocParams ?? [])])
		if (!d.name.includes(".") && !named.has(d.name) && !orphans.includes(d.name)) orphans.push(d.name);
	let orphan = 0;
	for (const p of parameters) {
		const name = isIdentifier(p.name) ? p.name.getText(source) : (orphans[orphan++] ?? _getBindingName(p, source));
		const type = p.type?.getText(source);
		const optional = !!p.questionToken || !!p.initializer;
		const def = p.initializer?.getText(source);
		// JSDoc `@param` entries for this name — the declaration's own take priority over the fallback (class-level) ones.
		const primary = primaryJsDocParams?.filter(d => d.name === name) ?? [];
		const matched = primary.length ? primary : (fallbackJsDocParams?.filter(d => d.name === name) ?? []);
		// A `@param` carrying a `{Type}` is canonical — emit one row per typed entry, its type overriding the inferred type.
		const typed = matched.filter(d => d.type);
		if (typed.length) {
			for (const d of typed) params.push({ name, type: d.type, description: d.description, optional, default: def });
		} else {
			params.push({ name, type, description: matched[0]?.description, optional, default: def });
		}
	}
	return params;
}

/**
 * Derive a display name for a destructured (binding-pattern) parameter, which has no name of its own.
 * - Prefers the rest element's name when present (`{ min, ...options }` → `options`), since that's already author-supplied and accurate.
 * - Otherwise falls back to a generic name read from the type — `props` for a `*Props` type (component props), else `options`.
 * - Callers resolve an explicit `@param` first (see `_buildParams`); this is only the fallback when none is given.
 */
function _getBindingName(p: ParameterDeclaration, source: SourceFile): string {
	const { name } = p;
	if (isObjectBindingPattern(name) || isArrayBindingPattern(name))
		for (const el of name.elements) if (isBindingElement(el) && el.dotDotDotToken && el.name && isIdentifier(el.name)) return el.name.text;
	return p.type?.getText(source).replace(/<.*/s, "").endsWith("Props") ? "props" : "options";
}

/**
 * Extract a class's constructor parameters as `params`, mirroring the function shape.
 * - Descriptions are sourced from the constructor's own `@param` first, falling back to the class-level `@param`.
 * - Overloaded constructors contribute their parameters in source order, de-duplicated by identity (same as function overloads).
 */
function _getConstructorParams(
	statement: ClassDeclaration,
	source: SourceFile,
	classJsDocParams: readonly DocumentationParam[] | undefined,
): readonly DocumentationParam[] | undefined {
	let params: readonly DocumentationParam[] | undefined;
	for (const ctor of _getConstructors(statement)) {
		const ctorJsDocParams = _getJSDoc(ctor, source)?.params;
		// Constructor-level `@param` wins over the class-level `@param` on collision; a `@param {Type}` is canonical (see `_buildParams`).
		const next = _buildParams(ctor.parameters, source, ctorJsDocParams, classJsDocParams);
		params = _concatUnique(params, next, p => `${p.name}\0${p.type}\0${p.description}\0${p.optional}\0${p.default}`);
	}
	return params?.length ? params : undefined;
}

/** Extract return entries — combines the signature return type with any `@returns` descriptions. */
function _getReturns(
	statement: Statement,
	source: SourceFile,
	jsDocReturns: readonly DocumentationReturn[] | undefined,
	name: string,
): readonly DocumentationReturn[] | undefined {
	if (isClassDeclaration(statement)) {
		// A constructor returns an instance of the class, including its generics (e.g. `ChoiceSchema<T>`).
		const type = `${name}${_getTypeParamNames(statement, source)}`;
		return [{ type, description: jsDocReturns?.[0]?.description }];
	}
	if (!isFunctionDeclaration(statement)) return jsDocReturns;
	const type = statement.type?.getText(source);
	if (jsDocReturns?.length) {
		// Merge: first entry gets the inferred type if it doesn't already have one.
		const [first, ...rest] = jsDocReturns;
		if (!first) return jsDocReturns;
		return [{ type: first.type ?? type, description: first.description }, ...rest];
	}
	if (type && type !== "void") return [{ type }];
}

/**
 * Extract a class or interface's **methods** as child elements.
 * - Data members (properties, getters/setters) are NOT child elements — they're collected as a structured list by [`_getProperties`](#) and rendered as the type's Properties table instead. Only methods, which carry their own params/returns/throws docs, warrant a dedicated page.
 * - `className` is stamped onto every method as its `class` prop (the source of the qualified flat key and the "member of …" affordance) and is prebaked into the member `title` (`Class.name()`).
 * - Members declared with the `override` modifier are skipped — the base class already documents them, so a subclass page lists only its newly-introduced API.
 * - Members declared with the `declare` modifier are skipped — they're ambient type-only re-declarations, not new API.
 * - `static` methods are labelled `static method` so the docs site groups them in their own section, separate from instance `method`s, and their rendered signature is prefixed with the `static ` keyword.
 */
function _getClassMembers(statement: Statement, source: SourceFile, className: string): DocumentationElement[] | undefined {
	if (!isClassDeclaration(statement) && !isInterfaceDeclaration(statement)) return;
	const members: DocumentationElement[] = [];

	for (const member of statement.members) {
		// Skip private, protected, and _-prefixed members.
		const name = _getMemberName(member);
		if (!name || name.startsWith("_")) continue;
		const modifiers = _getModifiers(member);
		if (modifiers?.some(m => m.kind === SyntaxKind.PrivateKeyword || m.kind === SyntaxKind.ProtectedKeyword)) continue;
		// Skip `override` members — the base class already documents them, so a subclass page lists only its newly-introduced API.
		if (modifiers?.some(m => m.kind === SyntaxKind.OverrideKeyword)) continue;
		// Skip `declare` members — ambient type-only re-declarations (e.g. a subclass narrowing an inherited property's type), not new API.
		if (modifiers?.some(m => m.kind === SyntaxKind.DeclareKeyword)) continue;

		// `static` methods are grouped and labelled separately from instance methods (`static method`),
		// and carry the `static ` keyword in their rendered signature.
		const isStatic = modifiers?.some(m => m.kind === SyntaxKind.StaticKeyword);
		const staticPrefix = isStatic ? "static " : "";

		const memberJSDoc = _getJSDoc(member, source);
		const content = _buildJSDocContent(memberJSDoc?.description, memberJSDoc?.unhandled);
		const description = extractMarkdownProps(memberJSDoc?.description ?? "").description;

		if (isMethodDeclaration(member) || isMethodSignatureDeclaration(member)) {
			const params = member.parameters.map(p => p.getText(source)).join(", ");
			const ret = member.type ? member.type.getText(source) : "void";
			const signature = `${staticPrefix}${name}(${params}): ${ret}`;
			const key = name;
			const existingIndex = members.findIndex(m => m.key === key);
			const existing = members[existingIndex];
			if (existing) {
				members[existingIndex] = {
					...existing,
					props: { ...existing.props, signatures: _concat(existing.props.signatures, [signature]) },
				};
			} else {
				members.push({
					type: "tree-documentation",
					key,
					props: {
						name,
						title: `${className}.${name}()`,
						description,
						content,
						kind: isStatic ? "static method" : "method",
						class: className,
						signatures: [signature],
					},
				});
			}
		}
		// Properties, getters, and setters are not child elements — `_getProperties` collects them as a structured list instead.
	}

	return members.length ? members : undefined;
}

interface JSDocResult {
	description?: string | undefined;
	/** Explicit kind override from an `@kind` tag (e.g. `"component"`), or `undefined` to use the AST-inferred kind. */
	kind?: string | undefined;
	/** Default-value text from a `@default` tag (e.g. on a property), or `undefined`. */
	default?: string | undefined;
	params?: DocumentationParam[] | undefined;
	returns?: DocumentationReturn[] | undefined;
	throws?: DocumentationThrow[] | undefined;
	examples?: DocumentationExample[] | undefined;
	/** Unhandled `@rule` blocks concatenated into a single markup string (each rule preserved as `@name body`, separated by blank lines). */
	unhandled?: string | undefined;
}

/**
 * Extract JSDoc from a node via the TypeScript compiler's parsed JSDoc AST.
 * - Reads the compiler's structured tags rather than re-scanning the raw comment text, so tags are only ever recognised at real tag positions — a `@kind`/`@param`/etc. mentioned inline in prose is left in the description, not parsed.
 * - Multi-line `@param` / `@returns` / `@throws` descriptions and `{Type}` expressions come through whole; `*` margins are already stripped.
 * - `@example` bodies are taken verbatim. The parser is markdown-fence-aware: an `@word` line inside a balanced triple-backtick fence stays part of the example rather than starting a new tag. The flip side: an unbalanced run of three-plus backticks anywhere in the comment opens a fence that swallows every following tag — never write a bare triple-backtick in docblock prose.
 * - `@see` is recognised only to discard it: it's a VS Code hover affordance (a link back to the docs site), never rendered into the page body.
 */
function _getJSDoc(node: Node, source: SourceFile): JSDocResult | undefined {
	// The compiler attaches every leading `/** */` block here; the last one is the doc comment.
	const jsDoc = node.jsDoc?.at(-1);
	if (!jsDoc || !isJSDoc(jsDoc)) return;

	const description = getTextOfJSDocComment(jsDoc.comment)?.trim();

	let kind: string | undefined;
	let def: string | undefined;
	const params: DocumentationParam[] = [];
	const returns: DocumentationReturn[] = [];
	const throws: DocumentationThrow[] = [];
	const examples: DocumentationExample[] = [];
	const unhandled: string[] = [];

	for (const tag of jsDoc.tags ?? []) {
		const comment = getTextOfJSDocComment(tag.comment)?.trim();
		if (isJSDocParameterTag(tag)) {
			const name = tag.name.getText(source);
			const type = _getJSDocTypeText(tag.typeExpression, source);
			if (name) params.push({ name, type: type || undefined, description: comment || undefined });
		} else if (isJSDocReturnTag(tag)) {
			const type = _getJSDocTypeText(tag.typeExpression, source);
			if (type || comment) returns.push({ type: type || undefined, description: comment || undefined });
		} else if (isJSDocThrowsTag(tag)) {
			const type = _getJSDocTypeText(tag.typeExpression, source);
			if (type || comment) throws.push({ type: type || undefined, description: comment || undefined });
		} else if (isJSDocSeeTag(tag)) {
			// `@see` is a hover affordance only — strip it, never render it.
		} else {
			const name = tag.tagName.text;
			// `@kind <name>` overrides the AST-inferred kind (e.g. `@kind component` for a React component declared as a function).
			if (name === "kind") kind = comment?.match(/^[\w-]+/)?.[0];
			// `@default <value>` documents a property's default — surfaced structurally (e.g. on `properties`) rather than rendered into the body.
			else if (name === "default") def = comment || undefined;
			else if (name === "example") {
				if (comment) examples.push({ description: comment });
			} else unhandled.push(comment ? `@${name} ${comment}` : `@${name}`);
		}
	}

	return {
		description: description || undefined,
		kind,
		default: def,
		params: params.length ? params : undefined,
		returns: returns.length ? returns : undefined,
		throws: throws.length ? throws : undefined,
		examples: examples.length ? examples : undefined,
		unhandled: unhandled.length ? unhandled.join("\n\n") : undefined,
	};
}
