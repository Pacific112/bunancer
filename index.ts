import {startLoadBalancer} from "./src/load-balancer.ts";

const loadBalancer = startLoadBalancer()

Bun.serve({
	fetch(request) {
		return loadBalancer.routeRequest(request)
	}
})

