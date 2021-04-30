# shelving/schema: Validate unknown user input against schemas

**shelving/schema** is a schema validator for user input written for JavaScript and TypeScript with special attention paid to TypeScript types.

## Usage

Import the `schema` object and use schema creator functions (e.g. `schema.string()`) to make schemas. These functions take an `options` object that configures the schema and returns an instance of the corresponding schema class.

When you have created a schema you can pass unknown values into the `validate()` method to validate those values:

- Valid values will be returned unchanged.
- Invalid values that can be trivially fixed will be modified and returned.
- Invalid values will return instances of `InvalidFeedback`, which contains a user-facing `message` property describing why.

This basic example shows how Shelving schemas can be used in the real world:

```ts
import { schema } from "shelving";

// Create a schema that can validate the data.
const objectSchema = schema.object(
	required: true;
	props: {
		"name": schema.string({ required: true }),
		"age": schema.number({ required: true, min: 0, max: 150 }),
		"status": schema.boolean(),
	}
);

// Function that runs on the server that validates input and saves it to the database.
export function myServerFunction(unsafeInput: unknown): true {
	// Validate the unsafe input.
	const data = objectSchema.validate(unsafeInput);

	// Note that the TypeScript type of data is:
	// { name: string, age: number, status: boolean }

	// The data was invalid. Throw an error.
	if (data instanceof Invalid) throw new ServerError("Invalid input: " + data.message);

	// Note: Now that we've filtered out Invalid we know the type is just the expect data object.

	// The data is valid. Now we can save it to the database safely.
	const status = saveToDatabase(data);

	// Success!
	return true;
}
```

### Invalid values

Is you pass an invalid value into `validate()` then two things might happen: 1) If the invalid value can be trivially converted to a valid value without data loss, it will be converted and returned, or 2) An instance of `InvalidFeedback` will be returned:

```ts
import { string, number, email, url, boolean, Invalid } from "shelving";

// Trivial conversion.
boolean().validate("abc"); // Returns `true`
boolean().validate(""); // Returns `false`
string().validate(123); // Returns "123" string.
number().validate("123.456"); // Returns 123.456 number.

// Fully invalid values.
string().validate(true); // Throws InvalidFeedback("Must be string")
number().validate("abc"); // Throws InvalidFeedback("Must be number")
email().validate("abc"); // Throws InvalidFeedback("Invalid email format")
url().validate("abc"); // Throws InvalidFeedback("Invalid URL format")
```

With object schemas, `options.props` is used to fill (and trivially convert) missing object props:

```ts
import { object, number, string } from "shelving";

// Make an object schema.
const schema = object({
	props: {
		name: string({ value: "DEFAULT" }),
		age: number(),
	},
});

// Returns { name: "DEFAULT", age: 123 }
schema.validate({ age: "123" });

// Returns { name: "Dave", age: null }
schema.validate({ name: "Dave" });
```

Instances of `InvalidFeedback` contain a string `.message` property describing the issue:

```ts
const invalid = url().validate("abc");
console.error(invalid.message); // Logs "Invalid URL format"
```

When validating an object, it's possible the _contents_ might be invalid. In this situation `InvalidFeedback` also has a `.messages` object specifying where, within the object, the data was invalid.

```ts
import { object, string, number } from "shelving"

// Make an object schema with `options.props`
const schema = object({
	props: {
		name: string({ required: true }),
		age: number({ min 0, max: 200 }),
	}
});

// Validate an invalid value.
const invalid = schema.validate({ age: 900 });

console.log(invalid.message); // "Invalid format"
console.log(invalid.messages); // { name: "Required", age: "Maximum 200" }
```

This also works for arrays. The keys in `.messages` will be numeric strings:

```ts
import { array, string } from "shelving";

// Make an array schema with `options.items`
const schema = array({
	items: string({ required: true }),
});

// Validate an invalid value.
const invalid = schema.validate([123, true, ""]);

console.log(invalid.message); // "Invalid format"
console.log(invalid.messages); // { "1": "Must be string", "2": "Required" }
```

### Validating different types

Schemaglobin contains a bunch of different schema types you can use:

