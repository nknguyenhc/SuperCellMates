import React, { useCallback, useEffect, useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Button } from 'react-bootstrap'
import {AiFillCamera} from "react-icons/ai"
import { triggerErrorMessage } from '../../utils/locals'
const ProfileWallpaper = () => {
  const [name, setName] = useState<string>("");
  const getName = useCallback(() => {
      fetch('/user/profile_async/<str:username>')
      .then (res => {
        if (res.status !== 200) {
          triggerErrorMessage();
          return;
        }
        console.log(res);
      })
  }, [name]);
  useEffect(() => {
    getName();
  },[getName]);
  return (
    <div className='profile-wallpaper'>
      <div className='profile-info'>
        <div className="thumbnail">
          <img src="/default_profile_pic.jpg" className="thumbnail-picture" />
          <button className="change-thumbnail-btn"><AiFillCamera/></button>
        </div>
        <p className="profile-name">Man</p>
        <span id="boot-icon" className="bi bi-camera"></span>
      
      </div>
      <button className="edit-profile-btn"> Edit Profile</button>
      
      <button className='edit-wallpaper-btn'> <AiFillCamera/></button>

    </div>
  )
}

export default ProfileWallpaper
