// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

function applyGitHubPagesRedirect(locationObject: Location) {
  if (locationObject.search[1] !== "/") return;

  const decoded = locationObject.search
    .slice(1)
    .split("&")
    .map((segment) => segment.replace(/~and~/g, "&"))
    .join("?");

  window.history.replaceState(null, "", `${locationObject.pathname.slice(0, -1)}${decoded}${locationObject.hash}`);
}

applyGitHubPagesRedirect(window.location);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
