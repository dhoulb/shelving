# requireEntity()

- Kind: function
- Import: `import { requireEntity } from "shelving/util/entity";`

Split an entity tag like `challenge:a1b2c3` into its `type` and `id`, or throw `RequiredError` if the entity tag was invalid.

## Signatures

```ts
requireEntity(entity: Entity<T>, caller?: AnyCaller): [type: T, id: string]
requireEntity(entity: string, caller?: AnyCaller): [type: string, id: string]
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `entity` | `Entity<T>` | The entity string to split. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `requireEntity`). Optional. |
| `entity` | `string` |  |
| `caller` | `AnyCaller` | Optional. |

## Returns

| Type | Description |
| --- | --- |
| `[type: T, id: string]` | A `[type, id]` tuple. |
| `[type: string, id: string]` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If the entity string is missing or invalid. |
