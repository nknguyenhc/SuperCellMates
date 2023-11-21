import { useCallback, useEffect, useState } from 'react'
import { triggerErrorMessage } from '../../utils/locals';
import { postRequestContent } from '../../utils/request';

interface tagProperties {
  id: number,
  name: string,
  icon: string,
  description: string
}

const ManageTags = () => {
  const [requests, setRequests] = useState<Array<tagProperties>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  useEffect(() => {
    fetch('/obtain_tag_requests')
        .then(response => response.json())
        .then(response => setRequests(response.tag_requests))
        .catch(() => triggerErrorMessage());
  }, []);

  const submitTag = useCallback((tag_request_id: number) => {
    if (!isLoading) {
        setIsLoading(true);
        fetch('/add_tag_admin', postRequestContent({
            tag_request_id: tag_request_id
        }))
            .then(response => {
                setIsLoading(false);
                if (response.status !== 200) {
                    triggerErrorMessage();
                }
            });
        setRequests(requests.filter(request => request.id !== tag_request_id));
    }
  }, [isLoading, requests]);
  
  const removeRequest = useCallback((tag_request_id: number) => {
    if (!isLoading) {
        setIsLoading(true);
        fetch('/remove_tag_request', postRequestContent({
            tag_request_id: tag_request_id
        }))
            .then(response => {
                setIsLoading(false);
                if (response.status !== 200) {
                    triggerErrorMessage();
                }
            });
        setRequests(requests.filter(request => request.id !== tag_request_id));
    }
  }, [isLoading, requests]);

  return (
    <div className='manage-tag-container'>
        <table className="table table-striped table-hover table-bordered border-primary">
                <thead>
                    <tr>
                        <th scope="col" style={{width: "5%"}}>ID</th>
                        <th scope="col" style={{width: "5%"}}>Icon</th>
                        <th scope="col" style={{width: "20%"}}>Tag</th>
                        <th scope="col" style={{width: "30%"}}>Description</th>
                        <th scope="col" style={{width: "20%"}}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map(request => (
                        <tr>
                            <th scope="row">{request.id}</th>
                            <td>
                                <img src={request.icon} height="30" width="30" alt='tag-request-icon' />
                            </td>
                            <td>{request.name}</td>
                            <td>{request.description}</td>
                            <td>
                                <button type="button" className="btn btn-success" onClick={() => {
                                    submitTag(request.id);
                                }}>Approve</button>
                                <button type="button" className="btn btn-danger" onClick={() => {
                                    removeRequest(request.id);
                                }}>Reject</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
      
    </div>
  )
}

export default ManageTags