```ts
import { boolean, string, number, date, email, phone, url, key, array, object, map } from "shelving";

// Create schemas.
const booleanSchema = boolean({ required: true, ...etc });
const stringSchema = string({ required: true, ...etc });
const numberSchema = number({ required: true, ...etc });
const colorSchema = color({ required: true, ...etc });
const dateSchema = date({ required: true, ...etc });
const emailSchema = email({ required: true, ...etc });
const phoneSchema = phone({ required: true, ...etc });
const urlSchema = url({ required: true, ...etc });
const keySchema = key({ required: true, ...etc });
const arraySchema = array({ required: true, items: etc, ...etc });
const objectSchema = object({ required: true, props: etc, ...etc });
const mapSchema = object({ required: true, items: etc, ...etc });

// Successful validation.
booleanSchema.validate(true); // Returns true
stringSchema.validate("abc"); // Returns "abc"
numberSchema.validate(12345); // Returns 12345
colorSchema.validate("#00CCFF"); // Returns "#00CCFF"
dateSchema.validate("1995"); // Returns "1995-01-01"
emailSchema.validate("me@x.com"); // Returns "me@x.com"
phoneSchema.validate("+1234567890"); // Returns "+1234567890"
urlSchema.validate("http://x.com"); // Returns "http://x.com"
keySchema.validate("ajdk29Jak"); // Returns "ajdk29Jak"
arraySchema.validate(["a", 2, true]); // Returns ["a", 2, true]
objectSchema.validate({ a: "A" }); // Returns { a: "A" }
mapSchema.validate({ a: "A" }); // Returns { a: "A" }

// Successful validation.
stringSchema.validate(true); // Throws InvalidFeedback("Must be string")
numberSchema.validate(true); // Throws InvalidFeedback("Must be number")
dateSchema.validate("aaaaaaa"); // Throws InvalidFeedback("Invalid date")
colorSchema.validate(true); // Throws InvalidFeedback("Must be string")
emailSchema.validate("111111"); // Throws InvalidFeedback("Invalid format")
phoneSchema.validate("aaaaaa"); // Throws InvalidFeedback("Invalid format")
urlSchema.validate("11111111"); // Throws InvalidFeedback("Invalid format")
keySchema.validate("!!!!!!!"); // Throws InvalidFeedback("Invalid format")
arraySchema.validate(true); // Throws InvalidFeedback("Must be array")
objectSchema.validate(true); // Throws InvalidFeedback("Must be object")
mapSchema.validate(true); // Throws InvalidFeedback("Must be object")
```

### Default values

Every schema has a default value that is used when the value is `undefined`. The default value can be changed for any schema with `options.value`

```ts
import { string } from "shelving";

const schemaWithoutDefault = string();
schemaWithDefault.validate(); // Returns ""

const schemaWithDefault = string({ value: "WOW VALUE" });
schemaWithDefault.validate(); // Returns "WOW VALUE"
schemaWithDefault.validate(undefined); // Returns "WOW VALUE"
```

### Required values

Normally values are not required, meaning `null` or `""` empty string are allowed. This can be changed with `options.required`

```ts
import { number } from "shelving";

const optionalSchema = number({ required: false });
optionalSchema.validate(null); // Returns null.

const requiredSchema = number({ required: true });
optionalSchema.validate(null); // Throws InvalidFeedback("Required")
```

### Using TypeScript

Schemaglobin pays special attention to the TypeScript type of values returned by `validate()`, for example:

- `NumberSchema.validate()`
  - Normally returns `number | null`
  - If `options.required` is truthy the value will never be `null` (as that would be invalid) so it only returns `number`
- `StringSchema.validate()`
  - Normally returns `string`
  - If `options.options` is set it can return a more specific type, e.g. `"a" | "b" | ""`

```ts
import { object, string, number, boolean, InvalidFeedback } from "shelving";

// `options.required` filters out falsy value.
const requiredNumber: number = number({ required: true }).validate(123); // No error.
const optionalNumber: number = number({ required: false }).validate(123); // Error `number | null` cannot be assigned to `number`

// Return type for StringSchema is inferred from `options.options`
const enumStringArray: "a" | "b" = string({ options: ["a", "b"] }).validate("a"); // No error.
const enumStringObject: "a" | "b" = string({ options: { a: "A", b: "B" } }).validate("a"); // No error.

// Return type for ObjectSchema is inferred from `options.props`
const objectSchema = object({
	required: true,
	props: {
		num: number(),
		str: string({ required: true }),
		bool: boolean({ required: true }),
	},
});

// Validated value has type `{ num: number | null, str: string, bool: true }`
const obj = objectSchema.validate(undefined);
if (!(obj instanceof InvalidFeedback)) {
	const num: number | null = obj.num; // No error.
	const str: string = obj.str; // No error.
	const bool: true = obj.bool; // No error.
}
```

