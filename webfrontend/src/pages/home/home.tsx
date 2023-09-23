import { useSelector } from "react-redux";
import { RootState } from '../../redux/store';
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HomeFilter, HomeSort } from "../../components/filter/home-filter";
import CreatePost from "../../components/posts/create-post";
import HomeFeed from "../../components/feed/homefeed";

export default function Home(): JSX.Element {
    const auth = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (auth.isVerified && !auth.isLoggedIn) {
            navigate(`/login?next=${window.location.pathname}`);
        }
    }, [auth, navigate]);

    return <div className="home-content pt-3 pb-5">
        <h3 className="welcome-message">Welcome, {auth.username}</h3>
        <div className="create-post">
            <CreatePost />
        </div>
        <div className="home-feed pt-5">
            <HomeFeed />
            <HomeFilter />
            <HomeSort />
        </div>
    </div>;
}