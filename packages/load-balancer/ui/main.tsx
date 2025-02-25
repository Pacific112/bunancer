import { hydrateRoot } from "react-dom/client";
import DashboardPage from "$/dashboard/dashboard-page.tsx";
import FAQPage from "$/faq/faq-page.tsx";

const path = window.location.pathname;
let Component;

switch (path) {
	case "/dashboard":
		Component = DashboardPage;
		break;
	case "/faq":
		Component = FAQPage;
		break;
	default:
		Component = DashboardPage;
}

hydrateRoot(document, <Component {...window.__INITIAL_PROPS__} />);
