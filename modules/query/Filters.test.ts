import { Data, Filters } from "../index.js";

test("Filters: types", () => {
	const filter1: Filters<{ a: number }> = new Filters<{ a: number }>();
	// Should allow a wider type.
	const filter2: Filters<Data> = new Filters<{ a: number }>();
});
