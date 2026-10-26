# Extractor

- Kind: class
- Import: `import { Extractor } from "shelving/extract";`

Base class for an extractor that converts an input of type `I` into a `TreeElement` output.
- Extractors are composable: outer extractors delegate to inner extractors.
- The output type is always a `TreeElement` (or a more specific subtype).

## Signatures

```ts
new Extractor<I, O>()
```

## Returns

| Type | Description |
| --- | --- |
| `Extractor<I, O>` |  |

## Examples

```ts
class JSONExtractor extends Extractor<string, TreeElement> {
	extract(input: string): TreeElement { return JSON.parse(input); }
}
```

## Methods

- [Extractor.extract()](Extractor/extract.md): Extract a tree element from the given input.
