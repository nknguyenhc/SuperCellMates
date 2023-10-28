import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Button } from 'react-bootstrap'
import {AiFillCamera} from "react-icons/ai"
const ProfileWallpaper = () => {
  return (
    <div className='profile-wallpaper'>
      <div className='profile-info'>
        <div className="thumbnail">
          <img src="/default_profile_pic.jpg" className="thumbnail-picture" />
          <button className="change-thumbnail-btn"><AiFillCamera/></button>
        </div>
        <p className="profile-name">man</p>
        <span id="boot-icon" className="bi bi-camera"></span>
      
      </div>
      <button className="edit-profile-btn"> Edit Profile</button>
      
      <button className='edit-wallpaper-btn'> <AiFillCamera/></button>

    </div>
  )
}

export default ProfileWallpaper
