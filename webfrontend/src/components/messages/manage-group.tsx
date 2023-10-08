import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { useMessageContext } from "./context";
import { useSearchParams } from "react-router-dom";
import { triggerErrorMessage } from "../../utils/locals";
import { postRequestContent } from "../../utils/request";

export const NewGroupChatButton = () => {
    const { isCreatingNewGroup, setIsCreatingNewGroup } = useMessageContext();
    const setSearchParams = useSearchParams()[1];

    const handleClick = useCallback(() => {
        setIsCreatingNewGroup(true);
        setSearchParams({
            chatid: 'newgroupchat',
        })
    }, [setIsCreatingNewGroup, setSearchParams]);

    return <div 
        className={"chatlist-list-form" + (isCreatingNewGroup ? " chatlist-list-form-highlight" : "")}
        onClick={handleClick}
    >
        <div className="chatlist-list-form-icon">
            <img src={process.env.PUBLIC_URL + '/plus-icon.png'} alt="" />
        </div>
        <div>Create group chat</div>
    </div>;
}

type FriendType = {
    name: string,
    username: string,
    link: string,
    img: string,
}

export const NewGroupChatForm = () => {
    const [groupName, setGroupName] = useState<string>('');
    const [addedFriends, setAddedFriends] = useState<Array<FriendType>>([]);
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const setSearchParam = useSearchParams()[1];
    const { setIsCreatingNewGroup } = useMessageContext();

    const addFriend = useCallback((newFriend: FriendType) => {
        setAddedFriends(friends => [
            ...friends,
            newFriend,
        ]);
    }, []);

    const isFriendAdded = useCallback((newFriend: FriendType): boolean => {
        return addedFriends.some((user: FriendType) => user.username === newFriend.username);
    }, [addedFriends]);

    const submitForm = useCallback(() => {
        if (groupName === '') {
            setError('Group name cannot be empty!');
            return;
        } else if (addedFriends.length === 0) {
            setError('You must add at least one friend!');
            return;
        } else {
            setError('');
        }

        if (isLoading) {
            return;
        }
        setIsLoading(true);
        fetch('/messages/create_group_chat', postRequestContent({
            group_name: groupName,
            users: addedFriends.map(friend => friend.username),
        }))
            .then(response => {
                setIsLoading(false);
                if (response.status !== 200) {
                    triggerErrorMessage();
                    return;
                }
                response.json().then(chat => {
                    setSearchParam({
                        chatid: chat.id,
                    });
                    setIsCreatingNewGroup(false);
                });
            });
    }, [addedFriends, groupName, isLoading, setSearchParam, setIsCreatingNewGroup]);

    return <div className="groupchat-form">
        <div className="groupchat-form-field">
            <div className="form-label">Groupchat name</div>
            <input
                type="text"
                className="form-control"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value.slice(0, 20))} 
            />
        </div>
        <div className="groupchat-form-field">
            <div className="form-label">Friends to add</div>
            <FriendSearchForm
                addFriend={addFriend}
                isFriendAdded={isFriendAdded}
            />
        </div>
        <div className="groupchat-form-friends">
            {addedFriends.map(addedFriend => (
                <AddedFriend
                    addedFriend={addedFriend} 
                    removeFriend={() => {
                        setAddedFriends(friends => friends.filter(friend => friend.username !== addedFriend.username));
                    }}
                    key={addedFriend.username}
                />
            ))}
        </div>
        <div className="groupchat-form-create">
            <div className="btn btn-success" onClick={submitForm}>Create</div>
        </div>
        {error !== '' && <div className="alert alert-danger mt-3">{error}</div>}
    </div>;
}

const FriendSearchForm = ({ addFriend, isFriendAdded }: {
    addFriend: (newFriend: FriendType) => void,
    isFriendAdded: (newFriend: FriendType) => boolean,
}): JSX.Element => {
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

const AddedFriend = ({ addedFriend, removeFriend }: {
    addedFriend: FriendType,
    removeFriend: () => void,
}): JSX.Element => {
    const [isHovering, setIsHovering] = useState<boolean>(false);

    return <div 
        className="groupchat-form-friend-container"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
    >
        <a 
            target="_blank" 
            rel="noreferrer"
            href={addedFriend.link} 
            className="groupchat-form-friend btn btn-outline-info p-1"
        >
            <div className="groupchat-form-friend-img">
                <img src={addedFriend.img} alt="" />
            </div>
            <div className="groupchat-form-friend-info">
                <div>{addedFriend.name}</div>
                <div>{addedFriend.username}</div>
            </div>
        </a>
        {isHovering && <div className="groupchat-form-friend-delete"> 
            <button type="button" className="btn-close" aria-label="Close" onClick={removeFriend} />
        </div>}
    </div>;
}
