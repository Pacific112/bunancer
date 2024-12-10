export type Server = {
	host: string;
	port: string;
};

type ServerPool = {
	servers: Server[];
};

const toUrl = (server: Server) => `${server.host}:${server.port}`

export const initializePool = (servers: Server[]) => {
	return {
		servers,
		requestTo: (server: Server, request: Request) => {
			return fetch(toUrl(server), {
				body: request.body,
				headers: request.headers,
			})
		}
	};
};
