function Documentation() {
    const siteApps = [
        "user_auth",
        "user_profile",
        "user_log",
    ]
    const structures = [
        {
            name: "Backend",
            path: "backend",
            apps: siteApps
        },
        {
            name: "Databases",
            path: "databases",
            apps: siteApps
        }
    ];
    const [structureSelected, setStructureSelected] = React.useState(-1);
    const [tabSelected, setTabSelected] = React.useState(-1);
    const [backendDocViews, setBackendDocViews] = React.useState([]);
    const [databaseDocViews, setDatabaseDocViews] = React.useState([]);
    const [details, setDetails] = React.useState('');
    const chapters = [backendDocViews, databaseDocViews];
    const chapterSetters = [setBackendDocViews, setDatabaseDocViews];
    const chapterRenderers = [backend, database];

    React.useEffect(() => {
        structures.forEach((structure, i) => {
            Promise.all(structure.apps.map(app => {
                return fetch('/static/documentation/' + structure.path + '/' + app + '.json')
                    .then(response => response.json());
            }))
                .then(response => {
                    chapterSetters[i](response);
                });
        });
    }, []);

    function backend(backendDocBody) {
        return (
            <div className='documentation-block'>
                <input className="backend-documentation-path form-control" value={backendDocBody.path} />
                <div className="backend-documentation-description">{backendDocBody.description}</div>
                 {
                    backendDocBody.getParams.length > 0 &&
                    <div className="backend-documentation-section">
                        <div className="backend-documentation-section-header">GET parameters</div>
                        <div className="backend-documentation-section-body">
                            {
                                backendDocBody.getParams.map(param => (
                                    <div className="backend-documentation-line">
                                        <div className="backend-documentation-line-name border ps-2">{param.name}</div>
                                        <div className="backend-documentation-line-description border ps-2">{param.description}</div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                }
                {
                    backendDocBody.postParams.length > 0 &&
                    <div className="backend-documentation-section">
                        <div className="backend-documentation-section-header">POST body parameters</div>
                        <div className="backend-documentation-section-body">
                            {
                                backendDocBody.postParams.length === 0
                                ? <div className="fst-italic">No POST parameter to display</div>
                                : backendDocBody.postParams.map(param => (
                                    <div className="backend-documentation-line">
                                        <div className="backend-documentation-line-name border ps-2">{param.name}</div>
                                        <div className="backend-documentation-line-description border ps-2">{param.description}</div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                }
                <div className="backend-documentation-section">
                    <div className="backend-documentation-section-header">Return</div>
                    <div className="backend-documentation-section-body">
                        <textarea rows={5} value={JSON.stringify(backendDocBody.return, '', 4)} className="form-control backend-documentation-return-value" />
                    </div>
                </div>
            </div>
        )
    }

    function database(databaseDocBody) {
        return (
            <div className="documentation-block">
                <div className="database-documentation-name fw-bold">{databaseDocBody.name}</div>
                <div className="database-documentation-fields">
                    {
                        databaseDocBody.fields.map(field => (
                            <div className="database-documentation-field">
                                <div className="database-documentation-field-name border ps-2">{field.name}</div>
                                <div className="database-documentation-field-type border ps-2">{field.type}</div>
                                <div className="database-documentation-field-description border ps-2">{field.description}</div>
                            </div>
                        ))
                    }
                </div>
            </div>
        )
    }

    function generateDetails(renderer, section) {
        return (
            <div className="documentation-details-page p-3">
                {
                    section.views.map(input => renderer(input))
                }
            </div>
        )
    }

    function showStructure(i) {
        setStructureSelected(i);
        setTabSelected(-1);
        setDetails('');
    }

    function showDocs(i, j) {
        setTabSelected(j);
        setDetails(generateDetails(chapterRenderers[i], chapters[i][j]));
    }

    return (
        <div id="documentation-window">
            <div id="documentation-nav">
                {
                    structures.map((structure, i) => (
                        <div className={"documentation-nav-button btn " + (structureSelected === i ? "btn-primary" : "btn-outline-primary")} onClick={() => showStructure(i)}>{structure.name}</div>
                    ))
                }
            </div>
            <div id="documentation-body">
                <div id="documentation-side-nav">
                    {
                        structures.map((structure, i) => (
                            <div className="documentation-side-nav-page" style={{display: structureSelected === i ? '' : 'none'}}>
                                {
                                    structure.apps.map((app, j) => (
                                        <button className={"btn " + (tabSelected === j ? "btn-success" : "btn-outline-success")} onClick={() => showDocs(i, j)}>{app}</button>
                                    ))
                                }
                            </div>
                        ))
                    }
                </div>
                <div id="documentation-details" className="border">{details}</div>
            </div>
        </div>
    )
}

ReactDOM.render(<Documentation />, document.querySelector("#documentation"));