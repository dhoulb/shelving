# getSource()

- Kind: function
- Import: `import { getSource } from "shelving/util/source";`

Recurse through `Sourceable` objects and return the first one that is an instance of `type`, or `undefined` if no source object matches.
- Follows the `source` property chain (e.g. layered providers) until a matching instance is found.

## Signatures

```ts
getSource(type: Class<T>, value: unknown): T | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `type` | `Class<T>` | The class to search for an instance of. |
| `value` | `unknown` | The object to start searching from. |

## Returns

| Type | Description |
| --- | --- |
| `T \| undefined` | The first matching source instance, or `undefined` if none matches. |
