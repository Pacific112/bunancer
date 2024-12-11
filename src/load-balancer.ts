import {initializePool, type Server} from "./server-pool.ts";

const serverDefinitions: Server[] = [
	{
		id: '1',
		host: "http://localhost",
		port: "3001",
		healthPath: '/health'
	},
	{
		id: '2',
		host: "http://localhost",
		port: "3002",
		healthPath: '/health'
	},
];

export const startLoadBalancer = () => {
	let counter = -1
	const {servers, requestTo} = initializePool(serverDefinitions);

	return {
		routeRequest: async (request: Request) => {
			const avServers = servers();
			counter = (counter + 1) % avServers.length

			const server = avServers[counter]
			return requestTo(server, request)
		},
	};
};
