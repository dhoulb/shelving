# getClosestNumber()

- Kind: function
- Import: `import { getClosestNumber } from "shelving/util/number";`

Find the number that's closest to a target in an iterable set of numbers.

## Signatures

```ts
getClosestNumber(nums: Iterable<T>, target: number): T | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `nums` | `Iterable<T>` | The iterable of numbers to search. |
| `target` | `number` | The target number to find the closest match for. |

## Returns

| Type | Description |
| --- | --- |
| `T \| undefined` | The number closest to `target`, or `undefined` if `nums` is empty. |
