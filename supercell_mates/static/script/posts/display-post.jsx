(() => {
    const username = document.querySelector("#profile-id").innerHTML.slice(1);
    let allPostsLoaded = true;
    const oneDayTime = 24 * 3600;
    let currDate;
    
    const profilePageFilters = getJSONItemFromLocal('profilePageFilters', {});
    const tag = profilePageFilters[username] ? profilePageFilters[username] : '';
    const tagFilters = Array.from(document.querySelectorAll("#nav-tag-list .tag-listing"));
    tagFilters.forEach(tagListing => {
        const tagInnerText = tagListing.querySelector('.tag-name').innerText;
        if (tagInnerText === tag) {
            tagListing.querySelector('label').click();
        }
        tagListing.addEventListener('click', () => {
            const currProfilePageFilters = getJSONItemFromLocal('profilePageFilters', {});
            currProfilePageFilters[username] = tagInnerText;
            localStorage.setItem('profilePageFilters', JSON.stringify(currProfilePageFilters));
            setTimeout(() => window.location.reload(), 200);
        });
    });
    const filterClearer = document.querySelector("#nav-clear-filter")
    filterClearer && filterClearer.addEventListener('click', () => {
        const currProfilePageFilters = getJSONItemFromLocal('profilePageFilters', {});
        currProfilePageFilters[username] = '';
        localStorage.setItem('profilePageFilters', JSON.stringify(currProfilePageFilters));
        setTimeout(() => window.location.reload(), 200);
        tagFilters.forEach(tagListing => {
            tagListing.querySelector('input').checked = false;
        });
    })

    fetch(`/post/posts/${username}${tag === '' ? '' : `?tag=${tag}`}`)
        .then(response => {
            if (response.status !== 200) {
                triggerErrorMessage();
            } else {
                response.json()
                    .then(response => {
                        currDate = response.next;
                        response.posts.forEach(post => {
                            addNewPostCard(post, response.myProfile);
                        });
                        allPostsLoaded = response.next === 0;
                        document.addEventListener("scroll", () => {
                            if (!allPostsLoaded && document.body.offsetHeight - window.innerHeight - window.scrollY < 100) {
                                allPostsLoaded = true;
                                loadMorePosts();
                            }
                        });
                    });
            }
        });
    
    function loadMorePosts() {
        fetch(`/post/posts/${username}?start=${currDate - oneDayTime}&end=${currDate}${tag === '' ? '' : `&tag=${tag}`}`)
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                } else {
                    response.json()
                        .then(response => {
                            if (response.next !== 0) {
                                currDate = response.next;
                            }
                            response.posts.forEach(post => {
                                addNewPostCard(post, response.myProfile);
                            });
                            allPostsLoaded = response.next === 0;
                        });
                }
            });
    }

    function addNewPostCard(post, myProfile) {
        const newPostCard = document.createElement("div");
        newPostCard.className = "post-card";
        newPostCard.id = "post-card-" + post.id;
        post.time_posted *= 1000;
        ReactDOM.render(<Post post={post} myProfile={myProfile} />, newPostCard);
        document.querySelector('#profile-posts').appendChild(newPostCard);
    }
})();