import { Button } from "react-bootstrap";
import ManageTags from "../../components/admin/manage-tags";
import { useState } from "react";
import AddTags from "../../components/admin/add-tags";
import ChangeTagIcon from "../../components/admin/change-tag-icon";

const Admin = () => {
  const [pageState, setPageState] = useState(1);
  return (
    <div className="admin-page">
      <div className="sidebar-menu">
        <Button variant="warning" onClick={() => setPageState(1)}>
          Manage Tag Requests
        </Button>
        <Button variant="warning" onClick={() => setPageState(2)}>
          Add Tags
        </Button>
        <Button variant="warning" onClick={() => setPageState(3)}>
          Change Tag Icon
        </Button>
      </div>

      <div className="admin-manage-container">
        {pageState === 1 && <ManageTags />}
        {pageState === 2 && <AddTags />}
        {pageState === 3 && <ChangeTagIcon />}
      </div>
    </div>
  );
};

export default Admin;
