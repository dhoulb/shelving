# DataProp

- Kind: type
- Import: `import { DataProp } from "shelving/util/data";`

Helper type to get a prop for a data object.
i.e. `DataProp<{ a: number }>` produces `readonly ["a", number"]`

## Signatures

```ts
{
	readonly [K in DataKey<T>]: readonly [K, T[K]];
}[DataKey<T>]
```

## Types

- [DataKey](DataKey.md): Helper type to get the key for a data object prop.
- `K`
