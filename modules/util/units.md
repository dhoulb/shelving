# Unit conversion and formatting helpers

These helpers model physical units of measure — mass, length, speed, area, volume, temperature, angles, percentages, and more — and let you convert amounts between units and format them for display. They exist so callers never have to hard-code conversion factors or wrangle `Intl.NumberFormat` unit options directly.

**Things to know:**

- Each [`UnitList`](/util/units/UnitList) is an [`ImmutableMap`](/util/map/ImmutableMap) of [`Unit`](/util/units/Unit) instances. The first entry in the list is always the **base unit** (e.g. `milligram` for [`MASS_UNITS`](/util/units/MASS_UNITS)).
- [`Unit.to()`](/util/units/Unit) and [`Unit.from()`](/util/units/Unit) both default to the base unit when no target/source key is given.
- Conversion can use a multiplier or a function; temperature conversions (°C ↔ °F) use functions.
- [`Unit.format()`](/util/units/Unit) delegates to `Intl.NumberFormat` for natively supported units (so `kilogram` is localised automatically) and falls back to a polyfill for custom units like `basis-point`.

## Usage

### Converting between units

```ts
import { MASS_UNITS, LENGTH_UNITS, TEMPERATURE_UNITS, SPEED_UNITS } from "shelving/util";

// Via the UnitList directly.
MASS_UNITS.convert(1, "kilogram", "pound");  // ≈ 2.205

// Via a Unit instance.
const km = LENGTH_UNITS.require("kilometer");
km.to(5, "mile");    // ≈ 3.107
km.from(26.2, "mile"); // ≈ 42.165

// Temperature (function-based conversion).
TEMPERATURE_UNITS.convert(100, "celsius", "fahrenheit"); // 212
```

### Formatting amounts

```ts
import { MASS_UNITS, VOLUME_UNITS } from "shelving/util";

MASS_UNITS.require("kilogram").format(2.5);                   // "2.5 kg"
VOLUME_UNITS.require("liter").format(1, { unitDisplay: "long" }); // "1 liter"
```

### Available unit lists and key types

| Export | Key type |
| --- | --- |
| `PERCENT_UNITS` | `PercentUnitKey` |
| `POINT_UNITS` | `PointUnitKey` |
| `ANGLE_UNITS` | `AngleUnitKey` |
| `MASS_UNITS` | `MassUnitKey` |
| `LENGTH_UNITS` | `LengthUnitKey` |
| `SPEED_UNITS` | `SpeedUnitKey` |
| `AREA_UNITS` | `AreaUnitKey` |
| `VOLUME_UNITS` | `VolumeUnitKey` |
| `TEMPERATURE_UNITS` | `TemperatureUnitKey` |
