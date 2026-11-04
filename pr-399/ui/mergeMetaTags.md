# mergeMetaTags()

- Kind: function
- Import: `import { mergeMetaTags } from "shelving/ui";`

Merge two sets of meta `<meta>` tags, with `next` taking precedence over `current`.

## Signatures

```ts
mergeMetaTags(current: MetaTags | undefined, next: MetaTags | undefined): MetaTags | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `current` | `MetaTags \| undefined` | The existing tags. |
| `next` | `MetaTags \| undefined` | The new tags to merge on top. |

## Returns

| Type | Description |
| --- | --- |
| `MetaTags \| undefined` | The merged tags, or `undefined` if both inputs were unset. |
