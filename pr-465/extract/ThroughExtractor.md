# ThroughExtractor

- Kind: class
- Import: `import { ThroughExtractor } from "shelving/extract";`
- Extends: `Extractor<I, O>`

Base class for an extractor that wraps another extractor.
- Subclasses delegate to `source` and (optionally) transform the input before or the output after.
- Composes the same way `Through*Provider` chains do — chain multiple `ThroughExtractor`s to build up behaviour.

## Signatures

```ts
new ThroughExtractor<I, O>(source: Extractor<I, O>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `source` | `Extractor<I, O>` |  |

## Returns

| Type | Description |
| --- | --- |
| `ThroughExtractor<I, O>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `source` | `Extractor<I, O>` | The wrapped source extractor this through extractor delegates to. Read only. |

## Examples

```ts
new MergingExtractor(new DirectoryExtractor()) // a ThroughExtractor wrapping a source extractor
```

## Methods

- [ThroughExtractor.extract()](ThroughExtractor/extract.md): Extract from the input by forwarding to source.extract().
