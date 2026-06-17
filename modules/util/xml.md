# XML helpers

Two small helpers for producing XML strings from data objects. They exist for cases where you need to serialise a plain data structure to XML without pulling in a full XML library.

**Things to know:**

- [`getXML()`](/util/xml/getXML) only accepts [`Data`](/util/data/Data) (plain `Record<string, unknown>`) at the top level — arrays and primitives cannot be the root because XML requires named elements.
- Keys must match `[a-zA-Z][a-zA-Z0-9]*`. Any key that does not match throws a [`RequiredError`](/error/RequiredError).
- `undefined` values are silently omitted from the output.
- Nested `Data` objects become nested elements. Strings, numbers, and booleans become text content (strings are XML-escaped). Other value types throw.

## Usage

```ts
import { getXML, escapeXML } from "shelving/util";

// Serialise a data object to XML.
getXML({ name: "Alice", age: 30 });
// "<name>Alice</name><age>30</age>"

// Nested objects become nested elements.
getXML({ user: { name: "Alice", active: true } });
// "<user><name>Alice</name><active>true</active></user>"

// Undefined values are omitted.
getXML({ name: "Alice", bio: undefined });
// "<name>Alice</name>"

// Escape special characters for safe inclusion in XML.
escapeXML(`Tom & "Jerry"`);
// "Tom &amp; &quot;Jerry&quot;"
```

## See also

- [util](/util) — naming conventions and the full helper overview.
