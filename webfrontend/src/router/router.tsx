import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { Login } from "../components/auth/login/login";
import Home from "../pages/home/home";
import Messages from "../pages/messages/messages";
import Profile from "../pages/profile/Profile";
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
                path: "/profile",
                element: <Profile/>
            }
        ]
    }
]);

export default router;