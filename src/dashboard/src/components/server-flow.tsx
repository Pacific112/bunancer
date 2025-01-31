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

const ServerNode = ({ data }: NodeProps) => (
	<div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-blue-400">
		<Handle
			type="target"
			position={Position.Top}
			className="w-16 !bg-blue-400"
		/>
		<div className="flex items-center">
			<div className="ml-2">
				<div className="text-lg font-bold">{data.label}</div>
				<div className="text-gray-500">Handles Requests</div>
			</div>
		</div>
	</div>
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
				data: { label: s.id },
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

	// const { nodes: positionedNodes, edges: positionedEdges } = useMemo(() => {
	// 	return getLayoutedElements(nodes, edges);
	// }, [nodes, edges]);

	return (
		<div className="w-full h-96">
			<ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
				<Background />
			</ReactFlow>
		</div>
	);
};
