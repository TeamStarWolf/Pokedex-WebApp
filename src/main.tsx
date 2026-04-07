// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

function applyGitHubPagesRedirect(locationObject: Location) {
  if (locationObject.search[1] !== "/") return;

  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const decoded = locationObject.search
    .slice(1)
    .split("&")
    .map((segment) => segment.replace(/~and~/g, "&"))
    .join("?");

  const newPath = `${locationObject.pathname.slice(0, -1)}${decoded}`;
  // Validate the redirect stays within the app's base path
  if (!newPath.startsWith(base) || newPath.includes("//")) return;
  window.history.replaceState(null, "", newPath + locationObject.hash);
}

applyGitHubPagesRedirect(window.location);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
