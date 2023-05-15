function AddTagsAdmin() {
    const [requests, setRequests] = React.useState([]);
    const [fetched, setFetched] = React.useState(false);

    if (!fetched) {
        setFetched(true);
        fetch('/obtain_tag_requests')
            .then(response => response.json())
            .then(response => setRequests(response.tag_requests));
    }

    function submitTag(tag_request_id, tag) {
        fetch('/add_tag_admin', postRequestContent({
            tag_request_id: tag_request_id,
            tag: tag
        }));
        setRequests(requests.filter(request => request.id != tag_request_id));
    }

    function removeRequest(tag_request_id) {
        fetch('/remove_tag_request', postRequestContent({
            tag_request_id: tag_request_id
        }));
        setRequests(requests.filter(request => request.id != tag_request_id));
    }

    return (
        <React.Fragment>
            <table className="table table-striped table-hover table-bordered border-primary">
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Tag</th>
                        <th scope="col">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map(request => (
                        <tr>
                            <th scope="row">{request.id}</th>
                            <td>{request.name}</td>
                            <td>
                                <button type="button" class="btn btn-success" onClick={() => {
                                    submitTag(request.id, request.name);
                                }}>Approve</button>
                                <button type="button" class="btn btn-danger" onClick={() => {
                                    removeRequest(request.id);
                                }}>Reject</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </React.Fragment>
    );
}

ReactDOM.render(<AddTagsAdmin />, document.querySelector("#add_tags_admin"));