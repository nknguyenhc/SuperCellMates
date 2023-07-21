function WebSocketDocumentation() {
    const [selectedSection, setSelectedSection] = React.useState('');
    const [body, setBody] = React.useState(null);
    const [text, setText] = React.useState('');

    React.useEffect(() => {
        fetch('/static/documentation/backend/websocket.json')
            .then(response => response.json())
            .then(response => setBody(response));
        fetch('/static/documentation/backend/websocket')
            .then(response => response.text())
            .then(response => setText(response));
    }, []);

    return (
        <div id="websocket-window" className="documentation-section">
            <h5 className="documentation-section-header">Web socket endpoints</h5>
            <div className="alert alert-info" role="alert">
                {
                    text.split('\n').map(line => <p>{line}</p>)
                }
            </div>
            <div id="websocket-nav">
                <div className={"btn " + (selectedSection === 'consumers' ? "btn-primary" : "btn-outline-primary")} onClick={() => setSelectedSection('consumers')}>Consumers</div>
                <div className={"btn " + (selectedSection === 'receive' ? "btn-primary" : "btn-outline-primary")} onClick={() => setSelectedSection('receive')}>JSON inputs</div>
                <div className={"btn " + (selectedSection === 'responses' ? "btn-primary" : "btn-outline-primary")} onClick={() => setSelectedSection('responses')}>JSON responses</div>
            </div>
            <div id="websocket-details" className="border">
                {selectedSection !== '' ? <TableDocumentation contents={body[selectedSection]} rowNames={
                    selectedSection === 'consumers'
                    ? ['path', 'description', 'permission']
                    : selectedSection === 'receive'
                    ? ['input', 'response']
                    : ['name', 'json']
                } /> : <div className="text-tertiary fst-italic">Select a section to start viewing documentation</div>}
            </div>
        </div>
    )
}


function TableDocumentation({ contents, rowNames }) {
    return (
        <table className="table table-bordered">
            <thead>
                <tr>
                    {
                        rowNames.map(rowName => (
                            <th scope="col">{rowName === 'json' ? 'JSON' : rowName[0].toUpperCase() + rowName.slice(1)}</th>
                        ))
                    }
                </tr>
            </thead>
            <tbody>
                {contents.map(row => (
                    <tr>
                        {
                            rowNames.map(rowName => (
                                <td className="websocket-table-element">{typeof(row[rowName]) === 'object' ? JSON.stringify(row[rowName], '', 4) : row[rowName]}</td>
                            ))
                        }
                    </tr>
                ))}
            </tbody>
        </table>
    )
}


ReactDOM.render(<WebSocketDocumentation />, document.querySelector("#websocket"));