import ts from "typescript";
import type { ImmutableArray } from "../util/array.js";
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
 * - Uses the TypeScript compiler API to parse the AST.
 * - Extracts exported, public, non-`_`-prefixed declarations as `tree-documentation` children.
 * - Overloaded declarations sharing a name are merged into a single `tree-documentation` with multiple `signatures`.
 * - Class declarations synthesise their `signatures`, `params`, and `returns` from the constructor — `new ClassName<…>(…)` including generics, one signature per constructor overload, with `returns` set to the class type. Param descriptions come from the constructor's `@param` first, then the class's `@param`.
 * - A `@kind` tag in a symbol's JSDoc overrides the inferred kind — e.g. `@kind component` relabels a React component (otherwise a `function`) so the docs site groups and colours it as a component. The override also drops the trailing `()` from the title, since a non-function kind reads as a bare name.
 * - Top-of-file JSDoc comment becomes the file's `content`.
 * - Sets `description` (a plain-text summary from the first JSDoc paragraph) on the file and every `tree-documentation` child.
 * - Sets `title` on every `tree-documentation` child — `name()` for functions, `Class.name()` for methods, `Class.name` for properties, bare `name` for other kinds.
 * - Records relational metadata as raw strings for render-time linking: `class` (owning class), `readonly`, `extends`, `implements`.
 * - Members declared with the `override` or `declare` modifier are skipped — the base class already documents overrides, and `declare` members are ambient type-only re-declarations rather than new API.
 * - Keys are the raw declared `name` (case-preserving) so case-distinct exports like `Collection` and `COLLECTION` stay separate.
 * - The file element itself has no `title` — a TS source file has no confident title source; renderers fall back to `name`.
 *
 * @example
 * ```ts
 * const element = new TypescriptExtractor().extractProps("string.ts", sourceText);
 * ```
 *
 * @see https://dhoulb.github.io/shelving/extract/TypescriptExtractor
 */
export class TypescriptExtractor extends FileExtractor {
	/**
	 * Parse a TypeScript source file into the props of a `tree-element`.
	 *
	 * @param name Filename of the source (used as the source file name and the element `name`).
	 * @param text Full TypeScript source text to parse.
	 * @returns Partial `tree-element` props with `name`, `description`, `content`, and `children`.
	 *
	 * @example
	 * ```ts
	 * const props = new TypescriptExtractor().extractProps("string.ts", sourceText);
	 * ```
	 *
	 * @see https://dhoulb.github.io/shelving/extract/TypescriptExtractor/extractProps
	 */
	override extractProps(name: string, text: string): Partial<TreeElementProps> & { name: string } {
		const source = ts.createSourceFile(name, text, ts.ScriptTarget.Latest, true);
		const content = _getFileDocComment(source);

		// Collect elements by key, merging overloads (same name) by appending signatures.
		const byKey = new Map<string, DocumentationElement>();
		for (const statement of source.statements) {
			const element = _extractStatement(statement, source);
			if (!element) continue;
			const existing = byKey.get(element.key);
			byKey.set(element.key, existing ? _mergeOverloads(existing, element) : element);
		}

		// The file element itself gets no `title` — a TS source file has no confident title source (the filename isn't one),
		// so renderers fall back to `name`. The `tree-documentation` children each carry their own `title`.
		return { name, description: extractMarkdownProps(content ?? "").description, content, children: Array.from(byKey.values()) };
	}
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
		// Identity: signatures/examples/throws by rendered string; params by (name, type, description, optional); returns by (type, description).
		signatures: _concatUnique(a.signatures, b.signatures, s => s),
		params: _concatUnique(a.params, b.params, p => `${p.name}\0${p.type}\0${p.description}\0${p.optional}`),
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

/** Get the leading JSDoc comment of the file (before the first statement). */
function _getFileDocComment(source: ts.SourceFile): string | undefined {
	const { statements } = source;
	if (!statements.length) return;
	const first = statements[0];
	if (!first) return;
	const ranges = ts.getLeadingCommentRanges(source.text, first.pos);
	if (!ranges?.length) return;
	const range = ranges[0];
	if (!range || range.kind !== ts.SyntaxKind.MultiLineCommentTrivia) return;
	const text = source.text.slice(range.pos, range.end);
	return _parseJSDocComment(text);
}

/** Extract an element from a top-level statement, or return undefined if it should be skipped. */
function _extractStatement(statement: ts.Statement, source: ts.SourceFile): DocumentationElement | undefined {
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
			children,
		},
	};
}

