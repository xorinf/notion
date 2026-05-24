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
import BoardView from "./components/BoardView";
import Notification from "./components/Notification";
import Logout from "./components/Logout";
import InviteHandler from "./components/InviteHandler";
import { ProtectedRoute, PublicRoute } from "./components/AuthGuards";
import Superadmin from "./components/Superadmin";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      {
        path: "register",
        element: (
          <PublicRoute>
            <Register />
          </PublicRoute>
        ),
      },
      {
        path: "login",
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        ),
      },
    ],
  },
  {
    path: "dashboard",
    element: (
      <ProtectedRoute>
        <DashBoard />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <HomeDashBoard /> },
      { path: "profile", element: <Profile /> },
      { path: "workspace/:id", element: <Workspace /> },
      { path: "workspace/invite/:token", element: <InviteHandler /> },
      { path: "task", element: <Task /> },
      { path: "journal", element: <Journal /> },
      { path: "page", element: <Page /> },
      { path: "search", element: <Search /> },
      { path: "dashboardhome", element: <HomeDashBoard /> },
      { path: "change-password", element: <ChangePassword /> },
      { path: "board/:boardId", element: <BoardView /> },
      { path: "notifications", element: <Notification /> },
    ],
  },
  {
    path: "logout",
    element: <Logout />,
  },
  {
    path: "superadmin",
    element: (
      <ProtectedRoute>
        <Superadmin />
      </ProtectedRoute>
    ),
  },
]);

function App() {
  const checkAuth = useAuth((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <RouterProvider router={router} />;
}

export default App;
