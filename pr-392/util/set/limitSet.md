# limitSet()

- Kind: function
- Import: `import { limitSet } from "shelving/util/set";`

Apply a limit to a set.
- Returns the input unchanged when it already fits within `limit`.

## Signatures

```ts
limitSet(set: ImmutableSet<T>, limit: number): ImmutableSet<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `set` | `ImmutableSet<T>` | The set to limit. |
| `limit` | `number` | The maximum number of items to keep. |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableSet<T>` | A set containing at most `limit` items. |
