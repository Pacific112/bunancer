import { startLoadBalancer } from "./src/load-balancer/load-balancer.ts";
import { loadConfig } from "./src/load-balancer/config.ts";

const config = await loadConfig();
const { routeRequest } = startLoadBalancer(config);

Bun.serve({
	fetch(request) {
		return routeRequest(request);
	},
});

Bun.serve({
	port: 40999,
	fetch(request) {
		return new Response("")
	},
});
