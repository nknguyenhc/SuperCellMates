function ChatPage() {
    const [privateChats, setPrivateChats] = React.useState([]);
    const [groupChats, setGroupChats] = React.useState([]);
    const [highlighting, setHighlighting] = React.useState(-1);
    const [texts, setTexts] = React.useState([]);
    const [currSocket, setCurrSocket] = React.useState(null);
    const [inputText, setInputText] = React.useState('');
    const [username, setUsername] = React.useState('');
    const [chatSelected, setChatSelected] = React.useState(false);
    const messageLog = React.useRef(null);
    const [moreMenuDisplay, setMoreMenuDisplay] = React.useState(false);
    const menuMouseOutTimer = React.useRef(null);
    const fileUpload = React.useRef(null);
    const [filePreview, setFilePreview] = React.useState('');
    const [showFilePreview, setShowFilePreview] = React.useState(false);
    const [fileToBeSubmitted, setFileToBeSubmitted] = React.useState(null);
    const filePreviewWindow = React.useRef(null);
    const [currChatId, setCurrChatId] = React.useState('');
    const imageExtensions = ['png', 'jpg', 'jpeg']

    React.useEffect(() => {
        fetch('/messages/get_private_chats')
            .then(response => response.json())
            .then(response => {
                setPrivateChats(
                    response.privates
                        .map(chat => {
                            return {
                                id: chat.id,
                                timestamp: chat.timestamp,
                                chatName: chat.user.username,
                                image: chat.user.profile_img_url
                            };
                        })
                );
            });
    }, []);

    React.useEffect(() => {
        setUsername(document.querySelector('input#username-hidden').value);
    }, []);

    function openChat(chatid) {
        setChatSelected(true);
        
        fetch('/messages/get_private_messages/' + chatid)
            .then(response => response.json())
            .then(response => {
                console.log(response);
                const currTexts = response.messages;
                setTexts(response.messages);
                setTimeout(() => {
                    messageLog.current.scrollTo(0, messageLog.current.scrollHeight);
                }, 300);

                if (currSocket !== null) {
                    currSocket.close();
                }

                const chatSocket = new WebSocket(
                    'ws://'
                    + window.location.host
                    + '/ws/message/'
                    + chatid
                    + '/'
                );
                
                chatSocket.onmessage = function(e) {
                    const data = JSON.parse(e.data);
                    currTexts.push(data);
                    setTexts([...currTexts]);
                    testAndScrollToBottom();
                };

                setCurrSocket(chatSocket);
            })
    }

    function testAndScrollToBottom() {
        if (messageLog.current.scrollTop >= messageLog.current.scrollHeight - messageLog.current.parentElement.clientHeight - 500) {
            setTimeout(() => {
                messageLog.current.scrollTo(0, messageLog.current.scrollHeight);
            }, 300);
        }
    }

    function sendMessage() {
        currSocket.send(JSON.stringify({
            type: "text",
            message: inputText
        }));
        setInputText('');
        testAndScrollToBottom();
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
        setFileToBeSubmitted(file);
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
                                <div className="chat-listing" onClick={() => {
                                    openChat(privateChat.id);
                                    setCurrChatId(privateChat.id);
                                    setHighlighting(i);
                                }} style={{
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
                            texts.map(text => (
                                <div className="text-line" style={{
                                    flexDirection: text.user.username === username ? "row-reverse" : "row",
                                }}>
                                    <div className="text-line-user-img">
                                        <img src={text.user.profile_img_url} />
                                    </div>
                                    <div className="text-line-content p-1 border border-primary">{
                                        text.type === "text" 
                                        ? text.message 
                                        : text.is_image 
                                        ? <img className="text-line-img" src={"/messages/image/" + text.id} />
                                        : <a href={"/messages/image/" + text.id} target='_blank'>
                                            {text.file_name}
                                        </a>
                                    }</div>
                                </div>
                            ))
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
                        <input id="chat-text-input" type="text" className="form-control" value={inputText} onChange={event => setInputText(event.target.value)}
                        onKeyUp={event => {
                            if (event.key === "Enter") {
                                sendMessage();
                            }
                        }} />
                        <button className="btn btn-outline-primary" onClick={() => sendMessage()}>Send</button>
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

ReactDOM.render(<ChatPage />, document.querySelector("#chat-page"));