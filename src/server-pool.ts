export type Server = {
	id: string
	host: string;
	port: string;
	healthPath: string
};

type ServerPool = {
	servers: Server[];
};

const toUrl = (server: Server) => `${server.host}:${server.port}`


export const initializePool = (servers: Server[]) => {
	const unavailableServers = new Set<string>()

	return {
		servers: () => servers.filter(s => !unavailableServers.has(s.id)),
		requestTo: (server: Server, request: Request) => {
			return fetch(toUrl(server), {
				body: request.body,
				headers: request.headers,
			})
		}
	};
};
