# Object helpers

Core immutable helpers for reading and updating plain objects, plus utility types for mutable/readonly/partial transformations. These are the building blocks for safe state management — every mutating helper returns the original reference when nothing changed.

**Things to know:**

- `withProp()` and `withProps()` preserve the object's prototype, so subclass instances survive updates intact.
- Same-reference shortcut: if the new value is `===` to the existing value, the original object is returned without allocating.
- `omitProp()` is an alias for `omitProps()` with a single key — they are the same function.
- `deleteProp()` / `deleteProps()` and `setProp()` / `setProps()` mutate by reference; use the `with*` / `omit*` variants for immutable operations.
- `isObject()` returns `true` for any non-null object including arrays and class instances. Use `isPlainObject()` when you need only `{}` shaped objects.

## Usage

### Type guards

```ts
import { isObject, assertObject, isPlainObject, assertPlainObject } from "shelving/util";

isObject(null);           // false
isObject([]);             // true  (arrays are objects)
isPlainObject([]);        // false
isPlainObject(new Map()); // false
isPlainObject({ a: 1 }); // true
```

### Immutable updates

```ts
import { withProp, withProps, omitProp, omitProps, pickProps } from "shelving/util";

const obj = { a: 1, b: 2, c: 3 };

withProp(obj, "b", 99);         // { a: 1, b: 99, c: 3 }
withProp(obj, "b", 2);          // same ref — value unchanged

withProps(obj, { b: 99, c: 0 }); // { a: 1, b: 99, c: 0 }
withProps(obj, {});               // same ref

omitProp(obj, "b");             // { a: 1, c: 3 }
omitProps(obj, "a", "c");       // { b: 2 }

pickProps(obj, "a", "c");       // { a: 1, c: 3 }
```

### Mutable updates (by reference)

```ts
import { setProp, setProps, deleteProp, deleteProps } from "shelving/util";

const obj = { a: 1, b: 2, c: 3 };
setProp(obj, "a", 99);          // obj.a is now 99; returns 99
setProps(obj, { b: 10, c: 20 });
deleteProp(obj, "a");
deleteProps(obj, "b", "c");
```

### Prop introspection

```ts
import { isProp, assertProp, getProps, getKeys, getProp, fromProp } from "shelving/util";

isProp(obj, "a");               // true if "a" is an own key
getProps(obj);                  // entries as [key, value][] array
getKeys(obj);                   // keys as string[] array
getProp(obj, "a");              // obj.a — with type-safe return
fromProp("id", "abc");          // { id: "abc" }
```

### Cloning

```ts
import { cloneObject, cloneObjectWith, getObject } from "shelving/util";

cloneObject(obj);               // shallow copy, prototype preserved
cloneObjectWith(obj, "a", 99);  // same as withProp but always allocates

// Build an object from an iterable of [key, value] pairs.
getObject([["a", 1], ["b", 2]]); // { a: 1, b: 2 }
```

### Utility types

```ts
import type { Mutable, DeepPartial, DeepMutable, DeepReadonly, PickProps, OmitProps } from "shelving/util";

type W = DeepReadonly<{ a: { b: number } }>;  // recursively readonly
type X = DeepPartial<{ a: { b: number } }>;   // recursively optional
type Y = PickProps<User, string>;              // only string-valued props
type Z = OmitProps<User, string>;             // exclude string-valued props
```
