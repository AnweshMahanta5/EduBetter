import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import "./i18n/setup";
import "../styles/index.css";

import App from "./App";
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import Scholarships from "./pages/Scholarships";
import ScholarshipDetail from "./pages/ScholarshipDetail";
import Resources from "./pages/Resources";
import ResourcesBoard from "./pages/ResourcesBoard";
import ResourcesLanding from "./pages/ResourcesLanding";
import StateBoards from "./pages/StateBoards";
import Help from "./pages/Help";
import ExamDates from "./pages/ExamDates";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Classroom from "./pages/Classroom";
import ProtectedRoute from "./components/ProtectedRoute";

import { AuthProvider } from "./contexts/AuthContext";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },

      { path: "onboarding", element: <Onboarding /> },
      { path: "scholarships", element: <Scholarships /> },
      { path: "scholarship/:id", element: <ScholarshipDetail /> },

      { path: "resources", element: <Resources /> },
      { path: "resources/board/:boardId", element: <ResourcesBoard /> },
      { path: "resources/landing", element: <ResourcesLanding /> },

      { path: "state-boards", element: <StateBoards /> },
      { path: "exam-dates", element: <ExamDates /> },
      { path: "help", element: <Help /> },

      {
        path: "classroom",
        element: (
          <ProtectedRoute>
            <Classroom />
          </ProtectedRoute>
        ),
      },

      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },

      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
