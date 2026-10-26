# StringSchema

- Kind: class
- Import: `import { StringSchema } from "shelving/schema";`
- Extends: `Schema<string>`

Schema that defines a valid string.

- Numbers are coerced to strings; all other non-string values are rejected.
- The value is sanitized (and optionally case-folded), then checked against `match`, `min`, and `max`.

Validates a value into a `string`. Numbers are coerced to their string form, and a missing value falls back to the schema's `value` default (an empty string by default). Construct a `StringSchema` directly to add constraints like `min`, `max`, and `match`.

`STRING` is the ready-made sugar instance for an unconstrained string; `REQUIRED_STRING` is a `StringSchema` with `min: 1`, so an empty string fails validation.

## Usage

### Sugar instances

To save creating a new instance of `StringSchema` for trivial uses, you can use the `STRING` or `REQUIRED_STRING` sugar instances instead. The module also ships `TITLE` and `NAME` (1–100 characters) and their nullable variants `NULLABLE_TITLE` and `NULLABLE_NAME`.

```ts
import { STRING, REQUIRED_STRING } from "shelving/schema";

STRING.validate("hello");        // "hello"
STRING.validate(42);             // "42"   (numbers coerced)
STRING.validate(undefined);      // ""     (default)
REQUIRED_STRING.validate("");    // throws "Required"
```

### Custom string schemas

Construct a `StringSchema` to apply length and pattern constraints:

```ts
import { StringSchema } from "shelving/schema";

const USERNAME = new StringSchema({ title: "Username", min: 3, max: 20, match: /^[a-z0-9_]+$/ });
USERNAME.validate("alice_99");   // "alice_99"
USERNAME.validate("al");         // throws "Minimum 3 characters"
USERNAME.validate("ALICE");      // throws "Invalid string"
```


## Signatures

```ts
new StringSchema({
		one = "string",
		min = 0,
		max = Number.POSITIVE_INFINITY,
		value = "",
		multiline = false,
		rows = multiline ? 2 : 1,
		match,
		case: _case,
		input = "text",
		...options
	}: StringSchemaOptions)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `StringSchemaOptions` |  |
| `.value` | `string \| undefined` | Default string value used when the input is `undefined`. Read only. Defaults to `""`. |
| `.min` | `number \| undefined` | Minimum allowed character length. Read only. Defaults to `0`. |
| `.max` | `number \| undefined` | Maximum allowed character length. Read only. Defaults to `Number.POSITIVE_INFINITY`. |
| `.multiline` | `boolean \| undefined` | Whether the string keeps line breaks (multiline sanitization). An input for it is a `<textarea>` that grows. Read only. Defaults to `false`. |
| `.rows` | `number \| undefined` | Rows a multiline input shows at first. Set `1` for a box that starts one line high, like a chat message. Single-line inputs ignore it. Read only. Defaults to `` `2` when `multiline`, else `1` ``. |
| `.match` | `RegExp \| undefined` | Regular expression the sanitized string must match. Read only. Optional. |
| `.case` | `"upper" \| "lower" \| undefined` | Force the result to `"upper"` or `"lower"` case. Read only. Optional. |
| `.input` | `StringInputType \| undefined` | HTML `<input />` `type=""` hint for downstream UIs. Read only. Defaults to `"text"`. |

## Returns

| Type | Description |
| --- | --- |
| `StringSchema` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `input` | `StringInputType` | Read only. |
| `min` | `number` | Read only. |
| `max` | `number` | Read only. |
| `rows` | `number` | Read only. |
| `multiline` | `boolean` | Read only. |
| `match` | `RegExp \| undefined` | Read only. |
| `case` | `"upper" \| "lower" \| undefined` | Read only. |

## Methods

- [sanitize](StringSchema/sanitize.md): Sanitize the string by removing unwanted characters.
