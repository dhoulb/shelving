# getMostVisibleObserverEntry()

- Kind: function
- Import: `import { getMostVisibleObserverEntry } from "shelving/ui";`

Find the most-visible entry in a list of `IntersectionObserverEntry` objects.

- Returns the entry with the highest `intersectionRatio`, or `undefined` for an empty list.

## Signatures

```ts
getMostVisibleObserverEntry(entries: IntersectionObserverEntry[]): IntersectionObserverEntry | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `entries` | `IntersectionObserverEntry[]` | The observer entries to compare (e.g. from an `IntersectionObserver` callback). |

## Returns

| Type | Description |
| --- | --- |
| `IntersectionObserverEntry \| undefined` | The entry with the largest visible ratio, or `undefined` when `entries` is empty. |

## Examples

```ts
getMostVisibleObserverEntry(entries)?.target;
```
