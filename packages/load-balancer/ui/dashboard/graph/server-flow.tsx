import { Background, Edge, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { type CreateServer, ServerPool, ServerStats } from "api/schema.ts";
import { useCallback, useMemo, useState } from "react";
import { buildServerNode, ServerNode } from "$/dashboard/graph/server-node.tsx";
import {
	buildServerPoolNode,
	ServerPoolNode,
} from "$/dashboard/graph/server-pool-node.tsx";
import { LoadBalancerNode } from "$/dashboard/graph/load-balancer-node.tsx";
import { positionForServerNode } from "$/dashboard/graph/position-calculator.tsx";

const loadBalancerNode: LoadBalancerNode = {
	id: "lb",
	type: "loadBalancer",
	data: { label: "Load Balancer" },
	position: { x: 260, y: 0 },
};

const nodeTypes = {
	server: ServerNode,
	serverPool: ServerPoolNode,
	loadBalancer: LoadBalancerNode,
};

type Props = {
	stats: Record<string, ServerStats>;
	serverPools: ServerPool[];
	onAddServer: (pool: ServerPool, server: CreateServer) => void;
};

const useExpandedPools = (allPools: ServerPool[]) => {
	const [expandedPools, setExpandedPools] = useState(
		allPools.filter((s) => s.servers.length > 0).map((s) => s.id),
	);

	const toggleExpand = useCallback(
		(pool: ServerPool) => {
			const index = expandedPools.indexOf(pool.id);
			if (index >= 0) {
				setExpandedPools(expandedPools.toSpliced(index, 1));
			} else {
				setExpandedPools([...expandedPools, pool.id]);
			}
		},
		[expandedPools],
	);

	return [expandedPools, toggleExpand] as const;
};

export const ServerFlow = ({ serverPools, onAddServer, stats }: Props) => {
	const [expandedIds, toggleExpand] = useExpandedPools(serverPools);

	const nodes = useMemo(() => {
		return [
			loadBalancerNode,
			...serverPools.flatMap((pool) => {
				const expanded = expandedIds.includes(pool.id);
				return [
					buildServerPoolNode(pool, expanded, onAddServer, toggleExpand),
					...pool.servers.map((server, i) =>
						buildServerNode(server, stats[server.id], {
							parentId: pool.id,
							hidden: !expanded,
							extent: "parent",
							position: positionForServerNode(i),
						}),
					),
				];
			}),
		];
	}, [serverPools, expandedIds, toggleExpand]);
	const edges = useMemo(
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
