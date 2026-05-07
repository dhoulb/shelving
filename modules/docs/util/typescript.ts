import ts from "typescript";
import { type Docblock, parseDocblock } from "./docblock.js";
import type { SymbolNode } from "./nodes.js";

/** Iterate over a TypeScript source file and find all symbol nodes using syntax only. */
export function* getSourceFileSymbols(sourceFile: ts.SourceFile): Iterable<SymbolNode> {
	for (const statement of sourceFile.statements) {
		// Skip non-exported nodes.
		if (!hasModifier(statement, ts.SyntaxKind.ExportKeyword)) continue;

		// Switch for type.
		if (ts.isFunctionDeclaration(statement)) {
			yield getFunctionNode(statement);
		} else if (ts.isClassDeclaration(statement)) {
			yield getClassNode(statement);
		} else if (ts.isInterfaceDeclaration(statement)) {
			yield getInterfaceNode(statement);
		} else if (ts.isTypeAliasDeclaration(statement)) {
			yield getTypeNode(statement);
		} else if (ts.isVariableStatement(statement)) {
			for (const declaration of statement.declarationList.declarations) {
				yield getConstantNode(declaration);
			}
		}
	}
}

export function getFunctionNode(declaration: ts.FunctionDeclaration): SymbolNode {
	const name = declaration.name?.getText() ?? "function ";
	const block = getNodeDocblock(declaration);
	return {
		kind: "function",
		name: `${name}()`,
		type: declaration.type?.getText(),
		...getCallableProps(declaration),
		...block,
	};
}

export function getClassNode(declaration: ts.ClassDeclaration): SymbolNode {
	const block = getNodeDocblock(declaration);
	const name = declaration.name?.getText() ?? "anonymous";
	return {
		kind: "class",
		name,
		signatures: [`class ${name}`],
		children: [...getClassChildren(declaration)],
		...block,
	};
}

export function* getClassChildren({ members }: ts.ClassDeclaration): Iterable<SymbolNode> {
	for (const member of members) {
		const memberName = member.name?.getText() || "anonymous";

		// Skip private and protected.
		const isPrivate = hasModifier(member, ts.SyntaxKind.PrivateKeyword);
		const isProtected = hasModifier(member, ts.SyntaxKind.ProtectedKeyword);
		if (isPrivate || isProtected || memberName.startsWith("_")) continue;

		// Switch for type.
		if (ts.isMethodDeclaration(member) || ts.isConstructorDeclaration(member)) {
			yield getMethodNode(member);
		} else if (ts.isGetAccessor(member)) {
			yield getAccessorNode(member);
		} else if (ts.isPropertyDeclaration(member)) {
			yield getPropertyNode(member);
		}
	}
}

export function getInterfaceNode(declaration: ts.InterfaceDeclaration): SymbolNode {
	const block = getNodeDocblock(declaration);
	const name = declaration.name.getText();
	const signatures = [`interface ${name}`];
	return {
		kind: "interface",
		name,
		signatures,
		...block,
	};
}

export function getTypeNode(declaration: ts.TypeAliasDeclaration): SymbolNode {
	const block = getNodeDocblock(declaration);
	const name = declaration.name.getText();
	const type = declaration.type?.getText();
	const signatures = [`type ${name}${type ? ` = ${type}` : ""}`];
	return {
		kind: "type",
		name,
		type,
		signatures,
		...block,
	};
}

export function getConstantNode(declaration: ts.VariableDeclaration): SymbolNode {
	const block = getNodeDocblock(declaration);
	const name = declaration.name.getText();
	const type = declaration.type?.getText() ?? declaration.initializer?.getText();
	const signatures = [`const ${name}${type ? `: ${type}` : ""}`];
	return {
		kind: "constant",
		name,
		type,
		signatures,
		...block,
	};
}

