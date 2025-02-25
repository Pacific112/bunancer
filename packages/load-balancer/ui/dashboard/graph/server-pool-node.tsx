import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import { AddServerDialog } from "$/components/add-server-dialog.tsx";
import { Button } from "$/components/ui/button.tsx";
import { Expand, Shrink } from "lucide-react";
import { type CreateServer, ServerPool } from "api/schema.ts";
import { serverPoolDimensions } from "$/dashboard/graph/position-calculator.tsx";

export type ServerPoolNode = Node<
	{
		serverPool: ServerPool;
		expanded: boolean;
		onExpand: () => void;
		onAddServer: (server: CreateServer) => void;
	},
	"serverPool"
>;

export const buildServerPoolNode = (
	pool: ServerPool,
	expanded: boolean,
	onAddServer: (pool: ServerPool, server: CreateServer) => void,
	onExpand: (serverPool: ServerPool) => void,
): ServerPoolNode => {
	const dimensions = expanded
		? serverPoolDimensions(pool.servers.length)
		: { width: 260, height: 55 };

	return {
		id: pool.id,
		type: "serverPool",
		position: { x: -20, y: 180 },
		data: {
			expanded,
			serverPool: pool,
			onExpand: () => onExpand(pool),
			onAddServer: (server: CreateServer) => onAddServer(pool, server),
		},
		width: dimensions.width,
		height: dimensions.height,
	};
};

export const ServerPoolNode = ({
	width,
	height,
	data,
}: NodeProps<ServerPoolNode>) => {
	return (
		<>
			<div
				className="px-4 shadow-md rounded-md bg-white border-2 border-stone-400 transition-all duration-300 overflow-hidden"
				style={{
					width,
					height,
				}}
			>
				<div className="pt-2 flex items-center">
					<div>{data.serverPool.name}</div>
					<AddServerDialog
						className="ml-auto mr-2"
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
					className="w-16 bg-stone-400!"
				/>
			</div>
		</>
	);
};
