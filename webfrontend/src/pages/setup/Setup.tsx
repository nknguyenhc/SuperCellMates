import ChangeProfilePicture from "../../components/setup/change-profile-picture";
import SetupTags from "../../components/setup/setup-tags";

const Setup = () => {
  return (
    <div className="setup-page">
      <div className="left-section">
        <ChangeProfilePicture />
      </div>
      <div className="right-section">
        <SetupTags />
      </div>
    </div>
  );
};
export default Setup;
