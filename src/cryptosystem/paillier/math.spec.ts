import { calculateMu, createL } from "./math";

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
