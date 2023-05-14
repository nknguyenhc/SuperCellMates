function Setup() {
    const [tag1, setTag1] = React.useState("");
    const [tag2, setTag2] = React.useState("");

    function submitTags(event) {
        event.preventDefault();
        let tags = {
            0: tag1,
            1: tag2
        };
        fetch("/profile/add_tags", postRequestContent({
            count: 2,
            tags: tags
        }))
            .then(response => response.json())
            .then(response => console.log(response));
    }

    return (
        <form onSubmit={submitTags}>
            <input type="text" onChange={event => {
                setTag1(event.target.value);
            }}></input>
            <input type="text" onChange={event => {
                setTag2(event.target.value);
            }}></input>
            <input type="submit" value="Add Tags"></input>
        </form>
    );
}

ReactDOM.render(<Setup />, document.querySelector("#setup"));