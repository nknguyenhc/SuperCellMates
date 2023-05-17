function AddTag() {
    const [tag, setTag] = React.useState('');
    const [errMessage, setErrMessage] = React.useState('');
    const [holding, setHolding] = React.useState(false);
    const [initialPosition, setInitialPosition] = React.useState();
    const [position, setPosition] = React.useState({
        top: "50px",
        left: "50px"
    });
    const [lastPosition, setLastPosition] = React.useState({
        x: 50,
        y: 50
    });

    function submitForm(event) {
        event.preventDefault();
        if (tag === '') {
            setErrMessage("tag cannot be empty");
        } else {
            fetch('/add_tag_request', postRequestContent({
                tag: tag
            }))
                .then(response => {
                    document.querySelector("#tag_request_message_button").click();
                });
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
                setInitialPosition({
                    x: event.pageX,
                    y: event.pageY
                });
            }} onMouseUp={() => {
                setHolding(false);
                setLastPosition({
                    x: pixelToNumber(position.left),
                    y: pixelToNumber(position.top)
                })
            }} onMouseMove={event => {
                if (holding) {
                    setPosition({
                        top: `${lastPosition.y + event.pageY - initialPosition.y}px`,
                        left: `${lastPosition.x + event.pageX - initialPosition.x}px`
                    });
                }
            }}>
                <form onSubmit={submitForm}>
                    <div>
                        <label className="form-label">Tag</label>
                        <input className="form-control" type="text" name="tag" onChange={event => 
                            setTag(event.target.value)}></input>
                    </div>
                    <div className="mt-3">
                        <input type="submit" value="Request" className="btn btn-primary"></input>
                    </div>
                </form>
                <div>{errMessage}</div>
            </div>
            <button style={{display: "none"}} id="tag_request_message_button" type="button" data-bs-toggle="modal" data-bs-target="#tagRequestMessage"></button>
            <div className="modal fade" id="tagRequestMessage" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Message</h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">Your request is sent, our admin will review your request.
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