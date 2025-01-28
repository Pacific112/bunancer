export interface Server {
	id: string;
	name: string;
	status: "online" | "offline" | "loading";
	ip: string;
	load: number;
	responseTime: number;
}

export interface CreateServer {
	instanceId: string;
	port: string;
}

export interface ServerPool {
	id: string;
	name: string;
	servers: Server[];
}
