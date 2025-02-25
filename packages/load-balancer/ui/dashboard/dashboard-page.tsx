import { ViewMode } from "$/lib/useViewMode.ts";
import PageLayout from "$/PageLayout.tsx";
import { Dashboard } from "$/dashboard/dashboard.tsx";
import { ServerPool } from "api/schema.ts";

function DashboardPage({
	stylesheets = [],
	initialMode,
	initialServerPools,
}: {
	stylesheets: string[];
	initialMode: ViewMode;
	initialServerPools: ServerPool[];
}) {
	return (
		<PageLayout stylesheets={stylesheets}>
			<Dashboard
				initialMode={initialMode}
				initialServerPools={initialServerPools}
			/>
		</PageLayout>
	);
}

export default DashboardPage;
