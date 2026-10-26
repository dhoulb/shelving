# pickArrayItems()

- Kind: function
- Import: `import { pickArrayItems } from "shelving/util/array";`

Pick multiple items from an array (immutably) and return a new array with those items (or the same array if no changes were made).

## Signatures

```ts
pickArrayItems(items: PossibleArray<T>, ...pick: T[]): ImmutableArray<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `items` | `PossibleArray<T>` | The array or iterable to pick from. |
| `pick` | `T[]` | The items to keep. |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableArray<T>` | A new array containing only the picked items, or the same array if nothing changed. |
