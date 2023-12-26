import { useCallback, useEffect, useState } from "react";
import { Tag } from "../posts/one-post";
import { triggerErrorMessage } from "../../utils/locals";

export default function ProfileNav({ isMyProfile, username }: {
    isMyProfile: boolean,
    username: string,
}): JSX.Element {
    const [tags, setTags] = useState<Array<Tag>>([]);
    const [tagChosenIndex, setTagChosenIndex] = useState<number>(-1);

    const handleClearTagChosen = useCallback(() => {
        setTagChosenIndex(-1);
    }, []);

    const handleChooseTag = useCallback((index: number) => () => {
        setTagChosenIndex(index);
    }, []);

    useEffect(() => {
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

    return <div className="profile-nav sticky-top p-3 border-end">
        <ul className="nav flex-column">
            {isMyProfile && <li className="nav-item">
                <a href="/user/friends" className="nav-link">Friends</a>
            </li>}
            <li className="nav-item profile-tag-list">
                <div className="profile-tag-list-filter">
                    <div>Filters:</div>
                    {tagChosenIndex !== -1 && <div className="btn btn-secondary" onClick={handleClearTagChosen}>Clear Filters</div>}
                </div>
                {tags.map((tag, tagIndex) => (
                    <div
                        className={"tag-button btn " + (tagChosenIndex === tagIndex ? "btn-info" : "btn-outline-info")}
                        onClick={handleChooseTag(tagIndex)}
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
