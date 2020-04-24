import { bigInt2Buffer, buffer2BigInt } from "../utils";
import { BloomFilter } from "./";

describe("Bloom filter", () => {
	const capacity = 100;
	const falsePositiveRate = 0.001;

	it("can add elements up to its capacity", () => {
		const bloomFilter = new BloomFilter(capacity, falsePositiveRate);
		const elements = Array.from({ length: capacity }, (_, i: number) =>
			bigInt2Buffer(BigInt(i)),
		);

		expect(
			elements.forEach.bind(elements, bloomFilter.add.bind(bloomFilter)),
		).not.toThrowError();
	});

	it("throws when adding elements beyond its capacity", () => {
		const bloomFilter = new BloomFilter(capacity, falsePositiveRate);
		const elements = Array.from({ length: capacity + 1 }, (_, i) =>
			bigInt2Buffer(BigInt(i)),
		);

		expect(
			elements.forEach.bind(elements, bloomFilter.add.bind(bloomFilter)),
		).toThrowError(/bloom filter is at capacity/i);
	});

	it("shows number of elements", () => {
		const bloomFilter = new BloomFilter(capacity, falsePositiveRate);
		const numElements = 33;
		const elements = Array.from({ length: numElements }, (_, i) =>
			bigInt2Buffer(BigInt(i)),
		);

		elements.forEach(bloomFilter.add.bind(bloomFilter));
		expect(bloomFilter.length).toEqual(numElements);
	});

	it("confirms elements are definitely not present", () => {
		const bloomFilter = new BloomFilter(capacity, falsePositiveRate);
		const numElements = 33;
		const elements = Array.from({ length: numElements }, (_, i) =>
			bigInt2Buffer(BigInt(i)),
		);

		elements.forEach(bloomFilter.add.bind(bloomFilter));

		const numTestElements = 100_000;
		const testElements = Array.from({ length: numTestElements }, (_, i) =>
			bigInt2Buffer(BigInt(i)),
		);
		const negatives = testElements.filter(
			(element) => !bloomFilter.has(element),
		);
		const falseNegatives = negatives.filter(
			(element) => buffer2BigInt(element) < numElements,
		);

		const expected = 0;
		expect(falseNegatives.length).toStrictEqual(expected);
	});

	it("confirms elements are possibly present", () => {
		const bloomFilter = new BloomFilter(capacity, falsePositiveRate);
		const numElements = 33;
		const elements = Array.from({ length: numElements }, (_, i) =>
			bigInt2Buffer(BigInt(i)),
		);

		elements.forEach(bloomFilter.add.bind(bloomFilter));

		const numTestElements = 100_000;
		const testElements = Array.from({ length: numTestElements }, (_, i) =>
			bigInt2Buffer(BigInt(i)),
		);
		const positives = testElements.filter((element) =>
			bloomFilter.has(element),
		);
		const falsePositives = positives.filter(
			(element) => buffer2BigInt(element) >= numElements,
		);

		const expectedMax = Math.ceil(numTestElements * falsePositiveRate);
		expect(falsePositives.length).toBeLessThanOrEqual(expectedMax);
	});
});
