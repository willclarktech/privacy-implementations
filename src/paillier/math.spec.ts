import {
	calculateMu,
	createL,
	getBitLength,
	greatestCommonDivisor,
	lowestCommonMultiple,
} from "./math";

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

describe("createL", () => {
	const n = 15n;
	const L = createL(n);

	test("creates a function", () => {
		expect(typeof L).toBe("function");
	});

	test("created function implements L", () => {
		const x = 136n;
		const expected = 9n;
		const actual = L(x);
		expect(actual).toStrictEqual(expected);
	});
});

describe("greatestCommonDivisor", () => {
	test("calculates greatest common denominator", () => {
		const a = 18n;
		const b = 300n;
		const expected = 6n;
		const actual = greatestCommonDivisor(a, b);
		expect(actual).toStrictEqual(expected);
	});
});

describe("lowestCommonMultiple", () => {
	test("calculates least common multiple", () => {
		const a = 18n;
		const b = 300n;
		const expected = 900n;
		const actual = lowestCommonMultiple(a, b);
		expect(actual).toStrictEqual(expected);
	});
});

describe("calculateMu", () => {
	test("calculates mu", () => {
		const g = 848n;
		const lambda = 144n;
		const n = 323n;
		const expected = 1n;
		const actual = calculateMu(g, lambda, n);
		expect(actual).toStrictEqual(expected);
	});
});
