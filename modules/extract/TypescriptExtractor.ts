import ts from "typescript";
import type { CodeElementType, Element } from "../util/element.js";
import { type ContentExtractor, Extractor } from "./Extractor.js";

/**
 * Extractor that converts a TypeScript source string into a file element.
 * - Uses the TypeScript compiler API to parse the AST.
 * - Extracts exported, public, non-`_`-prefixed declarations with their JSDoc and type signatures.
 * - Top-of-file JSDoc comment becomes the file's description.
 */
export class TypescriptExtractor extends Extractor<string> implements ContentExtractor {
	extract(content: string): Element {
		const source = ts.createSourceFile("source.ts", content, ts.ScriptTarget.Latest, true);
		const children: Element[] = [];
		const description = _getFileDocComment(source);

		for (const statement of source.statements) {
			const element = _extractStatement(statement, source);
			if (element) children.push(element);
		}

		return {
			type: "tree-file",
			key: null,
			props: { description, children },
		};
	}
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
function _extractStatement(statement: ts.Statement, source: ts.SourceFile): Element | undefined {
	// Skip non-exported statements.
	if (!_isExported(statement)) return;

	// Skip statements without a name.
	const name = _getStatementName(statement);
	if (!name) return;

	// Skip private/internal names.
	if (name.startsWith("_")) return;

	const jsDoc = _getJSDoc(statement, source);
	const kind = _getElementType(statement);
	if (!kind) return;

	const signature = _getSignature(statement, source);
	const params = _getParams(statement, source);
	const returns = _getReturnType(statement, source);
	const examples = jsDoc?.examples;
	const children = _getClassMembers(statement, source);

	const props: Record<string, unknown> = {
		title: name,
		description: jsDoc?.description,
		signature,
	};
	if (params?.length) props.params = params;
	if (returns) props.returns = returns;
	if (examples?.length) props.examples = examples;
	if (children?.length) props.children = children;

	return { type: kind, key: null, props };
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

/** Map a statement to its tree element type. */
function _getElementType(statement: ts.Statement): CodeElementType | undefined {
	if (ts.isFunctionDeclaration(statement)) return "tree-function";
	if (ts.isClassDeclaration(statement)) return "tree-class";
	if (ts.isInterfaceDeclaration(statement)) return "tree-interface";
	if (ts.isTypeAliasDeclaration(statement)) return "tree-type";
	if (ts.isVariableStatement(statement)) return "tree-constant";
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

/** Extract parameters from a function or method declaration. */
function _getParams(
	statement: ts.Statement,
	source: ts.SourceFile,
): { name: string; type?: string | undefined; description?: string | undefined; optional?: boolean | undefined }[] | undefined {
	if (!ts.isFunctionDeclaration(statement)) return;
	const jsDocParams = _getJSDoc(statement, source)?.params;
	const params = statement.parameters.map(p => {
		const name = p.name.getText(source);
		const type = p.type?.getText(source);
		const optional = !!p.questionToken || !!p.initializer;
		const description = jsDocParams?.find(d => d.name === name)?.description;
		return { name, type, description, optional };
	});
	return params.length ? params : undefined;
}

/** Get the return type of a function declaration. */
function _getReturnType(statement: ts.Statement, source: ts.SourceFile): string | undefined {
	if (ts.isFunctionDeclaration(statement) && statement.type) return statement.type.getText(source);
}

/** Extract class or interface members as child elements. */
function _getClassMembers(statement: ts.Statement, source: ts.SourceFile): Element[] | undefined {
	if (!ts.isClassDeclaration(statement) && !ts.isInterfaceDeclaration(statement)) return;
	const members: Element[] = [];

	for (const member of statement.members) {
		// Skip private, protected, and _-prefixed members.
		const name = member.name && ts.isIdentifier(member.name) ? member.name.text : undefined;
		if (!name || name.startsWith("_")) continue;
		if (ts.canHaveModifiers(member)) {
			const modifiers = ts.getModifiers(member);
			if (modifiers?.some(m => m.kind === ts.SyntaxKind.PrivateKeyword || m.kind === ts.SyntaxKind.ProtectedKeyword)) continue;
		}

		const jsDoc = _getJSDoc(member, source);
		const props: Record<string, unknown> = {
			title: name,
			description: jsDoc?.description,
		};

		if (ts.isMethodDeclaration(member) || ts.isMethodSignature(member)) {
			const params = member.parameters.map(p => p.getText(source)).join(", ");
			const ret = member.type ? member.type.getText(source) : "void";
			props.signature = `(${params}) => ${ret}`;
			members.push({ type: "tree-method", key: null, props });
		} else if (ts.isPropertyDeclaration(member) || ts.isPropertySignature(member)) {
			if (member.type) props.signature = member.type.getText(source);
			members.push({ type: "tree-property", key: null, props });
		}
	}

	return members.length ? members : undefined;
}

interface JSDocResult {
	description?: string | undefined;
	params?: { name: string; description: string }[] | undefined;
	examples?: string[] | undefined;
}

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
		const examples = _parseJSDocExamples(text);

		return {
			description: description || undefined,
			params: params.length ? params : undefined,
			examples: examples.length ? examples : undefined,
		};
	}
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

/** Parse `@param` tags from a JSDoc comment. */
function _parseJSDocParams(text: string): { name: string; description: string }[] {
	const results: { name: string; description: string }[] = [];
	const regexp = /@param\s+(?:\{[^}]*\}\s+)?(\w+)\s+(.*)/g;
	let match: RegExpExecArray | null;
	while ((match = regexp.exec(text))) {
		const name = match[1];
		const description = match[2];
		if (name && description) results.push({ name, description: description.trim() });
	}
	return results;
}

/** Parse `@example` tags from a JSDoc comment. */
function _parseJSDocExamples(text: string): string[] {
	const results: string[] = [];
	const regexp = /@example\s+(.*)/g;
	let match: RegExpExecArray | null;
	while ((match = regexp.exec(text))) {
		if (match[1]) results.push(match[1].trim());
	}
	return results;
}
