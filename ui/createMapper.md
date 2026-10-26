# createMapper()

- Kind: function
- Import: `import { createMapper } from "shelving/ui";`

Create a `[Mapping, Mapper]` pair of components backed by their own private React context.

- `Mapping` extends or overrides the mapping inside a subtree (useful for swapping in custom renderers for specific element types).
- `Mapper` accepts a pre-walked iterable of elements as `children` and dispatches each to the registered component for its `type`. Any other props passed to `Mapper` are spread onto every dispatched child.

Each call creates its own context — independent mappers don't interfere with each other.

## Signatures

```ts
createMapper(defaults: Mapping = {}): [Mapping: FunctionComponent<MappingProps>, Mapper: FunctionComponent<MapperProps>]
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `defaults` | `Mapping` | The initial mapping of element types to renderer components. Defaults to `{}`. |

## Returns

| Type | Description |
| --- | --- |
| `[Mapping: FunctionComponent<MappingProps>, Mapper: FunctionComponent<MapperProps>]` | A `[Mapping, Mapper]` tuple of components sharing a private context. |
