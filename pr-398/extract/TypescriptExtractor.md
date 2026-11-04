# TypescriptExtractor

- Kind: class
- Import: `import { TypescriptExtractor } from "shelving/extract";`
- Extends: `FileExtractor`

File extractor that parses a TypeScript source file into a tree element.
- Uses the native TypeScript compiler's API (`typescript/unstable/async` — TypeScript 7+) to parse the AST.
- Parsing runs on a shared native compiler server, spawned on demand into a virtual filesystem and closed again after a short idle — callers never manage its lifecycle.
- Extracts exported, public, non-`_`-prefixed declarations as `tree-documentation` children.
- Overloaded declarations sharing a name are merged into a single `tree-documentation` with multiple `signatures`. When a function (or constructor) is overloaded, the implementation declaration (the "base definition") is dropped entirely — only the overload signatures are documented.
- A `@param name {Type}` (or `@returns {Type}`) whose `{Type}` is given is canonical: it supersedes the inferred type from the base definition and any overloads. Multiple `@param name` tags for one parameter each emit a row, letting a single parameter be documented as several typed variants.
- Class declarations synthesise their `signatures`, `params`, and `returns` from the constructor — `new ClassName<…>(…)` including generics, one signature per constructor overload, with `returns` set to the class type. Param descriptions come from the constructor's `@param` first, then the class's `@param`.
- A `@kind` tag in a symbol's JSDoc overrides the inferred kind — e.g. `@kind component` relabels a React component (otherwise a `function`) so the docs site groups and colours it as a component. The override also drops the trailing `()` from the title, since a non-function kind reads as a bare name.
- Sets `description` (a plain-text summary from the first JSDoc paragraph) on every `tree-documentation` child.
- Sets `title` on every `tree-documentation` child — `name()` for functions, `Class.name()` for methods, bare `name` for other kinds. (Data members are not child elements — see `properties` below.)
- Records relational metadata as raw strings for render-time linking: `class` (owning class), `readonly`, `extends` / `implements` (full heritage type text including generic arguments, e.g. `AbstractStore<string>` or `Omit<StringSchemaOptions, "value">`), and `types` (the type names a `type` alias's body references, e.g. `OtherType` in `string | OtherType`).
- Records a structured `properties` list for classes, interfaces, and object-literal `type` aliases — each data member's (property/getter/setter) name, type, optionality, default, and description. This is the single source for a type's data members: they render as the type's Properties table and flatten into an options-bag parameter's fields at render time, rather than each becoming its own child element. Methods stay as child elements.
- Names a destructured (binding-pattern) parameter for the Param column — which has no name of its own — from an explicit `@param`, else its rest element (`...options`), else a type-derived fallback (`props` / `options`). The signature still shows the full `{ … }`.
- Pretty-prints object-literal signatures (interfaces and object-literal `type` aliases) as multi-line `{ … }` blocks, one member per line; other type bodies (`string | null`, mapped types, …) are emitted verbatim.
- Members declared with the `override` or `declare` modifier are skipped — the base class already documents overrides, and `declare` members are ambient type-only re-declarations rather than new API.
- Keys are the raw declared `name` (case-preserving) so case-distinct exports like `Collection` and `COLLECTION` stay separate.
- The file element itself has no `title` — a TS source file has no confident title source; renderers fall back to `name`.

## Signatures

```ts
new TypescriptExtractor()
```

## Returns

| Type | Description |
| --- | --- |
| `TypescriptExtractor` |  |

## Examples

```ts
const element = await new TypescriptExtractor().extractProps("string.ts", sourceText);
```
