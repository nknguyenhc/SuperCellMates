import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { Login } from "../components/auth/login/login";
import Home from "../pages/home/home";
import Messages from "../pages/messages/messages";
import Setup from "../pages/setup/setup";
const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "/",
                element: <Home />
            },
            {
                path: "/login",
                element: <Login />,
            },
            {
                path: "/messages",
                element: <Messages />
            },
            {
                path: "/profile/setup",
                element: <Setup />
            }
        ]
    }
]);

export default router;