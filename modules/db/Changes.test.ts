import { AsyncDatabase, Changes, DataUpdate } from "../index.js";

type Collections = {
	collection1: { one: number; bool: boolean };
	collection2: { two: number; bool: boolean };
	collection3: { three: number; bool: boolean };
};

test("Typescript", () => {
	const operations1: Changes<Collections> = {
		"collection1/a1": { one: 1, bool: false },
		"collection1/b2": null,
		"collection1/b3": new DataUpdate<{ one: number; bool: boolean }>({ bool: true }),
		"collection2/a1": { two: 1, bool: false },
		"collection2/b2": null,
		"collection2/c3": new DataUpdate<{ two: number; bool: boolean }>({ bool: true }),
	};

	// Check the keys.
	const operations2: Changes<Collections> = {
		// @ts-expect-error
		"NOTCOLLECTION/a1": { a: 1, bool: false },
	};

	// Check the values.
	const operations3: Changes<Collections> = {
		"collection1/a1": {
			one: 1,
			// @ts-expect-error
			bool: "NOTBOOL",
		},
	};

	// Check some objects.
	const db = new AsyncDatabase<Collections>(undefined as any);

	const changes: Changes<Collections> = {
		...db.item("collection1", "a1").getUpdate({ bool: true }),
		...db.item("collection2", "b2").getSet({ two: 123, bool: false }),
		...db.item("collection2", "b2").getDelete(),
	};

	// Merging changes.
	const changes1: Changes<Collections> = {};
	const changes2: Changes<Collections> = {};
	const changes3: Changes<Collections> = { ...changes1, ...changes2 };
});
