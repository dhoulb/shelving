# NoticeStore

- Kind: class
- Import: `import { NoticeStore } from "shelving/ui";`
- Extends: `DataStore<NoticeData<S>>`

Store holding a single notice's content and status, owned by a `NoticesStore`.

- Auto-closes itself a few seconds after opening unless its status is `"loading"`.
- Adds itself to its parent `NoticesStore` on construction and removes itself on `close()` or disposal.

## Signatures

```ts
new NoticeStore<S>(notices: NoticesStore<S>, children?: ReactNode | null, status?: S | undefined)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `notices` | `NoticesStore<S>` |  |
| `children` | `ReactNode \| null` | Optional. |
| `status` | `S \| undefined` | Optional. |

## Returns

| Type | Description |
| --- | --- |
| `NoticeStore<S>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `key` | `unknown` | Read only. Defaults to `getRandomKey()`. |

## Examples

```ts
const notice = notices.show("Saved", "success"); notice.close();
```

## Methods

- [NoticeStore.show()](NoticeStore/show.md): Update the notice's content and status, resetting its auto-close timer.
- [NoticeStore.close()](NoticeStore/close.md): Close this notice permanently, removing it from its parent NoticesStore.
