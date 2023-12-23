import OtherProfileWallpaper from "../../components/profile/other-profile-wallpaper";
import OtherProfileDashBoard from "../../components/profile/other-profile-dashboard";
import { Link } from "react-router-dom";
import { AiOutlineQuestionCircle } from "react-icons/ai";

const OtherProfile = () => {
  return (
    <div className="other-profile-page">
      <OtherProfileWallpaper />
      <OtherProfileDashBoard />
      <Link to="/about" className="about-link">
        <AiOutlineQuestionCircle /> About{" "}
      </Link>
    </div>
  );
}

export default OtherProfile
