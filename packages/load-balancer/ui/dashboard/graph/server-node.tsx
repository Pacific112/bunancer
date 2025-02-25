import { Node, NodeProps } from "@xyflow/react";
import { cn } from "$/lib/utils.ts";
import { DeleteServerDialog } from "$/components/delete-server-dialog.tsx";
import { ShowLogsDialog } from "$/components/show-logs-dialog.tsx";
import {
	SERVER_NODE_HEIGHT,
	SERVER_NODE_WIDTH,
} from "$/dashboard/graph/position-calculator.tsx";
import { Server, ServerStats } from "api/schema.ts";

export type ServerNode = Node<
	{
		server: Server;
		stats: ServerStats;
	},
	"server"
>;

export const buildServerNode = (
	server: Server,
	stats: ServerStats,
	nodeProps: Pick<Node, "extent" | "position" | "parentId" | "hidden">,
): ServerNode => {
	return {
		...nodeProps,
		id: server.id,
		type: "server",
		data: { server, stats },
		width: SERVER_NODE_WIDTH,
		height: SERVER_NODE_HEIGHT,
	};
};

export const ServerNode = ({
	data: { server, stats },
}: NodeProps<ServerNode>) => (
	<div
		className={cn("shadow-md rounded-md bg-white border-2 border-blue-400", {
			"border-blue-400": server.status === "healthy",
			"border-red-400": server.status === "unhealthy",
			"border-gray-400": server.status === "pending",
			"border-red-700 bg-red-200 opacity-30": server.status === "dead",
		})}
	>
		<div className="flex flex-col">
			<div className="flex p-2 items-center">
				<div className="font-bold text-ellipsis whitespace-nowrap overflow-hidden">
					{server.id}
				</div>
				<div className="flex ml-auto">
					{server.status === "healthy" && (
						<DeleteServerDialog server={server} />
					)}
					<ShowLogsDialog server={server} />
				</div>
			</div>
			<div className="grid grid-cols-3 gap-px p-px justify-center">
				<div className="text-center bg-gray-100 p-2">
					<div className="text-xs">Total</div>
					<div className="font-bold text-sm">{stats?.totalRequests || 0}</div>
				</div>
				<div className="text-xs text-center bg-gray-100 p-2">
					<div className="text-xs">Req/s</div>
					<div className="font-bold text-sm">
						{Math.round(stats?.requestsPerSecond) || 0}
					</div>
				</div>
				<div className="text-xs text-center bg-gray-100 p-2">
					<div className="text-xs">Error rate</div>
					<div className="font-bold text-sm">{stats?.errorRate || 0}%</div>
				</div>
			</div>
		</div>
	</div>
);
