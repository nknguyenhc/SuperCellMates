(() => {
    const username = document.querySelector("#profile-id").innerHTML.slice(1);
    let allPostsLoaded = true;
    const oneDayTime = 1000 * 24 * 60 * 60;
    const now = new Date();
    const yest = new Date(new Date().getTime() - oneDayTime);
    let currDate = yest;

    fetch(`/post/posts/${username}?start=${yest.getTime() / 1000}&end=${now.getTime() / 1000}`)
        .then(response => {
            if (response.status !== 200) {
                triggerErrorMessage();
            } else {
                response.json()
                    .then(response => {
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
    Array.from(document.querySelectorAll("#nav-tag-list .tag-listing")).forEach(tagListing => {
        tagListing.addEventListener('click', () => {
            tag = tagListing.querySelector('.tag-name').innerText;
        });
    });
    
    function loadMorePosts() {
        const prevDate = new Date(currDate.getTime() - oneDayTime);
        fetch(`/post/posts/${username}?start=${prevDate.getTime() / 1000}&end=${currDate.getTime() / 1000}${tag === '' ? '' : `&tag=${tag}`}`)
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                } else {
                    response.json()
                        .then(response => {
                            currDate = new Date(response.next * 1000);
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