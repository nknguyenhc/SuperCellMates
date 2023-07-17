function HomeFeed() {
    const [sortMethod, setSortMethod] = React.useState("time");
    const [isFriendFilter, setIsFriendFilter] = React.useState(
        getJSONItemFromLocal('isFriendFilter', false)
    );
    const [isTagFilter, setIsTagFilter] = React.useState(
        getJSONItemFromLocal('isTagFilter', false)
    );
    const isAllPostsLoaded = React.useRef(false);
    const startTimestamp = React.useRef('');
    const postsPerLoad = 10;
    const homeFeedContent = React.useRef(null);
    const [isFriendFilterClicked, setIsFriendFilterClicked] = React.useState(false);
    const [isTagFilterClicked, setIsTagFilterClicked] = React.useState(false);
    const [count, dispatchCount] = React.useReducer(state => state + 1, 0);

    // const setSortMethod = (newSortMethod) => sortMethod.current = newSortMethod;
    // const setIsFriendFilter = (newValue) => isFriendFilter.current = newValue;
    // const setIsTagFilter = (newValue) => isTagFilter.current = newValue;
    const setIsAllPostsLoaded = (newValue) => isAllPostsLoaded.current = newValue;
    const setStartTimestamp = (newStarTimestamp) => startTimestamp.current = newStarTimestamp;

    React.useEffect(() => {
        let isLoading = true;
        loadMorePosts().then(newTimestamp => {
            if (newTimestamp !== 0) {
                setStartTimestamp(newTimestamp);
            } else {
                setIsAllPostsLoaded(true);
            }
            isLoading = false;
        });
        const scrollCallBack = () => {
            if (!isLoading && !isAllPostsLoaded.current && document.body.offsetHeight - window.innerHeight - window.scrollY < 100) {
                isLoading = true;
                loadMorePosts().then(newTimestamp => {
                    if (newTimestamp !== 0) {
                        setStartTimestamp(newTimestamp);
                    } else {
                        setIsAllPostsLoaded(true);
                    }
                    isLoading = false;
                });
            }
        };
        window.addEventListener('scroll', scrollCallBack);
    }, []);

    function loadMorePosts() {
        return fetch(`/post/?friend_filter=${isFriendFilter ? 1 : 0}&tag_filter=${isTagFilter ? 1 : 0}&sort=${sortMethod}&start_timestamp=${startTimestamp.current}&limit=${postsPerLoad}`)
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                    return;
                }
                return response.json().then(response => {
                    response.posts.forEach(post => {
                        post.time_posted *= 1000;
                        const postCard = document.createElement('div');
                        postCard.className = 'post-card';
                        ReactDOM.render(<Post post={post} myProfile={false} />, postCard);
                        homeFeedContent.current.appendChild(postCard);
                    });
                    return response.stop_timestamp;
                });
            });
    }

    return (
        <React.Fragment>
            <div id="home-feed-content" ref={homeFeedContent}></div>
            <div id="home-feed-filters">
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" role="switch" id="friend-filter" checked={isFriendFilter} onChange={event => {
                        if (!isFriendFilterClicked) {
                            setIsFriendFilterClicked(true);
                            setIsFriendFilter(event.target.checked);
                            dispatchCount();
                            localStorage.setItem('isFriendFilter', !isFriendFilter);
                        }
                    }} />
                    <label class="form-check-label" for="friend-filter">My friends only</label>
                </div>
                <div className="form-check form-switch">
                    <input class="form-check-input" type="checkbox" role="switch" id="tag-filter" checked={isTagFilter} onChange={event => {
                        if (!isTagFilterClicked) {
                            setIsTagFilterClicked(true);
                            setIsTagFilter(event.target.checked);
                            dispatchCount();
                            localStorage.setItem('isTagFilter', !isTagFilter);
                        }
                    }} />
                    <label class="form-check-label" for="tag-filter">My tags only</label>
                </div>
            </div>
            <FilterMessage count={count} />
        </React.Fragment>
    )
}

ReactDOM.render(<HomeFeed />, document.querySelector("#home-feed"));