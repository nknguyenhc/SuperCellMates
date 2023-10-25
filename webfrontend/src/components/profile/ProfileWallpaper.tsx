import React from 'react'
import { Button } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
const ProfileWallpaper = () => {
  return (
    <div className='profile-wallpaper'>
      <div className='profile-info'>
        <div className="thumnail">
          <img src="/Jiale.jpg" className="thumbnail-picture" />
          <p className="profile-name">Jiale</p>
        </div>
        <Button>Test Button</Button>

      </div>
    </div>
  )
}

export default ProfileWallpaper
