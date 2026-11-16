# shelving/util/object

- Kind: module
- Import: `import { … } from "shelving/util/object";`

Core immutable helpers for reading and updating plain objects, plus utility types for mutable/readonly/partial transformations. These are the building blocks for safe state management — every mutating helper returns the original reference when nothing changed.

**Things to know:**

- `withProp()` and `withProps()` preserve the object's prototype, so subclass instances survive updates intact.
- Same-reference shortcut: if the new value is `===` to the existing value, the original object is returned without allocating.
- `omitProp()` is an alias for `omitProps()` with a single key — they are the same function.
- `deleteProp()` / `deleteProps()` and `setProp()` / `setProps()` mutate by reference; use the `with*` / `omit*` variants for immutable operations.
- `setProp()` / `setProps()` trust their keys by contract: a runtime-untrusted key like `__proto__` would mutate the target's prototype, so validate or filter untrusted keys first (or use a null-prototype target).
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


## Functions

- [isObject()](object/isObject.md): Is an unknown value an unknown object?
- [assertObject()](object/assertObject.md): Assert that a value is an object.
- [isPlainObject()](object/isPlainObject.md): Is an unknown value a plain object?
- [assertPlainObject()](object/assertPlainObject.md): Assert that an unknown value is a plain object.
- [isProp()](object/isProp.md): Is an unknown value the key for an own prop of an object.
- [assertProp()](object/assertProp.md): Assert that an unknown value is the key for an own prop of an object.
- [getObject()](object/getObject.md): Turn a possible object into an object.
- [getProps()](object/getProps.md): Get the props of an object as a set of entries.
- [getKeys()](object/getKeys.md): Get the keys of an object as an array.
- [getProp()](object/getProp.md): Extract the value of a named prop from an object.
- [fromProp()](object/fromProp.md): Create an object from a single prop.
- [withProp()](object/withProp.md): Set a prop on an object (immutably) and return a new object including that prop.
- [withProps()](object/withProps.md): Set several props on an object (immutably) and return a new object including those props.
- [omitProps()](object/omitProps.md): Remove several props from an object (immutably) and return a new object without those props.
- [pickProps()](object/pickProps.md): Pick several props from an object and return a new object with only those props.
- [setProp()](object/setProp.md): Set a single named prop on an object (by reference) and return its value.
- [setProps()](object/setProps.md): Set several named props on an object (by reference).
- [deleteProps()](object/deleteProps.md): Remove several key/value entries from an object (by reference).
- [getPrototype()](object/getPrototype.md): Get the prototype of an object instance.
- [cloneObject()](object/cloneObject.md): Shallow clone an object with the same prototype.
- [cloneObjectWith()](object/cloneObjectWith.md): Shallow clone an object with a single changed value.

## Types

- [ImmutableObject](object/ImmutableObject.md): Any readonly object.
- [MutableObject](object/MutableObject.md): Any writable object.
- [Prop](object/Prop.md): Prop for an object, as a readonly key/value entry tuple.
- [Key](object/Key.md): Key for an object prop.
- [Value](object/Value.md): Value for an object prop.
- [PossibleObject](object/PossibleObject.md): Something that can be converted to an object.
- [Mutable](object/Mutable.md): Mutable type is the opposite of Readonly<T> helper type.
- [DeepPartial](object/DeepPartial.md): Deep partial object: deeply convert an object to its partial version.
- [DeepMutable](object/DeepMutable.md): Deep mutable object: deeply convert an object to its mutable version.
- [DeepReadonly](object/DeepReadonly.md): Deep readonly object: deeply convert an object to its readonly version.
- [PickProps](object/PickProps.md): Pick only the properties of an object that match a type.
- [OmitProps](object/OmitProps.md): Omit the properties of an object that match a type.

## Constants

- [omitProp](object/omitProp.md): Remove a prop from an object (immutably) and return a new object without that prop.
- [deleteProp](object/deleteProp.md): Remove a key/value entry from an object (by reference).
