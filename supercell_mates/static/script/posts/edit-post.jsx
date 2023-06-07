function EditPost() {
    const [title, setTitle] = React.useState('');
    const [content, setContent] = React.useState('');
    const [tag, setTag] = React.useState(undefined);
    const [visibility, setVisibility] = React.useState('Visibility');
    const [userTags, setUserTags] = React.useState([]);
    const [fetched, setFetched] = React.useState(false);
    const postCreateButton = React.useRef(null);
    const [errorMessage, setErrorMessage] = React.useState('');
    const imagesInput = React.useRef(null);
    const [imgs, setImgs] = React.useState([]);
    const username = document.querySelector("#profile-id").innerHTML.slice(1);

    if (!fetched) {
        setFetched(true);
        fetch('/profile/user_tags/' + username)
            .then(response => response.json())
            .then(response => setUserTags(response.tags));
    }

    function removeImage(index) {
        setImgs(imgs.filter((_, i) => i !== index));
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
            imgs: imgs
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
                    userTags.length === 0
                    ? 'Your profile needs at least one tag to post!'
                    : userTags.map(tag => (
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
            <div class="mt-3">
                <label for="post-choose-images" class="form-label">Images</label>
                <input ref={imagesInput} class="form-control" type="file" id="post-choose-images" multiple onChange={() => {
                    setImgs(imgs.concat(Array.from(imagesInput.current.files)));
                }} />
            </div>
            <div className="mt-4" id="post-images-preview">
                {
                    imgs.map((imgFile, i) => ((
                        <div className="post-image-preview-div">
                            <img src={URL.createObjectURL(imgFile)} />
                            <div className="post-image-preview-close">
                                <button type="button" class="btn-close" aria-label="Close" onClick={() => removeImage(i)} />
                            </div>
                        </div>
                    )))
                }
            </div>
            <div className="mt-3" id="post-delete-all">
                {
                    imgs.length === 0
                    ? ''
                    : <div id="post-delete-all-button" className="btn btn-secondary" onClick={() => setImgs([])}>Clear All Photos</div>
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
                        <div class="modal-body">Post edited!</div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

const editPage = document.querySelector("#edit-post");
editPage.addEventListener("click", event => {
    const editWindow = editPage.querySelector("#edit-window");
    if (!editWindow.contains(event.target)) {
        editPage.style.display = "none";
    }
})

function popEditView(postId) {
    Array.from(editPage.children).forEach(child => editPage.removeChild(child));
    const newWindow = document.createElement("div");
    newWindow.id = "edit-window";
    newWindow.className = "p-3";
    ReactDOM.render(<EditPost />, newWindow);
    editPage.appendChild(newWindow)
    editPage.style.display = "block";
}