import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { FriendType } from "./manage-group";
import { triggerErrorMessage } from "../../utils/locals";

export default function FriendSearchForm ({ addFriend, isFriendAdded }: {
    addFriend: (newFriend: FriendType) => void,
    isFriendAdded: (newFriend: FriendType) => boolean,
}): JSX.Element {
    const [searchParam, setSearchParam] = useState<string>('');
    const [searchFriends, setSearchFriends] = useState<Array<FriendType>>([]);
    const [isFriendListLoading, setIsFriendListLoading] = useState<boolean>(false);
    const [isSearchParamChanged, setIsSearchParamChanged] = useState<boolean>(false);
    const [showResultBox, setShowResultBox] = useState<boolean>(false);
    const timer = useRef<number>(-1);
    const root = useRef<HTMLDivElement>(null);

    const searchFriend = useCallback(() => {
        if (!isSearchParamChanged || isFriendListLoading || searchParam === '') {
            return;
        }
        setIsFriendListLoading(true);
        fetch(`/user/search_friend?username=${searchParam}`)
            .then(res => {
                if (res.status !== 200) {
                    triggerErrorMessage();
                    return;
                }
                setIsFriendListLoading(false);
                setIsSearchParamChanged(false);
                res.json().then(res => {
                    setSearchFriends(res.users
                        .map((user: any) => ({
                            name: user.name,
                            username: user.username,
                            link: user.profile_link,
                            img: user.profile_pic_url,
                        }))
                        .filter((user: FriendType) => !isFriendAdded(user))
                    );
                });
            });
    }, [isFriendAdded, isFriendListLoading, searchParam, isSearchParamChanged]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            searchFriend();
        }
    }, [searchFriend]);

    const handleKeyUp = useCallback(() => {
        clearTimeout(timer.current);
        timer.current = window.setTimeout(searchFriend, 500);
    }, [searchFriend]);

    const handleChange = useCallback((e: ChangeEvent) => {
        setSearchParam((e.target as HTMLInputElement).value);
        setIsSearchParamChanged(true);
    }, []);

    const handleClick = useCallback((friend: FriendType) => {
        return () => {
            setShowResultBox(false);
            addFriend(friend);
            setSearchFriends(friends => friends.filter(user => user.username !== friend.username));
        };
    }, [addFriend]);

    const handleSearch = useCallback(() => {
        setShowResultBox(true);
        searchFriend();
    }, [searchFriend]);

    useEffect(() => {
        const callback = (e: MouseEvent) => {
            if (!root.current!.contains(e.target as HTMLElement)) {
                setShowResultBox(false);
            }
        }
        document.addEventListener('click', callback);
        return () => document.removeEventListener('click', callback);
    }, []);

    return <div className="groupchat-form-friend-search-container" ref={root}>
        <div className="groupchat-form-friend-search">
            <input 
                type="search"
                className="form-control"
                placeholder="Search for friend"
                onFocus={() => setShowResultBox(true)}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
            />
            <div className="btn btn-outline-primary" onClick={handleSearch}>Search</div>
        </div>
        <div className="groupchat-form-friend-search-result">
            <div className="groupchat-form-friend-search-result-box p-1" style={{ display: showResultBox ? "" : "none" }}>
                {searchFriends.length === 0
                ? <div className="text-secondary text-center">No search done/No result to show</div>
                : searchFriends.map(friend => (
                    <div 
                        className="groupchat-form-friend-search-friend-item" 
                        onClick={handleClick(friend)}
                        key={friend.username}
                    >
                        <div className="groupchat-form-friend-search-friend-img">
                            <img src={friend.img} alt="" />
                        </div>
                        <div className="groupchat-form-friend-search-friend-info">
                            <div>{friend.name}</div>
                            <div>{friend.username}</div>
                        </div>
                    </div>
                ))}
                {isFriendListLoading && <div className="loading-icon groupchat-form-friend-search-result-box-loader">
                    <span className="spinner-grow text-warning" />
                </div>}
            </div>
        </div>
    </div>;
}