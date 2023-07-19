function DocumentationInteractive() {
    const [structureSelected, setStructureSelected] = React.useState(-1);
    const [tabSelected, setTabSelected] = React.useState(-1);
    const [backendDocViews, setBackendDocViews] = React.useState([]);
    const [databaseDocViews, setDatabaseDocViews] = React.useState([]);
    const [webFrontendDocViews, setWebFrontendDocViews] = React.useState([]);
    const [mobileFrontendDocViews, setMobileFrontendDocViews] = React.useState([]);
    const [details, setDetails] = React.useState('');
    const chapters = [backendDocViews, databaseDocViews, webFrontendDocViews, mobileFrontendDocViews];
    const chapterSetters = [setBackendDocViews, setDatabaseDocViews, setWebFrontendDocViews, setMobileFrontendDocViews];
    const chapterRenderers = [Backend, Database, WebFrontend, MobileFrontend];
    const defaultDetails = <div className="text-body-tertiary p-3">Select a chapter to start viewing documentation ...</div>;

    const siteApps = [
        "user_auth",
        "user_profile",
        "user_log",
        "posts",
        "messages",
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
                "profile",
                "settings",
                "admin",
            ]
        },
        {
            name: "Mobile Frontend",
            path: "mobile_frontend",
            apps: [
                "authentication",
                "home",
                "profile",
            ]
        }
    ];

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

    function generateDetails(Renderer, section) {
        return (
            <div className="documentation-details-page p-3">
                {
                    section.views.map(input => <Renderer docBody={input} />)
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
        <div id="documentation-window" className="documentation-section">
            <h5 className="documentation-section-header">API endpoints, database and frontend details</h5>
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

ReactDOM.render(<DocumentationInteractive />, document.querySelector("#documentation"));