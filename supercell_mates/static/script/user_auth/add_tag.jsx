function AddTag() {
    const [tag, setTag] = React.useState('');
    const [errMessage, setErrMessage] = React.useState('');
    const [holding, setHolding] = React.useState(false);
    const [initialPosition, setInitialPosition] = React.useState();
    const [position, setPosition] = React.useState({
        zIndex: 9999,
        top: "100px",
        left: "50px"
    });
    const [lastPosition, setLastPosition] = React.useState({
        x: 50,
        y: 100
    });
    const [imagePreview, setImagePreview] = React.useState(undefined);
    const imageInput = React.useRef(null);
    const [tagRequestMessage, setTagRequestMessage] = React.useState('');

    function image() {
        return (
            <img src={URL.createObjectURL(imageInput.current.files[0])} style={{height: '25px'}} />
        )
    }

    function submitForm(event) {
        event.preventDefault();
        if (tag === '') {
            setErrMessage("Tag cannot be empty");
        } else {
            const requestBody = {
                tag: tag
            }
            if (imagePreview !== undefined) {
                requestBody.img = imageInput.current.files[0]
            }
            fetch('/add_tag_request', postRequestContent(requestBody))
                .then(async response => {
                    if (response.status !== 200) {
                        triggerErrorMessage();
                    } else {
                        const text = await response.text();
                        if (text === "tag already present/requested") {
                            await setTagRequestMessage('Tag is already present/requested');
                        } else {
                            await setTagRequestMessage('Your request is sent, our admin will review your request.');
                        }
                        document.querySelector("#tag_request_message_button").click();
                    }
                })
                .catch(() => triggerErrorMessage());
            setErrMessage("");
        }
    }

    function pixelToNumber(pixelStr) {
        let i = 0;
        while (!isNaN(pixelStr[i])) {
            i += 1;
        }
        return Number(pixelStr.slice(0, i));
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
            }} onMouseUp={() => {
                setHolding(false);
                document.body.style.userSelect = 'auto';
                setLastPosition({
                    x: pixelToNumber(position.left),
                    y: pixelToNumber(position.top)
                })
            }} onMouseMove={event => {
                if (holding) {
                    setPosition({
                        ...position,
                        top: `${lastPosition.y + event.pageY - initialPosition.y}px`,
                        left: `${lastPosition.x + event.pageX - initialPosition.x}px`
                    });
                }
            }}>
                <div className="tag-request-form-label">
                    <label className="form-label">Tag</label>
                    <button type="button" class="btn-close" aria-label="Close" onClick={() => document.querySelector('#add_tag').style.display = 'none'}></button>
                </div>
                <form autocomplete="off" onSubmit={submitForm}>
                    <div>
                        <input className="form-control" type="text" name="tag" placeholder="Name" onChange={event => 
                            setTag(event.target.value)}></input>
                    </div>
                    <div id="tag-request-icon-preview" className="mt-3">
                        <div>Icon:</div>
                        {imagePreview}
                    </div>
                    <div className="mt-3">
                        <input ref={imageInput} type="file" className="form-control" accept="image/*" onChange={() => setImagePreview(image())} />
                    </div>
                    <div className="mt-3">
                        <input type="submit" value="Request" className="btn btn-primary"></input>
                    </div>
                </form>
                <div class="alert alert-danger" role='alert' style={{
                    display: errMessage === '' ? 'none' : 'block'
                }}>{errMessage}</div>
            </div>
            <button style={{display: "none"}} id="tag_request_message_button" type="button" data-bs-toggle="modal" data-bs-target="#tagRequestMessage"></button>
            <div className="modal fade" id="tagRequestMessage" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Message</h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">{tagRequestMessage}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

ReactDOM.render(<AddTag />, document.querySelector("#add_tag"));