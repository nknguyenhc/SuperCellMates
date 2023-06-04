function CreatePost() {
    const [title, setTitle] = React.useState('');
    const [content, setContent] = React.useState('');
    const [tag, setTag] = React.useState(undefined);
    const [visibility, setVisibility] = React.useState('Visibility');
    const [userTags, setUserTags] = React.useState([]);
    const [fetched, setFetched] = React.useState(false);

    if (!fetched) {
        setFetched(true);
        fetch('/profile/user_tags/' + document.querySelector("#welcome-message").innerHTML.split("@")[1])
            .then(response => response.json())
            .then(response => setUserTags(response.tags));
    }

    function submitPost(event) {
        event.preventDefault();
        let visList;
        switch (visibility) {
            case "Public":
                visList = ["public"];
                break;
            case "People with same tag":
                visList = ["tag"];
                break;
            case "Friends":
                visList = ["friends"];
                break;
            case "Friends with same tag":
                visList = ["friends", "tag"];
                break;
        }
        fetch('/post/create_post', postRequestContent({
            title: title,
            content: content,
            tag: tag.name,
            visibility: visList,
        }))
            .then(response => response.text())
            .then(response => console.log(response));
    }

    return (
        <React.Fragment>
            <div className="mb-3">
                <label htmlFor="post-title" className="form-label">Title</label>
                <input type="text" id="post-title" className="form-control" onChange={event => {
                    setTitle(event.target.value);
                }} />
            </div>
            <div className="mb-3">
                <label htmlFor="post-content" className="form-label">Content</label>
                <textarea id="post-content" rows="8" className="form-control" onChange={event => {
                    setContent(event.target.value);
                }}></textarea>
            </div>
            <div className="mb-3 visibility-section">
                <div className="visibility-indicator">
                    <img src="/static/media/eye-icon.png" />
                </div>
                <div class="btn-group">
                    <button type="button" class="btn btn-warning dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                        {visibility}
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="javascript:void(0)" onClick={() => setVisibility("Public")}>Public</a></li>
                        <li><a class="dropdown-item" href="javascript:void(0)" onClick={() => setVisibility("People with same tag")}>People with same tag</a></li>
                        <li><a class="dropdown-item" href="javascript:void(0)" onClick={() => setVisibility("Friends")}>Friends</a></li>
                        <li><a class="dropdown-item" href="javascript:void(0)" onClick={() => setVisibility("Friends with same tag")}>Friends with same tag</a></li>
                    </ul>
                </div>
            </div>
            <div className="mt-3" id="post-choose-tag">
                {
                    userTags.map(tag => (
                        <React.Fragment>
                            <input type="radio" class="btn-check" name="options" id={"post-tag-" + tag.name} autocomplete="off" />
                            <label class="tag-button btn btn-outline-info" for={"post-tag-" + tag.name} onClick={() => {
                                setTag(tag);
                            }}>
                                <img src={tag.icon} />
                                <div>{tag.name}</div>
                            </label>
                        </React.Fragment>
                    ))
                }
            </div>
            <div className="mt-3" id="post-submit-button">
                <button type="button" className="btn btn-primary" onClick={submitPost}>Post</button>
            </div>
        </React.Fragment>
    );
}

ReactDOM.render(<CreatePost />, document.querySelector("#create-post"));