# shelving/schema

- Kind: module
- Import: `import { … } from "shelving/schema";`

Schema validation for TypeScript. A `Schema<T>` describes how to coerce and validate an unknown value into a typed `T`. Schemas are the foundation of shelving — database collections, API endpoints, and form handlers all build on them.

By convention, instantiated schemas are constants and use `UPPERCASE`.

## Concepts

### The `Schema<T>` interface

Every schema has a single `Schema.validate()` method — `validate(value: unknown): T`. If the value is valid (after any coercion), it returns `T`. If it is not, it throws a plain **string** error message — for example `"Must be 5–50 characters"` or `"Required"`. This is intentional: form handlers and API layers can consume these strings directly without any unwrapping.

Multi-field errors from `DataSchema` are joined by `\n`, one line per failed field, with the field name prepended: `"name: Required\nemail: Invalid format"`.

### Default value

`validate()` is called with `undefined` when no value is provided; the schema falls back to its `Schema.value` default.

### Coercion

Schema functionality in Shelving follows the **robustness principle**: "be conservative in what you do, be liberal in what you accept from others". Values that are obvious in their intent are coerced to appropriate valid values.

`StringSchema` converts numbers to strings, `BooleanSchema` converts the strings `"no"` and `"false"` to `false` and tests other values for truthiness, `ArraySchema` splits comma-separated strings into arrays, `NumberSchema` parses strings into numbers.

### Metadata

Every schema carries optional display metadata set at construction time:

| Property      | Default         | Purpose                                            |
| ------------- | --------------- | -------------------------------------------------- |
| `Schema.one`         | `"value"`       | Singular noun, e.g. `"product"`                   |
| `Schema.many`        | `one + "s"`     | Plural noun, e.g. `"products"`                    |
| `Schema.title`       | `""`            | Human-readable label for a field                  |
| `Schema.description` | `""`            | Longer description for a field                    |
| `Schema.placeholder` | `""`            | Placeholder text for an input                     |
| `Schema.value`       | schema-specific | Default used when `validate(undefined)` is called |
| `Schema.format()`      | schema-specific | Display formatter for downstream form and UI use  |

### Sugar instances and factories

For convenience the `shelving/schema` module offers sugar constants and factories to improve the readability of code that creates complex schemas. Sugar instances are pre-instantiated copies of `Schema` classes — by convention an instantiated schema is named in `ALL_CAPS`, a convention you will find it convenient to use in your own codebase too. Sugar factories are functions like `OPTIONAL()` and `DATA()` that build a configured schema for you.

| Sugar instance / factory | Validated type       |
| ----------------------- | -------------------- |
| `STRING`                | `string`             |
| `NUMBER`                | `number`             |
| `CURRENCY_AMOUNT(code)` | `number`             |
| `BOOLEAN`               | `boolean`            |
| `DATA(props)`           | `T` (plain object)   |
| `ARRAY(itemSchema)`     | `readonly T[]`       |
| `CHOICE(options)`       | union of string keys |
| `NULLABLE(schema)`      | `T \| null`          |
| `OPTIONAL(schema)`      | `T \| undefined`     |
| `PARTIAL(schema)`       | `Partial<T>`         |
| `ITEM(idSchema, props)` | `{ id: I } & T`      |
| `UPDATES(dataSchema)`   | `Updates<T>`         |
| `QUERY(dataSchema)`     | `Query<T>`           |

## Usage

Schemas compose: primitives, wrappers (`NULLABLE()`, `OPTIONAL()`, `ARRAY()`), and `DATA()` nest freely to describe an entire payload in a single validator. See each schema's own page for detailed usage of that class and its constants.

```ts
import { ITEM, STRING, REQUIRED_STRING, NUMBER, ARRAY, OPTIONAL, INTEGER } from "shelving/schema";

const PRODUCT = ITEM(INTEGER, {
  name: REQUIRED_STRING,
  price: NUMBER,
  tags: ARRAY(STRING),
  notes: OPTIONAL(STRING),
});

PRODUCT.validate({ id: 1, name: "Widget", price: 9.99, tags: "a,b" });
// { id: 1, name: "Widget", price: 9.99, tags: ["a", "b"], notes: undefined }

PRODUCT.validate({ id: 2, name: "", price: 9.99, tags: [] });
// throws "name: Required"
```

### Deep props, updates, and queries

`getDataSchemaProp()` is the schema twin of `getDataProp()`. It walks a dotted path (`"sub.num"`) down nested `DataSchema` props, through wrappers like `NULLABLE()`, and gives the schema at the path, or `undefined`.

