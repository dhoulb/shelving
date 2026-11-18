# setProps()

- Kind: function
- Import: `import { setProps } from "shelving/util/object";`

Set several named props on an object (by reference).
- Keys are trusted by contract: a runtime-untrusted key like `"__proto__"` would mutate the target's prototype, so validate or filter untrusted keys before calling (or use a null-prototype target).

## Signatures

```ts
setProps(obj: T, entries: T | Partial<T> | Iterable<Prop<T>>): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `obj` | `T` | The object to set the props on (modified by reference). |
| `entries` | `T \| Partial<T> \| Iterable<Prop<T>>` | The props to set, as an object or iterable set of key/value entry tuples. |