/** Extract the `extends` (single base type) and `implements` (interface list) names from a class or interface declaration. */
function _getHeritage(
	statement: ts.Statement,
	source: ts.SourceFile,
): { extends: string | undefined; implements: ImmutableArray<string> | undefined } | undefined {
	if (!ts.isClassDeclaration(statement) && !ts.isInterfaceDeclaration(statement)) return;
	let extendsName: string | undefined;
	const implementsNames: string[] = [];
	for (const clause of statement.heritageClauses ?? []) {
		const names = clause.types.map(t => t.expression.getText(source));
		// `extends` keeps the first base type; an interface extending several still surfaces its primary base.
		if (clause.token === ts.SyntaxKind.ExtendsKeyword) extendsName ??= names[0];
		else if (clause.token === ts.SyntaxKind.ImplementsKeyword) implementsNames.push(...names);
	}
	if (!extendsName && !implementsNames.length) return;
	return { extends: extendsName, implements: implementsNames.length ? implementsNames : undefined };
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
function _isExported(statement: ts.Statement): boolean {
	const modifiers = ts.canHaveModifiers(statement) ? ts.getModifiers(statement) : undefined;
	return !!modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
}

/** Get the declared name of a statement. */
function _getStatementName(statement: ts.Statement): string | undefined {
	if (
		ts.isFunctionDeclaration(statement) ||
		ts.isClassDeclaration(statement) ||
		ts.isInterfaceDeclaration(statement) ||
		ts.isTypeAliasDeclaration(statement) ||
		ts.isEnumDeclaration(statement)
	) {
		return statement.name?.text;
	}
	if (ts.isVariableStatement(statement)) {
		const declaration = statement.declarationList.declarations[0];
		if (declaration && ts.isIdentifier(declaration.name)) return declaration.name.text;
	}
}

/** Map a statement to its documentation kind. */
function _getKind(statement: ts.Statement): string | undefined {
	if (ts.isFunctionDeclaration(statement)) return "function";
	if (ts.isClassDeclaration(statement)) return "class";
	if (ts.isInterfaceDeclaration(statement)) return "interface";
	if (ts.isTypeAliasDeclaration(statement)) return "type";
	if (ts.isVariableStatement(statement)) return "constant";
}

/** Get the text signature(s) of a statement — complete, name-prefixed declarations usable as headings. */
function _getSignatures(statement: ts.Statement, source: ts.SourceFile, name: string): readonly string[] | undefined {
	if (ts.isFunctionDeclaration(statement)) {
		const params = statement.parameters.map(p => p.getText(source)).join(", ");
		const ret = statement.type ? statement.type.getText(source) : "void";
		return [`${name}(${params}): ${ret}`];
	}
	if (ts.isClassDeclaration(statement)) {
		// Synthesise `new ClassName<…>(…)` constructor signatures so a class page reads like a function's.
		return _getConstructorSignatures(statement, source, name);
	}
	if (ts.isInterfaceDeclaration(statement)) {
		// Emit `{ member; member }` — the same shape a `type` object body produces, distinguished only by the `kind` badge.
		const members = statement.members.map(m => m.getText(source).replace(/;\s*$/, "").trim()).join("; ");
		return [members ? `{ ${members} }` : "{}"];
	}
	if (ts.isTypeAliasDeclaration(statement)) {
		// Emit only the type body (e.g. `{ a: string }` or `string | null`) — the alias name is already the page title.
		return [statement.type.getText(source)];
	}
	if (ts.isVariableStatement(statement)) {
		const declaration = statement.declarationList.declarations[0];
		if (declaration?.type) return [`${name}: ${declaration.type.getText(source)}`];
	}
}

/** Render a class's generic parameter names as `<P, R>` (names only, no constraints), or `""` when non-generic. */
function _getTypeParamNames(statement: ts.ClassDeclaration, source: ts.SourceFile): string {
	const { typeParameters } = statement;
	if (!typeParameters?.length) return "";
	return `<${typeParameters.map(t => t.name.getText(source)).join(", ")}>`;
}

/** Get a class's constructor declarations (overload signatures + implementation), in source order. */
function _getConstructors(statement: ts.ClassDeclaration): readonly ts.ConstructorDeclaration[] {
	return statement.members.filter(ts.isConstructorDeclaration);
}

/**
 * Synthesise `new ClassName<…>(…)` signatures from a class's constructor declaration(s).
 * - Generics are included so the reader sees how they're inferred from the arguments (e.g. `new MockAPIProvider<P, R>(…)`).
 * - Multiple constructor overloads each become a signature, same as function overloads.
 * - A class with no explicit constructor yields a single degenerate `new ClassName()` signature.
 */
function _getConstructorSignatures(statement: ts.ClassDeclaration, source: ts.SourceFile, name: string): readonly string[] {
	const generics = _getTypeParamNames(statement, source);
	const constructors = _getConstructors(statement);
	if (!constructors.length) return [`new ${name}${generics}()`];
	return constructors.map(c => `new ${name}${generics}(${c.parameters.map(p => p.getText(source)).join(", ")})`);
}

/** Extract parameters from a function or class declaration, enriched with JSDoc `@param` descriptions. */
function _getParams(
	statement: ts.Statement,
	source: ts.SourceFile,
	jsDocParams: readonly DocumentationParam[] | undefined,
): readonly DocumentationParam[] | undefined {
	if (ts.isClassDeclaration(statement)) return _getConstructorParams(statement, source, jsDocParams);
	if (!ts.isFunctionDeclaration(statement)) return;
	const params: DocumentationParam[] = statement.parameters.map(p => {
		const name = p.name.getText(source);
		const type = p.type?.getText(source);
		const optional = !!p.questionToken || !!p.initializer;
		const description = jsDocParams?.find(d => d.name === name)?.description;
		return { name, type, description, optional };
	});
	return params.length ? params : undefined;
}

/**
 * Extract a class's constructor parameters as `params`, mirroring the function shape.
 * - Descriptions are sourced from the constructor's own `@param` first, falling back to the class-level `@param`.
 * - Overloaded constructors contribute their parameters in source order, de-duplicated by identity (same as function overloads).
 */
function _getConstructorParams(
	statement: ts.ClassDeclaration,
	source: ts.SourceFile,
	classJsDocParams: readonly DocumentationParam[] | undefined,
): readonly DocumentationParam[] | undefined {
	let params: readonly DocumentationParam[] | undefined;
	for (const ctor of _getConstructors(statement)) {
		const ctorJsDocParams = _getJSDoc(ctor, source)?.params;
		const next: DocumentationParam[] = ctor.parameters.map(p => {
			const name = p.name.getText(source);
			const type = p.type?.getText(source);
			const optional = !!p.questionToken || !!p.initializer;
			// Constructor-level `@param` wins over the class-level `@param` on collision.
			const description =
				ctorJsDocParams?.find(d => d.name === name)?.description ?? classJsDocParams?.find(d => d.name === name)?.description;
			return { name, type, description, optional };
		});
		params = _concatUnique(params, next, p => `${p.name}\0${p.type}\0${p.description}\0${p.optional}`);
	}
	return params?.length ? params : undefined;
}

/** Extract return entries — combines the signature return type with any `@returns` descriptions. */
function _getReturns(
	statement: ts.Statement,
	source: ts.SourceFile,
	jsDocReturns: readonly DocumentationReturn[] | undefined,
	name: string,
): readonly DocumentationReturn[] | undefined {
	if (ts.isClassDeclaration(statement)) {
		// A constructor returns an instance of the class, including its generics (e.g. `ChoiceSchema<T>`).
		const type = `${name}${_getTypeParamNames(statement, source)}`;
		return [{ type, description: jsDocReturns?.[0]?.description }];
	}
	if (!ts.isFunctionDeclaration(statement)) return jsDocReturns;
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
 * Extract class or interface members as child elements.
 * - `className` is stamped onto every member as its `class` prop (the source of the qualified flat key and the "member of …" affordance) and is prebaked into the member `title` (`Class.name` / `Class.name()`).
 * - Members declared with the `override` modifier are skipped — the base class already documents them, so a subclass page lists only its newly-introduced API.
 * - Members declared with the `declare` modifier are skipped — they're ambient type-only re-declarations (e.g. narrowing an inherited property's type), not new API.
 * - Getters/setters fold into a single `property` element per name; a getter with no matching setter is `readonly`.
 */
function _getClassMembers(statement: ts.Statement, source: ts.SourceFile, className: string): DocumentationElement[] | undefined {
	if (!ts.isClassDeclaration(statement) && !ts.isInterfaceDeclaration(statement)) return;
	const members: DocumentationElement[] = [];

	for (const member of statement.members) {
		// Skip private, protected, and _-prefixed members.
		const name = member.name && ts.isIdentifier(member.name) ? member.name.text : undefined;
		if (!name || name.startsWith("_")) continue;
		const modifiers = ts.canHaveModifiers(member) ? ts.getModifiers(member) : undefined;
		if (modifiers?.some(m => m.kind === ts.SyntaxKind.PrivateKeyword || m.kind === ts.SyntaxKind.ProtectedKeyword)) continue;
		// Skip `override` members — the base class already documents them, so a subclass page lists only its newly-introduced API.
		if (modifiers?.some(m => m.kind === ts.SyntaxKind.OverrideKeyword)) continue;
		// Skip `declare` members — ambient type-only re-declarations (e.g. a subclass narrowing an inherited property's type), not new API.
		if (modifiers?.some(m => m.kind === ts.SyntaxKind.DeclareKeyword)) continue;

		const memberJSDoc = _getJSDoc(member, source);
		const content = _buildJSDocContent(memberJSDoc?.description, memberJSDoc?.unhandled);
		const description = extractMarkdownProps(memberJSDoc?.description ?? "").description;

		if (ts.isMethodDeclaration(member) || ts.isMethodSignature(member)) {
			const params = member.parameters.map(p => p.getText(source)).join(", ");
			const ret = member.type ? member.type.getText(source) : "void";
			const signature = `${name}(${params}): ${ret}`;
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
						kind: "method",
						class: className,
						signatures: [signature],
					},
				});
			}
		} else if (ts.isPropertyDeclaration(member) || ts.isPropertySignature(member)) {
			const type = member.type?.getText(source);
			const readonly = modifiers?.some(m => m.kind === ts.SyntaxKind.ReadonlyKeyword) || undefined;
			members.push({
				type: "tree-documentation",
				key: name,
				props: {
					name,
					title: `${className}.${name}`,
					description,
					content,
					kind: "property",
					class: className,
					readonly,
					signatures: type ? [`${readonly ? "readonly " : ""}${name}: ${type}`] : undefined,
				},
			});
		} else if (ts.isGetAccessor(member) || ts.isSetAccessor(member)) {
			// Getters/setters fold into one `property`. A getter alone (no setter) is read-only; a setter clears that.
			const type = ts.isGetAccessor(member) ? member.type?.getText(source) : member.parameters[0]?.type?.getText(source);
			const key = name;
			const existingIndex = members.findIndex(m => m.key === key);
			const existing = members[existingIndex];
			if (existing) {
				members[existingIndex] = {
					...existing,
					props: {
						...existing.props,
						// A getter + setter pair is writable — drop the read-only flag and the `readonly ` signature prefix.
						readonly: undefined,
						signatures: type ? [`${name}: ${type}`] : existing.props.signatures,
					},
				};
			} else {
				members.push({
					type: "tree-documentation",
					key,
					props: {
						name,
						title: `${className}.${name}`,
						description,
						content,
						kind: "property",
						class: className,
						readonly: ts.isGetAccessor(member) || undefined,
						signatures: type ? [`${ts.isGetAccessor(member) ? "readonly " : ""}${name}: ${type}`] : undefined,
					},
				});
			}
		}
	}

	return members.length ? members : undefined;
}

