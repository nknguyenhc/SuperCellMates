function CreatePost() {
    const [title, setTitle] = React.useState('');
    const [content, setContent] = React.useState('');
    const [tag, setTag] = React.useState(undefined);
    const [visibility, setVisibility] = React.useState('Visibility');
    const [userTags, setUserTags] = React.useState([]);
    const [fetched, setFetched] = React.useState(false);
    const postCreateButton = React.useRef(null);
    const [errorMessage, setErrorMessage] = React.useState('');

    if (!fetched) {
        setFetched(true);
        fetch('/profile/user_tags/' + document.querySelector("#welcome-message").innerHTML.split("@")[1])
            .then(response => response.json())
            .then(response => setUserTags(response.tags));
    }

    function submitPost(event) {
        event.preventDefault();

        if (title === '') {
            setErrorMessage("Title cannot be empty");
            return;
        } else if (content === '') {
            setErrorMessage("Content cannot be empty");
            return;
        } else if (tag === undefined) {
            setErrorMessage("You must choose a tag to associate with this post");
            return;
        } else if (visibility === "Visibility") {
            setErrorMessage("Please choose a visibility setting");
            return;
        }

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
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                } else {
                    postCreateButton.current.click();
                    setErrorMessage('');
                }
            });
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
            {
                errorMessage === ''
                ? ''
                : <div className="mt-3 alert alert-danger" role="alert">{errorMessage}</div>
            }
            <button id="post-create-button" style={{display: 'none'}} ref={postCreateButton} type="button" data-bs-toggle="modal" data-bs-target="#post-create-message"></button>
            <div class="modal fade" id="post-create-message" tabindex="-1" aria-labelledby="post-create-label" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="post-create-label">Message</h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">Post created!
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

ReactDOM.render(<CreatePost />, document.querySelector("#create-post"));