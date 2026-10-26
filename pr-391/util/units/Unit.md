# Unit

- Kind: class
- Import: `import { Unit } from "shelving/util/units";`

Represent a single unit of measure within a `UnitList`, e.g. `kilometer`.

- Knows how to convert amounts to/from other units in its list and to format them for display.

## Signatures

```ts
new Unit<K>(list: UnitList<K>, key: K, { to, ...options }: UnitProps<K>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `list` | `UnitList<K>` |  |
| `key` | `K` |  |
| `options` | `UnitProps<K>` |  |

## Returns

| Type | Description |
| --- | --- |
| `Unit<K>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `list` | `UnitList<K>` | `UnitList` this unit belongs to. Read only. |
| `key` | `K` | String key for this unit, e.g. `kilometer` Read only. |
| `options` | `Readonly<UnitFormatOptions> \| undefined` | Possible options for formatting these units. Read only. |

## Methods

- [to](Unit/to.md): Convert an amount from this unit to another unit.
- [from](Unit/from.md): Convert an amount from another unit to this unit.
- [format](Unit/format.md): Format an amount with a given unit of measure, e.g. 12 kg or 29.5 l
- [formatAbbr](Unit/formatAbbr.md): Format the short name of this unit on its own, e.g. km or min, with no number.
