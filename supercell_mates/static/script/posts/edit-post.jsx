function EditPost(props) {
    const [title, setTitle] = React.useState('');
    const [content, setContent] = React.useState('');
    const titleInput = React.useRef(null);
    const contentInput = React.useRef(null);
    const [tag, setTag] = React.useState(undefined);
    const [visibility, setVisibility] = React.useState('Visibility');
    const [errorMessage, setErrorMessage] = React.useState('');
    const imagesInput = React.useRef(null);
    const [imgs, setImgs] = React.useState([]);
    const [numOfImgsToLoad, setNumOfImgsToLoad] = React.useState(-1);
    const [imgLinks, setImgLinks] = React.useState([]);
    const [allImgsLoaded, setAllImgsLoaded] = React.useState(false);
    const postId = props.postId;
    const [deleteMessage, setDeleteMessage] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(true);
    const [isEditSending, setIsEditSending] = React.useState(false);

    React.useEffect(() => {
        displayLoader();
        fetch('/post/post/' + postId)
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                } else {
                    response.json()
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
                            setImgLinks(response.images)
                            setNumOfImgsToLoad(response.images.length);
                            if (response.images.length === 0) {
                                setAllImgsLoaded(true);
                                setIsLoading(false);
                                hideLoader();
                            }
                        });
                }
            });
    }, []);

    if (numOfImgsToLoad !== -1 && imgs.length !== numOfImgsToLoad && !allImgsLoaded) {
        const imgLink = imgLinks[imgs.length];
        fetch(imgLink)
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                    return;
                }
                response.blob()
                    .then(blob => {
                        const arr = imgLink.split('/');
                        const file = new File([blob], `${arr[arr.length - 1]}.${blob.type.split('/')[1]}`, {
                            type: blob.type,
                        })
                        setImgs([...imgs, file]);
                        if (imgs.length === numOfImgsToLoad - 1) {
                            setAllImgsLoaded(true);
                            setIsLoading(false);
                            hideLoader();
                        }
                    });
            });
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

        function displayInputError(inputField, isError) {
            if (isError) {
                inputField.current.classList.add('is-invalid');
                inputField.current.classList.remove('is-valid');
            } else {
                inputField.current.classList.add('is-valid');
                inputField.current.classList.remove('is-invalid');
            }
        }

        let hasError = false;
        if (content === '') {
            setErrorMessage("Content cannot be empty");
            displayInputError(contentInput, true);
            hasError = true;
        } else {
            displayInputError(contentInput, false);
        }
        if (title === '') {
            setErrorMessage("Title cannot be empty");
            displayInputError(titleInput, true);
            hasError = true;
        } else {
            displayInputError(titleInput, false);
        }

        if (hasError) {
            return;
        }
        setErrorMessage('');

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

        if (!isLoading) {
            setIsLoading(true);
            displayLoader();
            setIsEditSending(true);
            fetch('/post/post/edit/' + postId, postRequestContent({
                title: title,
                content: content,
                visibility: visList,
                imgs: imgs
            }))
                .then(response => {
                    setIsLoading(false);
                    hideLoader();
                    setIsEditSending(false);
                    if (response.status !== 200) {
                        triggerErrorMessage();
                    } else {
                        document.querySelector("#edit-post").style.display = 'none';
                        setErrorMessage('');
                        document.querySelector("#post-edit-button").click();
                        editPostCard(postId);
                    }
                });
        }
    }

    function popDeleteMessage() {
        setDeleteMessage('Are you sure to delete this post? This action is irreversible.');
        setTimeout(() => {
            const editWindow = document.querySelector(".edit-window");
            editWindow.scrollTo({
                behaviour: "smooth",
                top: editWindow.scrollHeight
            })
        }, 200);
    }

    function deletePost() {
        if (!isLoading) {
            setIsLoading(true);
            displayLoader();
            fetch('/post/delete', postRequestContent({
                post_id: postId
            }))
                .then(response => {
                    setIsLoading(false);
                    hideLoader();
                    if (response.status !== 200) {
                        triggerErrorMessage();
                    } else {
                        document.querySelector("#post-delete-message-button").click();
                        deletePostCard(postId);
                    }
                });
        }
    }

    return (
        <React.Fragment>
            <button type="button" id="edit-close-btn" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => document.querySelector("#edit-post").style.display = 'none'} />
            <div className="mb-3" id="edit-first-div">
                <label htmlFor="post-title" className="form-label">Title <strong className="asterisk">*</strong></label>
                <input type="text" id="post-title" className="form-control" value={title} autoComplete="off" ref={titleInput} onChange={event => {
                    setTitle(event.target.value.slice(0, 100));
                }} />
                <div className="invalid-feedback">Please enter a title</div>
            </div>
            <div className="mb-3">
                <label htmlFor="post-content" className="form-label">Content <strong className="asterisk">*</strong></label>
                <textarea id="post-content" rows="6" className="form-control" value={content} ref={contentInput} onChange={event => {
                    setContent(event.target.value.slice(0, 1950));
                }}></textarea>
                <div className="invalid-feedback">Please enter some content</div>
            </div>
            <div className="mb-3 visibility-section">
                <div className="visibility-indicator">
                    <img src="/static/media/eye-icon.png" />
                    <strong className="asterisk">*</strong>
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
            {
                imgs.length === 0
                ? ''
                : <div className="mt-4" id="edit-post-images-preview">
                    {
                        imgs.map((imgLink, i) => ((
                            <div className="post-image-preview-div">
                                <img src={URL.createObjectURL(imgLink)} />
                                <div className="post-image-preview-close">
                                    <button type="button" class="btn-close" aria-label="Close" onClick={() => removeImage(i)} />
                                </div>
                            </div>
                        )))
                    }
                </div>
            }
            <div className="mt-3" id="post-delete-all">
                {
                    imgs.length === 0
                    ? ''
                    : <div id="post-delete-all-button" className="btn btn-secondary" onClick={() => deleteAllImages()}>Clear All Photos</div>
                }
            </div>
            <div className="post-edit-buttons mt-3">
                <div id="post-delete-button">
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => popDeleteMessage()}>Delete Post</button>
                </div>
                <div id="post-submit-button">
                    <span className="spinner-border text-warning" role="status" style={{display: isEditSending ? 'block' : 'none'}} />
                    <button type="button" className="btn btn-primary" onClick={submitPost} disabled={isEditSending}>Edit Post</button>
                </div>
            </div>
            {
                deleteMessage === ''
                ? ''
                : <div className="delete-warning">
                    <div className="mt-3 alert alert-danger" role="alert">{deleteMessage}</div>
                    <div className="mt-3 delete-confirm-buttons">
                        <button className="btn btn-success" onClick={() => deletePost()}>Yes</button>
                        <button className="btn btn-danger" onClick={() => setDeleteMessage('')}>No</button>
                    </div>
                </div>
            }
            {
                errorMessage === ''
                ? ''
                : <div className="mt-3 alert alert-danger" role="alert">{errorMessage}</div>
            }
        </React.Fragment>
    );
}

function popEditView(postId) {
    const editPage = document.querySelector("#edit-post");
    Array.from(editPage.children).forEach(child => editPage.removeChild(child));
    const newWindow = document.createElement("div");
    newWindow.className = "edit-window p-3";
    ReactDOM.render(<EditPost postId={postId}/>, newWindow);
    editPage.appendChild(newWindow)
    editPage.style.display = "block";
}


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