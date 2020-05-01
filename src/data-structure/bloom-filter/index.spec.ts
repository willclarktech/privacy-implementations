import { randomBytes } from "crypto";

import { bigInt2Buffer, buffer2BigInt } from "../../utils";
import { BloomFilter } from "./";

const bruteForce = (
	bloomFilter: BloomFilter,
	domainByteSize: number,
	deadline: number,
): readonly Buffer[] => {
	const foundEntries = [];
	for (
		let candidate = 0n;
		candidate < (2 ** 8) ** domainByteSize;
		++candidate
	) {
		const element = bigInt2Buffer(candidate);
		if (bloomFilter.has(element)) {
			foundEntries.push(element);
		}
		if (Date.now() > deadline) {
			throw new Error("Brute force ran out of time");
		}
	}
	return foundEntries;
};

describe("Bloom filter", () => {
	const capacity = 100;
	const falsePositiveRate = 0.001;
	const feasibleTime = 20_000;
	const acceptableBruteForceRatio = 10;

	it("creates a filter from a pre-existing set", () => {
		const numElements = 5;
		const set = new Set(
			Array.from({ length: numElements }, (_, i) => Buffer.from([i])),
		);

		const bloomFilter = BloomFilter.from(set, capacity, falsePositiveRate);

		expect(bloomFilter.length).toStrictEqual(numElements);
		expect([...set].every(bloomFilter.has.bind(bloomFilter))).toStrictEqual(
			true,
		);
	});

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

	it("leaks entries for small domains", () => {
		const bloomFilter = new BloomFilter(capacity, falsePositiveRate);
		const numElements = 33;
		const domainByteSize = 2;
		const elements = Array.from({ length: numElements }, () =>
			Buffer.concat([
				Buffer.alloc(8 - domainByteSize, 0),
				randomBytes(domainByteSize),
			]),
		);

		elements.forEach(bloomFilter.add.bind(bloomFilter));

		const deadline = Date.now() + feasibleTime;
		const results = bruteForce(bloomFilter, domainByteSize, deadline);

		elements.forEach((element) => expect(results).toContainEqual(element));
		expect(results.length).toBeLessThanOrEqual(
			elements.length * acceptableBruteForceRatio,
		);
	});

	it("cannot be brute forced for large domains", () => {
		const bloomFilter = new BloomFilter(capacity, falsePositiveRate);
		const numElements = 33;
		const domainByteSize = 8;
		const elements = Array.from({ length: numElements }, () =>
			randomBytes(domainByteSize),
		);

		elements.forEach(bloomFilter.add.bind(bloomFilter));

		const deadline = Date.now() + feasibleTime;
		expect(
			bruteForce.bind(null, bloomFilter, domainByteSize, deadline),
		).toThrowError(/brute force ran out of time/i);
	});
});
