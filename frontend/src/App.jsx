import { createBrowserRouter, RouterProvider } from "react-router";
import { useEffect, Suspense, lazy } from "react";
import { useAuth } from "../store/authStore";
import RootLayout from "./components/RootLayout";
import Home from "./components/Home";
import { ProtectedRoute, PublicRoute } from "./components/AuthGuards";

// Lazy-loaded components for code splitting
const Register = lazy(() => import("./components/Register"));
const Login = lazy(() => import("./components/Login"));
const DashBoard = lazy(() => import("./components/DashBoard"));
const Profile = lazy(() => import("./components/Profile"));
const Task = lazy(() => import("./components/Task"));
const Journal = lazy(() => import("./components/Journal"));
const Page = lazy(() => import("./components/Page"));
const Search = lazy(() => import("./components/Search"));
const HomeDashBoard = lazy(() => import("./components/HomeDashBoard"));
const Workspace = lazy(() => import("./components/Workspace"));
const ChangePassword = lazy(() => import("./components/ChangePassword"));
const BoardView = lazy(() => import("./components/BoardView"));
const Notification = lazy(() => import("./components/Notification"));
const Logout = lazy(() => import("./components/Logout"));
const InviteHandler = lazy(() => import("./components/InviteHandler"));
const Superadmin = lazy(() => import("./components/Superadmin"));

// Minimal global loader while chunks download
const GlobalLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-white">
    <div className="w-8 h-8 border-4 border-[#1a73e8] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

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
    element: <Superadmin />,
  },
]);

function App() {
  const checkAuth = useAuth((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Suspense fallback={<GlobalLoader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;
