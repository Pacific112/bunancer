import { useEffect, useState } from "react";

const SUPPORTED_VIEW_MODES = ["table", "flow"] as const;
export type ViewMode = (typeof SUPPORTED_VIEW_MODES)[number];

export const useViewMode = (initialMode: ViewMode) => {
	const [mode, setMode] = useState(initialMode);
	useEffect(() => {
		const search = new URLSearchParams(window.location.search);
		const mode = search.get("mode");
		if (mode && SUPPORTED_VIEW_MODES.includes(mode)) {
			setMode(mode);
		}
	}, []);

	const updateMode = (mode: ViewMode) => {
		const url = new URL(window.location.href);
		url.searchParams.set("mode", mode);

		window.history.replaceState(null, "", url.toString());
		setMode(mode);
	};

	return [mode, updateMode] as const;
};
