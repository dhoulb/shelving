# shelving/util/currency

- Kind: module
- Import: `import { … } from "shelving/util/currency";`

Validate ISO 4217 currency codes and retrieve display metadata (symbol, smallest unit step) using the runtime's built-in `Intl` API. The list of supported codes comes from `Intl.supportedValuesOf("currency")` so it stays current without a bundled lookup table.

- `getCurrencyCode()` normalises to uppercase and returns `undefined` for unrecognised codes; `requireCurrencyCode()` throws instead.
- `getCurrencyStep()` returns `0.01` for most currencies (e.g. USD, GBP), `1` for zero-decimal currencies (e.g. JPY), and smaller fractions for some crypto.

## Usage

### Validating a code

```ts
import { getCurrencyCode, requireCurrencyCode, CURRENCY_CODES } from "shelving/util";

getCurrencyCode("gbp");   // "GBP"
getCurrencyCode("XYZ");   // undefined

requireCurrencyCode("GBP"); // "GBP"
requireCurrencyCode("XYZ"); // throws RequiredError

CURRENCY_CODES.includes("EUR"); // true
```

### Display symbol and step

```ts
import { getCurrencySymbol, getCurrencyStep } from "shelving/util";

getCurrencySymbol("GBP"); // "£"
getCurrencySymbol("USD"); // "$"
getCurrencySymbol("JPY"); // "¥"

getCurrencyStep("USD"); // 0.01
getCurrencyStep("JPY"); // 1
```


## Functions

- [getCurrencyCode()](currency/getCurrencyCode.md): Normalise a value to a valid ISO 4217 CurrencyCode, or undefined if it isn't a supported currency.
- [requireCurrencyCode()](currency/requireCurrencyCode.md): Normalise a value to a valid ISO 4217 CurrencyCode, or throw RequiredError if it isn't a supported currency.
- [getCurrencySymbol()](currency/getCurrencySymbol.md): Get the display symbol used for a currency.
- [getCurrencyStep()](currency/getCurrencyStep.md): Get the "step" value for a currency, i.e. the smallest fractional unit that is used for that currency.

## Types

- [CurrencyCode](currency/CurrencyCode.md): ISO 4217 currency code, e.g. GBP or USD.

## Constants

- [CURRENCY_CODES](currency/CURRENCY_CODES.md): Array of all ISO 4217 currency codes supported by the current runtime's Intl implementation.
