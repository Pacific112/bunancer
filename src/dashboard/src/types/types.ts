export interface Server {
	id: string;
	name: string;
	status: "healthy" | "unhealthy" | "pending";
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
