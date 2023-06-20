function Post(props) {
    const post = props.post;

    function PostImages() {
        return (
            <div className="carousel slide" id={"post-images-carousel-" + post.id} data-bs-theme="dark">
                <div class="carousel-indicators">
                    {
                        post.images.map((_, i) => (
                            <button type="button" data-bs-target={"#post-images-carousel-" + post.id} data-bs-slide-to={i.toString()} class={i === 0 ? "active" : ""} aria-current={i === 0 ? "true" : ""}></button>
                        ))
                    }
                </div>
                <div class="carousel-inner">
                    {
                        post.images.map((image, i) => (
                            <div class={i === 0 ? "carousel-item active" : "carousel-item"}>
                                <img src={image} class="d-block" />
                            </div>
                        ))
                    }
                </div>
                <button class="carousel-control-prev" type="button" data-bs-target={"#post-images-carousel-" + post.id} data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Previous</span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target={"#post-images-carousel-" + post.id} data-bs-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Next</span>
                </button>
            </div>
        )
    }

    return (
        <React.Fragment>
            <div className="post-header">
                <div className="post-creator-info mb-2">
                    <div className="post-creator-profile-pic">
                        <img src={post.creator.profile_pic_url} />
                    </div>
                    <div className="post-creator-text-info">
                        <div className="post-creator-name">{post.creator.name}</div>
                        <a className="post-creator-username" href={post.creator.profile_link}>@{post.creator.username}</a>
                    </div>
                    {
                        props.myProfile
                        ? <div>
                            <button className="btn btn-secondary btn-sm" onClick={() => {
                                popEditView(post.id);
                            }}>Edit</button>
                        </div>
                        : ''
                    }
                </div>
                <div className="post-date">{`${formatNumber(post.time_posted.day, 2)}/${formatNumber(post.time_posted.month, 2)}/${formatNumber(post.time_posted.year, 4)} ${formatNumber(post.time_posted.hour, 2)}:${formatNumber(post.time_posted.minute, 2)}`}</div>
            </div>
            <h4 className='mb-2'>{post.title}</h4>
            <div className="post-tag mb-2">
                <div className="tag-button btn btn-outline-info">
                    <img src={post.tag.icon} />
                    <div>{post.tag.name}</div>
                </div>
            </div>
            <div className="post-content mb-2">{post.content}</div>
            <div className="post-images mb-2">
                {
                    post.images.length === 0
                    ? ''
                    : <PostImages />
                }
            </div>
        </React.Fragment>
    );
}

(() => {
    const username = document.querySelector("#profile-id").innerHTML.slice(1);
    let allPostsLoaded = true;
    const oneDayTime = 1000 * 24 * 60 * 60;
    const now = new Date();
    const yest = new Date(new Date().getTime() - oneDayTime);
    let currDate = yest;

    fetch(`/post/posts/${username}?start=${formatTime(yest)}&end=${formatTime(now)}`)
        .then(response => response.json())
        .then(response => {
            response.posts.forEach(post => {
                addNewPostCard(post, response.myProfile);
            });
            allPostsLoaded = !response.hasOlderPosts;
            document.addEventListener("scroll", () => {
                if (!allPostsLoaded && document.body.offsetHeight - window.innerHeight - window.scrollY < 100) {
                    allPostsLoaded = true;
                    loadMorePosts();
                }
            });
        })
        .catch(() => triggerErrorMessage());
    
    function loadMorePosts() {
        const prevDate = new Date(currDate - oneDayTime);
        fetch(`/post/posts/${username}?start=${formatTime(prevDate)}&end=${formatTime(currDate)}`)
            .then(response => response.json())
            .then(response => {
                currDate = prevDate;
                response.posts.forEach(post => {
                    addNewPostCard(post, response.myProfile);
                });
                allPostsLoaded = !response.hasOlderPosts;
            })
            .catch(() => triggerErrorMessage());
    }

    function formatTime(date) {
        return `${formatNumber(date.getFullYear(), 4)}-${formatNumber(date.getMonth() + 1, 2)}-${formatNumber(date.getDate(), 2)}-${formatNumber(date.getHours(), 2)}-${formatNumber(date.getMinutes(), 2)}-${formatNumber(date.getSeconds(), 2)}`
    }

    function addNewPostCard(post, myProfile) {
        const newPostCard = document.createElement("div");
        newPostCard.className = "post-card";
        newPostCard.id = "post-card-" + post.id;
        ReactDOM.render(<Post post={post} myProfile={myProfile} />, newPostCard);
        document.querySelector('#profile-posts').appendChild(newPostCard);
    }
})();


function editPostCard(postId) {
    const oldCard = document.getElementById("post-card-" + postId);
    fetch('/post/post/' + postId)
        .then(response => response.json())
        .then(post => {
            ReactDOM.render(<Post post={post} myProfile={true} />, oldCard);
        })
        .catch(() => triggerErrorMessage());
}


function deletePostCard(postId) {
    document.getElementById("post-card-" + postId).remove();
    Array.from(editPage.children).forEach(child => editPage.removeChild(child));
    editPage.style.display = "none";
}