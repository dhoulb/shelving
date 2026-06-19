# Geographic helpers

Country codes, names, and address formatting. Provides the `COUNTRIES` lookup (ISO 3166-1 alpha-2), typed `Country` and `AddressData` types, and helpers for parsing and displaying country information.

**Things to know:**

- `getCountry()` with `"detect"` reads `navigator.language` in the browser to guess the user's country — it returns `undefined` in non-browser environments or when the locale cannot be mapped to a country code.
- `formatCountry()` is tolerant of unknown codes — it returns the input string unchanged rather than throwing.

## Usage

### Looking up and validating countries

```ts
import { getCountry, requireCountry, formatCountry } from "shelving/util";

getCountry("gb");          // "GB"
getCountry("XX");          // undefined  (unknown code)
getCountry("detect");      // "US"  (inferred from navigator.language in browser)

requireCountry("gb");      // "GB"
requireCountry("XX");      // throws RequiredError

formatCountry("GB");       // "United Kingdom"
formatCountry("XX");       // "XX"  (passthrough for unknown codes)
```

### Formatting addresses

```ts
import { formatAddress } from "shelving/util";

const addr = {
  address1: "10 Downing Street",
  address2: "",
  city: "London",
  state: "England",
  postcode: "SW1A 2AA",
  country: "GB",
};

formatAddress(addr);
// "10 Downing Street\nLondon\nEngland\nSW1A 2AA\nUnited Kingdom"
```

### Using the countries map directly

```ts
import { COUNTRIES } from "shelving/util";

const name = COUNTRIES["FR"]; // "France"
const codes = Object.keys(COUNTRIES); // ["AF", "AX", ...]
```
