# Sourceable

- Kind: interface
- Import: `import { Sourceable } from "shelving/util/source";`

Something that has a source of a specified type.

## Signatures

```ts
{
	readonly source: T;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `source` | `T` | The wrapped source object this object delegates to. Read only. |