`UPDATES()` and `QUERY()` use it to validate every key of an `Updates` or `Query` object against the prop at its path. An unknown key throws.

```ts
import { ARRAY, DATA, NUMBER, QUERY, STRING, UPDATES } from "shelving/schema";

const PERSON = DATA({ name: STRING, tags: ARRAY(STRING), address: DATA({ city: STRING, floor: NUMBER }) });

UPDATES(PERSON).validate({ "address.city": "Leeds", "+=address.floor": 1, "+[]tags": "new" }); // Valid.
UPDATES(PERSON).validate({ "address.floor": "high" }); // throws "address.floor: Must be number"

QUERY(PERSON).validate({ "address.floor>": 2, "tags[]": "new", $order: "name", $limit: 10 }); // Valid.
QUERY(PERSON).validate({ "address.street": "Main" }); // throws "address.street: Unknown prop"
```


## Functions

- [DATA](schema/DATA.md): Create a DataSchema for a set of properties.
- [NULLABLE_DATA](schema/NULLABLE_DATA.md): Create a schema for a valid data object with specified properties, or null.
- [PARTIAL](schema/PARTIAL.md): Create a DataSchema that validates partially, i.e. every property can be its value or undefined.
- [ITEM](schema/ITEM.md): Create a DataSchema that validates a data item, i.e. it has a string or number .id identifier property.
- [getDataSchemaProp](schema/getDataSchemaProp.md): Get the schema for an optional (possibly deep) prop of a DataSchema, or undefined if it doesn't exist.
- [CURRENCY_AMOUNT](schema/CURRENCY_AMOUNT.md): Create a CurrencyAmountSchema for a non-negative monetary amount in a currency.
- [NULLABLE_CURRENCY_AMOUNT](schema/NULLABLE_CURRENCY_AMOUNT.md): Create a NullableSchema for an optional monetary amount in a currency, or null.
- [ARRAY](schema/ARRAY.md): Create a schema for a valid array with specified items.
- [DICTIONARY](schema/DICTIONARY.md): Create a schema for a valid dictionary object with specified entry values.
- [NULLABLE](schema/NULLABLE.md): Create a NullableSchema that wraps a source schema and also allows null.
- [getSourceSchema](schema/getSourceSchema.md): Get the innermost source of a wrapper schema, or the schema itself if it is not a ThroughSchema.
- [UPDATES](schema/UPDATES.md): Create an UpdatesSchema for the data object of a DataSchema.
- [OPTIONAL](schema/OPTIONAL.md): Create an OptionalSchema that wraps a source schema and also allows undefined.
- [CHOICE](schema/CHOICE.md): Create a schema for a valid choice from an allowed set of values.
- [REQUIRED](schema/REQUIRED.md): Create a RequiredSchema that wraps a source schema and rejects a falsy result.
- [QUERY](schema/QUERY.md): Create a QuerySchema for the data objects of a DataSchema.

## Classes

