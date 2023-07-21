function ManageTags() {
    const [requests, setRequests] = React.useState([]);
    const isLoading = React.useRef(false);
    const setIsLoading = (newValue) => isLoading.current = newValue;

    React.useEffect(() => {
        fetch('/obtain_tag_requests')
            .then(response => response.json())
            .then(response => setRequests(response.tag_requests))
            .catch(() => triggerErrorMessage());
    }, []);

    function submitTag(tag_request_id) {
        if (!isLoading.current) {
            setIsLoading(true);
            fetch('/add_tag_admin', postRequestContent({
                tag_request_id: tag_request_id
            }))
                .then(response => {
                    setIsLoading(false);
                    if (response.status !== 200) {
                        triggerErrorMessage();
                    }
                });
            setRequests(requests.filter(request => request.id != tag_request_id));
        }
    }

    function removeRequest(tag_request_id) {
        if (!isLoading.current) {
            setIsLoading(true);
            fetch('/remove_tag_request', postRequestContent({
                tag_request_id: tag_request_id
            }))
                .then(response => {
                    setIsLoading(false);
                    if (response.status !== 200) {
                        triggerErrorMessage();
                    }
                });
            setRequests(requests.filter(request => request.id != tag_request_id));
        }
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
                                    submitTag(request.id);
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
    const isLoading = React.useRef(false);
    const setIsLoading = (newValue) => isLoading.current = newValue;
    
    function addTag() {
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
        if (!isLoading.current) {
            setIsLoading(true);
            fetch('/new_tag_admin', postRequestContent(requestBody))
                .then(response => {
                    setIsLoading(false);
                    if (response.status === 200) {
                        response.text().then(text => setAdminMessage(text));
                        addTagAdminButton.current.click();
                        setTagName('');
                        setImgFile(null);
                        setImagePreview('');
                        fileInput.current.files = null;
                        setEmptyErrorMessageTriggered(false);
                    } else {
                        triggerErrorMessage();
                    }
                });
        }
    }

    function iconUpload(event) {
        setImagePreview((
            <img src={URL.createObjectURL(event.target.files[0])} style={{height: '25px'}} />
        ));
        setImgFile(event.target.files[0]);
    }

    return (
        <React.Fragment>
            <form onSubmit={event => event.preventDefault()}>
                <div className="m-3">
                    <label htmlFor="tag-input" className="form-label">Tag</label>
                    <input type="text" className="form-control" id="tag-input-admin" autoComplete="off" value={tagName} onChange={event => setTagName(event.target.value.slice(0, 25))} />
                </div>
                <div className="m-3 mb-0" id="new-tag-admin-icon">
                    <div>Icon:</div>
                    <div>{imagePreview}</div>
                </div>
                <div className="ms-3">
                    <input ref={fileInput} id="tag-icon-file" type="file" accept="image/*" className="form-control m-3 img-input" onChange={iconUpload} />
                    <button onClick={() => fileInput.current.click()} className="add-image-label">
                        <img src="/static/media/add-image-icon.png" />
                    </button>
                </div>
                <div className="m-3">
                    <input type="submit" class="btn btn-primary" value="Add Tag" onClick={addTag} />
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
                        <div class="modal-body">{adminMessage}</div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}


function ChangeTagIcon() {
    const [tags, setTags] = React.useState([]);
    const [selected, setSelected] = React.useState(-1);
    const fileInput = React.useRef(null);
    const [imgFile, setImgFile] = React.useState(null);
    const changeIconAdminButton = React.useRef(null);
    const [isError, setIsError] = React.useState(false);
    const [isBg, setIsBg] = React.useState(false);
    const [scrollY, setScrollY] = React.useState(0);

    React.useEffect(() => {
        refreshTags();
    }, []);

    function refreshTags() {
        fetch('/obtain_tags')
            .then(response => response.json())
            .then(response => {
                setTags(response.tags);
            });
    }

    function updateIcon() {
        if (!imgFile) {
            setIsError(true);
            return;
        }
        setIsError(false);
        fetch('/change_tag_icon', postRequestContent({
            name: tags[selected].name,
            icon: imgFile
        })).then(response => {
            if (response.status !== 200) {
                triggerErrorMessage();
                return;
            } else {
                changeIconAdminButton.current.click();
                refreshTags();
                setSelected(-1);
            }
        })
    }

    return (
        <React.Fragment>
            <div id='change-tag-icon-window'>
                {tags.map((tag, i) => (
                    <div className={"tag-button btn " + (i === selected ? "btn-info" : "btn-outline-info")} onClick={() => {
                        setSelected(i);
                        setImgFile(null);
                        setScrollY(window.scrollY);
                    }}>{tag.name}</div>
                ))}
            </div>
            {selected !== -1 && <div id="icon-display-window" className={"border border-info" + (isBg ? " bg-info" : "")} style={{marginTop: `${scrollY}px`}}>
                <img src={tags[selected].icon} />
                <div className="form-check">
                    <input type="checkbox" id="check-bg" className="form-check-input" onChange={event => setIsBg(event.target.checked)} />
                    <label htmlFor="check-bg" className="form-check-label">Test background</label>
                </div>
                <div>
                    New Icon:
                    <input ref={fileInput} type="file" className="img-input" accept="image/*" onChange={event => {
                        setImgFile(event.target.files[0]);
                    }} />
                    <button onClick={() => fileInput.current.click()} className="add-image-label">
                        <img src="/static/media/add-image-icon.png" />
                    </button>
                </div>
                {imgFile && <img src={URL.createObjectURL(imgFile)} />}
                <button className="btn btn-success" onClick={updateIcon}>Update Icon</button>
                {isError && <div className="alert alert-danger" role="alert">You have not set the new icon</div>}
                <button ref={changeIconAdminButton} style={{display: 'none'}} type="button" data-bs-toggle="modal" data-bs-target="#change-icon-admin-message"></button>
                <div class="modal fade" id="change-icon-admin-message" tabindex="-1" aria-labelledby="change-icon-admin-label" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h1 class="modal-title fs-5" id="change-icon-admin-label">Message</h1>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">Icon changed.</div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>}
        </React.Fragment>
    );
}


function Page() {
    const [pageState, setPageState] = React.useState(0);

    function AdminSideNav() {
        return (
            <div id="admin-side-nav" className="sticky-top border-end">
                <ul className="nav flex-column">
                    <li className="nav-item">
                        <a className="nav-link" href="javascript:void(0)" onClick={() => setPageState(0)}>Manage Tag Requests</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="javascript:void(0)" onClick={() => setPageState(1)}>Add Tags</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="javascript:void(0)" onClick={() => setPageState(2)}>Change Tag Icon</a>
                    </li>
                </ul>
            </div>
        )
    }

    return (
        <React.Fragment>
            <AdminSideNav />
            <div id="admin-content" className="ps-3">
                <div id="manage-tags" className="admin-content" style={{display: pageState === 0 ? '' : 'none'}}><ManageTags /></div>
                <div id="add-tags" className="admin-content" style={{display: pageState === 1 ? '' : 'none'}}><AddTags /></div>
                <div id="change-tag-icon" className="admin-content" style={{display: pageState === 2 ? '' : 'none'}}><ChangeTagIcon /></div>
            </div>
        </React.Fragment>
    );
}

ReactDOM.render(<Page />, document.querySelector("#admin-page"));