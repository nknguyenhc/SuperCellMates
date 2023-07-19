function DocumentationSequence() {
    const diagrams = [
        "register",
        "login",
        "change details",
        "tag setup",
        "profile pic setup",
        "request tag",
        "chat"
    ];
    const [index, setIndex] = React.useState(-1);

    return (
        <div id="sequence-window" className="documentation-section">
            <h5>Sequence diagrams</h5>
            <div id="sequence-nav">
                {diagrams.map((name, i) => (
                    <div className={"sequence-nav-btn btn " + (i === index ? "btn-primary" : "btn-outline-primary")} onClick={() => setIndex(i)}>{name}</div>
                ))}
            </div>
            <div id="sequence-display">
                {index !== -1 && <img src={"/static/documentation/sequence/" + diagrams[index].replaceAll(' ', '-') + ".png"} />}
            </div>
        </div>
    );
}


ReactDOM.render(<DocumentationSequence />, document.querySelector("#documentation-sequence"));