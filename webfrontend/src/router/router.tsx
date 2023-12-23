import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { Login } from "../components/auth/login/login";
import { Register } from "../components/auth/register/register";
import Home from "../pages/home/home";
import Messages from "../pages/messages/messages";
import Setup from "../pages/setup/Setup";
import Settings from "../pages/settings/settings";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/messages",
        element: <Messages />,
      },
      {
        path: "/profile/setup",
            {
                path: "/settings",
                element: <Settings />
            }
        element: <Setup />,
      },
    ],
  },
]);

export default router;