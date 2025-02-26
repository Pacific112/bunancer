import { ViewMode } from "$/lib/useViewMode.ts";
import PageLayout from "$/PageLayout.tsx";
import { Dashboard } from "$/dashboard/dashboard.tsx";
import { ServerPool, ServerStats } from "api/schema.ts";

function DashboardPage({
	stylesheets = [],
	initialMode,
	initialServerPools,
	initialStats,
}: {
	stylesheets: string[];
	initialMode: ViewMode;
	initialServerPools: ServerPool[];
	initialStats: Record<string, ServerStats>
}) {
	return (
		<PageLayout stylesheets={stylesheets}>
			<Dashboard
				initialMode={initialMode}
				initialServerPools={initialServerPools}
				initialStats={initialStats}
			/>
		</PageLayout>
	);
}

export default DashboardPage;
