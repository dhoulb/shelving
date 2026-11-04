# NoticesStore

- Kind: class
- Import: `import { NoticesStore } from "shelving/ui";`
- Extends: `ArrayStore<NoticeStore<S>>`

Store holding the live list of `NoticeStore` notices currently shown.

- Disposing the store disposes (and closes) every notice it contains.

## Signatures

```ts
new NoticesStore<S>()
```

## Returns

| Type | Description |
| --- | --- |
| `NoticesStore<S>` |  |

## Examples

```ts
const notices = new NoticesStore(); notices.show("Hello");
```

## Methods

- [NoticesStore.show()](NoticesStore/show.md): Create and show a new notice, adding it to this list.
