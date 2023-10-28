import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import ChangeNameForm from '../popup/ChangeNameForm';
const Profile = () => {
  const [isClickEditProfile, setIsClickEditProfile] = useState<boolean>(false);
  const [isClickChangeName, setIsClickChangeName] = useState<boolean>(false);
  return (
    <div className='profile-settings'>
      <div className="profile-menu">
        <h1>Profile settings</h1>
        <button 
          className="profile-button"
          onClick={() =>setIsClickEditProfile(prev => !prev)}
        ><Link to='/profile/setup' className='edit-profile-link'>Edit Profile</Link></button>
        <button 
          className="change-name"
          onClick={() => setIsClickChangeName(prev => !prev)}
        >Change Name</button>
      </div>
      {isClickChangeName ? <ChangeNameForm setIsClickChangeName={setIsClickChangeName}/> : ""}

      
    </div>
  )
}

export default Profile
