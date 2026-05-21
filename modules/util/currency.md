# Currency code helpers

Validate ISO 4217 currency codes and retrieve display metadata (symbol, smallest unit step) using the runtime's built-in `Intl` API. The list of supported codes comes from `Intl.supportedValuesOf("currency")` so it stays current without a bundled lookup table.

- `getCurrencyCode` normalises to uppercase and returns `undefined` for unrecognised codes; `requireCurrencyCode` throws instead.
- `getCurrencyStep` returns `0.01` for most currencies (e.g. USD, GBP), `1` for zero-decimal currencies (e.g. JPY), and smaller fractions for some crypto.

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

## See also

- [util](/util) — full util module overview
