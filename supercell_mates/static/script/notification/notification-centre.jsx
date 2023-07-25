function NotificationCentre() {
    const [currPage, setCurrPage] = React.useState(-1);
    const [friendRequests, setFriendRequests] = React.useState([]);

    React.useEffect(() => {
        fetch('/user/friend_requests_async')
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                    return;
                }
                response.json().then(users => setFriendRequests(users));
            });
    }, []);

    return (
        <React.Fragment>
            <div id="notification-header">
                <NotificationIcon 
                    src={"/static/media/nav-bar/incoming-request-icon.png"}
                    isSelected={currPage === 0}
                    setPage={() => setCurrPage(0)}
                />
            </div>
            <hr />
            <div id="notification-body">
                <div id="notification-title" className="mb-2">
                    {currPage === 0
                    ? 'Incoming friend requests'
                    : ''}
                </div>
                <div id="notification-list">
                    {
                        currPage === 0
                        ? friendRequests.map(listing => (
                            <FriendRequest request={listing} />
                        ))
                        : ''
                    }
                </div>
            </div>
        </React.Fragment>
    )
}


function FriendRequest({ request }) {
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
                }
            })
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


function NotificationIcon({ isSelected, setPage, src }) {
    const [isHovering, setIsHovering] = React.useState(false);

    return (
        <div 
        className={"notification-icon" + (isSelected ? " bg-info" : isHovering ? " bg-body-secondary" : "")} 
        onClick={setPage}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        >
            <img src={src} />
        </div>
    );
}


function renderNotificationCentre() {
    const notifDiv = document.querySelector("#notification-centre");
    Array.from(notifDiv.children).forEach(child => notifDiv.removeChild(child));
    const newChild = document.createElement('div');
    ReactDOM.render(<NotificationCentre />, newChild);
    notifDiv.appendChild(newChild);
}