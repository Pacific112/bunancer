import { EventEmitter } from "node:events";
import type { PendingServer } from "load-balancer/server-pool.ts";

type EventsMap = {
	"pool:new-server": [PendingServer];
	"pool:server-online": [string];
	"pool:server-offline": [string];
	"pool:server-killed": [string];
};

export const globalEmitter = new EventEmitter<EventsMap>();
