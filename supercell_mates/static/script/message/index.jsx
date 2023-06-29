function ChatPage() {
    const [privateChats, setPrivateChats] = React.useState([]);
    const [groupChats, setGroupChats] = React.useState([]);
    const [highlighting, setHighlighting] = React.useState(-1);
    const [texts, setTexts] = React.useState([]);
    const [currSocket, setCurrSocket] = React.useState(null);
    const [currInterval, setCurrInterval] = React.useState(null);
    const [inputText, setInputText] = React.useState('');
    const inputField = React.useRef(null);
    const [isHoldingShift, setIsHoldingShift] = React.useState(false);
    const [username, setUsername] = React.useState('');
    const [chatSelected, setChatSelected] = React.useState(false);
    const messageLog = React.useRef(null);
    const [moreMenuDisplay, setMoreMenuDisplay] = React.useState(false);
    const menuMouseOutTimer = React.useRef(null);
    const fileUpload = React.useRef(null);
    const [filePreview, setFilePreview] = React.useState('');
    const [showFilePreview, setShowFilePreview] = React.useState(false);
    const filePreviewWindow = React.useRef(null);
    const [currChatId, setCurrChatId] = React.useState('');
    const imageExtensions = ['png', 'jpg', 'jpeg', 'bmp', 'webp', 'svg', 'heic'];
    const jump = 60;

    React.useEffect(() => {
        fetch('/messages/get_private_chats')
            .then(response => response.json())
            .then(async response => {
                const newPrivateChats = response.privates.map(chat => {
                    return {
                        id: chat.id,
                        timestamp: chat.timestamp,
                        chatName: chat.user.username,
                        image: chat.user.profile_img_url
                    };
                });
                await setPrivateChats(newPrivateChats);
                return newPrivateChats;
            })
            .then(newPrivateChats => {
                const idQueries = window.location.search
                    .slice(1)
                    .split("&")
                    .map(eqn => eqn.split("="))
                    .filter(pair => pair[0] === "chatid");
                if (idQueries.length > 0) {
                    let index = 0;
                    const id = idQueries[0][1];
                    while (index < newPrivateChats.length) {
                        if (newPrivateChats[index].id === id) {
                            break;
                        }
                        index++;
                    }
                    if (index < newPrivateChats.length) {
                        clickOpenChat(id, index, false);
                    }
                }
            });
    }, []);

    React.useEffect(() => {
        setUsername(document.querySelector('input#username-hidden').value);
    }, []);

    function clickOpenChat(privateChatId, i, pushState) {
        openChat(privateChatId);
        setCurrChatId(privateChatId);
        setHighlighting(i);
        if (pushState) {
            history.pushState('', '', `?chatid=${privateChatId}`);
        }
    }

    async function loadMessagesUntilFound(chatid, currTime, currMessages) {
        return fetch('/messages/get_private_messages/' + chatid + `?start=${currTime - jump}&end=${currTime}`)
            .then(response => response.json())
            .then(async response => {
                if (response.messages.length === 0) {
                    if (response.next_last_timestamp !== 0) {
                        return loadMessagesUntilFound(chatid, response.next_last_timestamp, currMessages);
                    } else {
                        return {
                            currTexts: [...currMessages],
                            currTime: currTime,
                            fullChatLoaded: true
                        }
                    }
                } else {
                    setTexts(response.messages.concat(currMessages));
                    return {
                        currTexts: response.messages.concat(currMessages),
                        currTime: currTime - jump,
                        fullChatLoaded: false
                    }
                }
            });
    }

    function openChat(chatid) {
        setChatSelected(true);
        if (currSocket !== null) {
            currSocket.close();
        }
        if (currInterval !== null) {
            clearInterval(currInterval);
        }
        
        loadMessagesUntilFound(chatid, new Date().getTime() / 1000, [])
            .then(result => {
                setTimeout(() => {
                    messageLog.current.scrollTo(0, messageLog.current.scrollHeight);
                }, 300);

                const chatSocket = new WebSocket(
                    'ws://'
                    + window.location.host
                    + '/ws/message/'
                    + chatid
                    + '/'
                );
                
                chatSocket.onmessage = (e) => {
                    const data = JSON.parse(e.data);
                    result.currTexts.push(data);
                    setTexts([...result.currTexts]);
                    testAndScrollToBottom();
                };

                chatSocket.onerror = () => {
                    alert("Connection fails, please reload the page or try another time.")
                }

                chatSocket.onclose = (e) => {
                    if (e.code !== 1000) {
                        alert("Connection is lost, please reload the page or try another time.");
                    }
                }

                setCurrSocket(chatSocket);

                const scrollingState = {
                    loading: false
                }
                setCurrInterval(setInterval(() => {
                    if (chatSocket.readyState === 1 && messageLog.current.scrollTop < 10 && !scrollingState.loading && !result.fullChatLoaded) {
                        scrollingState.loading = true;
                        loadMessagesUntilFound(chatid, result.currTime, result.currTexts).then(newResult => {
                            result.currTexts = newResult.currTexts;
                            setTexts([...result.currTexts]);
                            result.currTime = newResult.currTime;
                            result.fullChatLoaded = newResult.fullChatLoaded;
                            messageLog.current.scrollBy({
                                top: 150,
                                behaviour: 'instant'
                            });
                            scrollingState.loading = false;
                        });
                    }
                }, 1000));
            })
    }

    function bringChatToTop() {
        const newPrivateChats = [...privateChats];
        for (let i = 1; i <= highlighting; i++) {
            newPrivateChats[i] = privateChats[i - 1];
        }
        newPrivateChats[0] = privateChats[highlighting];
        setPrivateChats(newPrivateChats);
        setHighlighting(0);
    }

    function testAndScrollToBottom() {
        if (messageLog.current.scrollTop >= messageLog.current.scrollHeight - messageLog.current.parentElement.clientHeight - 500) {
            setTimeout(() => {
                messageLog.current.scrollTo(0, messageLog.current.scrollHeight);
            }, 300);
        }
    }

    function sendMessage() {
        if (inputText !== '') {
            currSocket.send(JSON.stringify({
                type: "text",
                message: inputText
            }));
            setInputText('');
            testAndScrollToBottom();
            setTimeout(() => {
                adjustInputHeight(inputField.current);
            }, 50);
            bringChatToTop();
        }
    }

    function hoverMenu() {
        setMoreMenuDisplay(true);
        if (menuMouseOutTimer.current !== null) {
            clearInterval(menuMouseOutTimer.current);
        }
    }

    function blurMenu() {
        menuMouseOutTimer.current = setTimeout(() => {
            setMoreMenuDisplay(false);
        }, 500);
    }

    function uploadFile() {
        const file = fileUpload.current.files[0];
        let fileImgPreview;
        if (imageExtensions.includes(file.name.split('.').at(-1)) && imageExtensions.includes(file.type.split('/').at(-1))) {
            fileImgPreview = <img src={URL.createObjectURL(file)} />;
        } else {
            fileImgPreview = <React.Fragment>
                <div>No preview available</div>
                <div>{file.name}</div>
            </React.Fragment>
        }
        setShowFilePreview(true);
        setFilePreview((
            <div className="file-preview-window" ref={filePreviewWindow}>
                <div className="img-preview">
                    {fileImgPreview}
                </div>
                <div className="file-upload-buttons">
                    <button className="btn btn-danger" onClick={() => setShowFilePreview(false)}>Cancel</button>
                    <button className="btn btn-success" onClick={() => submitFile(file)}>Send</button>
                </div>
            </div>
        ))
    }

    function submitFile(file) {
        fetch('/messages/upload_file', postRequestContent({
            chat_id: currChatId,
            file: file,
            file_name: file.name
        }))
            .then(async response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                    return;
                }
                const messageId = await response.text();
                currSocket.send(JSON.stringify({
                    type: "file",
                    message_id: messageId,
                }));
                setShowFilePreview(false);
            })
    }

    function clickExitPreview(event) {
        if (!filePreviewWindow.current.contains(event.target)) {
            setShowFilePreview(false);
        }
    }

    function adjustInputHeight(inputField) {
        inputField.style.height = '5px';
        inputField.style.height = inputField.scrollHeight.toString() + 'px';
    }

    return (
        <div id="chat-window">
            <div id="chat-selector">
                <div id="chat-categories">
                    <div id="chat-category-private" className="chat-category"><div>Private</div></div>
                    <div id="chat-category-group" className="chat-category"><div>Groups</div></div>
                </div>
                <div id="chat-list" className="border">
                    <div id="chat-list-private">
                        {
                            privateChats.map((privateChat, i) => (
                                <div className="chat-listing" 
                                onClick={() => clickOpenChat(privateChat.id, i, true)} style={{
                                    backgroundColor: highlighting === i ? "#CDCBCB" : '',
                                }}>
                                    <div className="chat-listing-image">
                                        <img src={privateChat.image} />
                                    </div>
                                    <div className="chat-listing-name">{privateChat.chatName}</div>
                                </div>
                            ))
                        }
                    </div>
                    <div id="chat-list-groups"></div>
                </div>
            </div>
            <div id="chat-log" className="border p-1">
                <div id="chat-messages" ref={messageLog}>
                    <div id="chat-messages-container">
                        {
                            texts.map(text => <Message text={text} username={username} />)
                        }
                    </div>
                </div>
                {
                    chatSelected
                    ? <div id="chat-input" className="p-2">
                        <div id="chat-more-input" onMouseEnter={() => hoverMenu()} onMouseLeave={() => blurMenu()}>
                            <div id="chat-more-menu" style={{
                                display: moreMenuDisplay ? "" : "none"
                            }}>
                                <div className="chat-more-option">
                                    <label htmlFor="chat-file-upload" onClick={() => fileUpload.current.click()}>
                                        <img src="/static/media/docs-icon.png" />
                                    </label>
                                    <input type="file" ref={fileUpload} onChange={uploadFile} />
                                </div>
                                <div className="chat-more-option"></div>
                            </div>
                            <img src="/static/media/plus-icon.png" />
                        </div>
                        <textarea id="chat-text-input" rows={1} className="form-control" value={inputText}
                        onChange={event => {
                            const newValue = event.target.value;
                            setInputText(newValue);
                            if (newValue.slice(newValue.length - 1, newValue.length) !== '\n' || isHoldingShift) {
                                adjustInputHeight(event.target);
                            }
                        }}
                        onKeyUp={event => {
                            if (!isHoldingShift && event.key === "Enter") {
                                sendMessage();
                            } else if (event.key === "Shift") {
                                setIsHoldingShift(false);
                            }
                        }}
                        onKeyDown={event => {
                            if (event.key === "Shift") {
                                setIsHoldingShift(true);
                            }
                        }}
                        ref={inputField} />
                        <button className="btn btn-outline-primary chat-input-send-button" onClick={() => sendMessage()}>Send</button>
                    </div>
                    : ''
                }
                <div className="file-preview" style={{
                    display: showFilePreview ? '' : 'none',
                }} onClick={clickExitPreview}>{filePreview}</div>
            </div>
        </div>
    )
}

function Message({ text, username }) {
    const [isHovering, setIsHovering] = React.useState(false);

    function timestampToTime(timestamp) {
        const time = new Date(timestamp * 1000);
        return `${formatNumber(time.getHours(), 2)}:${formatNumber(time.getMinutes(), 2)} ${formatNumber(time.getDate(), 2)}/${formatNumber(time.getMonth(), 2)}/${formatNumber(time.getFullYear(), 2)}`;
    }

    return (
        <div className="text-line" style={{
            flexDirection: text.user.username === username ? "row-reverse" : "row",
        }} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
            <a className="text-line-user-img" href={text.user.profile_link}>
                <img src={text.user.profile_img_url} />
            </a>
            <div className="text-line-content p-1 border border-primary">{
                text.type === "text" 
                ? text.message 
                : text.is_image 
                ? <img className="text-line-img" src={"/messages/image/" + text.id} />
                : <a href={"/messages/image/" + text.id} target='_blank'>
                    {text.file_name}
                </a>
            }</div>
            <div className="text-timestamp text-secondary" style={{
                display: isHovering ? '' : 'none'
            }}>{timestampToTime(text.timestamp)}</div>
        </div>
    )
}

ReactDOM.render(<ChatPage />, document.querySelector("#chat-page"));