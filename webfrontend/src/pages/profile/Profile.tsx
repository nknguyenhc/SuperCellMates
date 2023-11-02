import React from 'react'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import ProfileWallpaper from '../../components/profile/ProfileWallpaper'
import ProfileDashBoard from '../../components/profile/ProfileDashBoard'
import { Link } from 'react-router-dom'
const Profile = () => {
  return (
    <div className='profile-page'>
      <ProfileWallpaper/>
      <ProfileDashBoard />
      <Link to='/about' className='about-link'>
            <AiOutlineQuestionCircle/>   About </Link>

    </div>
  )
}

export default Profile
