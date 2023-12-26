import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { triggerErrorMessage } from "../../utils/locals";

export default function ProfileTop({ isMyProfile, username }: {
    isMyProfile: boolean,
    username: string,
}): JSX.Element {
    const [isProfileLoading, setIsProfileLoading] = useState<boolean>(true);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [name, setName] = useState<string>('');

    useEffect(() => {
        const url = isMyProfile ? '/profile/async' : `/user/profile/${username}`;
        fetch(url).then(res => {
            if (res.status !== 200) {
                triggerErrorMessage();
                return;
            }
            setIsProfileLoading(false);
            res.json().then(res => {
                setImageUrl(res.image_url);
                setName(res.user_profile.name);
            });
        });
    }, [username, isMyProfile]);

    if (isProfileLoading) {
        return <div className="profile">
            <span className="spinner-grow" />
        </div>
    }

    return <div className="profile-top border-bottom p-4">
        <div className="profile-top-info">
            <img className="img-thumbnail" src={imageUrl} alt="" />
            <div className="profile-top-info-text">
                <Link to="/profile/setup">
                    <button className="btn btn-outline-primary">Edit Profile</button>
                </Link>
                <div className="profile-top-info-auth">
                    <strong className="fs-3">{name}</strong>
                    <div className="fs-4">{username}</div>
                </div>
            </div>
        </div>
        <Link className="profile-top-achievement" to={`/profile/achievements/${username}`}>
            <img src={process.env.PUBLIC_URL + "/trophy.jpg"} alt="" />
        </Link>
    </div>;
}