interface JSDocResult {
	description?: string | undefined;
	/** Explicit kind override from an `@kind` tag (e.g. `"component"`), or `undefined` to use the AST-inferred kind. */
	kind?: string | undefined;
	params?: DocumentationParam[] | undefined;
	returns?: DocumentationReturn[] | undefined;
	throws?: DocumentationThrow[] | undefined;
	examples?: DocumentationExample[] | undefined;
	/** Unhandled `@rule` blocks concatenated into a single markup string (each rule preserved as `@name body`, separated by blank lines). */
	unhandled?: string | undefined;
}

/**
 * `@rule` names handled (parsed or deliberately discarded) — everything else is appended to `unhandled` as raw markup.
 * - `@kind` is parsed by `_parseJSDocKind` to override the AST-inferred kind, so it must not also leak into `unhandled`.
 * - `@see` is recognised here purely to strip it: it's a VS Code hover affordance (a link back to the docs site) and must
 *   never leak into the rendered page content. It has no dedicated parser; it's simply discarded from the `unhandled` bucket.
 */
const _HANDLED_RULES = new Set(["kind", "param", "params", "return", "returns", "throw", "throws", "example", "examples", "see"]);

/** Extract JSDoc from a node. */
function _getJSDoc(node: ts.Node, source: ts.SourceFile): JSDocResult | undefined {
	const ranges = ts.getLeadingCommentRanges(source.text, node.pos);
	if (!ranges?.length) return;

	// Find the last JSDoc-style comment (/** ... */).
	for (let i = ranges.length - 1; i >= 0; i--) {
		const range = ranges[i];
		if (!range || range.kind !== ts.SyntaxKind.MultiLineCommentTrivia) continue;
		const text = source.text.slice(range.pos, range.end);
		if (!text.startsWith("/**")) continue;

		const description = _parseJSDocComment(text);
		const kind = _parseJSDocKind(text);
		const params = _parseJSDocParams(text);
		const returns = _parseJSDocReturns(text);
		const throws = _parseJSDocThrows(text);
		const examples = _parseJSDocExamples(text);
		const unhandled = _parseJSDocUnhandled(text);

		return {
			description: description || undefined,
			kind,
			params: params.length ? params : undefined,
			returns: returns.length ? returns : undefined,
			throws: throws.length ? throws : undefined,
			examples: examples.length ? examples : undefined,
			unhandled,
		};
	}
}

