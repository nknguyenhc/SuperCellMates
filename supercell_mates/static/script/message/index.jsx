function ChatPage() {
    const [isPrivateChatsSelected, setIsPrivateChatsSelected] = React.useState(true);
    const [privateChats, setPrivateChats] = React.useState([]);
    const [groupChats, setGroupChats] = React.useState([]);
    const [displayGroupChatForm, setDisplayGroupChatForm] = React.useState(false);
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
                console.log(response);
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
                    if (id === 'newgroupchatform') {
                        openNewGroupChatForm(false);
                    } else {
                        while (index < newPrivateChats.length) {
                            if (newPrivateChats[index].id === id) {
                                break;
                            }
                            index++;
                        }
                        if (index < newPrivateChats.length) {
                            clickOpenChat(id, index, false, true);
                        }
                    }
                }
            });
        fetch('/messages/get_group_chats')
            .then(response => response.json())
            .then(async response => {
                console.log(response);
                const newGroupChats = response.groups.map(chat => {
                    return {
                        id: chat.id,
                        timestamp: chat.timestamp,
                        chatName: chat.name,
                        image: chat.img
                    };
                });
                await setGroupChats(newGroupChats);
                return newGroupChats;
            })
            .then(newGroupChats => {
                const idQueries = window.location.search
                    .slice(1)
                    .split("&")
                    .map(eqn => eqn.split("="))
                    .filter(pair => pair[0] === "chatid");
                if (idQueries.length > 0) {
                    let index = 0;
                    const id = idQueries[0][1];
                    if (id === 'newgroupchatform') {
                        openNewGroupChatForm(false);
                    } else {
                        while (index < newGroupChats.length) {
                            if (newGroupChats[index].id === id) {
                                break;
                            }
                            index++;
                        }
                        if (index < newGroupChats.length) {
                            clickOpenChat(id, index, false, false);
                        }
                    }
                }
            });
    }, []);

    React.useEffect(() => {
        setUsername(document.querySelector('input#username-hidden').value);
    }, []);

    function openPrivateChats() {
        setIsPrivateChatsSelected(true);
        setChatSelected(false);
    }

    function openGroupChats() {
        setIsPrivateChatsSelected(false);
        setChatSelected(false);
    }

    function clickOpenChat(chatId, i, pushState, isPrivate) {
        setIsPrivateChatsSelected(isPrivate);
        openChat(chatId, isPrivate);
        setDisplayGroupChatForm(false);
        setChatSelected(true);
        setCurrChatId(chatId);
        setHighlighting(i);
        if (pushState) {
            history.pushState('', '', `?chatid=${chatId}`);
        }
    }

    function openNewGroupChatForm(pushState) {
        setDisplayGroupChatForm(true);
        setChatSelected(false);
        setHighlighting(-2);
        if (pushState) {
            history.pushState('', '', '?chatid=newgroupchatform');
        } else {
            setIsPrivateChatsSelected(false);
        }
    }

    async function loadMessagesUntilFound(chatid, currTime, currMessages, isPrivate) {
        return fetch('/messages/get_' + (isPrivate ? 'private' : 'group') + '_messages/' + chatid + `?start=${currTime - jump}&end=${currTime}`)
            .then(response => response.json())
            .then(async response => {
                if (response.messages.length === 0) {
                    if (response.next_last_timestamp !== 0) {
                        return loadMessagesUntilFound(chatid, response.next_last_timestamp, currMessages, isPrivate);
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

    function openChat(chatid, isPrivate) {
        if (currSocket !== null) {
            currSocket.close();
        }
        if (currInterval !== null) {
            clearInterval(currInterval);
        }
        
        loadMessagesUntilFound(chatid, new Date().getTime() / 1000, [], isPrivate)
            .then(result => {
                setTimeout(() => {
                    messageLog.current.scrollTo(0, messageLog.current.scrollHeight);
                }, 300);

                const chatSocket = new WebSocket(
                    'ws://'
                    + window.location.host
                    + '/ws/'+ (isPrivate ? 'message/' : 'group/')
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
                        loadMessagesUntilFound(chatid, result.currTime, result.currTexts, isPrivate).then(newResult => {
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
                    <div id="chat-category-private" className={"chat-category" + (isPrivateChatsSelected ? " border" : "")} onClick={openPrivateChats}><div>Private</div></div>
                    <div id="chat-category-group" className={"chat-category" + (isPrivateChatsSelected ? "" : " border")} onClick={openGroupChats}><div>Groups</div></div>
                </div>
                <div id="chat-list" className="border">
                    {
                        isPrivateChatsSelected
                        ? privateChats.map((privateChat, i) => (
                            <div className="chat-listing" 
                            onClick={() => clickOpenChat(privateChat.id, i, true, true)} style={{
                                backgroundColor: highlighting === i && chatSelected ? "#CDCBCB" : '',
                            }}>
                                <div className="chat-listing-image">
                                    <img src={privateChat.image} />
                                </div>
                                <div className="chat-listing-name">{privateChat.chatName}</div>
                            </div>
                        ))
                        : <React.Fragment>
                            <div className="create-new-group" onClick={() => openNewGroupChatForm(true)} style={{
                                backgroundColor: highlighting === -2 ? "#CDCBCB" : '',
                            }}>
                                <div className="create-new-group-icon">
                                    <img src="/static/media/plus-icon.png" />
                                </div>
                                <div className="create-new-group-text">Create a new group chat</div>
                            </div>
                            {
                                groupChats.map((groupChat, i) => (
                                    <div className="chat-listing"
                                    onClick={() => clickOpenChat(groupChat.id, i, true, false)} style={{
                                        backgroundColor: highlighting === i && chatSelected ? "#CDCBCB" : '',
                                    }}>
                                        <div className="chat-listing-image">
                                            <img src={groupChat.image} />
                                        </div>
                                        <div className="chat-listing-name">{groupChat.chatName}</div>
                                    </div>
                                ))
                            }
                        </React.Fragment>
                    }
                </div>
            </div>
            <div id="chat-log" className="border p-1">
                <div id="chat-messages" ref={messageLog}>
                    <div id="chat-messages-container">
                        {
                            chatSelected
                            ? texts.map(text => <Message text={text} username={username} />)
                            : !displayGroupChatForm && <div className="text-secondary fst-italic">Select a chat ...</div>
                        }
                        {
                            <NewGroupChatForm isDisplay={displayGroupChatForm} />
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

function NewGroupChatForm({ isDisplay }) {
    const [groupName, setGroupName] = React.useState('')
    const [showResultBox, setShowResultBox] = React.useState(false);
    const inputDiv = React.useRef(inputDiv);
    const [searchParam, setSearchParam] = React.useState('');
    const [searchFriends, setSearchFriends] = React.useState([]);
    const [addedFriends, dispatchAddedFriends] = React.useReducer(addFriendReducer, []);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        document.addEventListener('click', event => {
            if (!inputDiv.current.contains(event.target)) {
                setShowResultBox(false);
            }
        })
    }, []);

    function addFriendReducer(state, action) {
        return [...state, action.friend];
    }

    function addFriend(friend) {
        dispatchAddedFriends({
            friend: friend
        });
        setSearchFriends([]);
    }

    function isAlreadyAdded(friend) {
        return addedFriends.reduce((prevValue, currValue) => prevValue || currValue.username === friend.username, false);
    }

    function searchFriend() {
        fetch('/user/search_friend?username=' + searchParam)
            .then(response => response.json())
            .then(response => {
                setSearchFriends(response.users.filter(friend => !isAlreadyAdded(friend)));
            });
    }

    function submitForm() {
        if (groupName === '') {
            setError('Group name cannot be empty!');
            return;
        } else if (groupName.length > 15) {
            setError('Group name must be 15 characters or less!');
            return;
        } else if (addedFriends.length === 0) {
            setError('You must add at least one friend!');
            return;
        } else {
            setError('');
        }
        fetch('/messages/create_group_chat', postRequestContent({
            group_name: groupName,
            users: addedFriends.map(friend => friend.username)
        }))
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                } else {
                    response.text().then(text => console.log(text));
                }
            })
    }

    return (
        <div style={{ display: isDisplay ? "" : "none" }}>
            <div className="m-3">
                <label htmlFor="#group-chat-name" className="form-label">Group Chat Name</label>
                <input type="text" className="form-control" id="group-chat-name" onChange={event => setGroupName(event.target.value)} />
            </div>
            <div className="m-3">
                <label className="form-label">Friends to add</label>
                <div className="friends-added mb-2">
                    {
                        addedFriends.map(addedFriend => (
                            <a target="_blank" href={addedFriend.profile_link} className="friend-added-listing btn btn-outline-info p-1">
                                <div className="friend-added-img">
                                    <img src={addedFriend.profile_pic_url} />
                                </div>
                                <div className="friend-added-info">
                                    <div className="friend-added-name">{addedFriend.name}</div>
                                    <div className="friend-added-username">{addedFriend.username}</div>
                                </div>
                            </a>
                        ))
                    }
                </div>
                <div className="find-friend-input" ref={inputDiv}>
                    <input type="search" className="form-control" placeholder="Find by username" onFocus={() => setShowResultBox(true)} onChange={event => setSearchParam(event.target.value)}
                    onKeyUp={event => {
                        if (event.key === "Enter") {
                            searchFriend();
                        }
                    }} />
                    <button className="btn btn-outline-primary" onClick={() => searchFriend()}>Search</button>
                </div>
                <div className="find-friend-result">
                    <div className="find-friend-result-box p-1" style={{ display: showResultBox ? "" : "none" }}>
                        {
                            searchFriends.length === 0
                            ? <div className="text-secondary text-center">No search done/No result to show</div>
                            : searchFriends.map(friend => (
                                <div className="search-friend-listing" onClick={() => addFriend(friend)}>
                                    <div className="search-friend-img">
                                        <img src={friend.profile_pic_url} />
                                    </div>
                                    <div className="search-friend-info">
                                        <div className="search-friend-name">{friend.name}</div>
                                        <div className="search-friend-username">@{friend.username}</div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
                <div className="group-chat-submit mt-4 mx-2">
                    <button className="btn btn-success" onClick={submitForm}>Create</button>
                </div>
                {
                    error !== '' && <div className="alert alert-danger mt-3">{error}</div>
                }
            </div>
        </div>
    )
}

ReactDOM.render(<ChatPage />, document.querySelector("#chat-page"));