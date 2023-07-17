function DeveloperBoard() {
    const [sections, setSections] = React.useState([]);

    React.useEffect(() => {
        fetch('/static/developer-board/index.json')
            .then(response => response.json())
            .then(response => {
                setSections(response.sections.map(section => ({
                    ...section,
                    answer: section.answer.split('`')
                        .map((str, i) => (
                            i % 3 === 0
                            ? str
                            : i % 3 === 1
                            ? `<a href=${'"' + str + '"'}>`
                            : `${str}</a>`
                        ))
                        .reduce((prev, curr) => prev + curr, '')
                })));
            })
    }, []);

    return (
        <React.Fragment>
            <h3 className="mb-4">Developer Board</h3>
            <div className="mb-4">
                <p>Dear users,</p>
                <p>Thank you for your feedback in the first release. We have consolidated your feedback and implemented some of your suggestions.</p>
                <p>However, some of features suggested will not be implemented. You may find explanation below.</p>
            </div>
            <div id="developer-board-sections">
                {
                    sections.map((section, i) => (
                        <div class="accordion" id={"accordionSection" + i.toString()}>
                            <div class="accordion-item">
                                <h2 class="accordion-header">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={"#collapse" + i.toString()} aria-expanded="false" aria-controls={"collapse" + i.toString()}>{section.question}</button>
                                </h2>
                                <div id={"collapse" + i.toString()} class="accordion-collapse collapse" data-bs-parent={"#accordionSection" + i.toString()}>
                                    <div class="accordion-body" dangerouslySetInnerHTML={{__html: section.answer}}></div>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
        </React.Fragment>
    );
}


ReactDOM.render(<DeveloperBoard />, document.querySelector("#developer-board"));