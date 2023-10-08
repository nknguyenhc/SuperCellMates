import { ChangeEvent, useCallback, useMemo, useRef, useState } from "react";
import { useMessageContext } from "./context";
import { postRequestContent } from "../../utils/request";
import { triggerErrorMessage } from "../../utils/locals";

export const ChatMore = ({ isSocketOpen, setShowFile, setFile }: {
    isSocketOpen: () => boolean,
    setShowFile: (showFile: boolean) => void,
    setFile: (file: File) => void,
}): JSX.Element => {
    const [isHovering, setIsHovering] = useState<boolean>(false);
    const { isCurrChatPrivate } = useMessageContext();
    const fileInput = useRef<HTMLInputElement>(null);

    const handleOpenFile = useCallback(() => {
        if (!isSocketOpen()) {
            return;
        }
        fileInput.current!.click();
    }, [isSocketOpen]);

    const changeFile = useCallback(() => {
        setFile(fileInput.current!.files![0]);
        setShowFile(true);
    }, [setFile, setShowFile]);

    return <div 
        className="chatlog-more"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
    >
        <div className="chatlog-more-icon">
            <img src={process.env.PUBLIC_URL + '/plus-icon.png'} alt="more" />
        </div>
        {isHovering && <div className="chatlog-more-options">
            {!isCurrChatPrivate && <div className="chatlog-more-option">
                <img src={process.env.PUBLIC_URL + '/add-person-icon.png'} alt="members" />
            </div>}
            <div className="chatlog-more-option" onClick={handleOpenFile}>
                <img src={process.env.PUBLIC_URL + '/docs-icon.png'} alt="file" />
            </div>
            <input type="file" ref={fileInput} onChange={changeFile} />
            <div className="chatlog-more-option"></div>
        </div>}
    </div>;
}

export const FilePreview = ({ setShowFile, file, retrieveFileMessage, isSocketOpen }: {
    setShowFile: (showFile: boolean) => void,
    file: File,
    retrieveFileMessage: (messageId: string) => void,
    isSocketOpen: () => boolean,
}): JSX.Element => {
    const imageExtensions = useMemo(() => ['png', 'jpg', 'jpeg', 'bmp', 'webp', 'svg', 'heic'], []);
    const isImage = useMemo(() => {
        const nameExtension = file.name.split('.').at(-1);
        const typeExtension = file.type.split('/').at(-1);
        return nameExtension && imageExtensions.includes(nameExtension) 
            && typeExtension && imageExtensions.includes(typeExtension);
    }, [imageExtensions, file]);
    const { currChatId } = useMessageContext();

    const handleSubmit = useCallback(() => {
        if (!isSocketOpen()) {
            triggerErrorMessage();
            setShowFile(false);
        }

        fetch('/messages/upload_file', postRequestContent({
            chat_id: currChatId,
            file: file,
            file_name: file.name,
        }))
            .then(res => {
                if (res.status !== 200) {
                    triggerErrorMessage();
                    return;
                }
                res.text().then(messageId => retrieveFileMessage(messageId));
                setShowFile(false);
            });
    }, [file, retrieveFileMessage, isSocketOpen, currChatId, setShowFile]);

    return <div className="chatlog-file-preview">
        <div className="chatlog-file-preview-window">
            <div className="chatlog-file-preview-img">
                {!isImage
                ? <>
                    <div>No preview available</div>
                    <div>{file.name}</div>
                </>
                : <img src={URL.createObjectURL(file)} alt="preview" />}
            </div>
            <div className="chatlog-file-preview-buttons">
                <button className="btn btn-danger" onClick={() => setShowFile(false)}>Cancel</button>
                <button className="btn btn-success" onClick={handleSubmit}>Send</button>
            </div>
        </div>
    </div>;
}

export const ChatInput = ({ sendMessage }: {
    sendMessage: (message: string) => void,
}): JSX.Element => {
    const textInput = useRef<HTMLTextAreaElement>(null);
    const [text, setText] = useState<string>('');
    const maxLength = 700;
    const [isHoldingShift, setIsHoldingShift] = useState<boolean>(false);

    const adjustInputHeight = useCallback(() => {
        textInput.current!.style.height = "0px";
        textInput.current!.style.height = textInput.current!.scrollHeight + "px";
    }, []);

    const processMessage = useCallback(() => {
        if (text === '') {
            return;
        }
        sendMessage(text);
        setText('');
        setTimeout(adjustInputHeight, 10);
    }, [sendMessage, text, adjustInputHeight]);

    const changeInput = useCallback((e: ChangeEvent) => {
        const currValue = (e.target as HTMLTextAreaElement).value;
        if (currValue.slice(currValue.length - 1, currValue.length) === '\n' && !isHoldingShift) {
            processMessage();
            return;
        }
        setText(currValue.slice(0, maxLength));
        setTimeout(adjustInputHeight, 10);
    }, [isHoldingShift, processMessage, adjustInputHeight]);

    return <div className="chatlog-input-message-container">
        <div className="chatlog-input-message">
            <textarea
                rows={1}
                className="form-control"
                value={text}
                ref={textInput}
                onChange={changeInput}
                onKeyDown={e => {
                    if (e.key === 'Shift') {
                        setIsHoldingShift(true);
                    }
                }}
                onKeyUp={e => {
                    if (e.key === 'Shift') {
                        setIsHoldingShift(false);
                    }
                }}
            />
            <div 
                className="btn btn-primary chatlog-input-message-send"
                onClick={processMessage}
            >
                Send
            </div>
        </div>
        <div className="chatlog-input-message-wordcount text-primary">{text.length}/{maxLength}</div>
    </div>;
}
