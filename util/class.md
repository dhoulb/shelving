# shelving/util/class

- Kind: module
- Import: `import { … } from "shelving/util/class";`

Type utilities and runtime helpers for working with class constructors and instances. Useful when you need to check whether a value is a constructor, whether an object is an instance of a particular class, or when you need to inspect property descriptors.

## Usage

### Checking constructors and instances

```ts
import { isConstructor, isInstance, assertInstance } from "shelving/util";

isConstructor(class Foo {});    // true
isConstructor(function () {});  // false — regular function, not a class

isInstance(new Map(), Map);     // true
isInstance({}, Map);            // false

assertInstance(value, MyClass); // throws RequiredError if not an instance
```

### Inspecting property descriptors

```ts
import { getGetter, getSetter } from "shelving/util";

class MyClass {
  get name() { return this._name; }
  set name(v) { this._name = v; }
}

const obj = new MyClass();
const getter = getGetter(obj, "name"); // the getter function, or undefined
const setter = getSetter(obj, "name"); // the setter function, or undefined
```


## Functions

- [isConstructor](class/isConstructor.md): Is a given value a class constructor?
- [isInstance](class/isInstance.md): Is a value an instance of a class?
- [assertInstance](class/assertInstance.md): Assert that a value is an instance of something.
- [getGetter](class/getGetter.md): Get the 'getter' function for a given property, or undefined if it doesn't exist.
- [getSetter](class/getSetter.md): Get the 'setter' function for a given property, or undefined if it doesn't exist.

## Types

- [Constructor](class/Constructor.md): Class that has a public constructor() function.
- [AnyConstructor](class/AnyConstructor.md): Any class constructor (designed for use with extends AnyConstructor guards).
- [Class](class/Class.md): Class prototype that can be used with instanceof.
