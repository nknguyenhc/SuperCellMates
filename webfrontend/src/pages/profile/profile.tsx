import { useSelector } from "react-redux";
import ProfileNav from "../../components/profile/profile-nav";
import ProfileTop from "../../components/profile/profile-top";
import { RootState } from "../../redux/store";
import ProfileContent from "../../components/profile/profile-content";
import { ProfileContextProvider } from "./profile-context";

export default function Profile({ isMyProfile }: {
    isMyProfile: boolean,
}): JSX.Element {
    const username = useSelector((state: RootState) => state.auth.username);

    return <div className="profile">
        <ProfileContextProvider username={username} isMyProfile={isMyProfile}>
            <ProfileTop />
            <div className="profile-content">
                <ProfileNav />
                <ProfileContent />
            </div>
        </ProfileContextProvider>
    </div>;
}
