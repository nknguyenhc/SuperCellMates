import { useState } from 'react'
import { Link } from 'react-router-dom';
import ChangeNameForm from '../popup/ChangeNameForm';
import PopChangeAuthMessage from '../popup/PopChangeAuthMessage';
import { Button } from 'react-bootstrap';
const Profile = () => {
  const [isClickChangeName, setIsClickChangeName] = useState<boolean>(false);
  const [messageModal, setMessageModal] = useState<string> ('');
  const [isMessageModal, setIsMessageModal] = useState<boolean>(false);
  return (
    <div className='profile-settings'>
      <div className="profile-menu">
        <h1>Profile settings</h1>
        <Button 
          className="profile-button"
        ><Link style={{textDecoration: 'none', color:'white'}} to='/profile/setup' className='edit-profile-link'>Edit Profile</Link></Button>
        <Button 
          className="change-name"
          onClick={() => setIsClickChangeName(prev => !prev)}
        >Change Name</Button>
      </div>
      {isClickChangeName ? <ChangeNameForm setIsClickChangeName={setIsClickChangeName} setMessageModal={setMessageModal} setIsMessageModal={setIsMessageModal}/> : ""}
      {isMessageModal ? <PopChangeAuthMessage message={messageModal} setIsMessageModal={setIsMessageModal} />: ""}

      
    </div>
  )
}

export default Profile
