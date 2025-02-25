import DashboardPage from "$/dashboard/dashboard-page.tsx";
import FAQPage from "$/faq/faq-page.tsx";
import HomePage from "$/home/home-page.tsx";
import NotFoundPage from "$/not-found.tsx";
import UnauthorizedPage from "$/unauthorized.tsx";
import { RoadmapPage } from "$/roadmap/roadmap-page.tsx";

export const pages = {
	"/": HomePage,
	"/not-found": NotFoundPage,
	"/unauthorized": UnauthorizedPage,
	"/roadmap": RoadmapPage,
	"/faq": FAQPage,
	"/dashboard": DashboardPage,
} as const;

export type DashboardPages = typeof pages;
