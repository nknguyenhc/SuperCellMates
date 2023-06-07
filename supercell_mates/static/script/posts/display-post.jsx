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
        <div className="post-card">
            <div className="post-creator-info mb-2">
                <div className="post-creator-profile-pic">
                    <img src={post.creator.profile_pic_url} />
                </div>
                <div className="post-creator-text-info">
                    <div className="post-creator-name">{post.creator.name}</div>
                    <a className="post-creator-username" href={post.creator.profile_link}>@{post.creator.username}</a>
                </div>
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
        </div>
    );
}

function Posts() {
    const [fetched, setFetched] = React.useState(false);
    const [posts, setPosts] = React.useState([]);
    const [username, setUsername] = React.useState('');

    if (!fetched) {
        setUsername(document.querySelector("#profile-id").innerHTML.slice(1));
        if (username !== '') {
            setFetched(true);
            fetch(`/post/posts/${username}?start=2023-06-05-00-00-00&end=2023-06-09-23-59-00`)
                .then(response => response.json())
                .then(response => {
                    console.log(response.posts);
                    setPosts(response.posts);
                })
                .catch(() => triggerErrorMessage());
        }
    }

    return (
        <React.Fragment>
            {posts.map(post => <Post post={post} />)}
        </React.Fragment>
    );
}

ReactDOM.render(<Posts />, document.querySelector("#profile-posts"));