function HomeFeed() {
    const [sortMethod, setSortMethod] = React.useState(
        getStringFrom('sortMethod', 'time', localStorage)
    );
    const [isFriendFilter, setIsFriendFilter] = React.useState(
        getJSONItemFrom('isFriendFilter', false, localStorage)
    );
    const [isTagFilter, setIsTagFilter] = React.useState(
        getJSONItemFrom('isTagFilter', false, localStorage)
    );
    const isAllPostsLoaded = React.useRef(false);
    const startNumber = React.useRef('');
    const postsPerLoad = 10;
    const homeFeedContent = React.useRef(null);
    const [isFriendFilterClicked, setIsFriendFilterClicked] = React.useState(false);
    const [isTagFilterClicked, setIsTagFilterClicked] = React.useState(false);
    const [isSortMethodClicked, setIsSortMethodClicked] = React.useState(false);
    const [count, dispatchCount] = React.useReducer(state => state + 1, 0);

    const setIsAllPostsLoaded = (newValue) => isAllPostsLoaded.current = newValue;
    const setStartNumber = (newStarTimestamp) => startNumber.current = newStarTimestamp;

    React.useEffect(() => {
        let isLoading = true;
        loadMorePosts().then(newTimestamp => {
            if (newTimestamp !== 0) {
                setStartNumber(newTimestamp);
            } else {
                setIsAllPostsLoaded(true);
            }
            isLoading = false;
            document.querySelector("#post-loader").style.display = 'none';
        });
        const scrollCallBack = () => {
            if (!isLoading && !isAllPostsLoaded.current && document.body.offsetHeight - window.innerHeight - window.scrollY < 100) {
                isLoading = true;
                document.querySelector("#post-loader").style.display = '';
                loadMorePosts().then(newTimestamp => {
                    if (newTimestamp !== 0) {
                        setStartNumber(newTimestamp);
                    } else {
                        setIsAllPostsLoaded(true);
                    }
                    isLoading = false;
                    document.querySelector("#post-loader").style.display = 'none';
                });
            }
        };
        window.addEventListener('scroll', scrollCallBack);
    }, []);

    function loadMorePosts() {
        return fetch(`/post/?friend_filter=${isFriendFilter ? 1 : 0}&tag_filter=${isTagFilter ? 1 : 0}&sort=${sortMethod}&${sortMethod === 'time' ? 'start_timestamp' : 'start_index'}=${startNumber.current}&limit=${postsPerLoad}`)
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
                    return sortMethod === 'time' ? response.stop_timestamp : response.stop_index;
                });
            });
    }

    return (
        <React.Fragment>
            <div id="home-feed-content" ref={homeFeedContent}></div>
            <span className="spinner-border text-info" id="post-loader" role="status" />
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
            <div id="sort-method">
            <div class="form-check">
                <input class="form-check-input" type="radio" name="flexRadioDefault" id="sort-by-time" checked={sortMethod === 'time'} onChange={() => {
                    if (!isSortMethodClicked) {
                        setIsSortMethodClicked(true);
                        setSortMethod('time');
                        dispatchCount();
                        localStorage.setItem('sortMethod', 'time');
                    }
                }} />
                <label class="form-check-label" for="sort-by-time">Latest posts</label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="radio" name="flexRadioDefault" id="sort-by-recommendation" checked={sortMethod === 'recommendation'} onChange={() => {
                    if (!isSortMethodClicked) {
                        setIsSortMethodClicked(true);
                        setSortMethod('recommendation');
                        dispatchCount();
                        localStorage.setItem('sortMethod', 'recommendation');
                    }
                }} />
                <label class="form-check-label" for="sort-by-recommendation">Recommended posts</label>
                </div>
            </div>
            <FilterMessage count={count} />
        </React.Fragment>
    )
}

ReactDOM.render(<HomeFeed />, document.querySelector("#home-feed"));