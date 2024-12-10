import {startLoadBalancer} from "./src/load-balancer.ts";

const {routeRequest} = startLoadBalancer()

Bun.serve({
	fetch(request) {
		return routeRequest(request)
	}
})

