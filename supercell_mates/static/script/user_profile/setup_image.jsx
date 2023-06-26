function SetupImage() {
    const username = document.querySelector("#username-input").value;
    const profileImgContainer = React.useRef(null);
    const [imagePreview, setImagePreview] = React.useState();
    const imageInput = React.useRef(null);
    const imgPreviewPage = React.useRef(null);
    const imageFrame = React.useRef(null);
    const [holding, setHolding] = React.useState(false);
    const [initialMousePosition, setInitialMousePosition] = React.useState({
        x: 0,
        y: 0
    });
    const [boxPosition, setBoxPosition] = React.useState({
        x: 50,
        y: 50
    });
    const [initialBoxPosition, setInitialBoxPosition] = React.useState({
        x: 50,
        y: 50
    });
    const [frameSize, setFrameSize] = React.useState(100);
    const [initialFrameSize, setInitialFrameSize] = React.useState(100);
    const [resizing, setResizing] = React.useState(false);
    const frameResizer = React.useRef(null);
    const [imgToBeSubmitted, setImgToBeSubmitted] = React.useState(null);

    function image() {
        return (
            <img src={URL.createObjectURL(imageInput.current.files[0])}></img>
        )
    }

    function cropImage(callBack) {
        const canvas = document.createElement('canvas');
        const img = imageFrame.current.querySelector("img");
        canvas.width = frameSize;
        canvas.height = frameSize;
        const ratio = img.naturalWidth / img.width;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, boxPosition.x * ratio, boxPosition.y * ratio, frameSize * ratio, frameSize * ratio, 0, 0, frameSize, frameSize);
        canvas.toBlob(callBack);
    }

    function submitPhoto() {
        console.log(imgToBeSubmitted.type);
        fetch('/profile/set_profile_image', postRequestContent({
            img: imgToBeSubmitted
        }))
            .then(response => {
                if (response.status !== 200) {
                    response.text().then(text => console.log(text));
                    triggerErrorMessage();
                } else {
                    popSetupMessage("Profile image updated successfully!");
                    imgPreviewPage.current.style.display = 'none';
                    const content = profileImgContainer.current.innerHTML;
                    profileImgContainer.current.innerHTML = content;
                }
            });
    }

    return (
        <React.Fragment>
            <div id="setup-image-preview-page" ref={imgPreviewPage} style={{display: 'none'}}
            onMouseUp={() => {
                setHolding(false);
                setResizing(false);
                setInitialBoxPosition({
                    x: boxPosition.x,
                    y: boxPosition.y
                });
                setInitialFrameSize(frameSize);
                cropImage(blob => setImgToBeSubmitted(new File([blob], 'image.jpeg', {
                    type: blob.type,
                })));
            }} onMouseMove={event => {
                if (holding) {
                    setBoxPosition({
                        x: Math.min(Math.max(event.clientX - initialMousePosition.x + initialBoxPosition.x, 0), imageFrame.current.clientWidth - frameSize),
                        y: Math.min(Math.max(event.clientY - initialMousePosition.y + initialBoxPosition.y, 0), imageFrame.current.clientHeight - frameSize),
                    })
                } else if (resizing) {
                    setFrameSize(Math.min(
                        Math.max(
                            event.clientX - initialMousePosition.x + initialFrameSize,
                            event.clientY - initialMousePosition.y + initialFrameSize
                        ),
                        imageFrame.current.clientWidth - boxPosition.x,
                        imageFrame.current.clientHeight - boxPosition.y
                    ));
                }
            }}>
                <div id="setup-image-preview-image" ref={imageFrame}>
                    {imagePreview}
                    <div id="setup-image-preview-frame">
                        <div id="setup-image-preview-cut-frame" style={{
                            top: `${boxPosition.y}px`,
                            left:`${boxPosition.x}px`,
                            height: `${frameSize}px`,
                            width: `${frameSize}px`,
                            cursor: holding ? 'grabbing' : 'grab'
                        }}>
                            <div id="setup-image-overlay" style={{
                                top: `${-boxPosition.y - 2}px`,
                                left: `${-boxPosition.x - 2}px`
                            }}>
                                {imagePreview}
                            </div>
                            <div id="setup-image-preview-cut-frame-overlay" onMouseDown={event => {
                                if (!frameResizer.current.contains(event.target)) {
                                    setHolding(true);
                                }
                                setInitialMousePosition({
                                    x: event.clientX,
                                    y: event.clientY
                                });
                            }}></div>
                            <div id="setup-image-frame-resize" onMouseDown={event => {
                                setResizing(true);
                                setInitialMousePosition({
                                    x: event.clientX,
                                    y: event.clientY
                                });
                            }} ref={frameResizer}></div>
                        </div>
                    </div>
                </div>
                <div id="setup-image-preview-buttons">
                    <button className="btn btn-danger" onClick={() => {
                        imgPreviewPage.current.style.display = 'none';
                    }}>Cancel</button>
                    <button className="btn btn-success" onClick={() => submitPhoto()}>Confirm</button>
                </div>
            </div>
            <div className="m-3">
                <div>Add/Change Profile Image</div>
                <button class="add-image-label" onClick={() => imageInput.current.click()}>
                    <img src="/static/media/add-image-icon.png" />
                </button>
                <input ref={imageInput} class="form-control img-input" type="file" id="setupImage" name="profile_pic" accept="image/*" onChange={() => {
                    setImagePreview(image());
                    imgPreviewPage.current.style.display = '';
                }}></input>
            </div>
            <div ref={profileImgContainer} className="profile-img-container m-3">
                <img src={"/profile/img/" + username} alt="" />
            </div>
        </React.Fragment>
    );
}

ReactDOM.render(<SetupImage />, document.querySelector("#setup_image"));