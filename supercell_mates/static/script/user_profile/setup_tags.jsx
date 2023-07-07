function SetupTags() {
    const [tags, setTags] = React.useState([]);
    const [searchParam, setSearchParam] = React.useState('')
    const [searchResults, setSearchResults] = React.useState([]);
    const [toBeSubmitted, setToBeSubmitted] = React.useState([]);
    const [tagCountLimit, setTagCountLimit] = React.useState(0);
    const addTagMessageButton = React.useRef(null);

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
    }, []);

    function submitTags(event) {
        event.preventDefault();
        fetch('/profile/add_tags', postRequestContent({
            count: toBeSubmitted.length,
            tags: toBeSubmitted.map(tag => tag.name)
        }))
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                } else {
                    popSetupMessage("Tags updated successfully!");
                    setTags([...tags].concat(toBeSubmitted));
                    setToBeSubmitted([]);
                }
            });
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

    return (
        <React.Fragment>
            <div id="add-tag-page">
                <div className="add-tag-section p-3">
                    <div className="add-tag-section-title py-5">Your Current Tags</div>
                    <div className="add-tag-section-body ps-2">
                        {tags.map(tag => (
                            <div className="tag-button btn btn-outline-info">
                                <img src={tag.icon} />
                                <div>{tag.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="add-tag-section p-3">
                    <div className="add-tag-section-title py-5">New Tags</div>
                    <div className="add-tag-section-body">
                        {toBeSubmitted.map((tag, index) => (
                            <div className="new-tag-div">
                                <div className="tag-button btn btn-outline-info">
                                    <img src={tag.icon} />
                                    <div>{tag.name}</div>
                                </div>
                                <button type="button" class="btn-close" aria-label="Close" onClick={() => removeNewTag(index)}></button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="add-tag-section p-3">
                    <div className="add-tag-section-title py-5">Search Tags</div>
                    <div className="add-tag-section-body">
                        <form id="search-tag-form" onSubmit={searchTag}>
                            <input type="text" class="form-control" placeholder="Search Tag ..." onChange={event => setSearchParam(event.target.value)} />
                            <input type="submit" class="btn btn-outline-primary" value="Search"></input>
                        </form>
                        <div id="search-tag-result">
                            {
                            searchResults.length === 0 
                                ? <div class='text-body-tertiary'>No result/No search is done</div> 
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
            <div className="ps-4 pt-3">
                <button class="btn btn-success" type="submit" value="Add Tags" onClick={submitTags}>Update Tags</button>
            </div>
            <button ref={addTagMessageButton} style={{display: 'none'}} id="add-tag-message-button" type="button" data-bs-toggle="modal" data-bs-target="#add-tag-message"></button>
            <div className="modal fade" id="add-tag-message" tabindex="-1" aria-labelledby="add-tag-label" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="add-tag-label">Message</h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">You have reached your maximum tag count limit.
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

ReactDOM.render(<SetupTags />, document.querySelector("#setup_tags"));