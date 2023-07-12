function PendingFriendRequest() {
    const username = document.querySelector("#profile-id").innerText.slice(1);
    const isLoading = React.useRef(false);
    const setIsLoading = (newValue) => isLoading.current = newValue;

    function respondFriend(accepted) {
        if (!isLoading.current) {
            setIsLoading(true);
            fetch('/user/add_friend', postRequestContent({
                username: username,
                accepted: accepted
            }))
                .then(response => {
                    setIsLoading(false);
                    if (response.status === 200) {
                        window.location.reload();
                    } else {
                        triggerErrorMessage();
                    }
                });
        }
    }

    return (
        <React.Fragment>
            <div id="buttons">
                <button class="btn btn-success" onClick={() => respondFriend(true)}>Confirm</button>
                <button class="btn btn-danger" onClick={() => respondFriend(false)}>Reject</button>
            </div>
            <div class="confirm-friend-request-message">Confirm friend request?</div>
        </React.Fragment>
    )
}

ReactDOM.render(<PendingFriendRequest />, document.querySelector("#confirm-friend-request"));