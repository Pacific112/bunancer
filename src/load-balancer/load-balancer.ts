import { type ServerPool } from "./server-pool.ts";
import { ServerStateStorage } from "load-balancer/storage/server-state-storage.ts";
import { globalEmitter } from "load-balancer/global-emitter.ts";

export const startLoadBalancer = (
	serverPool: ServerPool,
	stateStorage: ServerStateStorage,
) => {
	let counter = -1;
	const { requestTo } = serverPool;

	const storeState = () => stateStorage.saveState(serverPool.status.servers);
	globalEmitter.on("pool:new-server", storeState);
	globalEmitter.on("pool:server-online", storeState);
	globalEmitter.on("pool:server-offline", storeState);
	globalEmitter.on("pool:server-killed", storeState);

	return {
		routeRequest: async (request: Request) => {
			return requestTo(request, (servers) => {
				counter = (counter + 1) % servers.length;
				return servers[counter];
			});
		},
	};
};
