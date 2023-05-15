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
        fetch('/profile/set_tags', postRequestContent({
            count: toBeSent.length,
            tags: toBeSent
        })).then(response => response.json()).then(response => pop_setup_page(1));
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
        <form onSubmit={submitTags}>
            {tags.map(tag => (
                <React.Fragment>
                    <input type="checkbox" class="btn-check" id={"tag" + tag.tag_id} checked={tag.in} autocomplete="off"></input>
                    <label class="btn btn-outline-primary" for={"tag" + tag.tag_id} onClick={() => toggleTag(tag.tag_id)}>{tag.tag_name}</label>
                </React.Fragment>
            ))}
            <div>
                <input class="btn btn-success" type="submit" value="Add Tags"></input>
            </div>
        </form>
    );
}

ReactDOM.render(<SetupTags />, document.querySelector("#setup_tags"));