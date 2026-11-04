# SQLFragment

- Kind: class
- Import: `import { SQLFragment } from "shelving/db";`

SQL fragment made from template strings plus embedded expressions, ready to be composed into a query.

- Flattens eagerly: `SQLFragment` values are spliced inline at construction, so `values` only ever contains bindable parameters (or driver-specific identifier tokens) — never other fragments.
- Concrete providers can therefore pass `strings` / `values` straight to their driver, and detect fragments with a plain `instanceof` check.

## Signatures

```ts
new SQLFragment(strings: ImmutableArray<string>, values: ImmutableArray<unknown>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `strings` | `ImmutableArray<string>` |  |
| `values` | `ImmutableArray<unknown>` |  |

## Returns

| Type | Description |
| --- | --- |
| `SQLFragment` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `strings` | `ImmutableArray<string>` | Read only. |
| `values` | `ImmutableArray<unknown>` | Read only. |
