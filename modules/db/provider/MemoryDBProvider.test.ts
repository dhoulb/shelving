import { MemoryDBProvider } from "shelving/db";
import { testDBProvider } from "../../test/index.js";

// Run the universal DBProvider contract suite against MemoryDBProvider.
testDBProvider("MemoryDBProvider", () => new MemoryDBProvider<string>());
