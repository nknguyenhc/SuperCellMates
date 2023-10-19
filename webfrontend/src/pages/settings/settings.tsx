import React from 'react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import Authentication from '../../components/settings/authentication'
import Profile from '../../components/settings/profile'
import './settings.scss'
import {MdPrivacyTip} from "react-icons/md";
import {CgProfile} from "react-icons/cg"
const Settings:React.FC = () => {
  const [button1,setButton1] = useState(true);
  const [button2,setButton2] = useState(false);
  const handleClick = (id: number) => {
    if (id === 1) {
      setButton1(true);
      setButton2(false);
    } else {
      setButton1(false);
      setButton2(true);
    }
  
  };

  return (
    <div className='settings-page'>
       <div className='settings-container'>
          <div className="left-section">
            <h1 className='menu-title'>Settings</h1>
            <button 
              className='menu-settings-button'
              onClick={() => handleClick(1)}
            ><MdPrivacyTip/> Authentication</button>
            <button 
              className='menu-settings-button'
              onClick={() => handleClick(2)}
            > <CgProfile/> Profile</button>
          
            <button className="logout-button">Log Out</button>
          
          </div>
          <div className="right-section">
             {button1 === true ? <Authentication /> : "" }
             {button2 === true ? <Profile /> : ""}
          </div>
          
         
       </div>
    </div>
  )
}

export default Settings
