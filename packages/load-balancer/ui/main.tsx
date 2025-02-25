import { hydrateRoot } from "react-dom/client";
import DashboardPage from "$/dashboard/dashboard-page.tsx";
import { pages } from "$/pages.ts";

const path = window.location.pathname;
const Component = pages[path] || DashboardPage;

hydrateRoot(document, <Component {...window.__INITIAL_PROPS__} />);
