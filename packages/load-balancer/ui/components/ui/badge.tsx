import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "$/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center rounded-full border border-zinc-200 px-1 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 redark:border-zinc-800 redark:focus:ring-zinc-300",
	{
		variants: {
			variant: {
				default:
					"border-transparent bg-zinc-900 text-zinc-50 shadow-sm hover:bg-zinc-900/80 redark:bg-zinc-50 redark:text-zinc-900 redark:hover:bg-zinc-50/80",
				secondary:
					"border-transparent bg-zinc-100 text-zinc-900 hover:bg-zinc-100/80 redark:bg-zinc-800 redark:text-zinc-50 redark:hover:bg-zinc-800/80",
				destructive:
					"border-transparent bg-red-500 text-zinc-50 shadow-sm hover:bg-red-500/80 redark:bg-red-900 redark:text-zinc-50 redark:hover:bg-red-900/80",
				outline: "text-zinc-950 redark:text-zinc-50",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
	return (
		<div className={cn(badgeVariants({ variant }), className)} {...props} />
	);
}

export { Badge, badgeVariants };
