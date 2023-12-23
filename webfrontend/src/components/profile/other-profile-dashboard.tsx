import { useParams } from "react-router";
import ProfileFeed from "./profile-feed";

const OtherProfileDashBoard = () => {
  const username = useParams().username;
  return (
    <div className="other-profile-dashboard-section">
      <ProfileFeed username={username} />
    </div>
  );
};

export default OtherProfileDashBoard;
