import React from "react";
import ReactDOM from "react-dom/client";
import NanaKnows from "./NanaKnows.jsx";
import { I18nProvider } from "./i18n/index.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <I18nProvider>
      <NanaKnows />
    </I18nProvider>
  </React.StrictMode>
);
