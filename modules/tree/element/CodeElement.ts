import type { ImmutableArray } from "../../util/array.js";
import type { Elements } from "../../util/element.js";
import type { TreeElement, TreeElementProps } from "./TreeElement.js";

/** A single parameter for a code symbol. */
export interface CodeParam {
	readonly name: string;
	readonly type?: string | undefined;
	readonly description?: string | undefined;
	readonly optional?: boolean | undefined;
}

/** Props shared by all code elements. */
export interface CodeElementProps extends TreeElementProps {
	readonly signature?: string | undefined;
	readonly params?: ImmutableArray<CodeParam> | undefined;
	readonly returns?: string | undefined;
	readonly examples?: ImmutableArray<string> | undefined;
}

/** Code element type discriminator. */
export type CodeElementType =
	| "tree-class"
	| "tree-function"
	| "tree-constant"
	| "tree-method"
	| "tree-property"
	| "tree-type"
	| "tree-interface";

/** Element representing a documented code symbol. */
export interface CodeElement<P extends CodeElementProps = CodeElementProps> extends TreeElement<P> {
	readonly type: CodeElementType;
}

/** Props for a class element. */
export interface ClassCodeElementProps extends CodeElementProps {
	readonly extends?: string | undefined;
	readonly implements?: ImmutableArray<string> | undefined;
	readonly children?: Elements | undefined;
}

/**
 * Element representing a class declaration.
 * - Children are the class's methods and properties.
 */
export interface ClassCodeElement extends CodeElement<ClassCodeElementProps> {
	readonly type: "tree-class";
}

/** Element representing a function declaration. */
export interface FunctionCodeElement extends CodeElement {
	readonly type: "tree-function";
}

/** Element representing a constant declaration. */
export interface ConstantCodeElement extends CodeElement {
	readonly type: "tree-constant";
}

/** Element representing a class method. */
export interface MethodCodeElement extends CodeElement {
	readonly type: "tree-method";
}

/** Element representing a class or interface property. */
export interface PropertyCodeElement extends CodeElement {
	readonly type: "tree-property";
}

/** Element representing a type alias. */
export interface TypeCodeElement extends CodeElement {
	readonly type: "tree-type";
}

/** Element representing an interface declaration. */
export interface InterfaceCodeElement extends CodeElement<ClassCodeElementProps> {
	readonly type: "tree-interface";
}
