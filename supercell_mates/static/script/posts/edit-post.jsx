function EditPost(props) {
    const [title, setTitle] = React.useState('');
    const [content, setContent] = React.useState('');
    const [tag, setTag] = React.useState(undefined);
    const [visibility, setVisibility] = React.useState('Visibility');
    const [fetched, setFetched] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    const imagesInput = React.useRef(null);
    const [imgs, setImgs] = React.useState([]);
    const postId = props.postId;

    if (!fetched) {
        setFetched(true);
        fetch('/post/post/' + postId)
            .then(response => response.json())
            .then(response => {
                setTitle(response.title);
                setContent(response.content);
                setTag(response.tag);
                if (response.public_visible) {
                    setVisibility("Public");
                } else {
                    if (response.friend_visible) {
                        if (response.tag_visible) {
                            setVisibility("Friends with same tag");
                        } else {
                            setVisibility("Friends");
                        }
                    } else {
                        setVisibility("People with same tag");
                    }
                }
            })
            .catch(() => triggerErrorMessage());
    }

    function removeImage(index) {
        setImgs(imgs.filter((_, i) => i !== index));
    }

    function addImages(fileArray) {
        setImgs(imgs.concat(fileArray));
    }

    function deleteAllImages() {
        setImgs([]);
    }

    function submitPost(event) {
        event.preventDefault();

        if (title === '') {
            setErrorMessage("Title cannot be empty");
            return;
        } else if (content === '') {
            setErrorMessage("Content cannot be empty");
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

        fetch('/post/post/edit/' + postId, postRequestContent({
            title: title,
            content: content,
            visibility: visList
        }))
            .then(async response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                    console.log(await response.text());
                } else {
                    editPage.style.display = 'none';
                    setErrorMessage('');
                    document.querySelector("#post-edit-button").click();
                }
            });
    }

    return (
        <React.Fragment>
            <div className="mb-3">
                <label htmlFor="post-title" className="form-label">Title</label>
                <input type="text" id="post-title" className="form-control" value={title} onChange={event => {
                    setTitle(event.target.value);
                }} />
            </div>
            <div className="mb-3">
                <label htmlFor="post-content" className="form-label">Content</label>
                <textarea id="post-content" rows="8" className="form-control" value={content} onChange={event => {
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
                    tag === undefined
                    ? ''
                    :
                        <div class="tag-button btn btn-outline-info">
                            <img src={tag.icon} />
                            <div>{tag.name}</div>
                        </div>
                }
            </div>
            <div class="mt-3">
                <label for="post-choose-images" class="form-label">Images</label>
                <input ref={imagesInput} class="form-control" type="file" id="post-choose-images" multiple onChange={() => {
                    addImages(Array.from(imagesInput.current.files));
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
                    : <div id="post-delete-all-button" className="btn btn-secondary" onClick={() => deleteAllImages()}>Clear All Photos</div>
                }
            </div>
            <div className="mt-3" id="post-submit-button">
                <button type="button" className="btn btn-primary" onClick={submitPost}>Edit Post</button>
            </div>
            {
                errorMessage === ''
                ? ''
                : <div className="mt-3 alert alert-danger" role="alert">{errorMessage}</div>
            }
        </React.Fragment>
    );
}

const editPage = document.querySelector("#edit-post");
editPage.addEventListener("click", event => {
    const editWindow = editPage.querySelector("#edit-window");
    if (!editWindow.contains(event.target) && editPage.contains(event.target)) {
        editPage.style.display = "none";
    }
})

function popEditView(postId) {
    Array.from(editPage.children).forEach(child => editPage.removeChild(child));
    const newWindow = document.createElement("div");
    newWindow.id = "edit-window";
    newWindow.className = "p-3";
    ReactDOM.render(<EditPost postId={postId}/>, newWindow);
    editPage.appendChild(newWindow)
    editPage.style.display = "block";
}