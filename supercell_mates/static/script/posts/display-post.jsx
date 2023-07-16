(() => {
    const username = document.querySelector("#profile-id").innerHTML.slice(1);
    let allPostsLoaded = true;
    const oneDayTime = 24 * 3600;
    let currDate;

    fetch(`/post/posts/${username}`)
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
    
    let tag = '';
    const tagFilters = Array.from(document.querySelectorAll("#nav-tag-list .tag-listing"));
    tagFilters.forEach(tagListing => {
        tagListing.addEventListener('click', () => {
            tag = tagListing.querySelector('.tag-name').innerText;
            allPostsLoaded = false;
        });
    });
    const filterClearer = document.querySelector("#nav-clear-filter")
    filterClearer && filterClearer.addEventListener('click', () => {
        tagFilters.forEach(tagListing => {
            tagListing.querySelector('input').checked = false;
            allPostsLoaded = false;
        })
        tag = '';
    })
    
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


function editPostCard(postId) {
    const oldCard = document.getElementById("post-card-" + postId);
    fetch('/post/post/' + postId)
        .then(response => {
            if (response.status !== 200) {
                triggerErrorMessage();
            } else {
                response.json()
                    .then(post => {
                        post.time_posted *= 1000;
                        ReactDOM.render(<Post post={post} myProfile={true} />, oldCard);
                    });
            }
        });
}


function deletePostCard(postId) {
    const editPage = document.querySelector("#edit-post");
    document.getElementById("post-card-" + postId).remove();
    Array.from(editPage.children).forEach(child => editPage.removeChild(child));
    editPage.style.display = "none";
}