import React from 'react'
import './ProfileDashBoard.scss'
import {FcInvite} from 'react-icons/fc'
import {BsFillPeopleFill} from 'react-icons/bs'
const ProfileDashBoard = () => {
  return (
    <div className='profile-dash-board'>
      <div className="dashboard-container">
        <div className="left-section">
          <div className="option">
              <FcInvite/> 
              Friend Requests
            </div>

          <div className="option">
            <BsFillPeopleFill/> 
            Friends
          </div>
        </div>
        <div className="right-section">right section</div>
      </div>
      
    </div>
  )
}

export default ProfileDashBoard
