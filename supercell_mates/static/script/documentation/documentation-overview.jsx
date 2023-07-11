function DocumentationOverview() {
    const [texts, setTexts] = React.useState([]);

    React.useEffect(() => {
        fetch('/static/documentation/overview').then(response => response.text()).then(response => {
            setTexts(response.split('\n'));
        })
    }, []);

    return (
        <React.Fragment>
            {
                texts.map(text => (
                    <p>{text}</p>
                ))
            }
        </React.Fragment>
    )
}

ReactDOM.render(<DocumentationOverview />, document.querySelector("#documentation-overview-text"));