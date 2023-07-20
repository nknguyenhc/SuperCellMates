function ChatPage() {
    const [isPrivateChatsSelected, setIsPrivateChatsSelected] = React.useState(true);
    const [privateChats, setPrivateChats] = React.useState([]);
    const [groupChats, setGroupChats] = React.useState([]);
    const [displayGroupChatForm, setDisplayGroupChatForm] = React.useState(false);
    const [highlighting, setHighlighting] = React.useState(-1);
    const [texts, setTexts] = React.useState([]);
    const [currSocket, setCurrSocket] = React.useState(null);
    const [isChatDisabled, setIsChatDisabled] = React.useState(false);
    const [currInterval, setCurrInterval] = React.useState(null);
    const [inputText, setInputText] = React.useState('');
    const inputTextCharLimit = 700;
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
    const [showAddPeopleForm, setShowAddPeopleForm] = React.useState(false);
    const isLoading = React.useRef(false);
    const setIsLoading = (newValue) => isLoading.current = newValue;
    const [isConnectingWs, setIsConnectingWs] = React.useState(false);
    const [targetPost, setTargetPost] = React.useState(null);

    React.useEffect(() => {
        fetch('/messages/get_private_chats')
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                } else {
                    response.json()
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
                }
            });
        
        fetch('/messages/get_group_chats')
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                } else {
                    response.json()
                        .then(async response => {
                            const newGroupChats = response.groups.map(chat => ({
                                id: chat.id,
                                timestamp: chat.timestamp,
                                chatName: chat.name,
                                image: chat.img
                            }));
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
                }
            });
        
        const postQueries = window.location.search
            .slice(1)
            .split('&')
            .map(eqn => eqn.split("="))
            .filter(pair => pair[0] === "post")
        if (postQueries.length > 0) {
            const postId = postQueries[0][1];
            fetch('/post/post/' + postId)
                .then(response => {
                    if (response.status === 200) {
                        response.json().then(post => setTargetPost(post));
                    } else if (response.status !== 404) {
                        triggerErrorMessage();
                    }
                });
        }
    }, []);

    React.useEffect(() => {
        setUsername(document.querySelector('input#username-hidden').value);
    }, []);

    async function createGroupChatListing(chat) {
        const newGroupChat = {
            id: chat.id,
            timestamp: chat.timestamp,
            chatName: chat.name,
            image: chat.img
        }
        await setGroupChats([newGroupChat, ...groupChats]);
        clickOpenChat(chat.id, 0, true, false);
    }

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
        setIsChatDisabled(false);
        setShowAddPeopleForm(false);
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
        setShowAddPeopleForm(false);
        setHighlighting(-2);
        if (pushState) {
            history.pushState('', '', '?chatid=newgroupchatform');
        } else {
            setIsPrivateChatsSelected(false);
        }
    }

    function openAddPeopleForm() {
        setShowAddPeopleForm(true);
        blurMenu();
    }

    async function loadMessagesUntilFound(chatid, currTime, currMessages, isPrivate) {
        return fetch('/messages/get_' + (isPrivate ? 'private' : 'group') + '_messages/' + chatid + `?start=${currTime - jump}&end=${currTime}`)
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                } else {
                    return response.json()
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
            });
    }

    function openChat(chatid, isPrivate) {
        if (currSocket !== null) {
            currSocket.close();
        }
        if (currInterval !== null) {
            clearInterval(currInterval);
        }

        setIsConnectingWs(false);
        
        loadMessagesUntilFound(chatid, new Date().getTime() / 1000, [], isPrivate)
            .then(result => {
                setTexts([...result.currTexts]);
                setTimeout(() => {
                    messageLog.current.scrollTo(0, messageLog.current.scrollHeight);
                }, 300);

                setIsConnectingWs(true);

                const chatSocket = new WebSocket(
                    'ws://'
                    + window.location.host
                    + '/ws/'+ (isPrivate ? 'message/' : 'group/')
                    + chatid
                    + '/'
                );

                chatSocket.onopen = () => {
                    setIsConnectingWs(false);
                };
                
                chatSocket.onmessage = (e) => {
                    const data = JSON.parse(e.data);
                    result.currTexts.push(data);
                    setTexts([...result.currTexts]);
                    testAndScrollToBottom();
                };

                chatSocket.onclose = (e) => {
                    if (e.code === 4003) {
                        setIsChatDisabled(true);
                        scrollingState.canLoadMessage = true;
                    } else if (e.code !== 1000) {
                        alert("Connection is lost, please reload the page or try another time.");
                    }
                }

                setCurrSocket(chatSocket);

                const scrollingState = {
                    loading: false,
                    canLoadMessage: false,
                }
                setCurrInterval(setInterval(() => {
                    if ((chatSocket.readyState === 1 || scrollingState.canLoadMessage) && messageLog.current.scrollTop < 10 && !scrollingState.loading && !result.fullChatLoaded) {
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

    function bringPrivateChatToTop() {
        const newPrivateChats = [...privateChats];
        for (let i = 1; i <= highlighting; i++) {
            newPrivateChats[i] = privateChats[i - 1];
        }
        newPrivateChats[0] = privateChats[highlighting];
        setPrivateChats(newPrivateChats);
        setHighlighting(0);
    }

    function bringGroupChatToTop() {
        const newGroupChats = [...groupChats];
        for (let i = 0; i <= highlighting; i++) {
            newGroupChats[i] = groupChats[i - 1];
        }
        newGroupChats[0] = groupChats[highlighting];
        setGroupChats(newGroupChats);
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
            const jsonBody = {
                message: inputText[inputText.length - 1] !== '\n' ? inputText : inputText.slice(0, inputText.length - 1)
            };
            if (targetPost) {
                jsonBody.type = "reply_post";
                jsonBody.post_id = targetPost.id;
                setTargetPost(null);
            } else {
                jsonBody.type = "text";
            }

            currSocket.send(JSON.stringify(jsonBody));
            setInputText('');
            testAndScrollToBottom();
            setTimeout(() => {
                adjustInputHeight(inputField.current);
            }, 50);
            if (isPrivateChatsSelected) {
                bringPrivateChatToTop();
            } else {
                bringGroupChatToTop();
            }
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

    function uploadFile(isPrivate) {
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
                    <button className="btn btn-success" onClick={() => submitFile(file, isPrivate)}>Send</button>
                </div>
            </div>
        ));
    }

    function submitFile(file, isPrivate) {
        if (currSocket.readyState === 1 && !isLoading.current) {
            setIsLoading(true);
            fetch('/messages/upload_file', postRequestContent({
                chat_id: currChatId,
                file: file,
                file_name: file.name
            }))
                .then(async response => {
                    setIsLoading(false);
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
                    if (isPrivate) {
                        bringPrivateChatToTop();
                    } else {
                        bringGroupChatToTop();
                    }
                })
        } else {
            setShowFilePreview(false);
        }
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

    function changeInputText(event) {
        const newValue = event.target.value.slice(0, inputTextCharLimit);
        setInputText(newValue);
        if (newValue.slice(newValue.length - 1, newValue.length) !== '\n' || isHoldingShift) {
            adjustInputHeight(event.target);
        }
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
                        ? privateChats.length === 0
                            ? <div className="p-3 text-danger">
                                <p>Oh no, you have no friend ...</p>
                                <p>Start adding friends and chat with your friends here!</p>
                            </div>
                            : privateChats.map((privateChat, i) => (
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
                <div id="chat-messages" ref={messageLog} style={{
                    display: showAddPeopleForm ? "none" : "block"
                }}>
                    <div id="chat-messages-container">
                        {
                            chatSelected
                            ? texts.map(text => <Message text={text} username={username} />)
                            : !displayGroupChatForm && <div className="text-secondary fst-italic">Select a chat ...</div>
                        }
                        {
                            <NewGroupChatForm isDisplay={displayGroupChatForm} createGroupChatListing={createGroupChatListing} />
                        }
                    </div>
                </div>
                {
                    showAddPeopleForm && <AddPeopleForm chatId={currChatId} myUsername={username} />
                }
                {
                    chatSelected && !isChatDisabled && !showAddPeopleForm
                    ? <div id="chat-bottom">
                        {
                            targetPost && <div className="chat-target-post">
                                <a href={targetPost.creator.profile_link} className="chat-target-post-creator">
                                    <img src={targetPost.creator.profile_pic_url} />
                                </a>
                                <a href={'/post/display?id=' + targetPost.id} className="chat-target-post-text">
                                    <h6 className="chat-target-post-title">{targetPost.title.length > 50 ? targetPost.title.slice(0, 40) + ' ...' : targetPost.title}</h6>
                                    <div className="chat-target-post-content">{targetPost.content.length > 50 ? targetPost.content.slice(0, 40) + ' ...' : targetPost.content}</div>
                                </a>
                            </div>
                        }
                        <div id="chat-input" className="p-2">
                            <div id="chat-more-input" onMouseEnter={() => hoverMenu()} onMouseLeave={() => blurMenu()}>
                                <div id="chat-more-menu" style={{
                                    display: moreMenuDisplay ? "" : "none"
                                }}>
                                    <div className="chat-more-option">
                                        {
                                            isPrivateChatsSelected || <label onClick={openAddPeopleForm}>
                                                <img src="/static/media/add-person-icon.png" />
                                            </label>
                                        }
                                        <label htmlFor="chat-file-upload" onClick={() => {
                                            if (currSocket.readyState === 1) {
                                                fileUpload.current.click();
                                            }
                                        }}>
                                            <img src="/static/media/docs-icon.png" />
                                        </label>
                                        <input type="file" ref={fileUpload} onChange={() => uploadFile(isPrivateChatsSelected)} />
                                    </div>
                                    <div className="chat-more-option"></div>
                                </div>
                                <img src="/static/media/plus-icon.png" />
                            </div>
                            <div id="chat-text-input-div">
                                <textarea id="chat-text-input" rows={1} className="form-control" value={inputText}
                                onInput={changeInputText}
                                onKeyUp={event => {
                                    changeInputText(event);
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
                                <div className={"chat-text-char-count " + (inputText.length === 700 ? "text-danger" : "text-primary")}>{inputText.length}/700</div>
                            </div>
                            <button className="btn btn-outline-primary chat-input-send-button" onClick={() => sendMessage()}>Send</button>
                        </div>
                    </div>
                    : isChatDisabled
                    ? <div className="message-disabled text-secondary fst-italic">You can no longer send message in this chat</div>
                    : ''
                }
                <div className="file-preview" style={{
                    display: showFilePreview ? '' : 'none',
                }} onClick={clickExitPreview}>{filePreview}</div>
                {isConnectingWs && <div id="message-loader">
                    <span className="spinner-grow text-warning" />
                </div>}
            </div>
        </div>
    )
}

function Message({ text, username }) {
    const [isHovering, setIsHovering] = React.useState(false);

    function timestampToTime(timestamp) {
        const time = new Date(timestamp * 1000);
        return `${formatNumber(time.getHours(), 2)}:${formatNumber(time.getMinutes(), 2)} ${formatNumber(time.getDate(), 2)}/${formatNumber(time.getMonth() + 1, 2)}/${formatNumber(time.getFullYear(), 2)}`;
    }

    return (
        <div className="text-line" style={{
            flexDirection: text.user.username === username ? "row-reverse" : "row",
        }} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
            <a className="text-line-user-img" href={text.user.profile_link}>
                <img src={text.user.profile_img_url} />
            </a>
            <div className="text-line-content p-1 border border-primary" style={{
                alignItems: text.user.username === username ? "end" : "start"
            }}>
                <a href={text.user.profile_link} className="text-line-content-username">{text.user.username}</a>
                {
                    text.type === "text" 
                    ? <Text text={text.message} /> 
                    : text.type === "reply_post"
                    ? <div className="text-line-content-text">
                        {text.post !== null ? <a href={"/post/display?id=" + text.post.id} className="text-line-post-hyperlink">
                            <div className="text-line-post-title">{text.post.title.length > 50 ? text.post.title.slice(0, 40) + ' ...' : text.post.title}</div>
                            <div className="text-line-post-content">{text.post.content.length > 50 ? text.post.content.slice(0, 40) + ' ...' : text.post.content}</div>
                        </a> : <div className="fst-italic">This post has been deleted</div>}
                        <Text text={text.message} />
                    </div>
                    : text.is_image 
                    ? <img className="text-line-img" src={"/messages/image/" + text.id} />
                    : <a href={"/messages/image/" + text.id} target='_blank'>
                        {text.file_name}
                    </a>
                }
            </div>
            <div className="text-timestamp text-secondary" style={{
                display: isHovering ? '' : 'none'
            }}>{timestampToTime(text.timestamp)}</div>
        </div>
    )
}


function Text({ text }) {
    const charLimit = 200;
    const [displayFullText, setDisplayFullText] = React.useState(false);

    return (
        <React.Fragment>
            {
                displayFullText || text.length <= charLimit ? text : text.slice(0, charLimit) + ' ... '
            }
            {
                text.length > charLimit && (
                    displayFullText 
                    ? <a href="javascript:void(0)" onClick={() => setDisplayFullText(false)}>{'\nSee Less'}</a> 
                    : <a href="javascript:void(0)" onClick={() => setDisplayFullText(true)}>See More</a>
                )
            }
        </React.Fragment>
    )
}


function NewGroupChatForm({ isDisplay, createGroupChatListing }) {
    const [groupName, setGroupName] = React.useState('')
    const [showResultBox, setShowResultBox] = React.useState(false);
    const inputDiv = React.useRef(inputDiv);
    const [searchParam, setSearchParam] = React.useState('');
    const [searchFriends, setSearchFriends] = React.useState([]);
    const [addedFriends, dispatchAddedFriends] = React.useReducer(addFriendReducer, []);
    const [error, setError] = React.useState('');
    const isLoading = React.useRef(false);
    const setIsLoading = (newValue) => isLoading.current = newValue;

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
        
        if (!isLoading.current) {
            setIsLoading(true);
            fetch('/messages/create_group_chat', postRequestContent({
                group_name: groupName,
                users: addedFriends.map(friend => friend.username)
            }))
                .then(response => {
                    setIsLoading(false);
                    if (response.status !== 200) {
                        triggerErrorMessage();
                    } else {
                        response.json().then(chat => createGroupChatListing(chat));
                    }
                });
        }
    }

    return (
        <div style={{ display: isDisplay ? "" : "none" }}>
            <div className="m-3">
                <label htmlFor="#group-chat-name" className="form-label">Group Chat Name</label>
                <input autoComplete="off" type="text" className="form-control" id="group-chat-name" onChange={event => setGroupName(event.target.value)} />
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


function AddPeopleForm({ chatId, myUsername }) {
    const [searchParam, setSearchParam] = React.useState('');
    const [showResultBox, setShowResultBox] = React.useState(false);
    const [searchFriends, setSearchFriends] = React.useState([]);
    const [currentMembers, setCurrentMembers] = React.useState([]);
    const inputDiv = React.useRef(null);
    const [showAddMessage, setShowAddMessage] = React.useState(false);
    const [currFriend, setCurrFriend] = React.useState('');
    const [addedFriends, dispatchAddedFriends] = React.useReducer(addFriendReducer, []);
    const [isAdmin, setIsAdmin] = React.useState(false);
    const [isCreator, setIsCreator] = React.useState(false);
    const [currentAdmins, setCurrentAdmins] = React.useState([]);
    const isLoading = React.useRef(false);
    const setIsLoading = (newValue) => isLoading.current = newValue;

    function addFriendReducer(state, friend) {
        return [...state, friend];
    }

    React.useEffect(() => {
        document.addEventListener('click', event => {
            if (inputDiv.current && !inputDiv.current.contains(event.target)) {
                setShowResultBox(false);
            }
        });
    }, []);

    React.useEffect(() => {
        getCurrentMembers();
    }, []);

    React.useEffect(() => {
        fetch('/messages/is_admin?chatid=' + chatId)
            .then(response => response.text())
            .then(response => {
                if (response === 'yes') {
                    setIsAdmin(true);
                    getCurrentAdmins();
                }
            })
            .catch(err => {
                triggerErrorMessage();
            });
        fetch('/messages/is_creator?chatid=' + chatId)
            .then(response => response.text())
            .then(response => {
                if (response === 'yes') {
                    setIsCreator(true);
                }
            })
            .catch(err => {
                triggerErrorMessage();
            });
    }, []);

    function getCurrentMembers() {
        fetch('/messages/get_members?chatid=' + chatId)
            .then(response => response.json())
            .then(response => {
                setCurrentMembers(response.users);
            })
            .catch(err => {
                triggerErrorMessage();
            })
    }

    function getCurrentAdmins() {
        fetch('/messages/get_admins?chatid=' + chatId)
            .then(response => response.json())
            .then(response => {
                setCurrentAdmins(response.users);
            })
            .catch(err => {
                triggerErrorMessage();
            });
    }

    function searchFriend() {
        fetch('/user/search_friend?username=' + searchParam)
            .then(response => response.json())
            .then(response => {
                setSearchFriends(response.users);
            });
    }

    function popAddMessage(friend) {
        setCurrFriend(friend);
        setShowAddMessage(true);
    }

    function addFriend(friend) {
        if (!isLoading.current) {
            setIsLoading(true);
            fetch('/messages/add_member', postRequestContent({
                username: currFriend.username,
                chat_id: chatId,
            }))
                .then(response => {
                    setIsLoading(false);
                    if (response.status !== 200) {
                        triggerErrorMessage();
                    } else {
                        dispatchAddedFriends(friend);
                        setShowAddMessage(false);
                        getCurrentMembers();
                    }
                });
        }
    }

    function removeUser(username) {
        if (!isLoading.current) {
            setIsLoading(true);
            fetch('/messages/remove_user', postRequestContent({
                chatid: chatId,
                username: username
            }))
                .then(response => {
                    setIsLoading(false);
                    if (response.status !== 200) {
                        triggerErrorMessage();
                    } else {
                        getCurrentMembers();
                        getCurrentAdmins();
                    }
                });
        }
    }

    function addAdmin(username) {
        if (!isLoading.current) {
            setIsLoading(true);
            fetch('/messages/add_admin', postRequestContent({
                chatid: chatId,
                username: username
            }))
                .then(response => {
                    setIsLoading(false);
                    if (response.status !== 200) {
                        triggerErrorMessage();
                    } else {
                        getCurrentAdmins();
                    }
                });
        }
    }

    function removeAdmin(username) {
        if (!isLoading.current) {
            setIsLoading(true);
            fetch('/messages/remove_admin', postRequestContent({
                chatid: chatId,
                username: username
            }))
                .then(response => {
                    setIsLoading(false);
                    if (response.status !== 200) {
                        triggerErrorMessage();
                    } else {
                        getCurrentAdmins();
                    }
                });
        }
    }

    function assignLeader(username, currPassword, setAuthErr) {
        if (!isLoading.current) {
            setIsLoading(true);
            fetch('/messages/assign_leader', postRequestContent({
                chatid: chatId,
                username: username,
                password: currPassword
            }))
                .then(response => {
                    setIsLoading(false);
                    if (response.status !== 200) {
                        triggerErrorMessage();
                    } else {
                        response.text().then(text => {
                            if (text === 'ok') {
                                setIsCreator(false);
                            } else {
                                setAuthErr("Authentication failed");
                            }
                        });
                    }
                });
        }
    }

    function UserTable({ users, privilegedUsers, removeAction, addAction, removeBtnText, addBtnText, removeCaption, addCaption }) {
        return (
            <div className="user-display mt-3 p-2">
                <table className="table border-primary">
                    <thead>
                        <tr>
                            <th scope="col" style={{ width: "50%" }}>Username</th>
                            <th scope="col" style={{ width: "50%" }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            users.map(member => (
                                <TableRow 
                                    username={member.username} 
                                    isPrivileged={privilegedUsers.map(admin => admin.username).includes(member.username)} 
                                    removeAction={removeAction}
                                    addAction={addAction}
                                    removeBtnText={removeBtnText}
                                    addBtnText={addBtnText}
                                    removeCaption={removeCaption}
                                    addCaption={addCaption}
                                />
                            ))
                        }
                    </tbody>
                </table>
            </div>
        )
    }

    function TableRow({ username, isPrivileged, removeAction, addAction, removeBtnText, addBtnText, removeCaption, addCaption }) {
        const [showMessage, setShowMessage] = React.useState(false);
        const [showAddMessage, setShowAddMessage] = React.useState(false);
        const [password, setPassword] = React.useState('');
        const [authErr, setAuthErr] = React.useState('')

        return (
            <tr>
                <td className="table-element">{username}</td>
                <td className="table-element">
                    {
                        username !== myUsername && 
                        <React.Fragment>
                            <div className="action-buttons">
                                <button className="btn btn-danger" onClick={() => {
                                    setShowMessage(true);
                                    setShowAddMessage(false);
                                }}>{removeBtnText}</button>
                                {
                                    isPrivileged || <button className="btn btn-primary" onClick={() => {
                                        setShowAddMessage(true);
                                        setShowMessage(false);
                                    }}>{addBtnText}</button>
                                }
                            </div>
                            {
                                showMessage && <div className="user-action-message">
                                    <div className="user-action-message-text">{removeCaption}</div>
                                    <div className="user-action-buttons">
                                        <button className="btn btn-primary" onClick={() => removeAction(username)}>Confirm</button>
                                        <button className="btn btn-secondary" onClick={() => setShowMessage(false)}>Cancel</button>
                                    </div>
                                </div>
                            }
                            {
                                showAddMessage && <div className="user-action-message">
                                    <div className="user-action-message-text">{addCaption}</div>
                                    {
                                        addAction === assignLeader &&
                                        <div className="user-action-confirmation">
                                            <div className="user-action-confirmation-label">Type your password to confirm:</div>
                                            <input type="password" className="form-control" onChange={event => setPassword(event.target.value)} />
                                        </div>
                                    }
                                    <div className="user-action-buttons">
                                        <button className="btn btn-primary" onClick={() => addAction === assignLeader ? addAction(username, password, setAuthErr) : addAction(username)}>Confirm</button>
                                        <button className="btn btn-secondary" onClick={() => setShowAddMessage(false)}>Cancel</button>
                                    </div>
                                    {
                                        authErr !== '' &&
                                        <div className="alert alert-danger mt-3">{authErr}</div>
                                    }
                                </div>
                            }
                        </React.Fragment>
                    }
                </td>
            </tr>
        )
    }

    return (
        <div className="add-people-form p-3">
            <div className="add-people-label">Add people to this group chat</div>
            <div className="find-friend-input mt-3" ref={inputDiv}>
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
                        searchFriends.filter(user => !currentMembers.map(user => user.username).includes(user.username)).length === 0
                        ? <div className="text-secondary text-center">No search done/No result to show</div>
                        : searchFriends.filter(user => !currentMembers.map(user => user.username).includes(user.username)).map(friend => (
                            <div className="search-friend-listing" onClick={() => popAddMessage(friend)}>
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
            {
                showAddMessage && <div className="add-friend-message mt-3">
                    Are you sure to add <a href={currFriend.profile_link}>@{currFriend.username}</a> to this group chat?
                    <div className="add-friend-actions mt-3">
                        <button className="btn btn-success" onClick={() => addFriend(currFriend)}>Yes</button>
                        <button className="btn btn-danger" onClick={() => setShowAddMessage(false)}>No</button>
                    </div>
                </div>
            }
            <div className="friends-added mt-3">
                {
                    addedFriends.map(friend => (
                        <div className="friend-added text-success">
                            <img src="/static/media/check-icon.png" className="add-friend-success-icon" />
                            User <a href={friend.profile_link}>@{friend.username}</a> has been added to this group chat.
                        </div>
                    ))
                }
            </div>
            {
                isAdmin && 
                <React.Fragment>
                    <div className="remove-user-label mt-3">Members</div>
                    <UserTable 
                        users={currentMembers}
                        privilegedUsers={currentAdmins}
                        removeAction={removeUser}
                        addAction={addAdmin}
                        removeBtnText={"Remove"}
                        addBtnText={"Assign as admin"}
                        removeCaption={"Remove this user from this chat?"}
                        addCaption={"Assign this user as admin?"}
                    />
                </React.Fragment>
            }
            {
                isCreator && <React.Fragment>
                    <div className="remove-user-label mt-3">Admins</div>
                    <UserTable 
                        users={currentAdmins}
                        privilegedUsers={[]}
                        removeAction={removeAdmin}
                        addAction={assignLeader}
                        removeBtnText={"Remove admin"}
                        addBtnText={"Assign as leader"}
                        removeCaption={"Remove this user from admin list?"}
                        addCaption={"Assign this user as leader?\nNote: you will lose privileges as leader"}
                    />
                </React.Fragment>
            }
        </div>
    )
}


ReactDOM.render(<ChatPage />, document.querySelector("#chat-page"));