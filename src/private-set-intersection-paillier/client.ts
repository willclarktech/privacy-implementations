import {
	decrypt,
	encrypt,
	generateKeysSync,
	KeyPair,
	PublicKey,
} from "../paillier";

export class Client {
	private readonly domainSize: number;
	private readonly set: Set<number>;
	private readonly keys: KeyPair;
	private readonly encrypt: (plainText: bigint) => bigint;
	private readonly decrypt: (cipherText: bigint) => bigint;

	constructor(domainSize: number, initialSet: Set<number>, bitLength?: number) {
		this.domainSize = domainSize;
		this.set = initialSet;
		this.keys = generateKeysSync(bitLength);
		this.encrypt = encrypt(this.publicKey);
		this.decrypt = decrypt(this.keys);
	}

	public get publicKey(): PublicKey {
		return this.keys.pub;
	}

	public addElement(element: number): void {
		this.set.add(element);
	}

	public removeElement(element: number): void {
		this.set.delete(element);
	}

	public getEncryptedValues(): readonly bigint[] {
		return Client.set2HotArray(this.domainSize, this.set).map(this.encrypt);
	}

	public handleIntersectionResponse(
		response: readonly bigint[],
	): readonly number[] {
		return response.reduce(
			(intersection: readonly number[], n, i) =>
				this.decrypt(n) ? [...intersection, i] : intersection,
			[],
		);
	}

	public handleIntersectionSizeResponse(response: bigint): number {
		return Number(this.decrypt(response));
	}

	public handleIntersectionNonEmptyResponse(response: bigint): boolean {
		return !!this.decrypt(response);
	}

	private static set2HotArray(
		arraySize: number,
		s: Set<number>,
	): readonly bigint[] {
		return [...new Array(arraySize)].map((_, i) => BigInt(s.has(i)));
	}
}