function getMethodNode(declaration: ts.MethodDeclaration | ts.ConstructorDeclaration): SymbolNode {
	const block = getNodeDocblock(declaration);
	const name = ts.isConstructorDeclaration(declaration) ? "constructor" : (declaration.name?.getText() ?? "function ");
	return {
		kind: "method",
		name: `${name}()`,
		static: hasModifier(declaration, ts.SyntaxKind.StaticKeyword),
		readonly: hasModifier(declaration, ts.SyntaxKind.ReadonlyKeyword),
		...getCallableProps(declaration),
		...block,
	};
}

function getAccessorNode(declaration: ts.GetAccessorDeclaration): SymbolNode {
	const block = getNodeDocblock(declaration);
	const name = declaration.name.getText();
	const type = declaration.type?.getText() ?? "unknown";
	const isReadonly = !(
		ts.isClassDeclaration(declaration.parent) && declaration.parent.members.some(n => ts.isSetAccessor(n) && n.name.getText() === name)
	);
	return {
		kind: "property",
		name,
		type,
		static: hasModifier(declaration, ts.SyntaxKind.StaticKeyword),
		readonly: isReadonly,
		signatures: [`${hasModifier(declaration, ts.SyntaxKind.StaticKeyword) ? "static " : ""} ${name}: ${type}`],
		...block,
	};
}

function getPropertyNode(declaration: ts.PropertyDeclaration): SymbolNode {
	const block = getNodeDocblock(declaration);
	const name = declaration.name.getText();
	const type = declaration.type?.getText() ?? declaration.initializer?.getText();
	const isStatic = hasModifier(declaration, ts.SyntaxKind.StaticKeyword);
	const isReadonly = hasModifier(declaration, ts.SyntaxKind.ReadonlyKeyword);
	const signatures = [`${isStatic ? "static " : ""}${name}${type ? `: ${type}` : ""}`];
	return {
		kind: "property",
		name,
		type,
		static: isStatic,
		readonly: isReadonly,
		signatures,
		...block,
	};
}

function getCallableProps(declaration: ts.FunctionLikeDeclaration): Pick<SymbolNode, "params" | "returns" | "signatures"> {
	const isStatic = hasModifier(declaration, ts.SyntaxKind.StaticKeyword);
	const displayName = ts.isConstructorDeclaration(declaration) ? "constructor" : (declaration.name?.getText() ?? "anonymous");
	const params = declaration.parameters.map(({ name, type }) => ({ name: name.getText(), type: type?.getText() ?? "unknown" }));
	const returns = [{ type: declaration.type?.getText() || "unknown" }];
	const signatures = [
		`${isStatic ? "static " : ""}${displayName}(${params.map(p => `${p.name}: ${p.type}`).join(", ")})${
			returns.length ? ` => ${returns.map(r => r.type).join(" | ")}` : ""
		}`,
	];
	return { params, returns, signatures };
}

function hasModifier(node: ts.Node | ts.FunctionDeclaration, kind: ts.SyntaxKind): boolean {
	// Some nodes expose a `modifiers` property but leave it undefined when no modifiers are present.
	return "modifiers" in node && node.modifiers?.some(mod => mod.kind === kind);
}

/** Extract the first docblock in a TypeScript source file. */
export function getSourceFileDocblock(sourceFile: ts.SourceFile): Docblock | undefined {
	const text = sourceFile.getFullText();
	const ranges = ts.getLeadingCommentRanges(text, 0) ?? [];
	const block = ranges.map(range => text.slice(range.pos, range.end)).find(snippet => snippet.startsWith("/**"));
	return block ? parseDocblock(block) : undefined;
}

/** Extract the docblock preceeding a node in a TypeScript source file. */
function getNodeDocblock(node: ts.Node): Docblock | undefined {
	const text = node.getSourceFile().getFullText();
	const ranges = ts.getLeadingCommentRanges(text, node.getFullStart());
	if (!ranges?.length) return undefined;
	const block = ranges
		.map(range => text.slice(range.pos, range.end))
		.filter(snippet => snippet.startsWith("/**"))
		.pop();
	return block ? parseDocblock(block) : undefined;
}
