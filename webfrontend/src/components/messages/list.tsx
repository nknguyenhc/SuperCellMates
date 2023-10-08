import { useCallback, useEffect, useState } from "react";
import { useMessageContext } from "./context";
import { triggerErrorMessage } from "../../utils/locals";
import { useSearchParams } from "react-router-dom";
import { NewGroupChatButton } from "./manage-group";

type ChatInfo = {
    id: string,
    timestamp: number,
    name: string,
    img: string,
};

export default function ChatList(): JSX.Element {
    const [privateChats, setPrivateChats] = useState<Array<ChatInfo>>([]);
    const [groupChats, setGroupChats] = useState<Array<ChatInfo>>([]);
    const {
        isPrivateSelected,
        setCurrChatId,
        setIsCurrChatPrivate,
        setIsPrivateSelected,
        setIsCreatingNewGroup,
    } = useMessageContext();
    const [unreadPrivateChats, setUnreadPrivateChats] = useState<Set<string>>(new Set<string>());
    const [unreadGroupChats, setUnreadGroupChats] = useState<Set<string>>(new Set<string>());
    const searchParam = useSearchParams()[0];
    const [isFirstLoading, setIsFirstLoading] = useState<{
        privates: boolean,
        groups: boolean,
    }>({
        privates: true,
        groups: true,
    });

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
                    const indicatedChatId = searchParam.get('chatid');
                    if (res.privates.find((e: any) => e.id === indicatedChatId)) {
                        setCurrChatId(indicatedChatId!);
                        setIsCurrChatPrivate(true);
                        setIsPrivateSelected(true);
                    }
                    setIsFirstLoading(isFirstLoading => ({
                        ...isFirstLoading,
                        privates: false,
                    }));
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
                    const indicatedChatId = searchParam.get('chatid');
                    if (res.groups.find((e: any) => e.id === indicatedChatId)) {
                        setCurrChatId(indicatedChatId!);
                        setIsCurrChatPrivate(false);
                        setIsPrivateSelected(false);
                    }
                    setIsFirstLoading(isFirstLoading => ({
                        ...isFirstLoading,
                        groups: false,
                    }))
                });
            });
        if (searchParam.get('chatid') === 'newgroupchat') {
            setIsCreatingNewGroup(true);
            setIsPrivateSelected(false);
        }
    }, [searchParam, setCurrChatId, setIsCurrChatPrivate, setIsPrivateSelected, setIsCreatingNewGroup]);

    return <div className="chatlist">
        <ChatIndicator getUnreadChats={getUnreadChats} />
        <Container 
            chats={isPrivateSelected ? privateChats : groupChats}
            isChatUnread={isChatUnread}
            getUnreadChats={getUnreadChats}
            isFirstLoading={isFirstLoading}
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

const Container = ({ chats, isChatUnread, getUnreadChats, isFirstLoading }: {
    chats: Array<ChatInfo>,
    isChatUnread: (chatId: string) => boolean,
    getUnreadChats: () => void,
    isFirstLoading: {
        privates: boolean,
        groups: boolean,
    }
}): JSX.Element => {
    const {
        isPrivateSelected,
        currChatId,
        setCurrChatId,
        setIsCurrChatPrivate,
        isCreatingNewGroup,
        setIsCreatingNewGroup,
    } = useMessageContext();
    const setSearchParam = useSearchParams()[1];
    
    const handleClick = useCallback((chatId: string) => {
        setCurrChatId(chatId);
        setIsCurrChatPrivate(isPrivateSelected);
        getUnreadChats();
        setIsCreatingNewGroup(false);
        setSearchParam({
            chatid: chatId,
        });
    }, [
        setCurrChatId,
        setIsCurrChatPrivate,
        isPrivateSelected,
        getUnreadChats,
        setSearchParam,
        setIsCreatingNewGroup,
    ]);

    return <div className="chatlist-list border">
        {!isPrivateSelected && <NewGroupChatButton />}
        {chats.length === 0 && !isFirstLoading.privates && !isFirstLoading.groups
        ? <div className="p-3 text-danger">
            <p>Oh no, you have no friend ...</p>
            <p>Start adding friends and chat with your friends here!</p>
        </div>
        : chats.map((chat) => (
            <div
                className={"chatlist-list-item" + (currChatId === chat.id && !isCreatingNewGroup ? " chatlist-list-item-highlight" : "")}
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
