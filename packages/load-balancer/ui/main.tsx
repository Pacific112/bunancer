import { hydrateRoot } from "react-dom/client";
import App from "./App.tsx";

hydrateRoot(document, (<App {...window.__INITIAL_PROPS__} />));