Schemaglobin also provides the `SchemaType<Schema>` helper type, which allow you to extract the type of a schema:

```ts
import { string, SchemaType } from "shelving";

// Make some schemas.
const requiredStringSchema = string({ required: true });
const optionalStringSchema = string({ required: false });
const requiredEnumSchema = string({ required: true, options: ["a", "b"] });
const optionalEnumSchema = string({ required: false, options: ["a", "b"] });

// Extract the types.
type RequiredStringType = SchemaType<typeof requiredStringSchema>; // string
type OptionalStringType = SchemaType<typeof optionalStringSchema>; // string
type RequiredEnumType = SchemaType<typeof requiredEnumSchema>; // "a" | "b"
type OptionalEnumType = SchemaType<typeof optionalEnumSchema>; // "a" | "b" | ""

// Object type can be inferred from `options.props`
const objectSchema = object({ props: { str: string(), num: number() } });
type ObjectType = Schematype<typeof objectSchema>; // { str: string, num: number | null }
```

## Reference

All schema creator functions allow the following options (and may allow others too):

- `options.title: string = ""` - A title for the schema (for showing in a user-facing field).
- `options.description: string = ""` - A description for the schema (for showing in a user-facing field).
- `options.placeholder: string = ""` - A placeholder for the schema (for showing in a user-facing field).
- `options.validator?: (value: T) => T` - Additional validation function that is called after all built in validation.

### `ArraySchema`

The `schema.array()` creator function creates a `ArraySchema` instance that can validate arrays and their contents:

- Arrays are valid, e.g. `[1,2,3]`
- Contents of the array can be validated with `options.items`
- Falsy values are converted to `[]` empty array.
- `[]` empty array is an invalid value if `options.required` is truthy.

`schema.array()` also allows the following options:

- `options.value: [] = []` - The default value which will be used if the value is `undefined`
- `options.required: boolean = false` - If true, then empty arrays will throw `InvalidFeedback("Required")`
- `options.min: number = null` - The minimum number of items allowed.
- `options.max: number = null` - The maximum number of items allowed.
- `options.items: Schema` (required) - Schema that will be used to validate the contents of the array.
- `options.unique: boolean` - Specify that items cannot appear in the array more than once (duplicates will be de-duped automatically).

### `BooleanSchema`

The `schema.boolean()` creator function creates a `BooleanSchema` instance:

- All truthy values are converted to `true`
- All falsy values are converted to `false`
- Default value is `false`
- `false` is an invalid value if `options.required` is truthy.
- Doesn't accept any additional options.

`schema.boolean()` also allows the following options:

- `options.value: boolean = false` - The default value which will be used if the value is `undefined`
- `options.required: boolean = false` - If true, then false values will throw `InvalidFeedback("Required")`

### `ColorSchema`

The `schema.color()` creator function creates a `ColorSchema` instance that can validate hexadecimal color strings:

- Strings in hex color format are valid, e.g. `#00CCFF`
- Whitespace is trimmed automatically.
- Falsy values are converted to `null`
- `null` is an invalid value if `options.required` is truthy.

`schema.color()` also allows the following options:

- `options.value: Date = null` - The default value which will be used if the value is `undefined`
- `options.required: boolean = false` - If true, then null values will throw `InvalidFeedback("Required")`

### `DateSchema`

The `schema.date()` creator function creates a `DateSchema` instance that can validate date YMD strings:

- Strings in YMD format are valid, e.g. `1995-10-20`
- Whitespace is trimmed automatically.
- Strings in other formats are parsed with `new Date()` and converted to YMD strings.
- `Date` instances and numbers are converted to YMD strings.
- `value`, `min` and `max` options can be functions that return calculated values, e.g. using `value: Date.now` will set the value to today's date.
- Falsy values are converted to `null`
- `null` is an invalid value if `options.required` is truthy.

`schema.date()` also allows the following options:

