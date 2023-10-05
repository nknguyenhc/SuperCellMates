import { ChangeEvent, useCallback, useRef, useState } from "react";

export const ChatMore = (): JSX.Element => {
    return <div className="chatlog-more">
        <div className="chatlog-more-icon">
            <img src={process.env.PUBLIC_URL + '/plus-icon.png'} alt="more" />
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
