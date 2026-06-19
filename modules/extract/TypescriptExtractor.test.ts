import { describe, expect, test } from "bun:test";
import type { BunFile } from "bun";
import { TypescriptExtractor } from "./index.js";

const extractor = new TypescriptExtractor();

/**
 * Make a fake `BunFile` for unit tests.
 * - Web `File` has the same `.name` and `.text()` behaviour the extractor needs.
 * - The extra `BunFile`-only methods (`writer`, `exists`, etc.) aren't touched by the extractor.
 */
function file(source: string, name = "/tmp/source.ts"): BunFile {
	return new File([source], name) as unknown as BunFile;
}

describe("TypescriptExtractor", () => {
	test("extracts exported function", async () => {
		const element = await extractor.extract(
			file(`
/** Add two numbers together. */
export function add(a: number, b: number): number {
	return a + b;
}
`),
		);
		expect(element.props.children).toMatchObject([
			{
				type: "tree-documentation",
				props: {
					kind: "function",
					name: "add",
					title: "add()",
					content: "Add two numbers together.",
					signatures: ["add(a: number, b: number): number"],
				},
			},
		]);
	});

	test("extracts exported constant", async () => {
		const element = await extractor.extract(
			file(`
/** Maximum retry count. */
export const MAX_RETRIES: number = 3;
`),
		);
		expect(element.props.children).toMatchObject([
			{
				type: "tree-documentation",
				props: { kind: "constant", name: "MAX_RETRIES", title: "MAX_RETRIES", signatures: ["MAX_RETRIES: number"] },
			},
		]);
	});

	test("extracts exported class with members", async () => {
		const element = await extractor.extract(
			file(`
/** A simple store. */
export class Store {
	/** Current value. */
	value: string;
	/** Update the value. */
	set(v: string): void {}
	private _internal(): void {}
}
`),
		);
		const children = element.props.children as unknown[];
		expect(children).toHaveLength(1);
		const cls = children[0] as {
			type: string;
			props: { kind: string; name: string; title: string; children: unknown[]; properties: unknown[] };
		};
		expect(cls.type).toBe("tree-documentation");
		expect(cls.props.kind).toBe("class");
		expect(cls.props.name).toBe("Store");
		expect(cls.props.title).toBe("Store");
		// Methods stay as child elements…
		expect(cls.props.children).toMatchObject([
			{ type: "tree-documentation", props: { kind: "method", name: "set", title: "Store.set()", class: "Store" } },
		]);
		// …while data members are collected as a structured `properties` list, not as child elements.
		expect(cls.props.properties).toMatchObject([{ name: "value", type: "string", description: "Current value.", optional: false }]);
	});

	test("labels static members as `static method` / `static property`", async () => {
		const element = await extractor.extract(
			file(`
/** A colour. */
export class Color {
	/** Parse a colour. */
	static from(possible: unknown): Color | undefined { return undefined; }
	/** Default colour. */
	static DEFAULT: string = "#000";
	/** Format the colour. */
	toString(): string { return ""; }
	/** Red channel. */
	red: number;
}
`),
		);
		const children = element.props.children as unknown[];
		const cls = children[0] as { props: { children: unknown[]; properties: unknown[] } };
		// Static and instance methods stay as child elements (labelled separately)…
		expect(cls.props.children).toMatchObject([
			{
				type: "tree-documentation",
				props: {
					kind: "static method",
					name: "from",
					title: "Color.from()",
					class: "Color",
					signatures: ["static from(possible: unknown): Color | undefined"],
				},
			},
			{
				type: "tree-documentation",
				props: { kind: "method", name: "toString", title: "Color.toString()", class: "Color", signatures: ["toString(): string"] },
			},
		]);
		// …while data members (static or instance) are collected as the structured `properties` list, with a field initializer captured as the default.
		expect(cls.props.properties).toMatchObject([
			{ name: "DEFAULT", type: "string", default: '"#000"' },
			{ name: "red", type: "number" },
		]);
	});

	test("extracts exported interface", async () => {
		const element = await extractor.extract(
			file(`
/** Options for the thing. */
export interface ThingOptions {
	/** Whether to be verbose. */
	verbose?: boolean;
}
`),
		);
		expect(element.props.children).toMatchObject([
			{ type: "tree-documentation", props: { kind: "interface", name: "ThingOptions", title: "ThingOptions" } },
		]);
	});

	test("extracts exported type alias", async () => {
		const element = await extractor.extract(
			file(`
/** A nullable string. */
export type NullableString = string | null;
`),
		);
		expect(element.props.children).toMatchObject([
			{
				type: "tree-documentation",
				props: { kind: "type", name: "NullableString", title: "NullableString", signatures: ["string | null"] },
			},
		]);
	});

	test("skips non-exported declarations", async () => {
		const element = await extractor.extract(
			file(`
function internal(): void {}
export function external(): void {}
`),
		);
		const children = element.props.children as unknown[];
		expect(children).toHaveLength(1);
	});

	test("skips _-prefixed declarations", async () => {
		const element = await extractor.extract(
			file(`
export function _helper(): void {}
export function publicFn(): void {}
`),
		);
		const children = element.props.children as unknown[];
		expect(children).toHaveLength(1);
	});

	test("skips private and protected class members", async () => {
		const element = await extractor.extract(
			file(`
export class Foo {
	public bar: string;
	private _baz: string;
	protected _qux: string;
}
`),
		);
		const cls = (element.props.children as unknown[])[0] as { props: { children?: unknown[]; properties: unknown[] } };
		// `bar` is the only public member; it's a data member, so it lands in `properties` and there are no method child elements.
		expect(cls.props.children).toBeUndefined();
		expect(cls.props.properties).toMatchObject([{ name: "bar", type: "string" }]);
		expect(cls.props.properties).toHaveLength(1);
	});

	test("leaves the file element title undefined (no confident source for a TS source file)", async () => {
		const element = await extractor.extract(file("export const X = 1;", "/tmp/array.ts"));
		expect(element.props.title).toBeUndefined();
		expect(element.props.name).toBe("array");
		expect(element.key).toBe("array.ts");
	});

	test("sets title with () for functions, Class.name() for methods, Class.name for properties, bare name for other kinds", async () => {
		const element = await extractor.extract(
			file(`
/** A function. */
export function doThing(): void {}
/** A constant. */
export const VALUE = 1;
/** A type. */
export type Thing = string;
/** A class. */
export class Widget {
	/** A property. */
	size: number;
	/** A method. */
	resize(): void {}
}
`),
		);
		expect(element.props.children).toMatchObject([
			{ props: { kind: "function", name: "doThing", title: "doThing()" } },
			{ props: { kind: "constant", name: "VALUE", title: "VALUE" } },
			{ props: { kind: "type", name: "Thing", title: "Thing" } },
			{
				props: {
					kind: "class",
					name: "Widget",
					title: "Widget",
					// The method is a child element with a `Class.name()` title; the property is a structured entry, not an element.
					children: [{ props: { kind: "method", name: "resize", title: "Widget.resize()" } }],
					properties: [{ name: "size", type: "number" }],
				},
			},
		]);
	});

	test("overrides the inferred kind with an @kind tag and drops the title parens", async () => {
		const element = await extractor.extract(
			file(`
/**
 * A card component.
 * @kind component
 * @example <Card />
 */
export function Card(props: CardProps): ReactElement { return null as never; }
`),
		);
		expect(element.props.children).toMatchObject([
			{
				type: "tree-documentation",
				props: {
					kind: "component",
					name: "Card",
					// A non-function kind reads as a bare name, not `Card()`.
					title: "Card",
					// The `@kind` tag is consumed, not leaked into the rendered content.
					content: "A card component.",
					signatures: ["Card(props: CardProps): ReactElement"],
				},
			},
		]);
	});

	test("ignores an @kind mentioned inline in prose (not a real tag)", async () => {
		const element = await extractor.extract(
			file(`
/**
 * A class that documents the \`@kind component\` override in its own prose.
 * @example new Thing()
 */
export class Thing {}
`),
		);
		expect(element.props.children).toMatchObject([
			{
				type: "tree-documentation",
				props: {
					// The inline \`@kind component\` mention must not override the AST-inferred class kind.
					kind: "class",
					name: "Thing",
					title: "Thing",
				},
			},
		]);
	});

	test("extracts extends and implements from a class declaration", async () => {
		const element = await extractor.extract(
			file(`
/** A concrete store. */
export class MemoryStore extends AbstractStore implements Serializable, Disposable {
	value: string;
}
`),
		);
		expect(element.props.children).toMatchObject([
			{
				type: "tree-documentation",
				props: { kind: "class", name: "MemoryStore", extends: "AbstractStore", implements: ["Serializable", "Disposable"] },
			},
		]);
	});

	test("keeps generic arguments in heritage text", async () => {
		const element = await extractor.extract(
			file(`
/** A typed store. */
export class StringStore extends AbstractStore<string> implements Serializable<string> {}
/** Slug options. */
export interface SlugSchemaOptions extends Omit<StringSchemaOptions, "value"> {}
`),
		);
		expect(element.props.children).toMatchObject([
			{ props: { name: "StringStore", extends: "AbstractStore<string>", implements: ["Serializable<string>"] } },
			{ props: { name: "SlugSchemaOptions", extends: 'Omit<StringSchemaOptions, "value">' } },
		]);
	});

	test("stamps the owning class onto members and skips `override` members", async () => {
		const element = await extractor.extract(
			file(`
/** A store. */
export class MemoryStore extends AbstractStore {
	/** The current value. */
	readonly value: string;
	/** Get a thing. */
	override get(): string { return ""; }
	/** Override a property. */
	override readonly size: number;
}
`),
		);
		const cls = (element.props.children as { props: { children?: unknown[]; properties: { name: string }[] } }[])[0];
		// Only the directly-implemented `value` survives — `get()` and `size` carry `override` and are documented on the base class.
		// `get()` is the only method and it's an override, so there are no method child elements; `value` lands in `properties`; the overridden `size` is excluded there too.
		expect(cls?.props.children).toBeUndefined();
		expect(cls?.props.properties).toMatchObject([{ name: "value", type: "string", description: "The current value." }]);
		expect(cls?.props.properties).toHaveLength(1);
	});

	test("folds getters and setters into the structured properties list (getter type wins for a get/set pair)", async () => {
		const element = await extractor.extract(
			file(`
/** A store. */
export class Store {
	/** Read-only size. */
	get size(): number { return 0; }
	/** Writable name. */
	get name(): string { return ""; }
	set name(v: string) {}
}
`),
		);
		const cls = (element.props.children as { props: { children?: unknown[]; properties: { name: string; type?: string }[] } }[])[0];
		// Accessors are data members, not method elements — they land in `properties`, and a get/set pair folds into one entry typed from the getter.
		expect(cls?.props.children).toBeUndefined();
		expect(cls?.props.properties).toMatchObject([
			{ name: "size", type: "number", description: "Read-only size." },
			{ name: "name", type: "string", description: "Writable name." },
		]);
		expect(cls?.props.properties).toHaveLength(2);
	});

	test("merges overloaded function declarations into one element with multiple signatures, dropping the implementation", async () => {
		const element = await extractor.extract(
			file(`
/** Add two values. */
export function add(a: number, b: number): number;
export function add(a: string, b: string): string;
export function add(a: any, b: any): any { return a + b; }
`),
		);
		const children = element.props.children as unknown[];
		expect(children).toHaveLength(1);
		// The implementation (base definition) `add(a: any, b: any): any` is dropped — only the overload signatures survive.
		expect(children[0]).toMatchObject({
			type: "tree-documentation",
			props: {
				name: "add",
				title: "add()",
				kind: "function",
				signatures: ["add(a: number, b: number): number", "add(a: string, b: string): string"],
			},
		});
	});

	test("documents a lone implementation when there are no overload signatures", async () => {
		const element = await extractor.extract(
			file(`
/** Add two numbers. */
export function add(a: number, b: number): number { return a + b; }
`),
		);
		// With no overload signatures, the implementation is the only declaration — it stands as the definition.
		expect(element.props.children).toMatchObject([
			{ type: "tree-documentation", props: { name: "add", kind: "function", signatures: ["add(a: number, b: number): number"] } },
		]);
	});

	test("drops the implementation signature, params, and returns when a single overload is present", async () => {
		const element = await extractor.extract(
			file(`
/**
 * Make partial.
 * @returns A partial schema.
 */
export function PARTIAL<T extends Data>(source: Schemas<T> | DataSchema<T>): DataSchema<PartialData<T>>;
export function PARTIAL(source: Schemas<Data> | DataSchema<Data>): DataSchema<PartialData<Data>> { return source as any; }
`),
		);
		// Only the overload's narrow signature/params/returns survive; the wider implementation (base definition) is ignored.
		expect(element.props.children).toMatchObject([
			{
				props: {
					name: "PARTIAL",
					kind: "function",
					signatures: ["PARTIAL(source: Schemas<T> | DataSchema<T>): DataSchema<PartialData<T>>"],
					params: [{ name: "source", type: "Schemas<T> | DataSchema<T>" }],
					returns: [{ type: "DataSchema<PartialData<T>>", description: "A partial schema." }],
				},
			},
		]);
	});

	test("treats a typed `@param {Type}` as canonical, overriding the inferred parameter type", async () => {
		const element = await extractor.extract(
			file(`
/**
 * Make a thing.
 * @param props {Schemas<T>} A named schema for each property.
 */
export function DATA<T extends Data>(props: Schemas<Data>): DataSchema<T> { return props as any; }
`),
		);
		const props = (element.props.children as { props: { params: unknown } }[])[0]?.props;
		// The inferred \`Schemas<Data>\` is superseded by the canonical \`{Schemas<T>}\` from the \`@param\`.
		expect(props?.params).toEqual([
			{ name: "props", type: "Schemas<T>", description: "A named schema for each property.", optional: false, default: undefined },
		]);
	});

	test("emits one row per `@param` when the same parameter is documented as several typed variants", async () => {
		const element = await extractor.extract(
			file(`
/**
 * Make partial.
 * @param source {Schemas<T>} The props schemas to make partial.
 * @param source {DataSchema<T>} An existing schema to make partial.
 */
export function PARTIAL<T extends Data>(source: Schemas<T> | DataSchema<T>): DataSchema<PartialData<T>> { return source as any; }
`),
		);
		const props = (element.props.children as { props: { params: unknown } }[])[0]?.props;
		expect(props?.params).toEqual([
			{ name: "source", type: "Schemas<T>", description: "The props schemas to make partial.", optional: false, default: undefined },
			{ name: "source", type: "DataSchema<T>", description: "An existing schema to make partial.", optional: false, default: undefined },
		]);
	});

	test("skips `declare` members (ambient type-only re-declarations)", async () => {
		const element = await extractor.extract(
			file(`
/** A typed schema. */
export class BooleanSchema extends Schema {
	/** Narrowed value type. */
	declare readonly value: boolean;
	/** A real new method. */
	check(): boolean { return true; }
}
`),
		);
		const cls = (element.props.children as { props: { children: { props: Record<string, unknown> }[] } }[])[0];
		// The `declare` field is omitted; only the genuinely-new `check()` survives.
		expect(cls?.props.children).toMatchObject([{ props: { kind: "method", name: "check", title: "BooleanSchema.check()" } }]);
		expect(cls?.props.children).toHaveLength(1);
	});

	test("keeps case-distinct exports separate (Class vs FACTORY) with case-preserving keys", async () => {
		// `Collection` and `COLLECTION` differ only in case — they must not collapse into one entity.
		const element = await extractor.extract(
			file(`
/** A collection. */
export class Collection {
	name: string;
}
/** Make a collection. */
export function COLLECTION(): Collection { return new Collection(); }
`),
		);
		const children = element.props.children as { key: string; props: { name: string; kind: string } }[];
		expect(children).toHaveLength(2);
		expect(children.map(c => c.key)).toEqual(["Collection", "COLLECTION"]);
		expect(children.map(c => c.props.name)).toEqual(["Collection", "COLLECTION"]);
		expect(children.map(c => c.props.kind)).toEqual(["class", "function"]);
	});

	test("synthesises a `new ClassName(...)` constructor signature, params, and returns for a simple class", async () => {
		const element = await extractor.extract(
			file(`
/** A boolean schema. */
export class BooleanSchema {
	constructor(options: BooleanSchemaOptions) {}
}
`),
		);
		expect(element.props.children).toMatchObject([
			{
				type: "tree-documentation",
				props: {
					kind: "class",
					name: "BooleanSchema",
					signatures: ["new BooleanSchema(options: BooleanSchemaOptions)"],
					params: [{ name: "options", type: "BooleanSchemaOptions", description: undefined, optional: false }],
					returns: [{ type: "BooleanSchema", description: undefined }],
				},
			},
		]);
	});

	test("includes generics in the constructor signature and returns type", async () => {
		const element = await extractor.extract(
			file(`
/** A mock API provider. */
export class MockAPIProvider<P, R> {
	constructor(handler: RequestHandler, source: APIProvider<P, R>) {}
}
`),
		);
		expect(element.props.children).toMatchObject([
			{
				props: {
					kind: "class",
					name: "MockAPIProvider",
					signatures: ["new MockAPIProvider<P, R>(handler: RequestHandler, source: APIProvider<P, R>)"],
					params: [
						{ name: "handler", type: "RequestHandler", optional: false },
						{ name: "source", type: "APIProvider<P, R>", optional: false },
					],
					returns: [{ type: "MockAPIProvider<P, R>" }],
				},
			},
		]);
	});

	test("emits multiple signatures for multiple constructor overloads, dropping the implementation", async () => {
		const element = await extractor.extract(
			file(`
/** A range. */
export class Range {
	constructor(max: number);
	constructor(min: number, max: number);
	constructor(min: number, max?: number) {}
}
`),
		);
		const props = (element.props.children as { props: { signatures: string[] } }[])[0]?.props;
		// The implementation constructor (base definition) `new Range(min: number, max?: number)` is dropped — only the overloads survive.
		expect(props?.signatures).toEqual(["new Range(max: number)", "new Range(min: number, max: number)"]);
	});

	test("emits `new ClassName()` with no params for a class with no explicit constructor", async () => {
		const element = await extractor.extract(
			file(`
/** A choice schema. */
export class ChoiceSchema<T> {
	value: T;
}
`),
		);
		expect(element.props.children).toMatchObject([
			{
				props: {
					kind: "class",
					name: "ChoiceSchema",
					signatures: ["new ChoiceSchema<T>()"],
					returns: [{ type: "ChoiceSchema<T>" }],
				},
			},
		]);
		// A no-arg constructor contributes no params.
		const props = (element.props.children as { props: { params?: unknown } }[])[0]?.props;
		expect(props?.params).toBeUndefined();
	});

	test("sources constructor param descriptions from the constructor's @param", async () => {
		const element = await extractor.extract(
			file(`
/** A user. */
export class User {
	/**
	 * Create a user.
	 * @param name The user's display name.
	 */
	constructor(name: string) {}
}
`),
		);
		const props = (element.props.children as { props: { params: unknown } }[])[0]?.props;
		expect(props?.params).toEqual([{ name: "name", type: "string", description: "The user's display name.", optional: false }]);
	});

	test("falls back to the class's @param for constructor param descriptions, constructor winning on collision", async () => {
		const element = await extractor.extract(
			file(`
/**
 * A point.
 * @param x The horizontal coordinate.
 * @param y The vertical coordinate.
 */
export class Point {
	/**
	 * Create a point.
	 * @param x The X position (constructor-level, wins).
	 */
	constructor(x: number, y: number) {}
}
`),
		);
		const props = (element.props.children as { props: { params: unknown } }[])[0]?.props;
		expect(props?.params).toEqual([
			{ name: "x", type: "number", description: "The X position (constructor-level, wins).", optional: false },
			{ name: "y", type: "number", description: "The vertical coordinate.", optional: false },
		]);
	});

	test("captures parameter default values from initializers, marking them optional", async () => {
		const element = await extractor.extract(
			file(`
/** Make a thing. */
export function makeThing(name: string, required = false, options: ThingOptions = {}): Thing {
	return new Thing();
}
`),
		);
		const props = (element.props.children as { props: { params: unknown } }[])[0]?.props;
		expect(props?.params).toEqual([
			{ name: "name", type: "string", description: undefined, optional: false, default: undefined },
			{ name: "required", type: undefined, description: undefined, optional: true, default: "false" },
			{ name: "options", type: "ThingOptions", description: undefined, optional: true, default: "{}" },
		]);
	});

	describe("destructured parameter naming", () => {
		const params = async (source: string) => {
			const element = await extractor.extract(file(source));
			return (element.props.children as { props: { params: unknown } }[])[0]?.props.params;
		};

		test("names a destructured param after its rest element (`...options`)", async () => {
			expect(
				await params(`
/** Make a thing. */
export function makeThing({ min = 0, max = 10, ...options }: ThingOptions): Thing {}
`),
			).toEqual([{ name: "options", type: "ThingOptions", description: undefined, optional: false, default: undefined }]);
		});

		test("falls back to `options` for a destructured param with no rest element", async () => {
			expect(
				await params(`
/** Make a thing. */
export function makeThing({ min = 0, max = 10 }: ThingOptions): Thing {}
`),
			).toEqual([{ name: "options", type: "ThingOptions", description: undefined, optional: false, default: undefined }]);
		});

		test("falls back to `props` for a destructured `*Props` param (incl. generics)", async () => {
			expect(
				await params(`
/** A component. */
export function Thing({ children }: ThingProps<Data>): ReactElement {}
`),
			).toEqual([{ name: "props", type: "ThingProps<Data>", description: undefined, optional: false, default: undefined }]);
		});

		test("lets an `@param` name a destructured param, supplying its description", async () => {
			expect(
				await params(`
/**
 * Make a thing.
 * @param config The configuration bag.
 */
export function makeThing({ min = 0, max = 10 }: ThingOptions): Thing {}
`),
			).toEqual([{ name: "config", type: "ThingOptions", description: "The configuration bag.", optional: false, default: undefined }]);
		});

		test("assigns orphan `@param` names positionally, leaving identifier params matched by name", async () => {
			expect(
				await params(`
/**
 * Make a thing.
 * @param id The thing's id.
 * @param opts The options bag.
 */
export function makeThing(id: string, { min = 0 }: ThingOptions): Thing {}
`),
			).toEqual([
				{ name: "id", type: "string", description: "The thing's id.", optional: false, default: undefined },
				{ name: "opts", type: "ThingOptions", description: "The options bag.", optional: false, default: undefined },
			]);
		});

		test("names a destructured constructor param the same way", async () => {
			const element = await extractor.extract(
				file(`
/** A schema. */
export class Schema {
	constructor({ one = "value", title, value }: SchemaOptions) {}
}
`),
			);
			const props = (element.props.children as { props: { params: unknown } }[])[0]?.props;
			expect(props?.params).toEqual([
				{ name: "options", type: "SchemaOptions", description: undefined, optional: false, default: undefined },
			]);
		});
	});

	test("sources the returns description from the class's @returns when present", async () => {
		const element = await extractor.extract(
			file(`
/**
 * A token.
 * @returns A freshly minted token.
 */
export class Token {
	constructor(value: string) {}
}
`),
		);
		const props = (element.props.children as { props: { returns: unknown } }[])[0]?.props;
		expect(props?.returns).toEqual([{ type: "Token", description: "A freshly minted token." }]);
	});

	test("parses @returns with type and description", async () => {
		const element = await extractor.extract(
			file(`
/**
 * Get the first element.
 * @returns {T} The first element of the array.
 */
export function first<T>(arr: T[]): T { return arr[0]!; }
`),
		);
		const children = element.props.children as { props: { returns?: unknown } }[];
		expect(children[0]?.props.returns).toEqual([{ type: "T", description: "The first element of the array." }]);
	});

	test("parses @throws tags as an array", async () => {
		const element = await extractor.extract(
			file(`
/**
 * Divide two numbers.
 * @throws {RangeError} When divisor is zero.
 * @throws {TypeError} When inputs aren't numbers.
 */
export function divide(a: number, b: number): number { return a / b; }
`),
		);
		const children = element.props.children as { props: { throws?: unknown } }[];
		expect(children[0]?.props.throws).toEqual([
			{ type: "RangeError", description: "When divisor is zero." },
			{ type: "TypeError", description: "When inputs aren't numbers." },
		]);
	});

	test("parses @example tags as an array of { description }", async () => {
		const element = await extractor.extract(
			file(`
/**
 * Add numbers.
 * @example add(1, 2)
 * @example add(3, 4)
 */
export function add(a: number, b: number): number { return a + b; }
`),
		);
		const children = element.props.children as { props: { examples?: unknown } }[];
		expect(children[0]?.props.examples).toEqual([{ description: "add(1, 2)" }, { description: "add(3, 4)" }]);
	});

	test("preserves a multi-line fenced @example verbatim (no leading * margin, full body)", async () => {
		const element = await extractor.extract(
			file(`
/**
 * Add numbers.
 * @example
 * \`\`\`ts
 * const total = add(1, 2);
 * doThing(total);
 * \`\`\`
 */
export function add(a: number, b: number): number { return a + b; }
`),
		);
		const children = element.props.children as { props: { examples?: unknown } }[];
		expect(children[0]?.props.examples).toEqual([{ description: "```ts\nconst total = add(1, 2);\ndoThing(total);\n```" }]);
	});

	test("preserves a multi-line @returns description", async () => {
		const element = await extractor.extract(
			file(`
/**
 * Get the value.
 * @returns {T} The first element of the array,
 *   or throws when the array is empty.
 */
export function first<T>(arr: T[]): T { return arr[0]!; }
`),
		);
		const children = element.props.children as { props: { returns?: unknown } }[];
		expect(children[0]?.props.returns).toEqual([
			{ type: "T", description: "The first element of the array,\nor throws when the array is empty." },
		]);
	});

	test("appends unhandled @rule blocks to content", async () => {
		const element = await extractor.extract(
			file(`
/**
 * Add two numbers.
 * @param a First operand.
 * @custom This is a custom tag
 * that spans multiple lines.
 * @deprecated Use \`sum()\` instead.
 */
export function add(a: number, b: number): number { return a + b; }
`),
		);
		const children = element.props.children as { props: { content?: string } }[];
		expect(children[0]?.props.content).toBe(
			"Add two numbers.\n\n@custom This is a custom tag\nthat spans multiple lines.\n\n@deprecated Use `sum()` instead.",
		);
	});

	test("strips `@see` lines from content (VS Code hover affordance, never rendered)", async () => {
		const element = await extractor.extract(
			file(`
/**
 * Add two numbers.
 * @see https://dhoulb.github.io/shelving/math/add
 */
export function add(a: number, b: number): number { return a + b; }
`),
		);
		const children = element.props.children as { props: { content?: string } }[];
		// The description survives; the `@see` link is discarded rather than leaking into the page body.
		expect(children[0]?.props.content).toBe("Add two numbers.");
	});

	test("strips `@see` while still appending other unhandled `@rule` blocks", async () => {
		const element = await extractor.extract(
			file(`
/**
 * Add two numbers.
 * @see https://dhoulb.github.io/shelving/math/add
 * @deprecated Use \`sum()\` instead.
 */
export function add(a: number, b: number): number { return a + b; }
`),
		);
		const children = element.props.children as { props: { content?: string } }[];
		// `@see` is dropped; `@deprecated` (genuinely unhandled) is still appended.
		expect(children[0]?.props.content).toBe("Add two numbers.\n\n@deprecated Use `sum()` instead.");
	});

	test("derives description from the first paragraph of a symbol's JSDoc", async () => {
		const element = await extractor.extract(
			file(`
/**
 * Add two numbers together.
 *
 * A second paragraph with more detail that should not appear in the summary.
 */
export function add(a: number, b: number): number {
	return a + b;
}
`),
		);
		const children = element.props.children as { props: { description?: string; content?: string } }[];
		expect(children[0]?.props.description).toBe("Add two numbers together.");
		// The full multi-paragraph text still lands in `content`.
		expect(children[0]?.props.content).toContain("A second paragraph");
	});

	test("derives description for class members from their JSDoc", async () => {
		const element = await extractor.extract(
			file(`
/** A store. */
export class Store {
	/** The current value of the store. */
	value: string;
	/** Replace the stored value. */
	set(v: string): void {}
}
`),
		);
		const cls = (
			element.props.children as { props: { children: { props: { description?: string } }[]; properties: { description?: string }[] } }[]
		)[0];
		// The property's description comes from its JSDoc (in the structured list); the method's from its own (as a child element).
		expect(cls?.props.properties[0]?.description).toBe("The current value of the store.");
		expect(cls?.props.children[0]?.props.description).toBe("Replace the stored value.");
	});

	test("leaves description undefined when a symbol has no JSDoc", async () => {
		const element = await extractor.extract(file("export const X = 1;"));
		const children = element.props.children as { props: { description?: string } }[];
		expect(children[0]?.props.description).toBeUndefined();
	});

	test("emits only the type body for a type alias (no alias name)", async () => {
		const element = await extractor.extract(
			file(`
/** A pair of values. */
export type Pair = { a: string; b: number };
`),
		);
		expect(element.props.children).toMatchObject([
			{ type: "tree-documentation", props: { kind: "type", name: "Pair", signatures: ["{\n\ta: string;\n\tb: number;\n}"] } },
		]);
	});

	test("emits a brace-wrapped signature for an interface, matching the type body shape", async () => {
		const element = await extractor.extract(
			file(`
/** Options for the thing. */
export interface ThingOptions {
	verbose?: boolean;
	retries: number;
}
`),
		);
		expect(element.props.children).toMatchObject([
			{
				type: "tree-documentation",
				props: { kind: "interface", name: "ThingOptions", signatures: ["{\n\tverbose?: boolean;\n\tretries: number;\n}"] },
			},
		]);
	});

	test("collects referenced type names from a type alias body into `types`", async () => {
		const element = await extractor.extract(
			file(`
/** A nullable other. */
export type Wrapped<T> = string | OtherType | ReadonlyArray<DeepType> | T;
`),
		);
		const props = (element.props.children as { props: { types?: string[] } }[])[0]?.props;
		// Primitives (\`string\`) and the alias's own generic param (\`T\`) are excluded; nested references (\`DeepType\`) are caught; order preserved and de-duplicated.
		expect(props?.types).toEqual(["OtherType", "ReadonlyArray", "DeepType"]);
	});

	test("leaves `types` undefined for a non-alias and an alias with no references", async () => {
		const element = await extractor.extract(
			file(`
/** Just primitives. */
export type Plain = string | number | null;
/** A class. */
export class Thing {}
`),
		);
		const children = element.props.children as { props: { name: string; types?: string[] } }[];
		expect(children.find(c => c.props.name === "Plain")?.props.types).toBeUndefined();
		expect(children.find(c => c.props.name === "Thing")?.props.types).toBeUndefined();
	});

	test("extracts a structured `properties` list from an interface, with `@default` and descriptions", async () => {
		const element = await extractor.extract(
			file(`
/** Options for the thing. */
export interface ThingOptions {
	/**
	 * The minimum length.
	 * @default 6
	 */
	min?: number;
	/** Whether to be loud. */
	verbose: boolean;
}
`),
		);
		const props = (element.props.children as { props: { properties?: unknown[] } }[])[0]?.props;
		expect(props?.properties).toEqual([
			{ name: "min", type: "number", description: "The minimum length.", optional: true, default: "6" },
			{ name: "verbose", type: "boolean", description: "Whether to be loud.", optional: false, default: undefined },
		]);
	});

	test("extracts `properties` from an object-literal type alias too", async () => {
		const element = await extractor.extract(
			file(`
/** A pair. */
export type Pair = { a: string; b?: number };
`),
		);
		const props = (element.props.children as { props: { properties?: unknown[] } }[])[0]?.props;
		expect(props?.properties).toEqual([
			{ name: "a", type: "string", description: undefined, optional: false, default: undefined },
			{ name: "b", type: "number", description: undefined, optional: true, default: undefined },
		]);
	});

	test("de-duplicates identical overload signatures, keeping distinct ones", async () => {
		const element = await extractor.extract(
			file(`
/** Add values. */
export function add(a: number, b: number): number;
/** Add values. */
export function add(a: number, b: number): number;
/** Add values. */
export function add(a: string, b: string): string;
export function add(a: any, b: any): any { return a + b; }
`),
		);
		const props = (element.props.children as { props: { signatures: string[] } }[])[0]?.props;
		// The implementation (base definition) is dropped; the two identical overloads collapse to one.
		expect(props?.signatures).toEqual(["add(a: number, b: number): number", "add(a: string, b: string): string"]);
	});

	test("de-duplicates identical params and returns across overloads, keeping distinct ones", async () => {
		const element = await extractor.extract(
			file(`
/**
 * Combine values.
 * @returns {number} The combined value.
 */
export function combine(a: number, b: number): number;
/**
 * Combine values.
 * @returns {string} The combined string.
 */
export function combine(a: number, b: number): string;
export function combine(a: number, b: number): number | string { return a + b; }
`),
		);
		const props = (element.props.children as { props: { params: unknown; returns: unknown } }[])[0]?.props;
		// Both overloads share the same params — deduped to a single (a, b) pair (the implementation is dropped).
		expect(props?.params).toEqual([
			{ name: "a", type: "number", description: undefined, optional: false },
			{ name: "b", type: "number", description: undefined, optional: false },
		]);
		// The two overloads document distinct returns — both kept; the implementation's `number | string` return is dropped.
		expect(props?.returns).toEqual([
			{ type: "number", description: "The combined value." },
			{ type: "string", description: "The combined string." },
		]);
	});

	test("de-duplicates identical throws and examples across overloads, keeping distinct ones", async () => {
		const element = await extractor.extract(
			file(`
/**
 * Do a thing.
 * @throws {RangeError} Bad range.
 * @example doThing(1)
 */
export function doThing(a: number): number;
/**
 * Do a thing.
 * @throws {RangeError} Bad range.
 * @throws {TypeError} Bad type.
 * @example doThing(1)
 * @example doThing(2)
 */
export function doThing(a: string): string;
export function doThing(a: any): any { return a; }
`),
		);
		const props = (element.props.children as { props: { throws: unknown; examples: unknown } }[])[0]?.props;
		// The implementation is dropped; throws/examples are merged and deduped across the two overloads.
		expect(props?.throws).toEqual([
			{ type: "RangeError", description: "Bad range." },
			{ type: "TypeError", description: "Bad type." },
		]);
		expect(props?.examples).toEqual([{ description: "doThing(1)" }, { description: "doThing(2)" }]);
	});

	test("strips directory path from filename when computing key/name", async () => {
		// In production, `BunFile.name` is the full absolute path (e.g. `/Users/.../modules/util/array.ts`).
		// The extractor should use only the basename.
		const element = await extractor.extract(file("export const X = 1;", "/Users/foo/modules/util/array.ts"));
		expect(element.props.name).toBe("array");
		expect(element.key).toBe("array.ts");
	});
});
