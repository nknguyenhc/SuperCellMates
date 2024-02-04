import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { Login } from "../components/auth/login/login";
import { Register } from "../components/auth/register/register";
import Home from "../pages/home/home";
import Messages from "../pages/messages/messages";
import Settings from "../pages/settings/settings";
import Setup from "../pages/setup/setup";
import Profile from "../pages/profile/profile";
import OnePostPage from "../pages/post/one-post";
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
                path: "/register",
                element: <Register />,
            },
            {
                path: "/profile",
                element: <Profile isMyProfile={true} />
            },
            {
                path: "/user/profile/*",
                element: <Profile isMyProfile={false} />
            },
            {
                path: "/post/display",
                element: <OnePostPage />,
            },
            {
                path: "/messages",
                element: <Messages />
            },
            {
                path: "/settings",
                element: <Settings />
            },
            {
                path: '/profile/setup',
                element: <Setup />
            },
        ]
    }
]);

export default router;