- [StringSchema](schema/StringSchema.md): Schema that defines a valid string.
- [AddressSchema](schema/AddressSchema.md): Schema that validates a postal address.
- [ColorSchema](schema/ColorSchema.md): Schema that defines a valid color hex string, e.g. #00CCFF
- [DataSchema](schema/DataSchema.md): Schema that validates a data object against a fixed set of named property schemas.
- [CurrencyAmountSchema](schema/CurrencyAmountSchema.md): Schema representing a numeric amount in a specific currency.
- [ArraySchema](schema/ArraySchema.md): Schema that validates an array and ensures every item matches a specified item schema.
- [BooleanSchema](schema/BooleanSchema.md): Schema that defines a valid boolean.
- [PhoneSchema](schema/PhoneSchema.md): Schema that defines a valid phone number.
- [URISchema](schema/URISchema.md): Schema that defines a valid absolute URI string.
- [UUIDSchema](schema/UUIDSchema.md): Schema that defines a valid UUID string (versions 1-5). Defaults to any-version validation.
- [DictionarySchema](schema/DictionarySchema.md): Schema that validates a dictionary object whose entries all share the same value schema and have string keys.
- [DateSchema](schema/DateSchema.md): Schema that defines a valid date stored as a YYYY-MM-DD string, e.g. 2005-09-12.
- [EntitySchema](schema/EntitySchema.md): Schema that validates an Entity string combining a type and ID, e.g. challenge:a1b2c3.
- [NullableSchema](schema/NullableSchema.md): Schema that wraps a source schema and additionally allows null.
- [EmailSchema](schema/EmailSchema.md): Schema that defines a valid email address.
- [ThroughSchema](schema/ThroughSchema.md): Schema that wraps and passes through to a source schema, used as a base for schemas that augment another schema's behaviour (e.g. NullableSchema, OptionalSchema, RequiredSchema).
- [UpdatesSchema](schema/UpdatesSchema.md): Schema that validates an Updates object against the schema of the data object it changes.
- [SlugSchema](schema/SlugSchema.md): Schema that defines a valid slug, e.g. this-is-a-slug.
- [PasswordSchema](schema/PasswordSchema.md): Schema that defines a valid password string.
- [CountrySchema](schema/CountrySchema.md): Schema that defines a valid ISO 3166 country code, e.g. GB.
- [FileSchema](schema/FileSchema.md): Schema that validates a file name matching one or more extensions.
- [URLSchema](schema/URLSchema.md): Schema that defines a valid absolute or relative URL string.
- [KeySchema](schema/KeySchema.md): Schema that validates a database key string, stripping any non-alphanumeric characters.
- [OptionalSchema](schema/OptionalSchema.md): Schema that wraps a source schema and additionally allows undefined.
- [ChoiceSchema](schema/ChoiceSchema.md): Schema that validates a value against a fixed set of allowed string choices.
- [TimeSchema](schema/TimeSchema.md): Schema that defines a valid abstract time in 24h hh:mm:ss.fff format, e.g. 23:59 or 24:00.
- [RequiredSchema](schema/RequiredSchema.md): Schema that wraps a source schema but rejects a falsy result.
- [Schema](schema/Schema.md): Schema is an object instance with a validate() method that converts unknown input into a known, valid type T.
- [ImageSchema](schema/ImageSchema.md): Schema that validates the file name of an image.
- [NumberSchema](schema/NumberSchema.md): Schema that defines a valid number.
- [MediaSchema](schema/MediaSchema.md): Schema that validates the file name of an image or a video.
- [CurrencyCodeSchema](schema/CurrencyCodeSchema.md): Schema that defines a valid ISO 4217 currency code, e.g. GBP.
- [DateTimeSchema](schema/DateTimeSchema.md): Schema that defines a valid UTC datetime in ISO 8601 format, e.g. 2005-09-12T18:15:00.000Z.
- [QuerySchema](schema/QuerySchema.md): Schema that validates a Query against the schema of the data objects it filters and sorts.
- [VideoSchema](schema/VideoSchema.md): Schema that validates the file name of a video.

## Interfaces

- [StringSchemaOptions](schema/StringSchemaOptions.md): Options for StringSchema.
- [AddressSchemaOptions](schema/AddressSchemaOptions.md): Allowed options for AddressSchema.
- [ColorSchemaOptions](schema/ColorSchemaOptions.md): Options for a ColorSchema.
- [DataSchemaOptions](schema/DataSchemaOptions.md): Options for DataSchema.
- [CurrencyAmountSchemaOptions](schema/CurrencyAmountSchemaOptions.md): Options for CurrencyAmountSchema.
- [ArraySchemaOptions](schema/ArraySchemaOptions.md): Options for ArraySchema.
- [BooleanSchemaOptions](schema/BooleanSchemaOptions.md): Allowed options for BooleanSchema.
- [PhoneSchemaOptions](schema/PhoneSchemaOptions.md): Options for a PhoneSchema.
- [URISchemaOptions](schema/URISchemaOptions.md): Options for URISchema.
- [UUIDSchemaOptions](schema/UUIDSchemaOptions.md): Options for a UUIDSchema.
- [DictionarySchemaOptions](schema/DictionarySchemaOptions.md): Options for DictionarySchema.
- [DateSchemaOptions](schema/DateSchemaOptions.md): Options for DateSchema.
- [EntitySchemaOptions](schema/EntitySchemaOptions.md): Options for EntitySchema.
- [NullableSchemaOptions](schema/NullableSchemaOptions.md): Allowed options for NullableSchema.
- [EmailSchemaOptions](schema/EmailSchemaOptions.md): Options for an EmailSchema.
- [ThroughSchemaOptions](schema/ThroughSchemaOptions.md): Allowed options for ThroughSchema.
- [UpdatesSchemaOptions](schema/UpdatesSchemaOptions.md): Options for UpdatesSchema.
- [SlugSchemaOptions](schema/SlugSchemaOptions.md): Options for a SlugSchema.
- [CountrySchemaOptions](schema/CountrySchemaOptions.md): Options for CountrySchema.
- [FileSchemaOptions](schema/FileSchemaOptions.md): Allowed options for FileSchema.
- [URLSchemaOptions](schema/URLSchemaOptions.md): Options for URLSchema.
- [OptionalSchemaOptions](schema/OptionalSchemaOptions.md): Allowed options for OptionalSchema.
- [ChoiceSchemaOptions](schema/ChoiceSchemaOptions.md): Options for ChoiceSchema.
- [NumberSchemaOptions](schema/NumberSchemaOptions.md): Allowed options for NumberSchema.
- [MediaSchemaOptions](schema/MediaSchemaOptions.md): Allowed options for MediaSchema.
- [CurrencyCodeSchemaOptions](schema/CurrencyCodeSchemaOptions.md): Options for CurrencyCodeSchema.
- [QuerySchemaOptions](schema/QuerySchemaOptions.md): Options for QuerySchema.

