import {
	Background,
	Edge,
	Handle,
	Node,
	NodeProps,
	Position,
	ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { type CreateServer, ServerPool, ServerStats } from "@/types/types.ts";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils.ts";
import { Popover, PopoverContent } from "@/components/ui/popover.tsx";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { DeleteServerDialog } from "@/components/delete-server-dialog.tsx";
import { ShowLogsDialog } from "@/components/show-logs-dialog.tsx";
import { AddServerDialog } from "@/components/add-server-dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Expand, Shrink } from "lucide-react";

const LoadBalancerNode = ({ data }: NodeProps) => (
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
);

const ServerPoolNode = ({ width, height, data }: NodeProps) => {
	return (
		<>
			<div
				className="px-4 shadow-md rounded-md bg-white border-2 border-stone-400 transition-all"
				style={{
					width,
					height,
				}}
			>
				<div className="pt-2 flex items-center">
					<div>{data.serverPool.name}</div>
					<AddServerDialog
						className="ml-auto"
						handleAddServer={data.onAddServer}
					/>
					<Button
						variant="outline"
						size="icon"
						className="h-8 w-8"
						onClick={data.onExpand}
					>
						{data.expanded ? <Shrink /> : <Expand />}
						<span className="sr-only">
							{data.expanded ? "Shrink" : "Expand"}
						</span>
					</Button>
				</div>
				<Handle
					type="target"
					position={Position.Top}
					className="w-16 !bg-stone-400"
				/>
			</div>
		</>
	);
};

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

const loadBalancerNode = {
	id: "lb",
	type: "loadBalancer",
	data: { label: "Load Balancer" },
	position: { x: 500, y: 0 },
};

const nodeTypes = {
	loadBalancer: LoadBalancerNode,
	server: ServerNode,
	serverPool: ServerPoolNode,
};

type Props = {
	stats: Record<string, ServerStats>;
	serverPools: ServerPool[];
	onAddServer: (pool: ServerPool, server: CreateServer) => void;
};

const NODE_WIDTH = 220;
const NODE_HEIGHT = 100;
const NODE_GAP = 20;
const TOOLBAR_HEIGHT = 35;
const SERVERS_PER_ROW = 3;

const buildNodesForPool = (
	pool: ServerPool,
	expanded: boolean,
	stats: Record<string, ServerStats>,
	onAddServer: Props["onAddServer"],
	onExpand: () => void,
) => {
	const { id, servers } = pool;
	return [
		{
			id,
			type: "serverPool",
			position: { x: -20, y: 180 },
			data: {
				expanded,
				serverPool: pool,
				onExpand,
				onAddServer: (server: CreateServer) => onAddServer(pool, server),
			},
			style: {
				width: expanded
					? NODE_GAP +
						(NODE_WIDTH + NODE_GAP) * Math.min(servers.length, SERVERS_PER_ROW)
					: 300,
				height: expanded
					? NODE_GAP +
						TOOLBAR_HEIGHT +
						(NODE_HEIGHT + NODE_GAP) *
							Math.max(Math.ceil(servers.length / SERVERS_PER_ROW), 1)
					: 55,
			},
		},
		...servers.map((s, i) => ({
			id: s.id,
			type: "server",
			parentId: id,
			hidden: !expanded,
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
					TOOLBAR_HEIGHT +
					(NODE_HEIGHT + NODE_GAP) * Math.floor(i / SERVERS_PER_ROW),
			},
		})),
	];
};

export const ServerFlow = ({ serverPools, onAddServer, stats }: Props) => {
	const [expandedPools, setExpandedPools] = useState<string[]>([]);

	const nodes = useMemo<Node[]>(() => {
		return [
			loadBalancerNode,
			...serverPools.flatMap((sp) =>
				buildNodesForPool(
					sp,
					expandedPools.includes(sp.id),
					stats,
					onAddServer,
					() =>
						expandedPools.includes(sp.id)
							? setExpandedPools(
									expandedPools.toSpliced(expandedPools.indexOf(sp.id), 1),
								)
							: setExpandedPools([...expandedPools, sp.id]),
				),
			),
		];
	}, [serverPools, expandedPools]);
	const edges = useMemo<Edge[]>(
		(): Edge[] =>
			serverPools.map((sp) => ({
				id: `lb-${sp.id}`,
				source: "lb",
				target: sp.id,
			})),
		[serverPools],
	);

	return (
		<div className="w-full h-96">
			<ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
				<Background />
			</ReactFlow>
		</div>
	);
};