/**
 * Walk the JSDoc body for `@rule` blocks not handled by dedicated parsers (param/returns/throws/example).
 * - Each rule block extends from its `@name` line up to the next `@rule` or the end of the docblock.
 * - Returns the unhandled blocks joined by blank lines as `@name body`, preserved verbatim for downstream markup rendering.
 * - Returns `undefined` if every rule is handled or there are none.
 */
function _parseJSDocUnhandled(text: string): string | undefined {
	const body = text
		.replace(/^\/\*\*\s*/, "")
		.replace(/\s*\*\/$/, "")
		.split("\n")
		.map(l => l.replace(/^\s*\*\s?/, ""))
		.join("\n");

	const sections: string[] = [];
	let currentName: string | undefined;
	let currentLines: string[] = [];
	const flush = () => {
		if (currentName && !_HANDLED_RULES.has(currentName)) {
			sections.push(`@${currentName} ${currentLines.join("\n")}`.trimEnd());
		}
		currentName = undefined;
		currentLines = [];
	};
	for (const line of body.split("\n")) {
		const match = line.match(/^@(\w+)\s*(.*)$/);
		if (match) {
			flush();
			currentName = match[1];
			currentLines = match[2] ? [match[2]] : [];
		} else if (currentName) {
			currentLines.push(line);
		}
	}
	flush();
	return sections.length ? sections.join("\n\n") : undefined;
}

