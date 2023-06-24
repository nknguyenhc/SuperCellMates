function DocumentationStatic() {
    const [backendDocViews, setBackendDocViews] = React.useState([]);
    const [databaseDocViews, setDatabaseDocViews] = React.useState([]);
    const [webFrontendDocViews, setWebFrontendDocViews] = React.useState([]);
    const [mobileFrontendDocViews, setMobileFrontendDocViews] = React.useState([]);
    const chapters = [backendDocViews, databaseDocViews, webFrontendDocViews, mobileFrontendDocViews];
    const chapterSetters = [setBackendDocViews, setDatabaseDocViews, setWebFrontendDocViews, setMobileFrontendDocViews];
    const chapterRenderers = [Backend, Database, WebFrontend, MobileFrontend];

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

    return (
        <React.Fragment>
            {
                chapters.map((chapter, i) => {
                    const Renderer = chapterRenderers[i];
                    return (
                        <div className="documentation-chapter">
                            <h3>{structures[i].name}</h3>
                            {
                                chapter.map(subchapter => (
                                    <div className="documentation-subchapter">
                                        <h4>{subchapter.name}</h4>
                                        {
                                            subchapter.views.map(block => <Renderer docBody={block} />)
                                        }
                                    </div>
                                ))
                            }
                        </div>
                    );
                })
            }
        </React.Fragment>
    )
}