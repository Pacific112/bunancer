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
import { Server } from "@/types/types.ts";
import { useMemo } from "react";
import { cn } from "@/lib/utils.ts";
import { Popover, PopoverContent } from "@/components/ui/popover.tsx";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { DeleteServerDialog } from "@/components/delete-server-dialog.tsx";
import { ShowLogsDialog } from "@/components/show-logs-dialog.tsx";

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

const ServerNode = ({ data: { server } }: NodeProps) => (
	<Popover>
		<PopoverTrigger asChild>
			<div
				className={cn(
					"px-4 py-2 shadow-md rounded-md bg-white border-2 border-blue-400",
					{
						"border-blue-400": server.status === "online",
						"border-red-400": server.status === "offline",
						"border-gray-400": server.status === "loading",
					},
				)}
			>
				{server.status === "online" ? (
					<Handle
						type="target"
						position={Position.Top}
						className="w-16 !bg-blue-400"
					/>
				) : null}
				<div className="flex items-center">
					<div className="ml-2">
						<div className="text-lg font-bold">{server.id}</div>
						<div className="text-gray-500">Handles Requests</div>
					</div>
				</div>
			</div>
		</PopoverTrigger>
		<PopoverContent className="w-fit p-1">
			<div className="flex">
				{server.status === "online" && <DeleteServerDialog server={server} />}
				<ShowLogsDialog server={server} />
			</div>
		</PopoverContent>
	</Popover>
);

const loadBalancerNode: Node = {
	id: "lb",
	type: "loadBalancer",
	data: { label: "Load Balancer" },
	position: { x: 500, y: 0 },
};

const nodeTypes = {
	loadBalancer: LoadBalancerNode,
	server: ServerNode,
};

type Props = {
	servers: Server[];
};
export const ServerFlow = ({ servers }: Props) => {
	const nodes = useMemo<Node[]>(() => {
		return [
			loadBalancerNode,
			...servers.map((s, i) => ({
				id: s.id,
				type: "server",
				data: { server: s },
				position: {
					x: 250 * (i % 5),
					y: 200 + 100 * Math.floor(i / 5),
				},
			})),
		];
	}, [servers]);
	const edges = useMemo<Edge[]>(
		() =>
			servers.map((s) => ({
				id: `lb-${s.id}`,
				source: loadBalancerNode.id,
				target: s.id,
			})),
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