/** Parse a JSDoc comment block into its description text. */
function _parseJSDocComment(text: string): string | undefined {
	const lines = text
		.replace(/^\/\*\*\s*/, "")
		.replace(/\s*\*\/$/, "")
		.split("\n")
		.map(l => l.replace(/^\s*\*\s?/, ""));

	// Collect lines until we hit a @tag.
	const description: string[] = [];
	for (const line of lines) {
		if (line.startsWith("@")) break;
		description.push(line);
	}

	const result = description.join("\n").trim();
	return result || undefined;
}

/** Parse a single `@kind` override from a JSDoc comment (e.g. `@kind component`), or `undefined` when absent. */
function _parseJSDocKind(text: string): string | undefined {
	// `@kind name` — a single identifier-ish token (letters, digits, hyphens).
	return text.match(/@kind\s+([\w-]+)/)?.[1];
}

/** Parse `@param` tags from a JSDoc comment. Duplicates are kept (overloads). */
function _parseJSDocParams(text: string): DocumentationParam[] {
	const results: DocumentationParam[] = [];
	// `@param {Type} name description` — type is optional.
	const regexp = /@param\s+(?:\{([^}]*)\}\s+)?(\w+)\s+(.*)/g;
	let match: RegExpExecArray | null;
	while ((match = regexp.exec(text))) {
		const type = match[1]?.trim();
		const name = match[2];
		const description = match[3]?.trim();
		if (name) results.push({ name, type: type || undefined, description: description || undefined });
	}
	return results;
}

