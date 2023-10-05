import { useCallback, useState } from "react";
import { MessageType } from "./log"
import { formatNumber } from "../../utils/primitives";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

export const Message = ({ message }: {
    message: MessageType
}): JSX.Element => {
    const [isHovering, setIsHovering] = useState<boolean>(false);
    const username = useSelector((state: RootState) => state.auth.username);

    const timestampToTime = useCallback((timestamp: number): string => {
        const time = new Date(timestamp * 1000);
        return `${
            formatNumber(time.getHours(), 2)
        }:${
            formatNumber(time.getMinutes(), 2)
        } ${
            formatNumber(time.getDate(), 2)
        }/${
            formatNumber(time.getMonth() + 1, 2)
        }/${
            formatNumber(time.getFullYear(), 2)
        }`;
    }, []);

    return <div 
        id={message.id}
        className={"message" + (message.user.username === username ? " message-self" : "")}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
    >
        <a href={message.user.link} className="message-user-img">
            <img src={message.user.img} alt="" />
        </a>
        <div className="message-content border border-primary">
            <a href={message.user.link} className="message-author">{message.user.username}</a>
            {
                'filename' in message
                ? <FileDisplay id={message.id} filename={message.filename} isImage={message.isImage} />
                : 'post' in message
                ? <ReplyPost text={message.message} post={message.post} />
                : <Text text={message.message} />
            }
        </div>
        <div 
            className="message-timestamp text-secondary"
            style={{
                display: isHovering ? "" : "none",
            }}
        >
            {timestampToTime(message.timestamp)}
        </div>
    </div>;
}

const Text = ({ text }: {
    text: string,
}): JSX.Element => {
    return <div className="message-text">{text}</div>;
}

const FileDisplay = ({ id, filename, isImage }: {
    id: string,
    filename: string,
    isImage: boolean,
}): JSX.Element => {
    return <div className="message-text">
        {isImage
        ? <img src={'/messages/image/' + id} alt="" />
        : <a href={'/messages/image/' + id} target="_blank" rel="noreferrer">{filename}</a>}
    </div>;
}

const ReplyPost = ({ text, post }: {
    text: string,
    post: {
        id: string,
        title: string,
        content: string,
    },
}): JSX.Element => {
    const trimContent = useCallback((content: string): string => 
            content.length > 50 ? content.slice(0, 40) + '...' : content, []);

    return <>
        <a href={`/post/display?id=${post.id}`} className="message-post">
            <div className="message-post-title">{trimContent(post.title)}</div>
            <div className="message-post-content">{trimContent(post.content)}</div>
        </a>
        <div className="message-text">{text}</div>
    </>;
}
