# Parser

- Kind: class
- Import: `import { Parser } from "shelving/markup";`

Base class for a parser that converts an input of type `I` into an output of type `O`.
- Subclasses implement `parse()` to define the actual transformation.
- `MarkupParser` is the canonical implementation — it parses a markup string into a React node.

## Signatures

```ts
new Parser<I, O>()
```

## Returns

| Type | Description |
| --- | --- |
| `Parser<I, O>` |  |

## Examples

```ts
class UppercaseParser extends Parser<string, string> {
	parse(input: string): string { return input.toUpperCase(); }
}
```

## Methods

- [Parser.parse()](Parser/parse.md): Parse an input value into an output value.
