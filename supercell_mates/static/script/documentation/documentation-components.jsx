function Backend({ docBody }) {
    return (
        <div className='documentation-block'>
            <div className="backend-documentation-path-display">
                <div className="backend-documentation-path-label">Path:</div>
                <input className="backend-documentation-path form-control" value={docBody.path} />
            </div>
            <div className="backend-documentation-description">{docBody.description}</div>
            {
                docBody.getParams.length > 0 &&
                <div className="backend-documentation-section">
                    <div className="backend-documentation-section-header">GET parameters</div>
                    <div className="backend-documentation-section-body">
                        {
                            docBody.getParams.map(param => (
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
                docBody.postParams.length > 0 &&
                <div className="backend-documentation-section">
                    <div className="backend-documentation-section-header">POST body parameters</div>
                    <div className="backend-documentation-section-body">
                        {
                            docBody.postParams.map(param => (
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
                    <textarea rows={5} value={JSON.stringify(docBody.return, '', 4)} className="form-control backend-documentation-return-value" />
                </div>
            </div>
        </div>
    )
}

function Database({ docBody }) {
    return (
        <div className="documentation-block">
            <div className="database-documentation-name fw-bold">{docBody.name}</div>
            <div className="database-documentation-fields">
                {
                    docBody.fields.map(field => (
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

function WebFrontend({ docBody }) {
    return (
        <div className="documentation-block">
            <div className="web-frontend-documentation-path-display">
                <div className="web-frontend-documentation-path-label">Path:</div>
                <input className="web-frontend-documentation-path form-control" value={docBody.path} />
            </div>
            <div className="web-frontend-documentation-description">{docBody.description}</div>
            <div className="web-frontend-documentation-apis">
                <h6 className="web-frontend-documentation-apis-label">API Calls</h6>
                {
                    docBody.APIs.length === 0
                    ? <div className="fst-italic">No API call to show</div>
                    : docBody.APIs.map(apiCall => (
                        <div className="web-frontend-documentation-api">
                            <input className="form-control web-frontend-documentation-api-path" value={apiCall.path} />
                            <div className="web-frontend-api-trigger"><u>When?</u> {apiCall.trigger}</div>
                            <div className="web-frontend-api-purpose"><u>For?</u> {apiCall.purpose}</div>   
                        </div>
                    ))
                }
            </div>
            <div className="web-frontend-documentation-redirects">
                <h6 className="web-frontend-documentation-redirects-label">Visible Links</h6>
                {
                    docBody.redirects.length === 0
                    ? <div className="fst-italic">No visible link to show</div>
                    : docBody.redirects.map(redirect => (
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

function MobileFrontend({ docBody }) {
    return (
        <div className="documentation-block">
            <div className="mobile-page-display">
                <h5 className="mobile-page-label">Page: </h5>
                <div className="mobile-page-name">{docBody.route}</div>
            </div>
            <div className="mobile-description">{docBody.description}</div>
            <div className="mobile-apis">
                <h6 className="mobile-apis-label">API Calls</h6>
                {
                    docBody.APIs.length === 0
                    ? <div className="fst-italic">No API call to show</div>
                    : docBody.APIs.map(apiCall => (
                        <div className="mobile-api">
                            <input value={apiCall.path} className="form-control mobile-api-path" />
                            <div className="mobile-api-trigger"><u>When?</u> {apiCall.trigger}</div>
                            <div className="mobile-api-purpose"><u>For?</u> {apiCall.purpose}</div>
                        </div>
                    ))
                }
            </div>
            <div className="mobile-navs">
                <h6 className="mobile-navs-label">Visible Pages</h6>
                {
                    docBody.navigations.length === 0
                    ? <div className="fst-italic">No visible page to show</div>
                    : <ul className="mobile-nav-list">
                        {
                            docBody.navigations.map(navigation => (
                                <li className="mobile-nav-item">{navigation}</li>
                            ))
                        }
                    </ul>
                }
            </div>
        </div>
    )
}