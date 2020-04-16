import { decrypt, encrypt } from "./encryption";
import { add, multiply } from "./homomorphic-math";
import { generateKeysSync } from "./keys";

describe("add", () => {
	const keyPair = generateKeysSync();
	const encryptN = encrypt(keyPair.pub);
	const decryptN = decrypt(keyPair);

	it("adds two encrypted numbers", () => {
		const n1 = 123n;
		const n2 = 456n;
		const expected = 579n;

		const cipherText1 = encryptN(n1);
		const cipherText2 = encryptN(n2);

		const encryptedResult = add(keyPair.pub)(cipherText1, cipherText2);
		const result = decryptN(encryptedResult);

		expect(result).toStrictEqual(expected);
	});
});

describe("multiply", () => {
	const keyPair = generateKeysSync();
	const encryptN = encrypt(keyPair.pub);
	const decryptN = decrypt(keyPair);

	it("multiplies an encrypted number by an unencrypted number", () => {
		const n1 = 123n;
		const n2 = 456n;
		const expected = 56088n;

		const cipherText = encryptN(n1);

		const encryptedResult = multiply(keyPair.pub)(cipherText, n2);
		const result = decryptN(encryptedResult);

		expect(result).toStrictEqual(expected);
	});
});
