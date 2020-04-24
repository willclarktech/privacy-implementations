import { getBitLength } from "./";

describe("getBitLength", () => {
	it.each([
		[0n, 1],
		[1n, 1],
		[2n, 2],
		[3n, 2],
		[15n, 4],
		[16n, 5],
		[9007199254740992n, 54],
	])("calculates bit length for %d = %d", (a, expected) => {
		const actual = getBitLength(a);
		expect(actual).toStrictEqual(expected);
	});
});
