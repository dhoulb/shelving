# ThroughExtractor.extract()

- Kind: method
- Member of: `ThroughExtractor`

Extract from the input by forwarding to `source.extract()`.
- Default implementation is a pass-through; subclasses override to do work before or after.

## Signatures

```ts
extract(input: I): O | Promise<O>
```
