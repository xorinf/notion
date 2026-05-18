import { createBrowserRouter, RouterProvider } from "react-router";
import { useEffect } from "react";
import { useAuth } from "../store/authStore";
import RootLayout from "./components/RootLayout";
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import DashBoard from "./components/DashBoard";
import Profile from "./components/Profile";
import Task from "./components/Task";
import Journal from "./components/Journal";
import Page from "./components/Page";
import Search from "./components/Search";
import HomeDashBoard from "./components/HomeDashBoard";
import Workspace from "./components/Workspace";
import ChangePassword from "./components/ChangePassword";
import Board from "./components/Board"

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "register", element: <Register /> },
      { path: "login", element: <Login /> },
    ],
  },
  {
    path: "dashboard",
    element: <DashBoard />,
    children: [
      { index: true, element: <HomeDashBoard /> },
      { path: "profile", element: <Profile /> },
      { path: "workspace/:id", element: <Workspace /> },
      { path: "task", element: <Task /> },
      { path: "journal", element: <Journal /> },
      { path: "page", element: <Page /> },
      { path: "search", element: <Search /> },
      { path: "dashboardhome", element: <HomeDashBoard /> },
      { path: "change-password", element: <ChangePassword /> },
      { path: "workspace/:workspaceId/board/:boardId", element: <Board /> }
    ],
  },
]);

function App() {
  const checkAuth = useAuth((state) => state.checkAuth);

  // Restore session on every full page load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <RouterProvider router={router} />;
}

export default App;
