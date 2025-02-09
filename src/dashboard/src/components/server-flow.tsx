import {
	Background,
	Edge,
	Handle,
	Node,
	NodeProps,
	NodeToolbar,
	Position,
	ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { type CreateServer, Server, ServerStats } from "@/types/types.ts";
import { useMemo } from "react";
import { cn } from "@/lib/utils.ts";
import { Popover, PopoverContent } from "@/components/ui/popover.tsx";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { DeleteServerDialog } from "@/components/delete-server-dialog.tsx";
import { ShowLogsDialog } from "@/components/show-logs-dialog.tsx";
import { AddServerDialog } from "@/components/add-server-dialog.tsx";

const LoadBalancerNode = ({ data }: NodeProps) => (
	<>
		<div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
			<div className="flex items-center">
				<div className="ml-2">
					<div className="text-lg font-bold">{data.label}</div>
					<div className="text-gray-500">Distributes Traffic</div>
				</div>
			</div>
			<Handle
				type="source"
				position={Position.Bottom}
				className="w-16 !bg-stone-400"
			/>
		</div>
		<NodeToolbar isVisible position={Position.Top}>
			<AddServerDialog handleAddServer={data.onAddServer} />
		</NodeToolbar>
	</>
);

const ServerPoolNode = ({ width, height }: NodeProps) => (
	<div
		className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400"
		style={{ width, height }}
	>
		<Handle
			type="target"
			position={Position.Top}
			className="w-16 !bg-stone-400"
		/>
	</div>
);

const ServerNode = ({ data: { server, stats } }: NodeProps) => (
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

const loadBalancerNode = (
	onAddServer: (server: CreateServer) => void,
): Node => ({
	id: "lb",
	type: "loadBalancer",
	data: { label: "Load Balancer", onAddServer },
	position: { x: 500, y: 0 },
});

const nodeTypes = {
	loadBalancer: LoadBalancerNode,
	server: ServerNode,
	serverPool: ServerPoolNode,
};

type Props = {
	servers: Server[];
	stats: Record<string, ServerStats>;
	onAddServer: (server: CreateServer) => void;
};

const NODE_WIDTH = 220;
const NODE_HEIGHT = 100;
const NODE_GAP = 20;
const SERVERS_PER_ROW = 3;

export const ServerFlow = ({ servers, onAddServer, stats }: Props) => {
	const nodes = useMemo<Node[]>(() => {
		return [
			loadBalancerNode(onAddServer),
			{
				id: "server-pool-1",
				type: "serverPool",
				position: { x: -20, y: 180 },
				style: {
					width:
						NODE_GAP +
						(NODE_WIDTH + NODE_GAP) * Math.min(servers.length, SERVERS_PER_ROW),
					height:
						NODE_GAP +
						(NODE_HEIGHT + NODE_GAP) *
							Math.max(Math.ceil(servers.length / SERVERS_PER_ROW), 1),
				},
			},
			...servers.map((s, i) => ({
				id: s.id,
				type: "server",
				parentId: "server-pool-1",
				data: { server: s, stats: stats[s.id] },
				extent: "parent",
				style: {
					width: NODE_WIDTH,
					height: NODE_HEIGHT,
				},
				position: {
					x:
						NODE_GAP +
						(NODE_WIDTH * (i % SERVERS_PER_ROW) +
							NODE_GAP * Math.floor(i % SERVERS_PER_ROW)),
					y:
						NODE_GAP +
						(NODE_HEIGHT + NODE_GAP) * Math.floor(i / SERVERS_PER_ROW),
				},
			})),
		];
	}, [servers]);
	const edges = useMemo<Edge[]>(
		(): Edge[] => [
			{
				id: `lb-server-pool-1`,
				source: "lb",
				target: "server-pool-1",
			},
		],
		[servers],
	);

	return (
		<div className="w-full h-96">
			<ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
				<Background />
			</ReactFlow>
		</div>
	);
};
