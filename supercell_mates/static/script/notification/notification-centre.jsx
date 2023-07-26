function NotificationCentre() {
    const [currPage, setCurrPage] = React.useState(-1);
    const [friendRequests, setFriendRequests] = React.useState([]);
    const [friendRequestCount, setFriendRequestCount] = React.useState(0);
    const [friendAccepts, setFriendAccepts] = React.useState([]);
    const [friendAcceptCount, setFriendAcceptCount] = React.useState(0);
    const [loadCount, setLoadCount] = React.useState(0);

    React.useEffect(() => {
        fetch('/user/friend_requests_async')
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                    return;
                }
                setLoadCount(state => state + 1);
                response.json().then(users => {
                    setFriendRequests(users);
                    setFriendRequestCount(users.length);
                });
            });
        
        fetch('/notification/friends', postRequestContent({}))
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                    return;
                }
                setLoadCount(state => state + 1);
                response.json().then(response => {
                    let currAccepts = getJSONItemFrom('friendAccepts', [], sessionStorage);
                    currAccepts = [...response.users.reverse(), ...currAccepts];
                    sessionStorage.setItem('friendAccepts', JSON.stringify(currAccepts));
                    setFriendAccepts(currAccepts);
                    setFriendAcceptCount(response.users.length);
                })
            });
    }, []);

    React.useEffect(() => {
        const total = friendAcceptCount + friendRequestCount;
        if (total > 0) {
            document.querySelector("#notification-count-badge").innerText = total;
        } else {
            document.querySelector("#notification-count-badge").innerText = '';
        }
    }, [friendAcceptCount, friendRequestCount])

    return (
        <React.Fragment>
            <div id="notification-header">
                <NotificationIcon 
                    src={"/static/media/nav-bar/incoming-request-icon.png"}
                    isSelected={currPage === 0}
                    setPage={() => setCurrPage(0)}
                    count={friendRequestCount}
                />
                <NotificationIcon 
                    src={"/static/media/nav-bar/friend-accept-icon.png"}
                    isSelected={currPage === 1}
                    setPage={() => setCurrPage(1)}
                    count={friendAcceptCount}
                    click={() => setFriendAcceptCount(0)}
                />
            </div>
            <hr />
            <div id="notification-body">
                <div id="notification-title" className="mb-2">
                    {currPage === 0
                    ? 'Incoming friend requests'
                    : currPage === 1
                    ? 'Outgoing accepted requests'
                    : ''}
                </div>
                <div id="notification-list">
                    {
                        currPage === 0
                        ? friendRequests.map(listing => (
                            <FriendRequest request={listing} click={() => setFriendRequestCount(state => state - 1)} />
                        ))
                        : currPage === 1
                        ? friendAccepts.map((listing, i) => (
                            <FriendAccept user={listing} isHighlighting={i < friendAcceptCount} />
                        ))
                        : ''
                    }
                </div>
            </div>
            {loadCount !== 2 && <div className="notification-loading-icon">
                <span className="spinner-grow text-warning" />
            </div>}
        </React.Fragment>
    )
}


function FriendRequest({ request, click }) {
    const [isActionDone, setIsActionDone] = React.useState(false);
    const [isFriendRequestAccepted, setIsFriendRequestAccepted] = React.useState(false);

    function respondFriendRequest(accepted) {
        fetch('/user/add_friend', postRequestContent({
            username: request.username,
            accepted: accepted,
        }))
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                } else {
                    setIsActionDone(true);
                    setIsFriendRequestAccepted(accepted);
                    click();
                }
            });
    }

    return (
        <div className='request-listing'>
            <div className="request-listing-info">
                <div className="request-listing-profile-pic">
                    <img src={request.profile_pic_url} />
                </div>
                <div className="request-listing-text">
                    <div>{request.name}</div>
                    <a href={request.profile_link}>{request.username}</a>
                </div>
            </div>
            <div className="request-listing-action">
                {
                    isActionDone
                        ? isFriendRequestAccepted
                            ? <React.Fragment>
                                <img height="18" width="18" src="/static/media/check-icon.png" />
                                <div className="text-success">accepted</div>
                            </React.Fragment>
                            : <React.Fragment>
                                <img height="18" width="18" src="/static/media/cross-icon.png" />
                                <div className="text-danger">rejected</div>
                            </React.Fragment>
                        : <React.Fragment>
                            <button className="btn btn-sm btn-success" onClick={() => respondFriendRequest(true)}>Accept</button>
                            <button className="btn btn-sm btn-danger" onClick={() => respondFriendRequest(false)}>Decline</button>
                        </React.Fragment>
                }
            </div>
        </div>
    )
}


function FriendAccept({ user }) {
    return (
        <div className="accept-listing">
            <a href={user.profile_link} className="accept-listing-profile-pic">
                <img src={user.profile_pic_url} />
            </a>
            <div className="accept-listing-text">
                {user.name} ({<a href={user.profile_link}>{user.username}</a>}) has accepted your friend request.
            </div>
        </div>
    )
}


function NotificationIcon({ isSelected, setPage, src, count, click }) {
    const [isHovering, setIsHovering] = React.useState(false);

    return (
        <div 
        className={"position-relative notification-icon" + (isSelected ? " bg-info" : isHovering ? " bg-body-secondary" : "")} 
        onClick={() => {
            setPage();
            click && click();
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        >
            <img src={src} />
            {count > 0 && <span class="position-absolute top-100 start-100 translate-middle badge rounded-pill bg-danger">{count}</span>}
        </div>
    );
}


ReactDOM.render(<NotificationCentre />, document.querySelector("#notification-centre"));