- `options.value: Date = null` - The default value which will be used if the value is `undefined`
- `options.required: boolean = false` - If true, then null values will throw `InvalidFeedback("Required")`
- `options.min: string = null` - The minimum date allowed.
- `options.max: string = null` - The maximum date allowed.

### `EmailSchema`

The `schema.email()` creator function creates a `EmailSchema` instance that can validate email addresses:

- Strings that are valid email addresses are valid, e.g. `dave@gmail.com`
- Whitespace is trimmed automatically.
- Email is converted to lowercase automatically.
- Falsy values are converted to `null`
- `null` is an invalid value if `options.required` is truthy.

`schema.email()` also allows the following options:

- `options.value: string = null` - The default value which will be used if the value is `undefined`
- `options.required: boolean = false` - If true, then null values will throw `InvalidFeedback("Required")`

### `KeySchema`

The `schema.key()` creator function creates a `KeySchema` instance that can validate database key strings:

- Strings that are valid database keys are valid, e.g. `abc` or `AAAA1234`
- By default key strings can only contain `a-zA-Z0-9` or `-` hyphen.
- Whitespace is trimmed automatically.
- Falsy values are converted to `null`
- `null` is an invalid value if `options.required` is truthy.

`schema.key()` also allows the following options:

- `options.value: string = null` - The default value which will be used if the value is `undefined`
- `options.required: boolean = false` - If true, then null values will throw `InvalidFeedback("Required")`
- `options.match: RegExp = /[a-zA-Z0-9-]{1,24}/` - Format the database key must match.

### `MapSchema`

The `schema.map()` creator function creates a `MapSchema` instance that can validate an object containing a list of key: value entries:

- Objects are valid, e.g. `{ a: 1, b: 2, c: 3 }`
- Contents of the object can be validated with `options.props`
- Falsy values are converted to `{}` empty object.
- `{}` empty object is an invalid value if `options.required` is truthy.

`schema.map()` also allows the following options:

- `options.value: {} = {}` - The default value which will be used if the value is `undefined`
- `options.required: boolean = false` - If true, then empty objects will throw `InvalidFeedback("Required")`
- `options.min: number = null` - The minimum number of items allowed.
- `options.max: number = null` - The maximum number of items allowed.
- `options.items: Schema` (required) - Schema that will be used to validate all properties in the object.

### `NumberSchema`

The `schema.number()` creator function creates a `NumberSchema` instance that can validate numbers:

- Numbers are valid values.
- Strings that can be converted to numbers are valid values.
- `0` zero is a valid value.
- Falsy values are converted to `null`
- `null` is an invalid value if `options.required` is truthy.

`schema.number()` also allows the following options:

- `options.value: number | null = null` - The default value which will be used if the value is `undefined`
- `options.required: boolean = false` - If true, then null values will throw `InvalidFeedback("Required")`
- `options.min: number = null` - The minimum number allowed.
- `options.max: number = null` - The maximum number allowed.
- `options.options: number[] | { number: string } = null` - Explicit list of allowed values as either:
  1. An array of numbers where each number is an allowed value.
  2. An object where each number key is an allowed value and the corresponding value can be a user-facing title for the option.
- `options.step: number = null` - The step size for the the number (the value will be rounded to the closest step).
- `options.unit: Unit = null` - The base unit for this schema (e.g. `"meter"` or `"feet"`). Compatible units (e.g. `"280 inches"`) will be converted to the base unit.

### `PhoneSchema`

The `schema.phone()` creator function creates a `PhoneSchema` instance that can validate URLs:

- Strings that are valid phone numbers are valid, e.g. `+441234567890`
- Whitespace is trimmed automatically.
- Non-digit characters are stripped automatically.
- Falsy values are converted to `null`
- `null` is an invalid value if `options.required` is truthy.

`schema.phone()` also allows the following options:

- `options.value: string = null` - The default value which will be used if the value is `undefined`
- `options.required: boolean = false` - If true, then null values will throw `InvalidFeedback("Required")`

### `ObjectSchema`

The `schema.object()` creator function creates a `ObjectSchema` instance that can validate an exact object:

