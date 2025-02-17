import { EventEmitter } from "node:events";
import type { PendingServer, ServerStats } from "@/pool/server.types";

type EventsMap = {
	"pool:new-server": [PendingServer];
	"pool:server-online": [string];
	"pool:server-offline": [string];
	"pool:server-killed": [string];
	"pool:stats-update": [Record<string, ServerStats>];
};

export const globalEmitter = new EventEmitter<EventsMap>();
