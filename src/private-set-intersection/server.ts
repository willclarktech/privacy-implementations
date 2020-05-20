import { BloomFilter } from "../data-structure/bloom-filter";
import { bigInt2Buffer } from "../util";
import { Shared } from "./shared";

export type ServerOptions = {
	readonly falsePositiveRate?: number;
};

export type IntersectionResponse = {
	readonly clientEncryptedValues: readonly bigint[];
	readonly serverIntermediateValues: readonly bigint[];
};

export type IntersectionFilterResponse = {
	readonly clientEncryptedValues: readonly bigint[];
	readonly filter: BloomFilter;
};

const defaultOptions = {
	falsePositiveRate: 0.001,
};

export class Server extends Shared {
	private readonly falsePositiveRate: number;

	constructor(initialSet: Set<bigint>, options: ServerOptions = {}) {
		const { falsePositiveRate } = { ...defaultOptions, ...options };
		super(initialSet);
		this.falsePositiveRate = falsePositiveRate;
	}

	public revealIntersection(
		clientIntermediateValues: readonly bigint[],
	): IntersectionResponse {
		return {
			clientEncryptedValues: this.handleClientIntermediateValues(
				clientIntermediateValues,
			),
			serverIntermediateValues: this.prepareIntermediateValues(),
		};
	}

	public revealIntersectionSize(
		clientIntermediateValues: readonly bigint[],
	): IntersectionResponse {
		const {
			clientEncryptedValues,
			serverIntermediateValues,
		} = this.revealIntersection(clientIntermediateValues);
		return {
			// NOTE: Sorting is a secure shuffle because the encrypted values
			// are indistinguishable from random without the server’s secret
			clientEncryptedValues: Array.from(clientEncryptedValues).sort(),
			serverIntermediateValues,
		};
	}

	public revealIntersectionFilter(
		clientIntermediateValues: readonly bigint[],
		falsePositiveRate = this.falsePositiveRate,
	): IntersectionFilterResponse {
		const {
			clientEncryptedValues,
			serverIntermediateValues,
		} = this.revealIntersection(clientIntermediateValues);
		return {
			clientEncryptedValues,
			filter: Server.createBloomFilter(
				serverIntermediateValues,
				falsePositiveRate,
				clientEncryptedValues.length,
			),
		};
	}

	public revealIntersectionSizeFilter(
		clientIntermediateValues: readonly bigint[],
		falsePositiveRate = this.falsePositiveRate,
	): IntersectionFilterResponse {
		const {
			clientEncryptedValues,
			serverIntermediateValues,
		} = this.revealIntersectionSize(clientIntermediateValues);
		return {
			clientEncryptedValues,
			filter: Server.createBloomFilter(
				serverIntermediateValues,
				falsePositiveRate,
				clientEncryptedValues.length,
			),
		};
	}

	private handleClientIntermediateValues(
		clientIntermediateValues: readonly bigint[],
	): readonly bigint[] {
		return clientIntermediateValues.map((value) => this.party.raise(value));
	}

	public static createBloomFilter(
		values: readonly bigint[],
		falsePositiveRate: number,
		numQueries: number,
	): BloomFilter {
		const adjustedFalsePositiveRate =
			numQueries === 0 ? falsePositiveRate : falsePositiveRate / numQueries;
		return BloomFilter.from(
			values.map((value) => bigInt2Buffer(value)),
			values.length,
			adjustedFalsePositiveRate,
		);
	}
}
