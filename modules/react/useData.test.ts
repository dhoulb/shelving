import { AsyncItem, ItemState } from "../index.js";
import { useData } from "./index.js";

test.skip("Typescript", () => {
	type ProfileData = { name: string; age: number };
	type DogData = { name: string; breed: string };

	const a1 = useData(undefined as unknown as AsyncItem<ProfileData>);
	const a2: ItemState<ProfileData> = a1;

	const b1 = useData(undefined as AsyncItem<ProfileData> | undefined);
	const b2: ItemState<ProfileData> | undefined = b1;

	const c1 = useData(undefined as unknown as AsyncItem<ProfileData>, undefined as unknown as AsyncItem<DogData>);
	const c2: [ItemState<ProfileData>, ItemState<DogData>] = c1;
});
