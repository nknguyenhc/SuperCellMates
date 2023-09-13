import { useSelector } from "react-redux";
import { RootState } from '../../redux/store';
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home(): JSX.Element {
    const auth = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (auth.isVerified && !auth.isLoggedIn) {
            navigate(`/login?next=${window.location.pathname}`);
        }
    }, [auth, navigate]);

    return <div>Home</div>;
}