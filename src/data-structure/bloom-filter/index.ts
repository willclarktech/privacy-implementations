import { createHash } from "crypto";

import { buffer2BigInt } from "../../util";
import { BitArray } from "../bit-array";

export class BloomFilter {
	private static HASH_ALGORITHM = "sha256";
	private static NONCES: readonly [number, number] = [1, 2];

	public readonly capacity: number;
	public readonly falsePositiveRate: number;

	private readonly numHashFunctions: number;
	private readonly bitLength: number;
	private readonly bitArray: BitArray;
	private count: number;

	constructor(capacity: number, falsePositiveRate: number) {
		if (falsePositiveRate <= 0 || falsePositiveRate >= 1) {
			throw new Error("False positive rate must be between 0 and 1");
		}

		this.capacity = capacity;
		this.falsePositiveRate = falsePositiveRate;

		this.numHashFunctions = BloomFilter.getNumHashFunctions(falsePositiveRate);
		this.bitLength = BloomFilter.getBitLength(capacity, falsePositiveRate);
		this.bitArray = new BitArray(this.bitLength);
		this.count = 0;
	}

	public get length(): number {
		return this.count;
	}

	public add(element: Buffer): void {
		if (this.count >= this.capacity) {
			throw new Error("Bloom filter is at capacity");
		}
		const hashes = this.getHashes(element);
		hashes.forEach((i: number) => {
			this.bitArray.set(i);
		});
		++this.count;
	}

	public has(element: Buffer): boolean {
		const hashes = this.getHashes(element);
		for (const i of hashes) {
			if (!this.bitArray.has(i)) {
				return false;
			}
		}
		return true;
	}

	public static from(
		iterable: Iterable<Buffer>,
		capacity: number,
		falsePositiveRate: number,
	): BloomFilter {
		const bloomFilter = new BloomFilter(capacity, falsePositiveRate);
		for (const element of iterable) {
			bloomFilter.add(element);
		}
		return bloomFilter;
	}

	private getHash(element: Buffer, nonce: number): number {
		const hash = createHash(BloomFilter.HASH_ALGORITHM);
		hash.update(Buffer.from([nonce]));
		hash.update(element);
		// Non-uniformity is negligible for filters of reasonable size
		return Number(buffer2BigInt(hash.digest()) % BigInt(this.bitLength));
	}

	private getHashes(element: Buffer): readonly number[] {
		const [h1, h2] = BloomFilter.NONCES.map(this.getHash.bind(this, element));
		return Array.from(
			{ length: this.numHashFunctions },
			(_, i: number) => (h1 + i * h2) % this.bitLength,
		);
	}

	private static getBitLength(
		capacity: number,
		falsePositiveRate: number,
	): number {
		return Math.ceil((-capacity * Math.log2(falsePositiveRate)) / Math.log(2));
	}

	private static getNumHashFunctions(falsePositiveRate: number): number {
		return Math.ceil(-Math.log2(falsePositiveRate));
	}
}
