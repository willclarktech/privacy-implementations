import { bigInt2Buffer } from "../../util";
import { IntersectionFilterResponse, IntersectionResponse } from "./server";
import { Shared } from "./shared";

export class Client extends Shared {
	constructor(initialSet: Set<bigint>) {
		super(initialSet);
	}

	public handleIntersectionResponse({
		clientEncryptedValues,
		serverIntermediateValues,
	}: IntersectionResponse): readonly bigint[] {
		const serverEncryptedValues = new Set(
			serverIntermediateValues.map((value) => this.party.raise(value)),
		);
		// NOTE: Converting the set to an array like this must be a
		// deterministic operation on the same set used to generate the
		// client’s intermediate values originally sent to the server
		const clientValues = [...this.set.values()];
		return clientEncryptedValues.reduce(
			(intersection: readonly bigint[], encryptedValue, i) =>
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
			serverIntermediateValues.map((value) => this.party.raise(value)),
		);
		return clientEncryptedValues.reduce(
			(count, encryptedValue) =>
				serverEncryptedValues.has(BigInt(encryptedValue)) ? count + 1 : count,
			0,
		);
	}

	public handleIntersectionFilterResponse({
		clientEncryptedValues,
		filter,
	}: IntersectionFilterResponse): readonly bigint[] {
		// NOTE: Converting the set to an array like this must be a
		// deterministic operation on the same set used to generate the
		// client’s intermediate values originally sent to the server
		const clientValues = [...this.set.values()];
		return clientEncryptedValues.reduce(
			(intersection: readonly bigint[], encryptedValue, i) => {
				const decryptedValue = bigInt2Buffer(
					this.party.raiseInverse(encryptedValue),
				);
				return filter.has(decryptedValue)
					? [...intersection, clientValues[i]]
					: intersection;
			},
			[],
		);
	}

	public handleIntersectionSizeFilterResponse({
		clientEncryptedValues,
		filter,
	}: IntersectionFilterResponse): number {
		const serverIntermediateValues = clientEncryptedValues.map((value) =>
			bigInt2Buffer(this.party.raiseInverse(value)),
		);
		return serverIntermediateValues.reduce(
			(count, value) => (filter.has(value) ? count + 1 : count),
			0,
		);
	}
}
