function HomeFeed() {
    const [sortMethod, setSortMethod] = React.useState("time");
    const [isFriendFilter, setIsFriendFilter] = React.useState(false);
    const [isTagFilter, setIsTagFilter] = React.useState(false);
    const [posts, dispatchPosts] = React.useReducer(addPosts, []);
    const postsPerLoad = 10;

    function addPosts(currPosts, newPosts) {
        return [...currPosts, ...newPosts];
    }

    React.useEffect(() => {
        let isLoading = true;
        let startTimestamp = '';
        loadMorePosts(startTimestamp).then(newTimestamp => {
            startTimestamp = newTimestamp;
            isLoading = false;
        });
        window.addEventListener('scroll', () => {
            if (!isLoading && startTimestamp !== '0' && document.body.offsetHeight - window.innerHeight - window.scrollY < 100) {
                isLoading = true;
                loadMorePosts(startTimestamp).then(newTimestamp => {
                    startTimestamp = newTimestamp;
                    isLoading = false;
                });
            }
        });
    }, []);

    function loadMorePosts(startTimestamp) {
        return fetch(`/post?friend_filter=${isFriendFilter ? 1 : 0}&tag_filter=${isTagFilter ? 1 : 0}&sort=${sortMethod}&start_timestamp=${startTimestamp}&limit=${postsPerLoad}`)
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                    return;
                }
                return response.json().then(response => {
                    dispatchPosts(response.posts);
                    return response.stop_timestamp;
                });
            });
    }

    return (
        <React.Fragment>
            {
                posts.map(post => (
                    <div className="post-card">
                        <Post post={post} myProfile={false} />
                    </div>
                ))
            }
        </React.Fragment>
    )
}

ReactDOM.render(<HomeFeed />, document.querySelector("#home-feed"));