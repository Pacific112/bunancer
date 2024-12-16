import { startLoadBalancer } from "./src/load-balancer.ts";
import { loadConfig } from "./src/config.ts";

const config = await loadConfig();
const { routeRequest } = startLoadBalancer(config);

Bun.serve({
	fetch(request) {
		return routeRequest(request);
	},
});