/** Parse `@returns` / `@return` tags from a JSDoc comment. */
function _parseJSDocReturns(text: string): DocumentationReturn[] {
	const results: DocumentationReturn[] = [];
	// `@returns {Type} description` or `@return {Type} description`.
	const regexp = /@returns?\s+(?:\{([^}]*)\}\s*)?(.*)/g;
	let match: RegExpExecArray | null;
	while ((match = regexp.exec(text))) {
		const type = match[1]?.trim();
		const description = match[2]?.trim();
		if (type || description) results.push({ type: type || undefined, description: description || undefined });
	}
	return results;
}

/** Parse `@throws` / `@throw` tags from a JSDoc comment. */
function _parseJSDocThrows(text: string): DocumentationThrow[] {
	const results: DocumentationThrow[] = [];
	// `@throws {Type} description` or `@throw {Type} description`.
	const regexp = /@throws?\s+(?:\{([^}]*)\}\s*)?(.*)/g;
	let match: RegExpExecArray | null;
	while ((match = regexp.exec(text))) {
		const type = match[1]?.trim();
		const description = match[2]?.trim();
		if (type || description) results.push({ type: type || undefined, description: description || undefined });
	}
	return results;
}

/** Parse `@example` tags from a JSDoc comment. */
function _parseJSDocExamples(text: string): DocumentationExample[] {
	const results: DocumentationExample[] = [];
	// `@example` followed by the rest of the line.
	const regexp = /@examples?\s+(.+)/g;
	let match: RegExpExecArray | null;
	while ((match = regexp.exec(text))) {
		const description = match[1]?.trim();
		if (description) results.push({ description });
	}
	return results;
}
