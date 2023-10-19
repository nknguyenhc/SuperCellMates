import React from 'react'
import { useState } from 'react';
import './authentication.scss'
import UserNameForm from '../popup/userNameForm';
import PasswordForm from '../popup/PasswordForm';
const Authentication = () => {
  const [isClickUsername, setIsClickUsername] = useState<boolean>(false);
  const [isClickPassword, setIsClickPassword] = useState<boolean>(false);
  const [isClickLogout, setIsClickLogout] = useState<boolean>(false);
  const handleClick = (id:number) => {
    if (id === 1) {
      setIsClickUsername(prev => !prev);
    } 
    if (id === 2)  {
      setIsClickPassword(prev => !prev);
    }
    if (id == 3) {
      setIsClickLogout(prev => !prev);
    }
  };
  return (
    <div className='authenticate-settings'>
      <div className="authenticate-menu">
        <h1>Authentication settings</h1>
        <button 
          className="username-button"
          onClick={() => handleClick(1)}
        >Change username</button>
        <button 
          className="password-button"
          onClick = {() => handleClick(2)}
        >Change password</button>
      </div> 
      {isClickUsername ? <UserNameForm setIsClickUsername={setIsClickUsername}/> : ""}
      {isClickPassword ? <PasswordForm setIsClickPassword={setIsClickPassword} />:""}


       

     
    </div>
  )
}

export default Authentication
