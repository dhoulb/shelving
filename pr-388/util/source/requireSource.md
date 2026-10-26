# requireSource()

- Kind: function
- Import: `import { requireSource } from "shelving/util/source";`

Recurse through `Sourceable` objects and return the first one that is an instance of `type`, or throw `RequiredError` if no source object matches.
- Like `getSource()`, but throws instead of returning `undefined` when no match is found.

## Signatures

```ts
requireSource(type: Class<T>, data: unknown, caller: AnyCaller = requireSource): T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `type` | `Class<T>` | The class to search for an instance of. |
| `data` | `unknown` | The object to start searching from. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `requireSource`). Defaults to `requireSource`. |

## Returns

| Type | Description |
| --- | --- |
| `T` | The first matching source instance. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If no source object is an instance of `type`. |
