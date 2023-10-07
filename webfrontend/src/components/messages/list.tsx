import { useCallback, useEffect, useState } from "react";
import { useMessageContext } from "./context";
import { triggerErrorMessage } from "../../utils/locals";

type ChatInfo = {
    id: string,
    timestamp: number,
    name: string,
    img: string,
};

export default function ChatList(): JSX.Element {
    const [privateChats, setPrivateChats] = useState<Array<ChatInfo>>([]);
    const [groupChats, setGroupChats] = useState<Array<ChatInfo>>([]);
    const { isPrivateSelected } = useMessageContext();
    const [unreadPrivateChats, setUnreadPrivateChats] = useState<Set<string>>(new Set<string>());
    const [unreadGroupChats, setUnreadGroupChats] = useState<Set<string>>(new Set<string>());

    const getUnreadChats = useCallback(() => {
        fetch('/notification/chats_new_messages')
            .then(res => {
                if (res.status !== 200) {
                    triggerErrorMessage();
                    return;
                }
                res.json().then(res => {
                    setUnreadPrivateChats(new Set<string>(res.privates));
                    setUnreadGroupChats(new Set<string>(res.groups));
                });
            });
    }, []);

    const isChatUnread = useCallback((chatId: string): boolean => {
        if (isPrivateSelected) {
            return unreadPrivateChats.has(chatId);
        } else {
            return unreadGroupChats.has(chatId);
        }
    }, [unreadPrivateChats, unreadGroupChats, isPrivateSelected]);

    useEffect(() => {
        fetch('/messages/get_private_chats')
            .then(res => {
                if (res.status !== 200) {
                    triggerErrorMessage();
                    return;
                }
                res.json().then(res => {
                    setPrivateChats(res.privates.map((chat: any) => ({
                        id: chat.id,
                        timestamp: chat.timestamp,
                        name: chat.user.name,
                        img: chat.user.profile_img_url,
                    })).sort((a: ChatInfo, b: ChatInfo) => b.timestamp - a.timestamp));
                });
            });
        fetch('/messages/get_group_chats')
            .then(res => {
                if (res.status !== 200) {
                    triggerErrorMessage();
                    return;
                }
                res.json().then(res => {
                    setGroupChats(res.groups.sort(
                        (a: ChatInfo, b: ChatInfo) => b.timestamp - a.timestamp
                    ));
                });
            });
    }, []);

    return <div className="chatlist">
        <ChatIndicator getUnreadChats={getUnreadChats} />
        <Container 
            chats={isPrivateSelected ? privateChats : groupChats}
            isChatUnread={isChatUnread}
            getUnreadChats={getUnreadChats}
        />
    </div>;
}

const ChatIndicator = ({ getUnreadChats }: {
    getUnreadChats: () => void,
}): JSX.Element => {
    const { isPrivateSelected, setIsPrivateSelected } = useMessageContext();

    const handlePrivateClick = useCallback(() => {
        setIsPrivateSelected(true);
        getUnreadChats();
    }, [setIsPrivateSelected, getUnreadChats]);

    const handleGroupClick = useCallback(() => {
        setIsPrivateSelected(false);
        getUnreadChats();
    }, [setIsPrivateSelected, getUnreadChats]);

    return <div className="chatlist-indicator">
        <div 
            className={"chatlist-indicator-item" + (isPrivateSelected ? " border" : "")}
            onClick={handlePrivateClick}
        >
            Private
        </div>
        <div 
            className={"chatlist-indicator-item" + (isPrivateSelected ? "" : " border")}
            onClick={handleGroupClick}
        >
            Groups
        </div>
    </div>
}

const Container = ({ chats, isChatUnread, getUnreadChats }: {
    chats: Array<ChatInfo>,
    isChatUnread: (chatId: string) => boolean,
    getUnreadChats: () => void,
}): JSX.Element => {
    const { isPrivateSelected, currChatId, setCurrChatId, setIsCurrChatPrivate } = useMessageContext();
    
    const handleClick = useCallback((chatId: string) => {
        setCurrChatId(chatId);
        setIsCurrChatPrivate(isPrivateSelected);
        getUnreadChats();
    }, [setCurrChatId, setIsCurrChatPrivate, isPrivateSelected, getUnreadChats]);

    return <div className="chatlist-list border">
        {chats.map((chat) => (
            <div
                className={"chatlist-list-item" + (currChatId === chat.id ? " chatlist-list-item-highlight" : "")}
                onClick={() => handleClick(chat.id)}
                key={chat.id}
            >
                <div className="chatlist-list-item-container">
                    <div className="chatlist-list-item-img">
                        <img src={chat.img} alt="" />
                    </div>
                    <div className="chatlist-list-item-name">{chat.name}</div>
                </div>
                {isChatUnread(chat.id) && <span className="bg-danger rounded-circle p-2" />}
            </div>
        ))}
    </div>
}
