import ChangeProfilePicture from "../../components/setup/ChangeProfilePicture"
import SetupTags from "../../components/setup/SetupTags"
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
  )
}
export default Setup
