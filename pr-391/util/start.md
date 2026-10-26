# shelving/util/start

- Kind: module
- Import: `import { … } from "shelving/util/start";`

Manage processes that have a start callback and an optional stop callback. `Starter` prevents double-starts and wraps errors, making it easy to build safe, disposable lifecycle objects.

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

`Starter` implements `Disposable`, so it works with `using`:

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

`STOPHOLE` is a start callback that always returns a no-op stop callback. Useful as a safe default.

```ts
import { STOPHOLE } from "shelving/util";

const noop = new Starter(STOPHOLE);
noop.start(); // fine — stop callback does nothing
```


## Functions

- [getStarter](start/getStarter.md): Get a Starter from a PossibleStarter.

## Classes

- [Starter](start/Starter.md): Wrapper class to handle state on start/stop callback process.

## Types

- [StartCallback](start/StartCallback.md): Callback function that starts something with multiple values and returns an optional stop callback.
- [StopCallback](start/StopCallback.md): Callback function that stops something.
- [PossibleStarter](start/PossibleStarter.md): Something that can be made into a Starter.

## Constants

- [STOPHOLE](start/STOPHOLE.md): Callback function that does nothing and returns a blackhole stop callback.
