function Documentation() {
    const siteApps = [
        "user_auth",
        "user_profile",
        "user_log",
        "posts"
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
        },
        {
            name: "Web Frontend",
            path: "web_frontend",
            apps: [
                "logged_out",
                "home",
                "layout",
            ]
        }
    ];
    const [structureSelected, setStructureSelected] = React.useState(-1);
    const [tabSelected, setTabSelected] = React.useState(-1);
    const [backendDocViews, setBackendDocViews] = React.useState([]);
    const [databaseDocViews, setDatabaseDocViews] = React.useState([]);
    const [webFrontendDocViews, setWebFrontendDocViews] = React.useState([]);
    const [details, setDetails] = React.useState('');
    const chapters = [backendDocViews, databaseDocViews, webFrontendDocViews];
    const chapterSetters = [setBackendDocViews, setDatabaseDocViews, setWebFrontendDocViews];
    const chapterRenderers = [backend, database, webFrontend];
    const defaultDetails = <div className="text-body-tertiary p-3">Select a chapter to start viewing documentation ...</div>;

    React.useEffect(() => {
        setDetails(defaultDetails);
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
                <div className="backend-documentation-path-display">
                    <div className="backend-documentation-path-label">Path:</div>
                    <input className="backend-documentation-path form-control" value={backendDocBody.path} />
                </div>
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

    function webFrontend(webFrontendDocBody) {
        return (
            <div className="documentation-block">
                <div className="web-frontend-documentation-path-display">
                    <div className="web-frontend-documentation-path-label">Path:</div>
                    <input className="web-frontend-documentation-path form-control" value={webFrontendDocBody.path} />
                </div>
                <div className="web-frontend-documentation-description">{webFrontendDocBody.description}</div>
                <div className="web-frontend-documentation-apis">
                    <h6 className="web-frontend-documentation-apis-label">API Calls</h6>
                    {
                        webFrontendDocBody.APIs.length === 0
                        ? <div className="fst-italic">No API call to show</div>
                        : webFrontendDocBody.APIs.map(apiCall => (
                            <div className="web-frontend-documentation-api">
                                <input className="form-control web-frontend-documentation-api-path" value={apiCall.path} />
                                <div className="web-frontend-api-trigger"><u>When?</u> {apiCall.trigger}</div>
                                <div className="web-frontend-api purpose"><u>For?</u> {apiCall.purpose}</div>   
                            </div>
                        ))
                    }
                </div>
                <div className="web-frontend-documentation-redirects">
                    <h6 className="web-frontend-documentation-redirects-label">Visible Links</h6>
                    {
                        webFrontendDocBody.redirects.length === 0
                        ? <div className="fst-italic">No visible link to show</div>
                        : webFrontendDocBody.redirects.map(redirect => (
                            <div className="web-frontend-documentation-redirect">
                                <input className="form-control web-frontend-documentation-redirect-path" value={redirect.path} />
                                <div className="web-frontend-documentation-redirect-description">{redirect.description}</div>
                                <div className="web-frontend-documentation-redirect-where"><u>Where is this link found?</u> {redirect.where}</div>
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
        setDetails(defaultDetails);
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