#!/usr/bin/env node
const { randBetween } = require("bigint-crypto-utils");
const { Client, Server } = require("../dist");

const domainSize = 100000000n;
const numServerElements = 10000;
const numClientElements = 100;
const falsePositiveRate = 0.000001;
const numIterations = 1;

const generateSet = (length) =>
	Array.from({ length }, () => randBetween(domainSize));

const generateServer = () => {
	const serverSet = generateSet(numServerElements);
	return new Server(serverSet, { falsePositiveRate });
};

const generateClient = () => {
	const clientSet = generateSet(numClientElements);
	return new Client(clientSet);
};

const formatter = new Intl.NumberFormat();

console.info("Running benchmark with the following parameters...");
console.info(`Domain size:         ${formatter.format(domainSize)}`);
console.info(`Num server elements: ${formatter.format(numServerElements)}`);
console.info(`Num client elements: ${formatter.format(numClientElements)}`);
console.info(`False positive rate: ${falsePositiveRate}`);
console.info(`Iterations:          ${formatter.format(numIterations)}`);
console.info("======================================");

if (process.env.CREATE_SETUP_MESSAGE !== "0") {
	const TIMER_CREATE_SETUP_MESSAGE = "Create setup message";
	console.time(TIMER_CREATE_SETUP_MESSAGE);
	for (let i = 0; i < numIterations; ++i) {
		const server = generateServer();
		const preparedValues = server.prepareIntermediateValues();
		Server.createBloomFilter(
			preparedValues,
			server.falsePositiveRate,
			numClientElements,
		);
	}
	console.timeEnd(TIMER_CREATE_SETUP_MESSAGE);
}

if (process.env.CREATE_REQUEST !== "0") {
	const TIMER_CREATE_REQUEST = "Create request";
	console.time(TIMER_CREATE_REQUEST);
	for (let i = 0; i < numIterations; ++i) {
		const client = generateClient();
		client.prepareIntermediateSortedValues();
	}
	console.timeEnd(TIMER_CREATE_REQUEST);
}

if (process.env.PROCESS_REQUEST !== "0") {
	const server = generateServer();
	const requests = Array.from({ length: numIterations }, () => {
		const client = generateClient();
		return client.prepareIntermediateSortedValues();
	});

	const TIMER_PROCESS_REQUEST = "Create setup message and process request";
	console.time(TIMER_PROCESS_REQUEST);
	for (let i = 0; i < numIterations; ++i) {
		server.revealIntersectionSizeFilter(requests[i]);
	}
	console.timeEnd(TIMER_PROCESS_REQUEST);
}

if (process.env.PROCESS_RESPONSE !== "0") {
	const server = generateServer();
	const cases = Array.from({ length: numIterations }, () => {
		const client = generateClient();
		const request = client.prepareIntermediateSortedValues();
		const response = server.revealIntersectionSizeFilter(request);
		return { client, response };
	});

	const TIMER_PROCESS_RESPONSE = "Process response";
	console.time(TIMER_PROCESS_RESPONSE);
	for (let i = 0; i < numIterations; ++i) {
		const { client, response } = cases[i];
		client.handleIntersectionSizeFilterResponse(response);
	}
	console.timeEnd(TIMER_PROCESS_RESPONSE);
}
