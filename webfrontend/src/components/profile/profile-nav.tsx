import { useCallback, useEffect, useState } from "react";
import { Tag } from "../posts/one-post";
import { triggerErrorMessage } from "../../utils/locals";
import { useProfileContext } from "../../pages/profile/profile-context";

export default function ProfileNav(): JSX.Element {
    const { isMyProfile, username, tagChosen, setTagChosen } = useProfileContext();
    const [tags, setTags] = useState<Array<Tag>>([]);

    const handleClearTagChosen = useCallback(() => {
        setTagChosen('');
    }, [setTagChosen]);

    const handleChooseTag = useCallback((tagName: string) => () => {
        setTagChosen(tagName);
    }, [setTagChosen]);

    useEffect(() => {
        if (!username) {
            return;
        }
        const url = `/profile/user_tags/${username}`;
        fetch(url).then(res => {
            if (res.status !== 200) {
                triggerErrorMessage();
                return;
            }
            res.json().then(res => {
                setTags(res.tags);
            });
        });
    }, [username, isMyProfile]);

    return <div className="profile-nav p-3 border-end">
        <ul className="nav flex-column">
            {isMyProfile && <li className="nav-item">
                <a href="/user/friends" className="nav-link">Friends</a>
            </li>}
            <li className="nav-item profile-tag-list">
                <div className="profile-tag-list-filter">
                    <div>Filters:</div>
                    {tagChosen && <div className="btn btn-secondary" onClick={handleClearTagChosen}>Clear Filters</div>}
                </div>
                {tags.map((tag) => (
                    <div
                        className={"tag-button btn " + (tagChosen === tag.name ? "btn-info" : "btn-outline-info")}
                        onClick={handleChooseTag(tag.name)}
                        key={tag.name}
                    >
                        <img src={tag.icon} alt="" />
                        <div className="tag-name">{tag.name}</div>
                    </div>
                ))}
            </li>
        </ul>
    </div>;
}
