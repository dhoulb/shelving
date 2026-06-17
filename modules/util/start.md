# Start/stop lifecycle helpers

Manage processes that have a start callback and an optional stop callback. [`Starter`](/util/start/Starter) prevents double-starts and wraps errors, making it easy to build safe, disposable lifecycle objects.

## Usage

### Basic start/stop

```ts
import { Starter } from "shelving/util";

const starter = new Starter(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id); // returned function is the stop callback
});

starter.start(); // begins the interval
starter.start(); // no-op — already started
starter.stop();  // calls the stop callback
```

### Using as a disposable

[`Starter`](/util/start/Starter) implements `Disposable`, so it works with `using`:

```ts
{
  using starter = new Starter(myStartCallback);
  starter.start();
  // starter.stop() called automatically when block exits
}
```

### Normalising a start callback or existing Starter

```ts
import { getStarter, type PossibleStarter } from "shelving/util";

function setup(s: PossibleStarter<[]>) {
  const starter = getStarter(s); // wraps a function; passes a Starter through unchanged
  starter.start();
}
```

### No-op stop placeholder

[`STOPHOLE`](/util/start/STOPHOLE) is a start callback that always returns a no-op stop callback. Useful as a safe default.

```ts
import { STOPHOLE } from "shelving/util";

const noop = new Starter(STOPHOLE);
noop.start(); // fine — stop callback does nothing
```
