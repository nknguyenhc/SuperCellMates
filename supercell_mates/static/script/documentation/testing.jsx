function Testing() {
    const structures = [
        {
            display: "Backend",
            path: "backend/",
            apps: [
                "user_auth",
                "user_profile",
                "user_log"
            ]
        },
        {
            display: "Web Frontend",
            path: "web_frontend/",
            apps: [
                "logged_out",
                "layout",
                "profile",
                "settings"
            ]
        }
    ];
    const [displayIndex, setDisplayIndex] = React.useState(-1);
    const [appDisplay, setAppDisplay] = React.useState(-1);
    const [backendViews, setBackendViews] = React.useState([]);
    const [webFrontendViews, setWebFrontendViews] = React.useState([]);
    const [backendNotes, setBackendNotes] = React.useState('');
    const [webFrontendNotes, setWebFrontendNotes] = React.useState('');
    const views = [backendViews, webFrontendViews];
    const viewSetters = [setBackendViews, setWebFrontendViews];
    const notes = [backendNotes, webFrontendNotes];
    const noteSetters = [setBackendNotes, setWebFrontendNotes];
    const viewNotes = displayIndex >= 0 ? notes[displayIndex] : '';
    const Renderers = [BackendView, WebFrontendView];
    const Renderer = displayIndex >= 0 && displayIndex < structures.length && appDisplay >= 0 && appDisplay < structures[displayIndex].apps.length
        && Renderers[displayIndex];

    React.useEffect(() => {
        structures.forEach((structure, i) => {
            Promise.all(structure.apps.map(app => {
                return fetch('/static/testing/' + structure.path + app + '.json')
                    .then(response => response.json());
            }))
                .then(response => {
                    viewSetters[i](response);
                });
            fetch('/static/testing/' + structure.path + 'notes')
                .then(response => response.text())
                .then(text => noteSetters[i](text));
        })
    }, []);

    function newSection(i) {
        setDisplayIndex(i);
        setAppDisplay(-1);
    }

    function newApp(i) {
        setAppDisplay(i);
    }

    return (
        <div id="testing-window" className="p-4">
            <div id="testing-sections">
                {
                    structures.map((structure, i) => (
                        <button className={"btn " + (i === displayIndex ? "btn-primary" : "btn-outline-primary")} onClick={() => newSection(i)}>{structure.display}</button>
                    ))
                }
            </div>
            <Notes notes={viewNotes} />
            <div id="testing-apps" className="pt-3">
                {
                    displayIndex >= 0 && displayIndex < structures.length && 
                    structures[displayIndex].apps.map((app, i) => (
                        <button className={"btn " + (i === appDisplay ? "btn-success" : "btn-outline-success")} onClick={() => newApp(i)}>{app}</button>
                    ))
                }
            </div>
            <div id="testing-content" className="pt-3 pb-5">
                {
                    displayIndex >= 0 && displayIndex < structures.length && appDisplay >= 0 && appDisplay < structures[displayIndex].apps.length
                    && <Renderer tests={views[displayIndex][appDisplay].tests} />
                }
            </div>
        </div>
    );
}


function BackendView({ tests }) {
    const table = React.useRef(null);

    React.useEffect(() => {
        setTimeout(() => {
            Array.from(table.current.querySelectorAll('textarea'))
                .forEach(textarea => {
                    textarea.style.height = '1px';
                    textarea.style.height = `${textarea.scrollHeight + 2}px`;
                });
        }, 10);
    }, [tests]);

    return (
        <table className="table table-bordered" ref={table}>
            <thead>
                <tr>
                    <th scope="col" style={{width: '32%'}}>Setup</th>
                    <th scope="col" style={{width: '32%'}}>Javascript</th>
                    <th scope="col" style={{width: '32%'}}>Expected Result</th>
                    <th scope="col" style={{width: '4%'}}>Date Passed</th>
                </tr>
            </thead>
            <tbody>
                {
                    tests.map(test => (
                        <tr>
                            <td>{test.setup}</td>
                            <td>
                                {
                                    test.javascript === 'NIL' ? <div>NIL</div> : <textarea value={test.javascript} className='form-control testing-textarea'></textarea>
                                }
                            </td>
                            <td>{test.expected}</td>
                            <td>{test.datePassed}</td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    )
}


function WebFrontendView({ tests }) {
    return (
        <table className="table table-bordered">
            <thead>
                <tr>
                    <th scope="col" style={{ width: '45%' }}>Instruction</th>
                    <th scope="col" style={{ width: '45%' }}>Expected Result</th>
                    <th scope="col" style={{ width: '10%' }}>Date Passed</th>
                </tr>
            </thead>
            <tbody>
                {
                    tests.map(test => (
                        <tr>
                            <td>{test.instruction}</td>
                            <td>{test.expected}</td>
                            <td>{test.datePassed}</td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    )
}


function Notes({ notes }) {
    return (
        notes === '' 
        ? <React.Fragment /> 
        : <div className="alert alert-info mt-3" role="alert">
            <h6>Notes</h6>
            <div>
                {
                    notes.split('\n').map(line => (
                        <p dangerouslySetInnerHTML={{ 
                            __html: line
                                .split('`')
                                .map((substring, i) => i % 2 === 0 ? substring : `<a href=${substring}>here</a>`)
                                .join('') 
                        }} />
                    ))
                }
            </div>
        </div>
    )
}


ReactDOM.render(<Testing />, document.querySelector("#testing"));