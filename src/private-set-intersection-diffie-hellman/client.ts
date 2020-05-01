import { IntersectionResponse } from "./server";
import { Shared, SharedOptions } from "./shared";

export type ClientOptions = SharedOptions & {
	readonly p: bigint;
	readonly g: bigint;
};

export class Client extends Shared {
	constructor(initialSet: Set<number>, options: ClientOptions) {
		super(initialSet, options);
	}

	public handleIntersectionResponse({
		clientEncryptedValues,
		serverIntermediateValues,
	}: IntersectionResponse): readonly number[] {
		const serverEncryptedValues = new Set(
			serverIntermediateValues.map(this.party.raise.bind(this.party)),
		);
		// NOTE: Converting the set to an array like this must be a
		// deterministic operation on the same set used to generate the
		// client’s intermediate values originally sent to the server
		const clientValues = [...this.set.values()];
		return clientEncryptedValues.reduce(
			(intersection: readonly number[], encryptedValue, i) =>
				serverEncryptedValues.has(encryptedValue)
					? [...intersection, clientValues[i]]
					: intersection,
			[],
		);
	}

	public handleIntersectionSizeResponse({
		clientEncryptedValues,
		serverIntermediateValues,
	}: IntersectionResponse): number {
		const serverEncryptedValues = new Set(
			serverIntermediateValues.map(this.party.raise.bind(this.party)),
		);
		return clientEncryptedValues.reduce(
			(count, encryptedValue) =>
				serverEncryptedValues.has(encryptedValue) ? count + 1 : count,
			0,
		);
	}
}
