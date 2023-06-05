function Post(props) {
    const post = props.post;
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
            <h5 className='mb-2'>{post.title}</h5>
            <div className="post-tag mb-2">
                <div className="tag-button btn btn-outline-info">
                    <img src={post.tag.icon} />
                    <div>{post.tag.name}</div>
                </div>
            </div>
            <div className="post-content mb-2">{post.content}</div>
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
            fetch(`/post/posts/${username}?start=2023-06-05-00-00-00&end=2023-06-05-23-59-00`)
                .then(response => response.json())
                .then(response => {
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