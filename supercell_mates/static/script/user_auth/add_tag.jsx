function AddTag() {
    const [tag, setTag] = React.useState('');
    const tagInput = React.useRef(null);
    const [errMessage, setErrMessage] = React.useState('');
    const [holding, setHolding] = React.useState(false);
    const [initialPosition, setInitialPosition] = React.useState();
    const [position, setPosition] = React.useState({
        top: "100px",
        left: "50px"
    });
    const [lastPosition, setLastPosition] = React.useState({
        x: 50,
        y: 100
    });
    const [imagePreview, setImagePreview] = React.useState(undefined);
    const imageInput = React.useRef(null);
    const [description, setDescription] = React.useState('');
    const [attach, setAttach] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    function image() {
        return (
            <img src={URL.createObjectURL(imageInput.current.files[0])} style={{height: '25px'}} />
        )
    }

    function submitForm(event) {
        event.preventDefault();
        if (tag === '') {
            setErrMessage("Tag cannot be empty");
            tagInput.current.classList.add('is-invalid');
            return;
        } else {
            tagInput.current.classList.remove('is-invalid');
        }
        const requestBody = {
            tag: tag,
            description: description,
            attach: attach
        }
        if (imagePreview !== undefined) {
            requestBody.img = imageInput.current.files[0]
        }
        if (!isLoading) {
            setIsLoading(true);
            fetch('/add_tag_request', postRequestContent(requestBody))
                .then(async response => {
                    setIsLoading(false);
                    mouseUp();
                    if (response.status !== 200) {
                        setIsLoading(false);
                        triggerErrorMessage();
                    } else {
                        const text = await response.text();
                        if (text === "tag already present/requested") {
                            document.querySelector("#tag-request-message-content").innerText = 'Tag is already present/requested';
                        } else {
                            document.querySelector("#tag-request-message-content").innerText = 'Your request is sent, our admin will review your request.';
                        }
                        document.querySelector('#add_tag').style.display = 'none';
                        document.querySelector("#tag_request_message_button").click();
                    }
                });
        }
        setErrMessage("");
    }

    function mouseUp() {
        setHolding(false);
        document.body.style.userSelect = 'auto';
    }

    return (
        <React.Fragment>
            <div id="tag_request_window" className="p-3 position-fixed border border-black rounded z- bg-white" 
            style={position}
            onMouseDown={event => {
                setHolding(true);
                document.body.style.userSelect = 'none';
                setInitialPosition({
                    x: event.pageX,
                    y: event.pageY
                });
                setLastPosition({
                    x: Number(position.left.slice(0, -2)),
                    y: Number(position.top.slice(0, -2))
                });
            }} onMouseUp={() => mouseUp()} onMouseMove={event => {
                if (holding) {
                    setPosition({
                        top: `${lastPosition.y + event.pageY - initialPosition.y}px`,
                        left: `${lastPosition.x + event.pageX - initialPosition.x}px`
                    });
                }
            }}>
                <div className="tag-request-form-label">
                    <label className="form-label">Request Tag</label>
                    <button type="button" class="btn-close" aria-label="Close" onClick={() => document.querySelector('#add_tag').style.display = 'none'}></button>
                </div>
                <form autocomplete="off" className='needs-validation'>
                    <div>
                        <label className="form-label">Tag name <strong className="asterisk">*</strong></label>
                        <input className="form-control" type="text" name="tag" placeholder="Name" value={tag} ref={tagInput} onChange={event => {
                            setTag(event.target.value.slice(0, 25));
                        }} />
                        <div className="invalid-feedback">Please enter a tag name</div>
                    </div>
                    <div id="tag-request-icon-preview" className="mt-3">
                        <div>Icon:</div>
                        {imagePreview}
                    </div>
                    <div className="mt-3">
                        <button className="add-image-label" onClick={(e) => {
                            e.preventDefault();
                            imageInput.current.click();
                        }}>
                            <img src="/static/media/add-image-icon.png" />
                        </button>
                        <input ref={imageInput} type="file" className="form-control img-input" accept="image/*" onChange={() => setImagePreview(image())} />
                    </div>
                    <div className="mt-3">
                        <label for="tag-request-description" className="form-label">Description</label>
                        <textarea id="tag-request-description" class="form-control" rows="3" placeholder="Description" value={description} onChange={event => {
                            setDescription(event.target.value.slice(0, 200));
                        }} />
                    </div>
                    <div className="form-check mt-3">
                        <input className="form-check-input" type="checkbox" value="" id="attach-tag-option" onChange={event => setAttach(event.target.checked)} />
                        <label className="form-check-label" for="attach-tag-option">Attach this tag to me once approved</label>
                    </div>
                    <div className="mt-3" id="tag-request-submit-div">
                        <span className="spinner-border text-warning" style={{display: isLoading ? '' : 'none'}} />
                        <button type="submit" className="btn btn-primary" onClick={submitForm} disabled={isLoading}>Request</button>
                    </div>
                </form>
                <div class="alert alert-danger" role='alert' style={{
                    display: errMessage === '' ? 'none' : 'block'
                }}>{errMessage}</div>
            </div>
        </React.Fragment>
    );
}

ReactDOM.render(<AddTag />, document.querySelector("#add_tag"));