import React from 'react'
import { useState } from 'react';
import './userNameForm.scss'
interface props {
  setIsClickUsername: React.Dispatch<React.SetStateAction<boolean>>;
}
const UserNameForm:React.FC<props> = ({setIsClickUsername}) => {
  const [username,setUsername] = useState<string>("");
  const [password,setPassword] = useState<string>("");
  const [error,setError] = useState<boolean>(false);
  function isAphanumeric(str:string) {
    return str.match(/^[a-zA-Z0-9]+$/) !== null;
  }
  return (
    <div className='form-container'>
       <form 
          className='username-form'
          onSubmit={(e) => {
            e.preventDefault();
            if ((!(username === "")) && (isAphanumeric(username)) && !(password === "")) {
              setError(false);
              setIsClickUsername(prev => !prev);
            }
            else {
              setError(true);
            }
          
          }}
        >
           <button 
            className='escape-button' 
            onClick={()=>{
              setIsClickUsername(prev => !prev);
            }}
            >X</button>
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
          {error ? <p className='error-statement'>Username and password cannot be left blank and username has to be alphanumeric(a-z,A-Z,0-9)</p>:""}
          <button type='submit' className='input_submit'>
              Change username
          </button>
        </form>
    </div>
  )
}

export default UserNameForm
