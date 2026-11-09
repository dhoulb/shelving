# shelving/util/error

- Kind: module
- Import: `import { … } from "shelving/util/error";`

Low-level helpers for working with error messages as plain strings. They exist to give call-site code a uniform way to extract, split, join, and annotate messages without caring whether the source is an `Error` object, a plain string, or any other value.

These are **not** the typed error classes — see `shelving/error` for `RequiredError`, `ValueError`, and friends.

**Things to know:**

- `splitMessage()` parses a newline-separated string and looks for `"name: message"` lines, building a keyed dictionary. Lines without a `name: ` prefix land under the `""` (empty-string) key.
- `joinMessage()` is the exact inverse of `splitMessage` — round-tripping through both returns the original content.
- `getNamedMessage()` applies a prefix to every line, which is useful when wrapping a child error message into a parent field's error.

## Usage

### Detecting and extracting messages

```ts
import { isError, getMessage, requireMessage, logError } from "shelving/util";

isError(new Error("boom")); // true
isError("boom");            // false

getMessage(new Error("boom")); // "boom"
getMessage("boom");             // "boom"
getMessage(42);                 // undefined

requireMessage(new Error("oops")); // "oops"
requireMessage(42);                // throws RequiredError

logError(new Error("fatal")); // console.error(...)
```

### Splitting and joining structured messages

```ts
import { splitMessage, joinMessage, getNamedMessage } from "shelving/util";

const msg = "Something went wrong\nname: Dave\nage: Must be positive";

const parts = splitMessage(msg);
// { "": "Something went wrong", name: "Dave", age: "Must be positive" }

joinMessage(parts);
// "Something went wrong\nname: Dave\nage: Must be positive"

// Prefix every line with a field name — useful for nested validation errors.
getNamedMessage("address", "Street is required\nCity is required");
// "address: Street is required\naddress: City is required"
```


## Functions

- [logError()](error/logError.md): Log an error to the console.
- [isError()](error/isError.md): Is an unknown value an Error instance?
- [getMessage()](error/getMessage.md): Return the string message from an unknown value, or return undefined if it could not be found.
- [requireMessage()](error/requireMessage.md): Require a message from an unknown value, or throw RequiredError if it could not be found.
- [splitMessage()](error/splitMessage.md): Split a string message into lines, look for prefixes like name:, and return a dictionary of those named messages.
- [joinMessage()](error/joinMessage.md): Join a dictionary of named messages back into a single string.
- [getNamedMessage()](error/getNamedMessage.md): Name a message by applying a name: prefix to it.

## Types

- [PossibleMessage](error/PossibleMessage.md): Things that can be a message: a string, or an object with a message string property.
