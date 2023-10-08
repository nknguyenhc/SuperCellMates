import { useCallback, useEffect, useRef, useState } from "react";
import { useMessageContext } from "./context";
import { Message } from "./message";
import { ChatInput, ChatMore, FilePreview } from "./input";
import { postRequestContent } from "../../utils/request";
import { triggerErrorMessage } from "../../utils/locals";
import { NewGroupChatForm } from "./manage-group";

interface MessageInterface {
    id: string,
    user: {
        name: string,
        username: string,
        link: string,
        img: string,
    },
    timestamp: number,
};

interface TextMessageType extends MessageInterface {
    message: string,
}

interface FileMessageType extends MessageInterface {
    filename: string,
    isImage: boolean,
}

interface ReplyPostMessageType extends MessageInterface {
    message: string,
    post: {
        id: string,
        title: string,
        content: string,
    },
}

export type MessageType = TextMessageType | FileMessageType | ReplyPostMessageType;

export default function ChatLog(): JSX.Element {
    const { currChatId, isCurrChatPrivate, isCreatingNewGroup } = useMessageContext();
    const [isConnecting, setIsConnecting] = useState<boolean>(false);
    const [messages, setMessages] = useState<Array<MessageType>>([]);
    const chatSocket = useRef<WebSocket | undefined>(undefined);
    const [isChatDisabled, setIsChatDisabled] = useState<boolean>(false);
    const currTime = useRef<number>(new Date().getTime() / 1000);
    const jump = 60;
    const isFirstLoading = useRef<boolean>(true);
    const isFullHistoryLoaded = useRef<boolean>(false);
    const logDiv = useRef<HTMLDivElement>(null);
    const isLoading = useRef<boolean>(false);
    const lastIdLoaded = useRef<string>('');
    const currInterval = useRef<number>(-1);
    const [showFile, setShowFile] = useState<boolean>(false);
    const [file, setFile] = useState<File | undefined>(undefined);

    const dataToMessageInfo = useCallback((data: any): MessageType => {
        switch (data.type) {
            case 'text':
                return {
                    id: data.id,
                    timestamp: data.timestamp,
                    message: data.message,
                    user: {
                        name: data.user.name,
                        username: data.user.username,
                        link: data.user.profile_link,
                        img: data.user.profile_img_url,
                    },
                }
            case 'file':
                return {
                    id: data.id,
                    timestamp: data.timestamp,
                    user: {
                        name: data.user.name,
                        username: data.user.username,
                        link: data.user.profile_link,
                        img: data.user.profile_img_url,
                    },
                    filename: data.file_name,
                    isImage: data.is_image,
                };
            case 'reply_post':
                return {
                    id: data.id,
                    timestamp: data.timestamp,
                    user: {
                        name: data.user.name,
                        username: data.user.username,
                        link: data.user.profile_link,
                        img: data.user.profile_img_url,
                    },
                    message: data.message,
                    post: data.post,
                };
            default:
                throw new Error("unrecognised message type");
        }
    }, []);

    const scrollToLastMessage = useCallback(() => {
        if (lastIdLoaded.current === '') {
            return;
        }
        const messageDiv = document.getElementById(lastIdLoaded.current);
        if (messageDiv && logDiv.current!.scrollTop < messageDiv.offsetTop) {
            logDiv.current!.scrollTo(0, messageDiv.offsetTop);
        }
    }, []);

    const loadMessages = useCallback(() => {
        if (isLoading.current) {
            return;
        }
        isLoading.current = true;
        fetch(
            `/messages/get_${
                isCurrChatPrivate ? 'private' : 'group'
            }_messages/${currChatId}?start=${
                currTime.current - jump
            }&end=${currTime.current}`,
            isFirstLoading.current ? postRequestContent({}) : undefined
        )
            .then(res => {
                isLoading.current = false;
                if (res.status !== 200) {
                    triggerErrorMessage();
                    return;
                }
                res.json().then(res => {
                    if (res.messages.length === 0) {
                        if (res.next_last_timestamp !== 0) {
                            currTime.current = res.next_last_timestamp;
                            loadMessages();
                            return;
                        }
                        isFirstLoading.current = false;
                        isFullHistoryLoaded.current = true;
                        return;
                    }
                    isFirstLoading.current = false;
                    setMessages(messages => [
                        ...res.messages.map((message: any) => dataToMessageInfo(message)),
                        ...messages,
                    ]);
                    currTime.current -= jump;
                    setTimeout(() => {
                        scrollToLastMessage();
                        lastIdLoaded.current = res.messages[0].id;
                    }, 10);
                });
            });
    }, [currChatId, isCurrChatPrivate, dataToMessageInfo, scrollToLastMessage]);

    const sendMessage = useCallback((message: string) => {
        chatSocket.current!.send(JSON.stringify({
            type: 'text',
            message: message,
        }));
    }, []);

    const isSocketOpen = useCallback((): boolean => {
        if (chatSocket.current) {
            return chatSocket.current.readyState === 1;
        } else {
            return false;
        }
    }, []);

    const retrieveFileMessage = useCallback((messageId: string) => {
        chatSocket.current!.send(JSON.stringify({
            type: 'file',
            message_id: messageId,
        }));
    }, []);

    const resetLog = useCallback(() => {
        setIsChatDisabled(false);
        setMessages([]);
        setIsConnecting(false);
        currTime.current = new Date().getTime() / 1000;
        isFirstLoading.current = true;
        isFullHistoryLoaded.current = false;
        isLoading.current = false;
        lastIdLoaded.current = '';
        clearInterval(currInterval.current);
    }, []);

    useEffect(() => {
        if (chatSocket.current) {
            chatSocket.current.close();
        }

        if (currChatId) {
            resetLog();
            setIsConnecting(true);
            const socket = new WebSocket(
                (window.location.protocol === 'http:' ? 'ws://' : 'wss://')
                // + window.location.host
                + '127.0.0.1:8000'
                + '/ws/' + (isCurrChatPrivate ? 'message/' : 'group/')
                + currChatId
                + '/'
            );

            socket.onopen = () => {
                setIsConnecting(false);
                loadMessages();
                currInterval.current = window.setInterval(() => {
                    if (logDiv.current!.scrollTop < 10 && !isFullHistoryLoaded.current) {
                        loadMessages();
                    }
                }, 1000);
            }

            socket.onmessage = (e) => {
                const data = JSON.parse(e.data);
                setMessages(messages => [
                    ...messages,
                    dataToMessageInfo(data),
                ]);
                setTimeout(() => {
                    logDiv.current!.scrollTo(0, logDiv.current!.scrollHeight);
                }, 10);
                fetch('/notification/see_message', postRequestContent({
                    message_id: data.id,
                    type: data.type + (isCurrChatPrivate ? ' private' : ' group')
                }))
                    .then(res => {
                        if (res.status !== 200) {
                            triggerErrorMessage();
                        }
                    });
            }

            socket.onclose = (e) => {
                if (e.code === 4003) {
                    setIsChatDisabled(true);
                } else if (e.code !== 1000) {
                    alert("Connection is lost, please reload the page or try another time.");
                }
            }

            chatSocket.current = socket;
        }
    }, [
        currChatId, 
        isCurrChatPrivate,
        resetLog, 
        loadMessages,
        dataToMessageInfo,
    ]);

    return <div className="chatlog border">
        {isCreatingNewGroup
        ? <NewGroupChatForm />
        : currChatId === undefined
        ? <div className="text-secondary fst-italic">Select a chat</div>
        : <>
            <div className="chatlog-log" ref={logDiv}>
                {messages.map((message) => (
                    <Message message={message} key={message.id} />
                ))}
            </div>
            {isChatDisabled
            ? <div className="chatlog-input-disabled text-secondary fst-italic">
                You can no longer send message in this chat
            </div>
            : <div className="chatlog-input">
                <ChatMore
                    isSocketOpen={isSocketOpen} 
                    setShowFile={setShowFile}
                    setFile={setFile}
                />
                <ChatInput sendMessage={sendMessage} />
            </div>}
        </>}
        {showFile && <FilePreview 
            setShowFile={setShowFile} 
            file={file as File} 
            retrieveFileMessage={retrieveFileMessage}
            isSocketOpen={isSocketOpen}
        />}
        {isConnecting && !isCreatingNewGroup && <div className="chatlog-loader">
            <span className="spinner-grow text-warning" />
        </div>}
    </div>;
}
