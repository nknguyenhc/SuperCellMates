import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { Login } from "../components/auth/login/login";
import Home from "../pages/home/home";

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
            }
        ]
    }
]);

export default router;