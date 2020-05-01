import { Shared, SharedOptions } from "./shared";

export type ServerOptions = SharedOptions;

export type IntersectionResponse = {
	readonly clientEncryptedValues: readonly bigint[];
	readonly serverIntermediateValues: readonly bigint[];
};

export class Server extends Shared {
	constructor(initialSet: Set<number>, options: ServerOptions = {}) {
		super(initialSet, options);
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

	private handleClientIntermediateValues(
		clientIntermediateValues: readonly bigint[],
	): readonly bigint[] {
		return clientIntermediateValues.map(this.party.raise.bind(this.party));
	}
}
