import { Node, NodeProps } from "@xyflow/react";
import { Server, ServerStats } from "$/types/types.ts";
import { Popover, PopoverContent } from "$/components/ui/popover.tsx";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { cn } from "$/lib/utils.ts";
import { DeleteServerDialog } from "$/components/delete-server-dialog.tsx";
import { ShowLogsDialog } from "$/components/show-logs-dialog.tsx";
import {
	SERVER_NODE_HEIGHT,
	SERVER_NODE_WIDTH,
} from "$/dashboard/graph/position-calculator.tsx";

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
): ServerNode => ({
	...nodeProps,
	id: server.id,
	type: "server",
	data: { server, stats },
	style: {
		width: SERVER_NODE_WIDTH,
		height: SERVER_NODE_HEIGHT,
	},
});

export const ServerNode = ({
	data: { server, stats },
}: NodeProps<ServerNode>) => (
	<Popover>
		<PopoverTrigger asChild>
			<div
				className={cn(
					"shadow-md rounded-md bg-white border-2 border-blue-400",
					{
						"border-blue-400": server.status === "healthy",
						"border-red-400": server.status === "unhealthy",
						"border-gray-400": server.status === "pending",
						"border-red-700 bg-red-200 opacity-30": server.status === "dead",
					},
				)}
			>
				<div className="flex flex-col">
					<div className="text-lg font-bold px-4 py-2 text-center">
						{server.id}
					</div>
					<div className="grid grid-cols-3 gap-px p-px justify-center">
						<div className="text-center bg-gray-100 p-2">
							<div className="text-xs">Total</div>
							<div className="font-bold text-sm">
								{stats?.totalRequests || 0}
							</div>
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
		</PopoverTrigger>
		<PopoverContent className="w-fit p-1">
			<div className="flex">
				{server.status === "healthy" && <DeleteServerDialog server={server} />}
				<ShowLogsDialog server={server} />
			</div>
		</PopoverContent>
	</Popover>
);
