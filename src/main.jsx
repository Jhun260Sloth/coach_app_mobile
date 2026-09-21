import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

function setupDynamicFavicon() {
  const updateFavicon = () => {
    const isDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const favicon = document.getElementById("dynamic-favicon");
    if (favicon) {
      favicon.href = isDark ? "/logomark-white.png" : "/logomark-dark.png";
    }
  };

  if (typeof window !== "undefined" && window.matchMedia) {
    const matcher = window.matchMedia("(prefers-color-scheme: dark)");
    updateFavicon();
    if (matcher.addEventListener) {
      matcher.addEventListener("change", updateFavicon);
    } else if (matcher.addListener) {
      matcher.addListener(updateFavicon);
    }
  }
}

setupDynamicFavicon();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
