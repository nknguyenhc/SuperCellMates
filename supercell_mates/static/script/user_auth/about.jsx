function ReadMeSection({ sectionName }) {
    const [text, setText] = React.useState('');

    React.useEffect(() => {
        fetch('/static/about/' + sectionName)
            .then(response => response.text())
            .then(response => setText(response.split("\n").map(paragraph => (
                <p>{paragraph}</p>
            ))));
    }, []);

    return (
        <React.Fragment>{text}</React.Fragment>
    )
}

const sections = ['motivation', 'user-stories', 'project-scope'];
sections.forEach(section => {
    ReactDOM.render(<ReadMeSection sectionName={section} />, document.querySelector("#about-" + section));
})

function FeatureSection() {
    const [data, setData] = React.useState({ features: [] });
    React.useEffect(() => {
        fetch('/static/about/features.json')
            .then(response => response.json())
            .then(response => setData(response))
    }, [])

    return (
        <table className="table table-bordered">
            <thead>
                <tr>
                    <th scope="col">Feature</th>
                    <th scope="col">Details</th>
                    <th scope="col">Progress</th>
                </tr>
            </thead>
            <tbody>
                {
                    data.features.map(feature => (
                        <React.Fragment>
                            {
                                feature.rows.map((row, i) => (
                                    <tr>
                                        {i === 0 && <th scope="row" rowSpan={feature.rows.length}>{feature.name}</th>}
                                        <td>{row.details}</td>
                                        <td>{row.progress}</td>
                                    </tr>
                                ))
                            }
                        </React.Fragment>
                    ))
                }
            </tbody>
        </table>
    )
}

ReactDOM.render(<FeatureSection />, document.querySelector("#about-features"))