import { Party } from "./";

describe("Elliptic Curve Diffie-Hellman", () => {
	it("successfully completes key exchange", () => {
		const alice = new Party();
		const bob = new Party();

		const aliceSharedSecret = alice.raise(bob.intermediateValue);
		const bobSharedSecret = bob.raise(alice.intermediateValue);

		expect(bobSharedSecret).toStrictEqual(aliceSharedSecret);
		expect(aliceSharedSecret).not.toBeNull();
		expect(aliceSharedSecret).not.toBeNaN();
		expect(aliceSharedSecret).toBeGreaterThanOrEqual(1);
	});

	it("successfully inverts a reraise", () => {
		const alice = new Party();
		const bob = new Party();

		const plainText = 123n;
		const raisedByAlice = alice.raise(plainText, true);
		const raisedByBob = bob.raise(plainText, true);
		const raisedByBoth = bob.raise(raisedByAlice);
		const invertedByAlice = alice.raiseInverse(raisedByBoth);

		expect(invertedByAlice).toStrictEqual(raisedByBob);
	});
});
