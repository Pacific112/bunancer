import { Handle, Node, NodeProps, Position } from "@xyflow/react";

export type LoadBalancerNode = Node<{ label: string }, "loadBalancer">;

export const LoadBalancerNode = ({ data }: NodeProps<LoadBalancerNode>) => (
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
			className="w-16 bg-stone-400!"
		/>
	</div>
);
