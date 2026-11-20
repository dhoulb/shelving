# getStarter()

- Kind: function
- Import: `import { getStarter } from "shelving/util/start";`

Get a `Starter` from a `PossibleStarter`.
- Returns the input unchanged when it is already a `Starter`; otherwise wraps the callback in a new `Starter`.

## Signatures

```ts
getStarter(start: StartCallback<T> | Starter<T>): Starter<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `start` | `StartCallback<T> \| Starter<T>` | A `StartCallback` or an existing `Starter`. |

## Returns

| Type | Description |
| --- | --- |
| `Starter<T>` |  |
