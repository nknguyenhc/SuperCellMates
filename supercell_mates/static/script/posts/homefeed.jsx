function HomeFeed() {
    const sortMethod = React.useRef("time");
    const isFriendFilter = React.useRef(false);
    const isTagFilter = React.useRef(false);
    const isAllPostsLoaded = React.useRef(false);
    const startTimestamp = React.useRef('');
    const postsPerLoad = 10;
    const homeFeedContent = React.useRef(null);
    const filterMessageDiv = React.useRef(null);
    const messageTimeout = React.useRef(null);

    const setSortMethod = (newSortMethod) => sortMethod.current = newSortMethod;
    const setIsFriendFilter = (newValue) => isFriendFilter.current = newValue;
    const setIsTagFilter = (newValue) => isTagFilter.current = newValue;
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
        return fetch(`/post/?friend_filter=${isFriendFilter.current ? 1 : 0}&tag_filter=${isTagFilter.current ? 1 : 0}&sort=${sortMethod.current}&start_timestamp=${startTimestamp.current}&limit=${postsPerLoad}`)
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                    return;
                }
                return response.json().then(response => {
                    response.posts.forEach(post => {
                        const postCard = document.createElement('div');
                        postCard.className = 'post-card';
                        ReactDOM.render(<Post post={post} myProfile={false} />, postCard);
                        homeFeedContent.current.appendChild(postCard);
                    });
                    return response.stop_timestamp;
                });
            });
    }

    function popFilterMessage() {
        function addClasses() {
            filterMessageDiv.current.classList.add('filter-message-transition');
            filterMessageDiv.current.classList.add('filter-message-position');
            filterMessageDiv.current.classList.add('filter-message-fading');
        }
        function removeClasses() {
            filterMessageDiv.current.classList.remove('filter-message-transition');
            filterMessageDiv.current.classList.remove('filter-message-position');
            filterMessageDiv.current.classList.remove('filter-message-fading');
        }

        clearTimeout(messageTimeout.current);
        removeClasses();
        setTimeout(addClasses, 10);
        messageTimeout.current = setTimeout(removeClasses, 2000);
    }

    return (
        <React.Fragment>
            <div id="home-feed-content" ref={homeFeedContent}></div>
            <div id="home-feed-filters">
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" role="switch" id="friend-filter" onChange={event => {
                        setIsFriendFilter(event.target.checked);
                        setIsAllPostsLoaded(false);
                        popFilterMessage();
                    }} />
                    <label class="form-check-label" for="friend-filter">My friends only</label>
                </div>
                <div className="form-check form-switch">
                    <input class="form-check-input" type="checkbox" role="switch" id="tag-filter" onChange={event => {
                        setIsTagFilter(event.target.checked);
                        setIsAllPostsLoaded(false);
                        popFilterMessage();
                    }} />
                    <label class="form-check-label" for="tag-filter">My tags only</label>
                </div>
            </div>
            <div id="filter-message" ref={filterMessageDiv} class="alert alert-info" role="alert">Filter will be applied when you scroll to the bottom!</div>
        </React.Fragment>
    )
}

ReactDOM.render(<HomeFeed />, document.querySelector("#home-feed"));