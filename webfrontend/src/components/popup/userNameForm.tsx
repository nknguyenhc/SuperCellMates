import React from 'react'
import { useState } from 'react';
import './userNameForm.scss'
interface props {
  setIsClickUsername: React.Dispatch<React.SetStateAction<boolean>>;
}
const UserNameForm:React.FC<props> = ({setIsClickUsername}) => {
  const [username,setUsername] = useState<string>("");
  const [password,setPassword] = useState<string>("");
  return (
    <div className='form-container'>
       <form 
          className='username-form'
          onSubmit={() => {
            console.log("okay");
            setIsClickUsername(prev => !prev);
          }}
        >
          <div className="username-input">
            <p className="title">New Username</p>
            <input 
              value ={username}
              onChange={(e) => setUsername(e.target.value)}
              className='username-input-text'
            />
          </div>
          <div className="password-input">
            <p className="title">Confirm Password</p>
            <input 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className = 'password-input-text'
            />
          </div>
          <button type='submit' className='input_submit'>
              change username
          </button>
        </form>
    </div>
  )
}

export default UserNameForm
