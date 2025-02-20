export interface Server {
	id: string;
	name: string;
	status: "healthy" | "unhealthy" | "pending" | "dead";
	ip: string;
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

export type ServerStats = {
	totalRequests: number;
	requestsPerSecond: number;
	errorCount: number;
	errorRate: number;
	lastRequestTimestamp: number;
};
