function SetupTags() {
    const [tags, setTags] = React.useState([]);
    const [searchParam, setSearchParam] = React.useState('')
    const [searchResults, setSearchResults] = React.useState([]);
    const [toBeSubmitted, setToBeSubmitted] = React.useState([]);
    const [tagCountLimit, setTagCountLimit] = React.useState(0);
    const addTagMessageButton = React.useRef(null);
    const searchTagForm = React.useRef(null);
    const [showTagResult, setShowTagResult] = React.useState(false);
    const [showAlert, setShowAlert] = React.useState(false);
    const [searchDone, setSearchDone] = React.useState(false);
    const isLoading = React.useRef(false);
    const setIsLoading = (newValue) => isLoading.current = newValue;
    const [canRemoveTag, setCanRemoveTag] = React.useState(false);
    const [showRemoveAlert, setShowRemoveAlert] = React.useState(false);
    const [tagToBeRemoved, setTagToBeRemoved] = React.useState('');

    React.useEffect(() => {
        fetch('/profile/obtain_tags')
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                } else {
                    response.json()
                        .then(response => {
                            setTags(response.tags);
                            setTagCountLimit(response.tag_count_limit);
                        });
                }
            });
        
        fetch('/profile/can_remove_tag')
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                    return;
                }
                response.text().then(text => {
                    setCanRemoveTag(text === 'true');
                })
            })
    }, []);

    React.useEffect(() => {
        document.addEventListener('click', event => {
            if (searchTagForm.current.contains(event.target)) {
                setShowTagResult(true);
            } else {
                setShowTagResult(false);
            }
        })
    }, []);

    function submitTags(event) {
        event.preventDefault();
        if (!isLoading.current) {
            setIsLoading(true);
            fetch('/profile/add_tags', postRequestContent({
                count: toBeSubmitted.length,
                tags: toBeSubmitted.map(tag => tag.name)
            }))
                .then(response => {
                    setIsLoading(false);
                    if (response.status !== 200) {
                        triggerErrorMessage();
                    } else {
                        popSetupMessage("Tags updated successfully!");
                        setTags([...tags].concat(toBeSubmitted));
                        setToBeSubmitted([]);
                        setShowAlert(false);
                    }
                });
        }
    }

    function searchTag(event) {
        event.preventDefault();
        fetch("/profile/search_tags?tag=" + searchParam)
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                } else {
                    response.json().then(response => {
                        setSearchResults(response.tags.filter(tag => toBeSubmitted.find(addedTag => addedTag.name === tag.name) === undefined));
                        setSearchDone(true);
                    })
                }
            })
    }

    function addNewTag(index) {
        if (tags.length + toBeSubmitted.length < tagCountLimit) {
            setSearchResults(searchResults.filter((_, i) => i !== index));
            setToBeSubmitted([...toBeSubmitted, searchResults[index]]);
        } else {
            addTagMessageButton.current.click();
        }
    }

    function removeNewTag(index) {
        setToBeSubmitted(toBeSubmitted.filter((_, i) => i !== index));
    }

    function removeTag() {
        fetch('/profile/remove_tag', postRequestContent({
            tag: tagToBeRemoved.name
        })).then(response => {
            if (response.status !== 200) {
                triggerErrorMessage();
                return;
            }
            popSetupMessage('Tag removed');
            setTags(tags.filter(tag => tag !== tagToBeRemoved));
            setShowRemoveAlert(false);
            setCanRemoveTag(false);
        })
    }

    return (
        <React.Fragment>
            <div id="add-tag-page">
                <div className="add-tag-section p-3">
                    <div className="add-tag-section-title py-3">Your Current Tags</div>
                    <div className="add-tag-section-body ps-2">
                        {tags.map(tag => (
                            <div className="old-tag-div">
                                <div className="tag-button btn btn-outline-info">
                                    <img src={tag.icon} />
                                    <div>{tag.name}</div>
                                </div>
                                {canRemoveTag && <button type="button" className="btn-close" aria-label="Close" onClick={() => {
                                    setTagToBeRemoved(tag);
                                    setShowRemoveAlert(true);
                                    setShowAlert(false);
                                }} />}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="add-tag-section p-3">
                    <div className="add-tag-section-title py-3">New Tags</div>
                    <div className="add-tag-section-body">
                        {toBeSubmitted.map((tag, index) => (
                            <div className="new-tag-div">
                                <div className="tag-button btn btn-outline-info">
                                    <img src={tag.icon} />
                                    <div>{tag.name}</div>
                                </div>
                                <button type="button" class="btn-close" aria-label="Close" onClick={() => removeNewTag(index)} />
                            </div>
                        ))}
                    </div>
                    <div className="add-tag-section-body pt-3">
                        <form id="search-tag-form" onSubmit={searchTag} ref={searchTagForm}>
                            <input type="text" class="form-control" placeholder="Search Tag ..." onChange={event => setSearchParam(event.target.value)} />
                            <input type="submit" class="btn btn-outline-primary" value="Search"></input>
                        </form>
                        <div id="search-tag-result">
                            <div id="search-tag-result-window" className='p-2' style={{display: showTagResult ? '' : 'none'}}>
                                {
                                    searchResults.length === 0 
                                    ? <div class='text-body-tertiary'>{searchDone ? 'No result matches your query' : 'Type something and hit enter'}</div>
                                    : searchResults.map((tag, index) => (
                                        <div className="tag-button btn btn-outline-info" onClick={() => addNewTag(index)}>
                                            <img src={tag.icon} />
                                            <div>{tag.name}</div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="ps-4 pt-3">
                <button class="btn btn-success" value="Add Tags" onClick={() => {
                    setShowAlert(true);
                    setShowRemoveAlert(false);
                }}>Update Tags</button>
            </div>
            {showAlert && <div className="ms-4 action-alert alert alert-info mt-3" role="alert">
                <div>Your account can only have 4 tags, and you will not be able to change tags for 1 week if you delete one of your tags. Are you sure to proceed?</div>
                <div className="setup-tags-confirmation-buttons mt-3">
                    <button className="btn btn-primary" onClick={submitTags}>Yes</button>
                    <button className="btn btn-secondary" onClick={() => setShowAlert(false)}>No</button>
                </div>
            </div>}
            {showRemoveAlert && <div className="ms-4 action-alert alert alert-danger mt-3" role="alert">
                <div>You are attempting to delete tag: {tagToBeRemoved.name}. You will not be able to delete another tag within the next one week upon deleting a tag. Are you sure to proceed?</div>
                <div className="setup-tags-confirmation-buttons mt-3">
                    <button className="btn btn-primary" onClick={removeTag}>Yes</button>
                    <button className="btn btn-secondary" onClick={() => setShowRemoveAlert(false)}>No</button>
                </div>
            </div>}
            <button ref={addTagMessageButton} style={{display: 'none'}} id="add-tag-message-button" type="button" data-bs-toggle="modal" data-bs-target="#add-tag-message"></button>
            <div className="modal fade" id="add-tag-message" tabindex="-1" aria-labelledby="add-tag-label" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="add-tag-label">Message</h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">You have reached your maximum tag count limit.</div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

ReactDOM.render(<SetupTags />, document.querySelector("#setup_tags"));