# DBDifferentialOperation

- Kind: type
- Import: `import { DBDifferentialOperation } from "shelving/test";`

A random operation that `testDBDifferential()` runs on the reference and on the provider under test.

## Signatures

```ts
| { readonly action: "set"; readonly id: string; readonly data: BasicData }
	| { readonly action: "update"; readonly id: string; readonly updates: Updates }
	| { readonly action: "delete"; readonly id: string }
	| { readonly action: "setQuery"; readonly query: Query; readonly data: BasicData }
	| { readonly action: "updateQuery"; readonly query: Query; readonly updates: Updates }
	| { readonly action: "deleteQuery"; readonly query: Query }
	| { readonly action: "get"; readonly id: string }
	| { readonly action: "getQuery"; readonly query: Query }
	| { readonly action: "countQuery"; readonly query: Query }
```

## Types

- [BasicData](BasicData.md): Validated data shape of a test basic, inferred from BASIC_SCHEMA.
- [Updates](../util/update/Updates.md): Set of named updates for a data object, keyed by encoded update syntax.
- [Query](../util/query/Query.md): Query that can be applied to a list of data objects.
