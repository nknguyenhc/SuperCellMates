function ProfileFeed() {
    const username = document.querySelector("#profile-id").innerText;
    const isAllPostsLoaded = React.useRef(false);
    const setIsAllPostsLoaded = (newValue) => isAllPostsLoaded.current = newValue;
    const oneDayTime = 24 * 3600;
    const currTimestamp = React.useRef(null);
    const setCurrTimestamp = (newValue) => currTimestamp.current = newValue;
    const postsDiv = React.useRef(null);
    const profilePageFilters = getJSONItemFromLocal('profilePageFilters', {});
    const tag = React.useRef(profilePageFilters[username] ? profilePageFilters[username] : '');
    const setTag = (newTag) => tag.current = newTag;
    const [count, dispatchCount] = React.useReducer(state => state + 1, 0);

    React.useEffect(() => {
        const tagFilters = Array.from(document.querySelectorAll('#nav-tag-list .tag-listing'));
        let tagStillExists = false;
        tagFilters.forEach(tagListing => {
            const tagInnerText = tagListing.querySelector('.tag-name').innerText;
            if (tagInnerText === tag.current) {
                tagListing.querySelector('label').click();
                tagStillExists = true;
            }
            tagListing.addEventListener('click', () => {
                const currProfilePageFilters = getJSONItemFromLocal('profilePageFilters', {});
                currProfilePageFilters[username] = tagInnerText;
                localStorage.setItem('profilePageFilters', JSON.stringify(currProfilePageFilters));
                dispatchCount();
            });
        });
        if (!tagStillExists) {
            profilePageFilters[username] = '';
            localStorage.setItem('profilePageFilters', JSON.stringify(profilePageFilters));
            setTag('');
        }
        const filterClearer = document.querySelector("#nav-clear-filter");
        filterClearer.addEventListener('click', () => {
            const currProfilePageFilters = getJSONItemFromLocal('profilePageFilters', {});
            currProfilePageFilters[username] = '';
            localStorage.setItem('profilePageFilters', JSON.stringify(currProfilePageFilters));
            dispatchCount();
            tagFilters.forEach(tagListing => {
                tagListing.querySelector('input').checked = false;
            });
        });

        loadMorePosts().then(() => {
            setInterval(() => {
                if (!isAllPostsLoaded.current && document.body.offsetHeight - window.innerHeight - window.scrollY < 100) {
                    setIsAllPostsLoaded(true);
                    loadMorePosts();
                }
            }, 1000);
        })
    }, []);

    function loadMorePosts() {
        return fetch(`/post/posts/${username}?${currTimestamp.current ? `start=${currTimestamp.current - oneDayTime}&end=${currTimestamp.current}` : ''}${tag.current === '' ? '' : `&tag=${tag.current}`}`)
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                    return;
                }
                return response.json().then(response => {
                    if (response.next !== 0) {
                        setCurrTimestamp(response.next);
                        setIsAllPostsLoaded(false);
                    } else {
                        setIsAllPostsLoaded(true);
                    }
                    response.posts.forEach(post => {
                        post.time_posted *= 1000;
                        const postCard = document.createElement('div');
                        postCard.className = 'post-card';
                        postCard.id = 'post-card-' + post.id;
                        ReactDOM.render(<Post post={post} myProfile={response.myProfile} />, postCard);
                        postsDiv.current.appendChild(postCard);
                    });

                    if (response.posts.length === 0 && !isAllPostsLoaded.current) {
                        return loadMorePosts();
                    }
                })
            });
    }

    return (
        <React.Fragment>
            <div ref={postsDiv} id="profile-posts"></div>
            <FilterMessage count={count} />
        </React.Fragment>
    );
}


ReactDOM.render(<ProfileFeed />, document.querySelector("#profile-posts-container"));