## Types

- [StringInputType](schema/StringInputType.md): type="" prop for HTML <input /> tags that are relevant for strings.
- [DateInputType](schema/DateInputType.md): type="" prop for HTML <input /> tags that are relevant for dates.
- [ChoiceOptions](schema/ChoiceOptions.md): Dictionary of allowed options for a ChoiceSchema in { key: title } format.
- [PossibleChoiceOptions](schema/PossibleChoiceOptions.md): Things that can be converted to a ChoiceOptions dictionary.
- [ChoiceInputType](schema/ChoiceInputType.md): Input control hint for a ChoiceSchema: "radio" for radio inputs, or "select" for a <select>.
- [SchemaOptions](schema/SchemaOptions.md): Options allowed by a Schema instance.
- [SchemaType](schema/SchemaType.md): Extract the validated value type T from a Schema<T>.
- [Schemas](schema/Schemas.md): A set of named schemas in { name: schema } format.

## Constants

- [STRING](schema/STRING.md): Sugar instance of StringSchema for an unconstrained string. Equivalent to new StringSchema({}).
- [REQUIRED_STRING](schema/REQUIRED_STRING.md): Sugar instance of StringSchema requiring at least one character. Equivalent to new StringSchema({ min: 1 }).
- [TITLE](schema/TITLE.md): Sugar instance of StringSchema for a title of 1–100 characters. Equivalent to new StringSchema({ one: "title", title: "Title", min: 1, max: 100 }).
- [NULLABLE_TITLE](schema/NULLABLE_TITLE.md): Sugar instance allowing a TITLE or null. Equivalent to NULLABLE(TITLE).
- [NAME](schema/NAME.md): Sugar instance of StringSchema for a name of 1–100 characters. Equivalent to new StringSchema({ one: "name", title: "Name", min: 1, max: 100 }).
- [NULLABLE_NAME](schema/NULLABLE_NAME.md): Sugar instance allowing a NAME or null. Equivalent to NULLABLE(NAME).
- [ADDRESS](schema/ADDRESS.md): Sugar instance of AddressSchema for postal address data. Equivalent to new AddressSchema({}).
- [NULLABLE_ADDRESS](schema/NULLABLE_ADDRESS.md): Sugar instance allowing an ADDRESS or null. Equivalent to NULLABLE(ADDRESS).
- [COLOR](schema/COLOR.md): Sugar instance of ColorSchema for a required hex color string, e.g. #00CCFF. Equivalent to new ColorSchema({}).
- [NULLABLE_COLOR](schema/NULLABLE_COLOR.md): Sugar instance allowing a COLOR or null. Equivalent to NULLABLE(COLOR).
- [USD_AMOUNT](schema/USD_AMOUNT.md): Sugar instance of CurrencyAmountSchema for a US dollar amount. Equivalent to new CurrencyAmountSchema({ currency: "USD" }).
- [GBP_AMOUNT](schema/GBP_AMOUNT.md): Sugar instance of CurrencyAmountSchema for a pound sterling amount. Equivalent to new CurrencyAmountSchema({ currency: "GBP" }).
- [EUR_AMOUNT](schema/EUR_AMOUNT.md): Sugar instance of CurrencyAmountSchema for a euro amount. Equivalent to new CurrencyAmountSchema({ currency: "EUR" }).
- [NULLABLE_USD_AMOUNT](schema/NULLABLE_USD_AMOUNT.md): Sugar instance allowing a USD_AMOUNT or null. Equivalent to NULLABLE(USD_AMOUNT).
- [NULLABLE_GBP_AMOUNT](schema/NULLABLE_GBP_AMOUNT.md): Sugar instance allowing a GBP_AMOUNT or null. Equivalent to NULLABLE(GBP_AMOUNT).
- [NULLABLE_EUR_AMOUNT](schema/NULLABLE_EUR_AMOUNT.md): Sugar instance allowing an EUR_AMOUNT or null. Equivalent to NULLABLE(EUR_AMOUNT).
- [BOOLEAN](schema/BOOLEAN.md): Sugar instance of BooleanSchema for a coerced boolean. Equivalent to new BooleanSchema({}).
- [PHONE](schema/PHONE.md): Sugar instance of PhoneSchema for a valid phone number. Equivalent to new PhoneSchema({}).
- [NULLABLE_PHONE](schema/NULLABLE_PHONE.md): Sugar instance allowing a PHONE or null. Equivalent to NULLABLE(PHONE).
- [URI_SCHEMA](schema/URI_SCHEMA.md): Sugar instance of URISchema for an absolute URI string. Equivalent to new URISchema({}).
- [NULLABLE_URI_SCHEMA](schema/NULLABLE_URI_SCHEMA.md): Sugar instance allowing a URI_SCHEMA or null. Equivalent to NULLABLE(URI_SCHEMA).
- [UUID](schema/UUID.md): Sugar instance of UUIDSchema for any valid UUID (versions 1-5). Equivalent to new UUIDSchema({ title: "ID" }).
- [NULLABLE_UUID](schema/NULLABLE_UUID.md): Sugar instance allowing a UUID or null. Equivalent to NULLABLE(UUID).
- [DATE](schema/DATE.md): Sugar instance of DateSchema for a required date. Equivalent to new DateSchema({}).
- [NULLABLE_DATE](schema/NULLABLE_DATE.md): Sugar instance allowing a DATE or null. Equivalent to NULLABLE(DATE).
- [ENTITY](schema/ENTITY.md): Sugar instance of EntitySchema for an entity string, e.g. challenge:a1b2c3. Equivalent to new EntitySchema({}).
- [NULLABLE_ENTITY](schema/NULLABLE_ENTITY.md): Sugar instance allowing an ENTITY or null. Equivalent to NULLABLE(ENTITY).
- [EMAIL](schema/EMAIL.md): Sugar instance of EmailSchema for a valid email address. Equivalent to new EmailSchema({}).
- [NULLABLE_EMAIL](schema/NULLABLE_EMAIL.md): Sugar instance allowing an EMAIL or null. Equivalent to NULLABLE(EMAIL).
- [SLUG](schema/SLUG.md): Sugar instance of SlugSchema for a valid slug. Equivalent to new SlugSchema({}).
- [NULLABLE_SLUG](schema/NULLABLE_SLUG.md): Sugar instance allowing a SLUG or null. Equivalent to NULLABLE(SLUG).
- [PASSWORD](schema/PASSWORD.md): Sugar instance of PasswordSchema for a password string. Equivalent to new PasswordSchema({}).
- [COUNTRY](schema/COUNTRY.md): Sugar instance of CountrySchema for a required ISO 3166 country code, e.g. GB. Equivalent to new CountrySchema({}).
- [NULLABLE_COUNTRY](schema/NULLABLE_COUNTRY.md): Sugar instance allowing a COUNTRY or null. Equivalent to NULLABLE(COUNTRY).
- [FILE](schema/FILE.md): Sugar instance of FileSchema for a file name, e.g. file.txt. Equivalent to new FileSchema({}).
- [NULLABLE_FILE](schema/NULLABLE_FILE.md): Sugar instance allowing a FILE or null. Equivalent to NULLABLE(FILE).
- [URL_SCHEMA](schema/URL_SCHEMA.md): Sugar instance of URLSchema for an absolute or relative URL string. Equivalent to new URLSchema({}).
- [NULLABLE_URL_SCHEMA](schema/NULLABLE_URL_SCHEMA.md): Sugar instance allowing a URL_SCHEMA or null. Equivalent to NULLABLE(URL_SCHEMA).
- [KEY](schema/KEY.md): Sugar instance of KeySchema for a database key. Equivalent to new KeySchema({ title: "ID" }).
- [NULLABLE_KEY](schema/NULLABLE_KEY.md): Sugar instance allowing a KEY or null. Equivalent to NULLABLE(KEY).
- [TIME](schema/TIME.md): Sugar instance of TimeSchema for a required abstract time. Equivalent to new TimeSchema({}).
- [NULLABLE_TIME](schema/NULLABLE_TIME.md): Sugar instance allowing a TIME or null. Equivalent to NULLABLE(TIME).
- [UNKNOWN](schema/UNKNOWN.md): Unknown validator that always passes through its input value as unknown.
- [UNDEFINED](schema/UNDEFINED.md): Undefined validator that always returns undefined.
- [NULL](schema/NULL.md): Null validator that always returns null.
- [IMAGE](schema/IMAGE.md): Sugar instance of ImageSchema for an image file name, e.g. photo.jpg. Equivalent to new ImageSchema({}).
- [NULLABLE_IMAGE](schema/NULLABLE_IMAGE.md): Sugar instance allowing an IMAGE or null. Equivalent to NULLABLE(IMAGE).
- [NUMBER](schema/NUMBER.md): Sugar instance of NumberSchema for an unconstrained number. Equivalent to new NumberSchema({ title: "Number" }).
- [NULLABLE_NUMBER](schema/NULLABLE_NUMBER.md): Sugar instance allowing a NUMBER or null. Equivalent to NULLABLE(NUMBER).
- [INTEGER](schema/INTEGER.md): Sugar instance of NumberSchema for an integer. Equivalent to new NumberSchema({ step: 1, min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER }).
- [POSITIVE_INTEGER](schema/POSITIVE_INTEGER.md): Sugar instance of NumberSchema for a positive integer (excluding zero). Equivalent to new NumberSchema({ step: 1, min: 1, max: Number.MAX_SAFE_INTEGER }).
- [NON_NEGATIVE_INTEGER](schema/NON_NEGATIVE_INTEGER.md): Sugar instance of NumberSchema for a non-negative integer (including zero). Equivalent to new NumberSchema({ step: 1, min: 0, max: Number.MAX_SAFE_INTEGER }).
- [NEGATIVE_INTEGER](schema/NEGATIVE_INTEGER.md): Sugar instance of NumberSchema for a negative integer (excluding zero). Equivalent to new NumberSchema({ step: 1, min: Number.MIN_SAFE_INTEGER, max: -1 }).
- [NON_POSITIVE_INTEGER](schema/NON_POSITIVE_INTEGER.md): Sugar instance of NumberSchema for a non-positive integer (including zero). Equivalent to new NumberSchema({ step: 1, min: Number.MIN_SAFE_INTEGER, max: 0 }).
- [NULLABLE_INTEGER](schema/NULLABLE_INTEGER.md): Sugar instance allowing an INTEGER or null. Equivalent to NULLABLE(INTEGER).
- [TIMESTAMP](schema/TIMESTAMP.md): Sugar instance of NumberSchema for a Unix timestamp (including milliseconds). Equivalent to new NumberSchema({ title: "Timestamp", step: 1, min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER }).
- [NULLABLE_TIMESTAMP](schema/NULLABLE_TIMESTAMP.md): Sugar instance — alias of NULLABLE_INTEGER. Equivalent to NULLABLE_INTEGER.
- [MEDIA](schema/MEDIA.md): Sugar instance of MediaSchema for an image or video file name, e.g. photo.jpg. Equivalent to new MediaSchema({}).
- [NULLABLE_MEDIA](schema/NULLABLE_MEDIA.md): Sugar instance allowing a MEDIA or null. Equivalent to NULLABLE(MEDIA).
- [CURRENCY_CODE](schema/CURRENCY_CODE.md): Sugar instance of CurrencyCodeSchema for a required ISO 4217 currency code, e.g. GBP. Equivalent to new CurrencyCodeSchema({}).
- [NULLABLE_CURRENCY_CODE](schema/NULLABLE_CURRENCY_CODE.md): Sugar instance allowing a CURRENCY_CODE or null. Equivalent to NULLABLE(CURRENCY_CODE).
- [DATETIME](schema/DATETIME.md): Sugar instance of DateTimeSchema for a required UTC datetime. Equivalent to new DateTimeSchema({}).
- [NULLABLE_DATETIME](schema/NULLABLE_DATETIME.md): Sugar instance allowing a DATETIME or null. Equivalent to NULLABLE(DATETIME).
- [VIDEO](schema/VIDEO.md): Sugar instance of VideoSchema for a video file name, e.g. clip.mp4. Equivalent to new VideoSchema({}).
- [NULLABLE_VIDEO](schema/NULLABLE_VIDEO.md): Sugar instance allowing a VIDEO or null. Equivalent to NULLABLE(VIDEO).
