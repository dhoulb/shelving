import { AsyncItem, ItemState, AsyncDatabase, MemoryProvider } from "../index.js";
import { useData } from "./index.js";

test.skip("Typescript", () => {
	type DB = {
		profiles: { name: string; age: number };
		dogs: { name: string; breed: string };
	};

	const db = undefined as unknown as AsyncDatabase<DB>;

	const a1 = useData(new AsyncItem(db, "profiles", "1"));
	const a2: ItemState<DB, "profiles"> = a1;

	const b1 = useData(undefined as AsyncItem<DB, "profiles"> | undefined);
	const b2: ItemState<DB, "profiles"> | undefined = b1;

	const c1 = useData(new AsyncItem(db, "profiles", "1"), new AsyncItem(db, "dogs", "1"));
	const c2: [ItemState<DB, "profiles">, ItemState<DB, "dogs">] = c1;
});
