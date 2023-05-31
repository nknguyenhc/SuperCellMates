function SetupTags() {
    const [tags, setTags] = React.useState([]);
    const [fetched, setFetched] = React.useState(false);

    if (!fetched) {
        setFetched(true);
        fetch('/profile/obtain_tags').then(response => response.json())
            .then(response => {
                setTags(response.tags);
            });
    }

    function submitTags(event) {
        event.preventDefault();
        const toBeSent = tags.filter(tag => tag.in).map(tag => tag.tag_id)
        fetch('/profile/add_tags', postRequestContent({
            count: toBeSent.length,
            tags: toBeSent
        }))
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                } else {
                    pop_setup_page(1);
                }
            });
    }

    function toggleTag(tag_id) {
        setTags(tags.map(tag => 
            tag.tag_id === tag_id
            ? {
                ...tag,
                in: !tag.in
            }
            : tag
        ));
    }

    return (
        <React.Fragment>
            <div className="ps-5 py-3">Add Tags</div>
            <form onSubmit={submitTags}>
                <div id="setup-tags-selection" className="ps-2">
                    {tags.map(tag => (
                        <div className="p-2">
                            <input type="checkbox" class="btn-check" id={"tag" + tag.tag_id} checked={tag.in} autocomplete="off"></input>
                            <label class="btn btn-outline-info" for={"tag" + tag.tag_id} onClick={() => toggleTag(tag.tag_id)}>{tag.tag_name}</label>
                        </div>
                    ))}
                </div>
                <div className="ps-4 pt-3">
                    <input class="btn btn-success" type="submit" value="Add Tags"></input>
                </div>
            </form>
        </React.Fragment>
    );
}

ReactDOM.render(<SetupTags />, document.querySelector("#setup_tags"));