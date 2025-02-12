import { type ServerPool } from "./server-pool.ts";
import { ServerStateStorage } from "load-balancer/storage/server-state-storage.ts";
import { globalEmitter } from "load-balancer/global-emitter.ts";

export const startLoadBalancer = (serverPool: ServerPool) => {
	let counter = -1;
	const { requestTo } = serverPool;

	const serverStateStorage = new ServerStateStorage();
	const store = () => serverStateStorage.saveState(serverPool.status.servers);
	globalEmitter.on("pool:new-server", store);
	globalEmitter.on("pool:server-online", store);
	globalEmitter.on("pool:server-offline", store);
	globalEmitter.on("pool:server-killed", store);

	return {
		routeRequest: async (request: Request) => {
			return requestTo(request, (servers) => {
				counter = (counter + 1) % servers.length;
				return servers[counter];
			});
		},
	};
};
