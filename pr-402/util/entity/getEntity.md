# getEntity()

- Kind: function
- Import: `import { getEntity } from "shelving/util/entity";`

Split an optional entity tag like `challenge:a1b2c3` into its `type` and `id`, or return `EmptyEntity` if the entity was invalid.

## Signatures

```ts
getEntity(entity: Entity<T>): [type: T, id: string]
getEntity(entity: Nullish<Entity<T>>): [type: T, id: string] | EmptyEntity
getEntity(entity: Nullish<string>): [type: string, id: string] | EmptyEntity
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `entity` | `Entity<T>` | The entity string to split, or a nullish value. |
| `entity` | `Nullish<Entity<T>>` |  |
| `entity` | `Nullish<string>` |  |

## Returns

| Type | Description |
| --- | --- |
| `[type: T, id: string]` | A `[type, id]` tuple, or `EMPTY_ENTITY` if the entity was missing or invalid. |
| `[type: T, id: string] \| EmptyEntity` |  |
| `[type: string, id: string] \| EmptyEntity` |  |
