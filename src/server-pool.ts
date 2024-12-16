export type Server = {
	id: string
	host: string;
	port: string;
	health: {
		path: string
		interval: number
	}
};

type ServerPool = {
	servers: Server[];
};

const toUrl = (server: Server) => `${server.host}:${server.port}`

const setupHealthCheck = (server: Server, onSuccess: (id: string) => void, onError: (id: string) => void) => {
	setInterval(async () => {
		try {
			const res = await fetch(`${toUrl(server)}/${server.health.path}`)
			if (res.status === 200) {
				onSuccess(server.id)
			} else {
				onError(server.id)
			}
		} catch (e) {
			onError(server.id)
		}
	}, server.health.interval)
}

export const initializePool = (servers: Server[]) => {
	const unavailableServers = new Set<string>()

	for (const server of servers) {
		setupHealthCheck(
			server,
			(id) => unavailableServers.delete(id),
			(id) => unavailableServers.add(id),
		)
	}

	return {
		servers: () => {
			return servers.filter(s => !unavailableServers.has(s.id));
		},
		requestTo: (server: Server, request: Request) => {
			return fetch(toUrl(server), {
				body: request.body,
				headers: request.headers,
			})
		}
	};
};
