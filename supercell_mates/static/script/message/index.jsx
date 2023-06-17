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
    })

    function openChat(chatid) {
        setChatSelected(true);
        
        fetch('/messages/get_private_messages/' + chatid)
            .then(response => response.json())
            .then(response => {
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
                    currTexts.push(data)
                    setTexts([...currTexts]);
                    testAndScrollToBottom();
                };
                
                chatSocket.onclose = function(e) {
                    console.error('Chat socket closed unexpectedly');
                    // triggerErrorMessage();
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
            message: inputText
        }))
        setInputText('');
        testAndScrollToBottom();
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
                                    <div className="text-line-content p-1 border border-primary">{text.message}</div>
                                </div>
                            ))
                        }
                    </div>
                </div>
                {
                    chatSelected
                    ? <div id="chat-input" className="p-2">
                        <input type="text" className="form-control" value={inputText} onChange={event => setInputText(event.target.value)}
                        onKeyUp={event => {
                            if (event.key === "Enter") {
                                sendMessage();
                            }
                        }} />
                        <button className="btn btn-outline-primary" onClick={() => sendMessage()}>Send</button>
                    </div>
                    : ''
                }
            </div>
        </div>
    )
}

ReactDOM.render(<ChatPage />, document.querySelector("#chat-page"));