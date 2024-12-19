import { startLoadBalancer } from "src/load-balancer/load-balancer.ts";
import { loadConfig } from "src/load-balancer/config.ts";

const config = await loadConfig();
const { routeRequest } = startLoadBalancer(config);

Bun.serve({
	fetch(request) {
		return routeRequest(request);
	},
});
