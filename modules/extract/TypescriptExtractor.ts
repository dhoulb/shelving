import ts from "typescript";
import type {
	DocumentationElement,
	DocumentationElementProps,
	DocumentationExample,
	DocumentationParam,
	DocumentationReturn,
	DocumentationThrow,
	FileElementProps,
} from "../util/element.js";
import { requireSlug } from "../util/string.js";
import { FileExtractor } from "./FileExtractor.js";

/**
 * File extractor that parses a TypeScript source file into a tree element.
 * - Uses the TypeScript compiler API to parse the AST.
 * - Extracts exported, public, non-`_`-prefixed declarations as `tree-documentation` children.
 * - Overloaded declarations sharing a name are merged into a single `tree-documentation` with multiple `signatures`.
 * - Top-of-file JSDoc comment becomes the file's `content`.
 * - Sets `title` on every `tree-documentation` child — `name()` for functions and methods, `name` for other kinds.
 * - The file element itself has no `title` — a TS source file has no confident title source; renderers fall back to `name`.
 */
export class TypescriptExtractor extends FileExtractor {
	override extractProps(name: string, text: string): Partial<FileElementProps> & { name: string } {
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
		return { name, content, children: Array.from(byKey.values()) };
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
		// Append signatures.
		signatures: _concat(a.signatures, b.signatures),
		// Append params, returns, throws, examples — never dedupe (per spec).
		params: _concat(a.params, b.params),
		returns: _concat(a.returns, b.returns),
		throws: _concat(a.throws, b.throws),
		examples: _concat(a.examples, b.examples),
	};
	return { ...existing, props: merged };
}

function _concat<T>(a: readonly T[] | undefined, b: readonly T[] | undefined): readonly T[] | undefined {
	if (!a) return b;
	if (!b) return a;
	return [...a, ...b];
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
	const kind = _getKind(statement);
	if (!kind) return;

	const signature = _getSignature(statement, source);
	const params = _getParams(statement, source, jsDoc?.params);
	const returns = _getReturns(statement, source, jsDoc?.returns);
	const throws = jsDoc?.throws;
	const examples = jsDoc?.examples;
	const children = _getClassMembers(statement, source);

	return {
		type: "tree-documentation",
		key: requireSlug(name),
		props: {
			name,
			// Functions read as callable with `()`; other kinds use the bare name.
			title: kind === "function" ? `${name}()` : name,
			kind,
			content: _buildJSDocContent(jsDoc?.description, jsDoc?.unhandled),
			signatures: signature ? [signature] : undefined,
			params,
			returns,
			throws,
			examples,
			children,
		},
	};
}

/**
 * Combine the JSDoc leading-description text and any unhandled `@rule` blocks into a single markup content string.
 * - Unhandled rules (anything not `@param`/`@returns`/`@throws`/`@example`) are appended after the description, separated by blank lines, with their `@name` preserved.
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

/** Get the text signature of a statement. */
function _getSignature(statement: ts.Statement, source: ts.SourceFile): string | undefined {
	if (ts.isFunctionDeclaration(statement)) {
		const params = statement.parameters.map(p => p.getText(source)).join(", ");
		const ret = statement.type ? statement.type.getText(source) : "void";
		return `(${params}) => ${ret}`;
	}
	if (ts.isTypeAliasDeclaration(statement)) {
		return statement.type.getText(source);
	}
	if (ts.isVariableStatement(statement)) {
		const declaration = statement.declarationList.declarations[0];
		if (declaration?.type) return declaration.type.getText(source);
	}
}

/** Extract parameters from a function or method declaration, enriched with JSDoc `@param` descriptions. */
function _getParams(
	statement: ts.Statement,
	source: ts.SourceFile,
	jsDocParams: readonly DocumentationParam[] | undefined,
): readonly DocumentationParam[] | undefined {
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

/** Extract return entries — combines the signature return type with any `@returns` descriptions. */
function _getReturns(
	statement: ts.Statement,
	source: ts.SourceFile,
	jsDocReturns: readonly DocumentationReturn[] | undefined,
): readonly DocumentationReturn[] | undefined {
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

/** Extract class or interface members as child elements. */
function _getClassMembers(statement: ts.Statement, source: ts.SourceFile): DocumentationElement[] | undefined {
	if (!ts.isClassDeclaration(statement) && !ts.isInterfaceDeclaration(statement)) return;
	const members: DocumentationElement[] = [];

	for (const member of statement.members) {
		// Skip private, protected, and _-prefixed members.
		const name = member.name && ts.isIdentifier(member.name) ? member.name.text : undefined;
		if (!name || name.startsWith("_")) continue;
		if (ts.canHaveModifiers(member)) {
			const modifiers = ts.getModifiers(member);
			if (modifiers?.some(m => m.kind === ts.SyntaxKind.PrivateKeyword || m.kind === ts.SyntaxKind.ProtectedKeyword)) continue;
		}

		const memberJSDoc = _getJSDoc(member, source);
		const content = _buildJSDocContent(memberJSDoc?.description, memberJSDoc?.unhandled);

		if (ts.isMethodDeclaration(member) || ts.isMethodSignature(member)) {
			const params = member.parameters.map(p => p.getText(source)).join(", ");
			const ret = member.type ? member.type.getText(source) : "void";
			const signature = `(${params}) => ${ret}`;
			const key = requireSlug(name);
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
					props: { name, title: `${name}()`, content, kind: "method", signatures: [signature] },
				});
			}
		} else if (ts.isPropertyDeclaration(member) || ts.isPropertySignature(member)) {
			const type = member.type?.getText(source);
			members.push({
				type: "tree-documentation",
				key: requireSlug(name),
				props: { name, title: name, content, kind: "property", signatures: type ? [type] : undefined },
			});
		}
	}

	return members.length ? members : undefined;
}

interface JSDocResult {
	description?: string | undefined;
	params?: DocumentationParam[] | undefined;
	returns?: DocumentationReturn[] | undefined;
	throws?: DocumentationThrow[] | undefined;
	examples?: DocumentationExample[] | undefined;
	/** Unhandled `@rule` blocks concatenated into a single markup string (each rule preserved as `@name body`, separated by blank lines). */
	unhandled?: string | undefined;
}

/** `@rule` names handled by dedicated parsers — everything else is appended to `unhandled` as raw markup. */
const _HANDLED_RULES = new Set(["param", "params", "return", "returns", "throw", "throws", "example", "examples"]);

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
		const params = _parseJSDocParams(text);
		const returns = _parseJSDocReturns(text);
		const throws = _parseJSDocThrows(text);
		const examples = _parseJSDocExamples(text);
		const unhandled = _parseJSDocUnhandled(text);

		return {
			description: description || undefined,
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
