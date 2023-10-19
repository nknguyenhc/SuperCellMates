import React, { useState } from 'react'
import './profile.scss'
import { Link } from 'react-router-dom';
import ChangeNameForm from '../popup/ChangeNameForm';
const Profile = () => {
  const [isClickEditProfile, setIsClickEditProfile] = useState<boolean>(false);
  const [isClickChangeName, setIsClickChangeName] = useState<boolean>(false);
  const handleclick = (id: number) => {
    if (id === 1) {
      setIsClickEditProfile(prev => !prev);
    }
    if (id === 2) {
      setIsClickChangeName(prev => !prev);
    }
  };
  return (
    <div className='profile-settings'>
      <div className="profile-menu">
        <h1>Profile Settings</h1>
        <button 
          className="profile-button"
          onClick={() => handleclick(1)}
        ><Link to='/profile/setup' className='edit-profile-link'>Edit Profile</Link></button>
        <button 
          className="change-name"
          onClick={() => handleclick(2)}
        >Change Name</button>
      </div>
      {isClickChangeName ? <ChangeNameForm setIsClickChangeName={setIsClickChangeName}/> : ""}

      
    </div>
  )
}

export default Profile
