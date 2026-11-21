# getRandomItem()

- Kind: function
- Import: `import { getRandomItem } from "shelving/util/random";`

Get a random item from an array.

## Signatures

```ts
getRandomItem(arr: ImmutableArray<T>): T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `arr` | `ImmutableArray<T>` | Array to pick an item from. |

## Returns

| Type | Description |
| --- | --- |
| `T` | Single item chosen at random from `arr`. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | RequiredError If the chosen item is undefined (e.g. the array is empty). |
