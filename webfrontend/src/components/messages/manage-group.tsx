import { useCallback, useEffect, useMemo, useState } from "react";
import { useMessageContext } from "./context";
import { useSearchParams } from "react-router-dom";
import { triggerErrorMessage } from "../../utils/locals";
import { postRequestContent } from "../../utils/request";
import FriendSearchForm from "./friend-search";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import UserTable from "./table";

export const NewGroupChatButton = () => {
    const { isCreatingNewGroup, setIsCreatingNewGroup, setIsAddingPeople } = useMessageContext();
    const setSearchParams = useSearchParams()[1];

    const handleClick = useCallback(() => {
        setIsCreatingNewGroup(true);
        setIsAddingPeople(false);
        setSearchParams({
            chatid: 'newgroupchat',
        })
    }, [setIsCreatingNewGroup, setIsAddingPeople, setSearchParams]);

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

export type FriendType = {
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

export type Role = 'member' | 'admin' | 'creator';

export type MemberType = {
    name: string,
    username: string,
    link: string,
    img: string,
    role: Role,
}

export const AddPeopleForm = (): JSX.Element => {
    const [currentMembers, setCurrentMembers] = useState<Array<MemberType>>([]);
    const currentAdmins = useMemo(
        () => currentMembers.filter(member => member.role === 'admin' || member.role === 'creator'),
        [currentMembers]
    );
    const [currFriend, setCurrFriend] = useState<FriendType | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [addedFriends, setAddedFriends] = useState<Array<FriendType>>([]);
    const [myRole, setMyRole] = useState<Role>('member');
    const { currChatId } = useMessageContext();
    const username = useSelector((state: RootState) => state.auth.username);

    const getCurrentMembers = useCallback(() => {
        fetch('/messages/get_members?chatid=' + currChatId)
            .then(res => {
                if (res.status !== 200) {
                    triggerErrorMessage();
                    return;
                }
                res.json().then(res => {
                    setCurrentMembers(res.users.map((user: any) => ({
                        name: user.name,
                        username: user.username,
                        link: user.profile_link,
                        img: user.profile_img_url,
                        role: user.role,
                    })));
                    setIsLoading(false);
                    res.users.forEach((user: any) => {
                        if (user.username === username) {
                            setMyRole(user.role);
                        }
                    })
                });
            });
    }, [currChatId, username]);

    useEffect(() => {
        getCurrentMembers();
    }, [getCurrentMembers]);

    const addFriend = useCallback(() => {
        if (isLoading) {
            return;
        }
        setIsLoading(true);
        fetch('/messages/add_member', postRequestContent({
            username: currFriend!.username,
            chat_id: currChatId,
        }))
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                    return;
                }
                setAddedFriends(addedFriends => [
                    ...addedFriends,
                    currFriend!
                ]);
                setCurrFriend(undefined);
                setTimeout(getCurrentMembers, 100);
            });
    }, [isLoading, currFriend, currChatId, getCurrentMembers]);

    const removeUser = useCallback((member: MemberType) => {
        if (isLoading) {
            return;
        }
        setIsLoading(true);
        fetch('/messages/remove_user', postRequestContent({
            chatid: currChatId,
            username: member.username
        }))
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                    return;
                }
                setTimeout(getCurrentMembers, 100);
            });
    }, [isLoading, currChatId, getCurrentMembers]);

    const addAdmin = useCallback((user: MemberType) => {
        if (isLoading) {
            return;
        }
        setIsLoading(true);
        fetch('/messages/add_admin', postRequestContent({
            chatid: currChatId,
            username: user.username,
        }))
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                    return;
                }
                setTimeout(getCurrentMembers, 100);
            });
    }, [isLoading, currChatId, getCurrentMembers]);

    const removeAdmin = useCallback((user: MemberType) => {
        if (isLoading) {
            return;
        }
        setIsLoading(true);
        fetch('/messages/remove_admin', postRequestContent({
            chatid: currChatId,
            username: user.username,
        }))
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                    return;
                }
                setTimeout(getCurrentMembers, 100);
            });
    }, [isLoading, currChatId, getCurrentMembers]);

    const assignLeader = useCallback((user: MemberType, password?: string) => {
        if (isLoading) {
            return;
        }
        setIsLoading(true);
        fetch('/messages/assign_leader', postRequestContent({
            chatid: currChatId,
            username: user.username,
            password: password
        }))
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                    return;
                }
                response.text().then(text => {
                    if (text === 'ok') {
                        setMyRole('admin');
                    } else {
                        alert("Authentication failed!");
                    }
                });
                setTimeout(getCurrentMembers, 100);
            });
    }, [isLoading, currChatId, getCurrentMembers]);

    const isFriendAdded = useCallback((friend: FriendType) => {
        return friend.username === currFriend?.username || currentMembers.some(member => member.username === friend.username);
    }, [currentMembers, currFriend]);

    return <div className="add-people-form p-3">
        <div>Add people to this group chat</div>
        <FriendSearchForm
            addFriend={(friend: FriendType) => setCurrFriend(friend)}
            isFriendAdded={isFriendAdded}
        />
        {currFriend && <div className="add-people-friend">
            <div>Are you sure to add {currFriend.name} (<a href={currFriend.link}>{currFriend.username}</a>) to this group chat?</div>
            <div className="add-people-friend-actions">
                <button className="btn btn-success" onClick={() => addFriend()}>Yes</button>
                <button className="btn btn-danger" onClick={() => setCurrFriend(undefined)}>No</button>
            </div>
        </div>}
        <div className="add-people-added-friends">
            {addedFriends.map(friend => (
                <div className="text-success" key={friend.username}>
                    <img src="/static/media/check-icon.png" className="add-people-added-success" alt="success" />
                    User {friend.name} (<a href={friend.link}>{friend.username}</a>) has been added to this group chat.
                </div>
            ))}
        </div>
        <div className="add-people-table">
            <div>Members</div>
            <UserTable 
                users={currentMembers}
                variant="members"
                removeAction={removeUser}
                addAction={addAdmin}
                removeBtnText="Remove"
                addBtnText="Assign as admin"
                removeCaption="Remove this user from this chat?"
                addCaption="Assign this user as admin?"
                myRole={myRole}
            />
        </div>
        <div className="add-people-table">
            <div>Admins</div>
            <UserTable 
                users={currentAdmins}
                variant="admins"
                removeAction={removeAdmin}
                addAction={assignLeader}
                removeBtnText="Remove admin"
                addBtnText="Transfer ownership"
                removeCaption="Remove this user from admin list?"
                addCaption="Assign this user as leader?\nNote: you will lose privileges as leader"
                myRole={myRole}
            />
        </div>
        {isLoading && <div className="chatlog-loader">
            <span className="spinner-grow text-warning" />
        </div>}
    </div>;
}
