import type { Server, ServerPool as ServerPoolType } from "$/types/types.ts";
import { useReducer } from "react";
import { produce } from "immer";

type State = {
	serverPools: ServerPoolType[];
};

type Action<NAME, PAYLOAD> = { name: NAME; payload: PAYLOAD };

type ServerPoolActions =
	| Action<"new_server", { poolId: string; server: Server }>
	| Action<"mark_healthy", { poolId: string; serverId: string }>
	| Action<"mark_unhealthy", { poolId: string; serverId: string }>
	| Action<"mark_dead", { poolId: string; serverId: string }>;

const findServer = (
	serverPools: ServerPoolType[],
	poolId: string,
	serverId: string,
) =>
	serverPools
		.find((sp) => sp.id === poolId)
		?.servers.find((s) => s.id === serverId);

const reducer = (state: State, action: ServerPoolActions) => {
	switch (action.name) {
		case "new_server":
			return produce(state, (draft) => {
				const { poolId, server } = action.payload;
				const serverPool = draft.serverPools.find((sp) => sp.id === poolId);
				if (!serverPool) return;

				const serverIndex = serverPool.servers.findIndex(
					(s) => s.id === server.id,
				);
				if (serverIndex === -1) {
					serverPool.servers.push(server);
				} else {
					serverPool.servers.toSpliced(serverIndex, 1, server);
				}
			});
		case "mark_healthy":
			return produce(state, (draft) => {
				const { poolId, serverId } = action.payload;
				const server = findServer(draft.serverPools, poolId, serverId);
				if (server) server.status = "healthy";
			});
		case "mark_unhealthy":
			return produce(state, (draft) => {
				const { poolId, serverId } = action.payload;
				const server = findServer(draft.serverPools, poolId, serverId);
				if (server) server.status = "unhealthy";
			});
		case "mark_dead":
			return produce(state, (draft) => {
				const { poolId, serverId } = action.payload;
				const server = findServer(draft.serverPools, poolId, serverId);
				if (server) server.status = "dead";
			});
		default:
			const _exhausted: never = action;
			throw new Error(`Action ${action} should be handled.`);
	}
};

export const useServerPools = (initialServerPools: ServerPoolType[]) => {
	return useReducer(reducer, {
		serverPools: initialServerPools,
	});
};
