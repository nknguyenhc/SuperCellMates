function CreatePost() {
    const [title, setTitle] = React.useState('');
    const titleInput = React.useRef(null);
    const [content, setContent] = React.useState('');
    const contentInput = React.useRef(null);
    const [tag, setTag] = React.useState(undefined);
    const [visibility, setVisibility] = React.useState('Visibility');
    const visibilityInput = React.useRef(null);
    const [userTags, setUserTags] = React.useState([]);
    const tagInput = React.useRef(null);
    const postCreateButton = React.useRef(null);
    const [errorMessage, setErrorMessage] = React.useState('');
    const imagesInput = React.useRef(null);
    const [imgs, setImgs] = React.useState([]);
    const username = document.querySelector("#welcome-message").innerHTML.split("@")[1];

    React.useEffect(() => {
        fetch('/profile/user_tags/' + username)
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                } else {
                    response.json().then(response => setUserTags(response.tags));
                }
            })
    }, []);

    function removeImage(index) {
        setImgs(imgs.filter((_, i) => i !== index));
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

        function clearInputValidations() {
            titleInput.current.classList.remove('is-valid');
            contentInput.current.classList.remove('is-valid');
            visibilityInput.current.classList.remove('is-valid');
            tagInput.current.classList.remove('is-valid');
        }

        let hasError = false;
        if (visibility === "Visibility") {
            setErrorMessage("Please choose a visibility setting");
            displayInputError(visibilityInput, true);
            hasError = true;
        } else {
            displayInputError(visibilityInput, false);
        }
        if (tag === undefined) {
            setErrorMessage("You must choose a tag to associate with this post");
            displayInputError(tagInput, true);
            hasError = true;
        } else {
            displayInputError(tagInput, false);
        }
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
                    clearInput();
                    clearInputValidations();
                }
            });
    }

    function clearInput() {
        titleInput.current.value = '';
        contentInput.current.value = '';
        setVisibility('Visibility');
        for (let i = 0; i < userTags.length; i++) {
            document.getElementById("post-tag-" + userTags[i].name).checked = false;
        }
        setImgs([]);
        imagesInput.current.files = null;
    }

    return (
        <form onSubmit={event => event.preventDefault()} className="needs-validation" noValidate>
            <div className="mb-3">
                <label htmlFor="post-title" className="form-label">Title</label>
                <input type="text" id="post-title" className="form-control" ref={titleInput} value={title} autoComplete="off" onChange={event => {
                    setTitle(event.target.value.slice(0, 100));
                }} />
                <div className="invalid-feedback">Please enter a title</div>
            </div>
            <div className="mb-3">
                <label htmlFor="post-content" className="form-label">Content</label>
                <textarea id="post-content" rows="8" className="form-control" ref={contentInput} value={content} onChange={event => {
                    setContent(event.target.value.slice(0, 2000));
                }}></textarea>
                <div className="invalid-feedback">Please enter some content</div>
            </div>
            <div className="mb-3 visibility-section">
                <div className="visibility-indicator">
                    <img src="/static/media/eye-icon.png" />
                </div>
                <div class="btn-group" ref={visibilityInput}>
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
                <div className="invalid-feedback">Please select visibility</div>
            </div>
            <div className="mt-3">
                <div ref={tagInput} id="post-choose-tag">
                    {
                        userTags.length === 0
                        ? <div className="text-danger">Your profile needs at least one tag to post! Setup your tags <a href="/profile/setup">here</a></div>
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
                <div className="invalid-feedback">Please choose a tag to post</div>
            </div>
            <div class="mt-3">
                <div>Images &#40;max file size: 5MB, limit: 9&#41;</div>
                <button className="post-choose-img-label add-image-label" onClick={() => imagesInput.current.click()}>
                    <img src="/static/media/add-image-icon.png" />
                </button>
                <div>
                    <input ref={imagesInput} class="form-control img-input" accept="image/*" type="file" multiple onChange={() => {
                        const files = Array.from(imagesInput.current.files);
                        if (imgs.length + files.length > 9) {
                            alert("9 images only please!");
                        } else if (files.map(file => file.size / 1024 / 1024).reduce((prev, curr) => prev && curr < 5, true)) {
                            setImgs(imgs.concat(files));
                        } else {
                            alert("One of your images exceeds 5MB, please ensure all images are below 5MB.");
                        }
                    }} />
                </div>
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
                        <div class="modal-body">Post created!</div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}

ReactDOM.render(<CreatePost />, document.querySelector("#create-post"));