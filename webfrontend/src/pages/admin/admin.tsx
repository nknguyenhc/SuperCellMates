import { Button } from "react-bootstrap"

const Admin = () => {

  return (
    <div className='admin-page'>
      <div className="sidebar-menu">
        <Button variant="warning">
          Manage Tag Requests
        </Button>
        <Button variant ="warning">
          Add Tags
        </Button>
        <Button variant ='warning'>
          Change Tag Icon
        </Button>
      </div>
      <div className="admin-manage-container">

      </div>
    </div>
  )
}

export default Admin
