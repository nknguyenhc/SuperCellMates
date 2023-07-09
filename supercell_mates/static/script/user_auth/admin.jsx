function ManageTags() {
    const [requests, setRequests] = React.useState([]);

    React.useEffect(() => {
        fetch('/obtain_tag_requests')
            .then(response => response.json())
            .then(response => setRequests(response.tag_requests))
            .catch(() => triggerErrorMessage());
    }, []);

    function submitTag(tag_request_id, tag) {
        fetch('/add_tag_admin', postRequestContent({
            tag_request_id: tag_request_id,
            tag: tag
        }))
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                }
            });
        setRequests(requests.filter(request => request.id != tag_request_id));
    }

    function removeRequest(tag_request_id) {
        fetch('/remove_tag_request', postRequestContent({
            tag_request_id: tag_request_id
        }));
        setRequests(requests.filter(request => request.id != tag_request_id));
    }

    return (
        <React.Fragment>
            <table className="table table-striped table-hover table-bordered border-primary">
                <thead>
                    <tr>
                        <th scope="col" style={{width: "5%"}}>ID</th>
                        <th scope="col" style={{width: "5%"}}>Icon</th>
                        <th scope="col" style={{width: "20%"}}>Tag</th>
                        <th scope="col" style={{width: "30%"}}>Description</th>
                        <th scope="col" style={{width: "20%"}}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map(request => (
                        <tr>
                            <th scope="row">{request.id}</th>
                            <td>
                                <img src={request.icon} height="30" width="30" />
                            </td>
                            <td>{request.name}</td>
                            <td>{request.description}</td>
                            <td>
                                <button type="button" class="btn btn-success" onClick={() => {
                                    submitTag(request.id, request.name);
                                }}>Approve</button>
                                <button type="button" class="btn btn-danger" onClick={() => {
                                    removeRequest(request.id);
                                }}>Reject</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </React.Fragment>
    );
}

function AddTags() {
    const addTagAdminButton = React.useRef(null);
    const [tagName, setTagName] = React.useState('');
    const [emptyErrorMessageTriggered, setEmptyErrorMessageTriggered] = React.useState(false);
    const [adminMessage, setAdminMessage] = React.useState('');
    const [imagePreview, setImagePreview] = React.useState('');
    const [imgFile, setImgFile] = React.useState(null);
    const fileInput = React.useRef(null);
    
    function addTag(event) {
        event.preventDefault();
        if (tagName === '') {
            setEmptyErrorMessageTriggered(true);
            return;
        }

        const requestBody = {
            tag: tagName
        }
        if (imgFile !== null) {
            requestBody.img = imgFile;
        }
        fetch('/new_tag_admin', postRequestContent(requestBody))
            .then(response => {
                if (response.status === 200) {
                    response.text().then(text => setAdminMessage(text));
                    addTagAdminButton.current.click();
                    setTagName('');
                    setImgFile(null);
                    fileInput.current.files = null;
                    setEmptyErrorMessageTriggered(false);
                } else {
                    triggerErrorMessage();
                }
            });
    }

    function iconUpload(event) {
        setImagePreview((
            <img src={URL.createObjectURL(event.target.files[0])} style={{height: '25px'}} />
        ));
        setImgFile(event.target.files[0]);
    }

    return (
        <React.Fragment>
            <form onSubmit={addTag}>
                <div className="m-3">
                    <label htmlFor="tag-input" className="form-label">Tag</label>
                    <input type="text" className="form-control" id="tag-input-admin" autoComplete="off" value={tagName} onChange={event => setTagName(event.target.value.slice(0, 25))} />
                </div>
                <div className="m-3" id="new-tag-admin-icon">
                    <div>Icon:</div>
                    <div>{imagePreview}</div>
                </div>
                <input ref={fileInput} type="file" accept="image/*" className="form-control m-3" onChange={iconUpload} />
                <div className="m-3">
                    <input type="submit" class="btn btn-primary" value="Add Tag" />
                </div>
                <div className="m-3 alert alert-danger" role="alert" style={{display: emptyErrorMessageTriggered ? "block" : "none"}}>Tag cannot be empty!</div>
            </form>
            <button ref={addTagAdminButton} style={{display: 'none'}} id="add-tag-admin-message-button" type="button" data-bs-toggle="modal" data-bs-target="#add-tag-admin-message"></button>
            <div class="modal fade" id="add-tag-admin-message" tabindex="-1" aria-labelledby="add-tag-admin-label" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="add-tag-admin-label">Message</h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">{adminMessage}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}

function Page() {
    const [pageState, setPageState] = React.useState(0);

    function AdminSideNav() {
        return (
            <div id="admin-side-nav" className="sticky-top border-end">
                <ul className="nav flex-column">
                    <li className="nav-item">
                        <a className="nav-link" href="javascript:void(0)" id="manage-tag-requests" onClick={() => setPageState(0)}>Manage Tag Requests</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="javascript:void(0)" id="manage-tag-requests" onClick={() => setPageState(1)}>Add Tags</a>
                    </li>
                </ul>
            </div>
        )
    }

    return (
        <React.Fragment>
            <AdminSideNav />
            <div id="admin-content" className="ps-3">
                <div id="manage-tags" className="admin-content" style={{display: pageState === 0 ? 'block' : 'none'}}><ManageTags /></div>
                <div id="add-tags" className="admin-content" style={{display: pageState === 1 ? 'block' : 'none'}}><AddTags /></div>
            </div>
        </React.Fragment>
    );
}

ReactDOM.render(<Page />, document.querySelector("#admin-page"));