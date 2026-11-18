# NotString

- Kind: type
- Import: `import { NotString } from "shelving/util/string";`

Type that never matches the `string` type.
- `string` itself is iterable (iterating over its individual characters) and implements `Iterable<string>`
- Using `Iterable<string> & NotString` allows an iterable containing strings but not `string` itself.
- This helps catch this category of subtle errors.

## Signatures

```ts
{
	toUpperCase?: never;
	toLowerCase?: never;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `toUpperCase` | `never` | Optional. |
| `toLowerCase` | `never` | Optional. |
