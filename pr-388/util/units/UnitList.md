# UnitList

- Kind: class
- Import: `import { UnitList } from "shelving/util/units";`
- Extends: `ImmutableMap<K, Unit<K>>`

Represent a list of related units of measure (e.g. all length units).
- Has a known base unit at `.base`
- Can get required units from `.unit()`
- Cannot have additional units added after it is created.

## Signatures

```ts
new UnitList<K>(units: ImmutableObject<K, UnitProps<K>>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `units` | `ImmutableObject<K, UnitProps<K>>` |  |

## Returns

| Type | Description |
| --- | --- |
| `UnitList<K>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `base` | `Unit<K>` | Base unit for this list (the first unit added). Read only. |

## Methods

- [convert](UnitList/convert.md): Convert an amount from a unit in this list to another unit in this list.
- [require](UnitList/require.md): Require a unit from this list.
