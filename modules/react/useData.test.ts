import type { AsyncItemReference, ItemState } from "../index.js";
import { useData } from "./index.js";

test.skip("Typescript", () => {
	type ProfileData = { name: string; age: number };
	type DogData = { name: string; breed: string };

	const a1 = useData(undefined as unknown as AsyncItemReference<ProfileData>);
	const a2: ItemState<ProfileData> = a1;

	const b1 = useData(undefined as AsyncItemReference<ProfileData> | undefined);
	const b2: ItemState<ProfileData> | undefined = b1;

	const c1 = useData(undefined as unknown as AsyncItemReference<ProfileData>, undefined as unknown as AsyncItemReference<DogData>);
	const c2: [ItemState<ProfileData>, ItemState<DogData>] = c1;
});
test("Empty", () => {
	expect(true).toBe(true);
});