- Objects are valid, e.g. `{ a: 1, b: "two" }`
- Contents of the object can be validated with `options.props`
- Properties not specified in `options.props
- Falsy values are converted to `null`
- `null` is an invalid value if `options.required` is truthy.

`schema.object()` also allows the following options:

- `options.value: {} | null = null` - The default value which will be used if the value is `undefined`
- `options.required: boolean = false` - If true, then null values will throw `InvalidFeedback("Required")`
- `options.props: { [prop: string]: Schema }` (required) - An object explicitly specifying the type of each individual property.

### `StringSchema`

The `schema.string()` creator function creates a `StringSchema` instance:

- Strings are valid values.
- Whitespace is trimmed automatically.
- Control characters are stripped automatically.
- Newlines (and tabs) are stripped unless the `multiline` option is `true`
- Numbers are converted to string automatically.
- Falsy values are converted to `""` empty string
- Default value is `""` empty string
- `""` empty string is an invalid value if `options.required` is truthy.

`schema.string()` also allows the following options:

- `options.value: string = ""` - The default value which will be used if the value is `undefined`
- `options.required: boolean = false` - If true, then empty strings will throw `InvalidFeedback("Required")`
- `options.min: number = 0` - The minimum number of characters allowed.
- `options.max: number = null` - The maximum number of characters allowed.
- `options.options?: string[] | { string: string }` - Explicit list of allowed values as either:
  1. An array of strings where each string is an allowed value.
  2. An object where each string key is an allowed value, and the corresponding value is a user-facing title for the option.
- `options.match: RegExp = null` - A regular expression that the string must match.
- `options.multiline: boolean = false` - Whether the string allows newlines or not.
- `options.sanitizer?: (value: string) => string` - Additional sanitization function that runs after initial string conversion (e.g. strip disallowed characters).
- `options.type: string = "text"` — Type for `<input type="text" />` attribute.

### `UrlSchema`

The `schema.url()` creator function creates a `UrlSchema` instance that can validate URLs:

- Strings that are valid email addresses are valid, e.g. `https://x.com` or `data:anything`
- Whitespace is trimmed automatically.
- Falsy values are converted to `null`
- `null` is an invalid value if `options.required` is truthy

`schema.url()` also allows the following options:

- `options.value: string = null` - The default value which will be used if the value is `undefined`
- `options.required: boolean = false` - If true, then null values will throw `InvalidFeedback("Required")`
- `options.schemes: string[] = ["http:", "https:"]` - Whitelist of allowed URL schemes.
- `options.hosts: string[] = null` - List of allowed hostnames, e.g. `["google.com"]`
- `options.max: number = 512` - Maximum length of a URL.

### Shortcuts

The following static values are available as shortcuts attached to the creator functions for all simple values:

```js
import { schema } from "shelving";

// These shortcuts save having to pass `options.required` into the creator function.
schema.boolean.required.validate(true);
schema.boolean.optional.validate(false);
schema.color.required.validate("#00CCFF");
schema.color.optional.validate(null);
schema.date.required.validate(new Date());
schema.date.optional.validate(null);
schema.email.required.validate("dave@x.com");
schema.email.optional.validate(null);
schema.key.required.validate("abc123");
schema.key.optional.validate(null);
schema.number.required.validate(12345);
schema.number.optional.validate(null);
schema.number.timestamp.validate(Date.now());
schema.phone.required.validate("+44123456789");
schema.phone.optional.validate(null);
schema.string.required.validate("AAAAA");
schema.string.optional.validate("");
schema.url.required.validate("https://x.com");
schema.url.optional.validate(null);

// These schemas always return fixed values.
schema.null.validate(null);
schema.undefined.validate(undefined);
```

Object schemas also provide shortcuts, but as `options.props` and `options.items` are required these must be passed in as the only argument:

```js
import { schema } from "shelving";

// Object shortcuts accept `options.props` as an argument.
schema.object.required({ num: schema.number.optional }).validate({ num: 123 });
schema.object.optional({ num: schema.number.required }).validate(null);

// Data objects are required objects whose values must be plain values.
// Data objects accept `options.props` as their argument.
schema.data({ name: schema.string.required }).validate({ name: "Dave" });

// Array shortcuts accept `options.items` as an argument.
schema.array.required(schema.string.required).validate([1, 2, 3]);
schema.array.optional(schema.string.required).validate([]);

// Map shortcuts accept `options.items` as an argument.
schema.map.required(schema.boolean.required).validate({ a: 1, b: 2, c: 3 });
schema.map.optional(schema.boolean.required).validate(null);
```

## Changelog

See [Releases](https://github.com/dhoulb/shelving/releases)
