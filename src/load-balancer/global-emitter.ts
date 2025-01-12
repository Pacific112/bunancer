import { EventEmitter } from "node:events";
import type { ServerConfig } from "load-balancer/config-schema.ts";

type EventsMap = {
	"new-server": [ServerConfig];
};

export const globalEmitter = new EventEmitter<EventsMap>();
