import { EventEmitter } from "node:events";
import type { ServerConfig } from "load-balancer/config-schema.ts";

type EventsMap = {
	"pool:new-server": [ServerConfig];
	"pool:server-online": [string];
	"pool:server-offline": [string];
};

export const globalEmitter = new EventEmitter<EventsMap>();
