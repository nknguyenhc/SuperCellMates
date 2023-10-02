import { useEffect, useState } from "react";
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
        <ChatIndicator />
        <Container chats={isPrivateSelected ? privateChats : groupChats} />
    </div>;
}

const ChatIndicator = (): JSX.Element => {
    const { isPrivateSelected, setIsPrivateSelected } = useMessageContext();

    return <div className="chatlist-indicator">
        <div 
            className={"chatlist-indicator-item" + (isPrivateSelected ? " border" : "")}
            onClick={() => setIsPrivateSelected(true)}
        >
            Private
        </div>
        <div 
            className={"chatlist-indicator-item" + (isPrivateSelected ? "" : " border")}
            onClick={() => setIsPrivateSelected(false)}
        >
            Groups
        </div>
    </div>
}

const Container = ({ chats }: {
    chats: Array<ChatInfo>
}): JSX.Element => {
    const { currChatId, setCurrChatId } = useMessageContext();

    return <div className="chatlist-list border">
        {chats.map((chat) => (
            <div
                className={"chatlist-list-item" + (currChatId === chat.id ? " chatlist-list-item-highlight" : "")}
                onClick={() => setCurrChatId(chat.id)}
                key={chat.id}
            >
                <div className="chatlist-list-item-container">
                    <div className="chatlist-list-item-img">
                        <img src={chat.img} alt="" />
                    </div>
                    <div className="chatlist-list-item-name">{chat.name}</div>
                </div>
            </div>
        ))}
    </div>
}
