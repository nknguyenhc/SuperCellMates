import { useSelector } from "react-redux";
import ProfileNav from "../../components/profile/profile-nav";
import ProfileTop from "../../components/profile/profile-top";
import { RootState } from "../../redux/store";

export default function Profile({ isMyProfile }: {
    isMyProfile: boolean,
}): JSX.Element {
    const username = useSelector((state: RootState) => state.auth.username);

    return <div className="profile">
        <ProfileTop isMyProfile={isMyProfile} username={username} />
        <div className="profile-content">
            <ProfileNav isMyProfile={isMyProfile} username={username} />
        </div>
    </div>;
}
