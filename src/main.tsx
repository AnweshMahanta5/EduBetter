import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "./i18n/setup";
import "../styles/index.css";

import App from "./App";

// Pages
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import Scholarships from "./pages/Scholarships";
import ScholarshipDetail from "./pages/ScholarshipDetail";
import Resources from "./pages/Resources";
import ResourcesBoard from "./pages/ResourcesBoard";
import Help from "./pages/Help";

// Simple error element (prevents blank screen on route errors)
function RouteError() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>Unexpected Application Error</h1>
      <p>Something went wrong while loading this page.</p>
      <p>
        <a href="/" style={{ textDecoration: "underline" }}>Go Home</a>
      </p>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,          // App must render <Outlet />
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Home /> },

      // Scholarships flow
      { path: "onboarding", element: <Onboarding /> },
      { path: "scholarships", element: <Scholarships /> },
      { path: "scholarship/:id", element: <ScholarshipDetail /> },

      // Resources flow
      { path: "resources", element: <Resources /> },                           // landing (CBSE / ICSE / STATE)
      { path: "resources/board/:boardId", element: <ResourcesBoard /> },       // detailed view

      { path: "help", element: <Help /> },

      // Fallback → Home (prevents blank page)
      { path: "*", element: <Navigate to="/" replace /> }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <React.Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <RouterProvider router={router} fallbackElement={<div style={{ padding: 24 }}>Loading…</div>} />
    </React.Suspense>
  </React.StrictMode>
);
