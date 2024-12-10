import {initializePool, type Server} from "./server-pool.ts";

const serverDefinitions: Server[] = [
	{
		host: "http://localhost",
		port: "3001",
	},
	{
		host: "http://localhost",
		port: "3002",
	},
];

export const startLoadBalancer = () => {
	let counter = -1
	const {servers, requestTo} = initializePool(serverDefinitions);

	return {
		routeRequest: async (request: Request) => {
			counter = (counter + 1) % servers.length

			const server = servers[counter]
			return requestTo(server, request)
		},
	};
};
