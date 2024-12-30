export interface Server {
	id: string;
	name: string;
	status: "online" | "offline" | "maintenance" | "loading";
	ip: string;
	load: number;
	responseTime: number;
}

export interface ServerPool {
	id: string;
	name: string;
	servers: Server[];
}
