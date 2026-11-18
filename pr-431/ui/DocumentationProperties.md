# DocumentationProperties

- Kind: component
- Import: `import { DocumentationProperties } from "shelving/ui";`

Render a documented type's data members (properties, getters/setters) as a scrollable table — one row per property.
- Self-contained: pulls its own copy of the tree map from `useTreeMap()` so the `Type` column can link each type to its documented page via `TreeLink` (exact-match only; compound or builtin types stay plain text).
- Each property name carries a leading `.` (e.g. `.caller`); a union type renders one linked token per member, each on its own line, with a `| undefined` member dropped and marking the property optional.
- Descriptions render as inline markup, with a trailing `Defaults to …` (linked when documented) or `Required.` note — see `DocumentationDescription`. A row with no hand-written description falls back to the referenced type's own `description`.
- These are the same structured entries an options-bag parameter is flattened from in `DocumentationParams`, so the two stay in sync by construction.
- Renders nothing when there are no properties.

## Signatures

```ts
DocumentationProperties({ properties }: DocumentationPropertiesProps): ReactNode
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `DocumentationPropertiesProps` |  |
| `.properties` | `ImmutableArray<DocumentationParam> \| undefined` | Properties to render — one row each. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactNode` |  |

## Examples

```ts
<DocumentationProperties properties={properties} />
```
