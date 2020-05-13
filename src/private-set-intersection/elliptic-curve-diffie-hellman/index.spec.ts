import { Client, Server } from "./";

describe("Private set intersection based on Diffie-Hellman", () => {
	describe("without filter", () => {
		it.each([
			[new Set([]), []],
			[new Set([1n]), [1n]],
			[new Set([1n, 6n]), [1n]],
			[new Set([6n, 7n]), []],
			[new Set([1n, 2n, 3n, 4n, 5n]), [1n, 2n, 3n, 4n, 5n]],
			[new Set([1n, 2n, 3n, 4n, 5n, 6n]), [1n, 2n, 3n, 4n, 5n]],
		])("reveals the intersection", (clientSet, expected) => {
			const serverSet = new Set([1n, 2n, 3n, 4n, 5n]);
			const server = new Server(serverSet);
			const client = new Client(clientSet);

			const clientIntermediateValues = client.prepareIntermediateValues();
			const response = server.revealIntersection(clientIntermediateValues);
			const actual = client.handleIntersectionResponse(response);

			expect(actual).toStrictEqual(expected);
		});

		it.each([
			[new Set([]), 0],
			[new Set([1n]), 1],
			[new Set([1n, 6n]), 1],
			[new Set([6n, 7n]), 0],
			[new Set([1n, 2n, 3n, 4n, 5n]), 5],
			[new Set([1n, 2n, 3n, 4n, 5n, 6n]), 5],
		])("reveals the size of the intersection", (clientSet, expected) => {
			const serverSet = new Set([1n, 2n, 3n, 4n, 5n]);
			const server = new Server(serverSet);
			const client = new Client(clientSet);

			const clientIntermediateValues = client.prepareIntermediateSortedValues();
			const response = server.revealIntersectionSize(clientIntermediateValues);
			const actual = client.handleIntersectionSizeResponse(response);

			expect(actual).toStrictEqual(expected);
		});

		it("is insecure for small domains", () => {
			const domainSize = 10;
			const serverSet = new Set([1n, 2n, 3n, 4n, 5n]);
			const server = new Server(serverSet);
			const clients = [...new Array(domainSize)].map((_, i) => {
				const clientSet = new Set([BigInt(i)]);
				return new Client(clientSet);
			});

			const clientIntermediateValues = clients.map((client) =>
				client.prepareIntermediateSortedValues(),
			);
			const responses = clientIntermediateValues.map(
				server.revealIntersectionSize.bind(server),
			);
			const reconstructedServerSet = responses.reduce((set, response, i) => {
				const included = clients[i].handleIntersectionSizeResponse(response);
				if (included) {
					set.add(BigInt(i));
				}
				return set;
			}, new Set());

			expect(reconstructedServerSet).toEqual(serverSet);
		});
	});

	describe("with filter", () => {
		it.each([
			[new Set([]), []],
			[new Set([1n]), [1n]],
			[new Set([1n, 6n]), [1n]],
			[new Set([6n, 7n]), []],
			[new Set([1n, 2n, 3n, 4n, 5n]), [1n, 2n, 3n, 4n, 5n]],
			[new Set([1n, 2n, 3n, 4n, 5n, 6n]), [1n, 2n, 3n, 4n, 5n]],
		])("reveals the intersection", (clientSet, expected) => {
			const serverSet = new Set([1n, 2n, 3n, 4n, 5n]);
			const server = new Server(serverSet);
			const client = new Client(clientSet);

			const clientIntermediateValues = client.prepareIntermediateValues();
			const response = server.revealIntersectionFilter(
				clientIntermediateValues,
			);
			const actual = client.handleIntersectionFilterResponse(response);

			expect(actual).toStrictEqual(expected);
		});

		it.each([
			[new Set([]), 0],
			[new Set([1n]), 1],
			[new Set([1n, 6n]), 1],
			[new Set([6n, 7n]), 0],
			[new Set([1n, 2n, 3n, 4n, 5n]), 5],
			[new Set([1n, 2n, 3n, 4n, 5n, 6n]), 5],
		])("reveals the size of the intersection", (clientSet, expected) => {
			const serverSet = new Set([1n, 2n, 3n, 4n, 5n]);
			const server = new Server(serverSet);
			const client = new Client(clientSet);

			const clientIntermediateValues = client.prepareIntermediateSortedValues();
			const response = server.revealIntersectionSizeFilter(
				clientIntermediateValues,
			);
			const actual = client.handleIntersectionSizeFilterResponse(response);

			expect(actual).toStrictEqual(expected);
		});

		it("is insecure for small domains", () => {
			const domainSize = 10;
			const serverSet = new Set([1n, 2n, 3n, 4n, 5n]);
			const server = new Server(serverSet);
			const clients = [...new Array(domainSize)].map((_, i) => {
				const clientSet = new Set([BigInt(i)]);
				return new Client(clientSet);
			});

			const clientIntermediateValues = clients.map((client) =>
				client.prepareIntermediateSortedValues(),
			);
			const responses = clientIntermediateValues.map(
				server.revealIntersectionSizeFilter.bind(server),
			);
			const reconstructedServerSet = responses.reduce((set, response, i) => {
				const included = clients[i].handleIntersectionSizeFilterResponse(
					response,
				);
				if (included) {
					set.add(BigInt(i));
				}
				return set;
			}, new Set());

			expect(reconstructedServerSet).toEqual(serverSet);
		});
	});
});
