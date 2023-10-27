import React, { useCallback } from 'react'
import { useState } from 'react';
import { postRequestContent } from '../../utils/request';
import { response } from 'express';
import { triggerErrorMessage } from '../../utils/locals';
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
  const submitForm = useCallback((e:React.SyntheticEvent<EventTarget>) => {
    e.preventDefault();
    console.log(username);
    console.log(password);
    if ((!(username === "")) && (isAphanumeric(username)) && !(password === "")) {
      fetch('/profile/change_name',postRequestContent({
        username: username,
      }))
      .then(response => {
          if (response.status != 200) {
            triggerErrorMessage();
            return;
          }
          setUsername("");
          setError(false);
          setIsClickUsername(prev => !prev);
      });
    

     
    }
    else {
      setError(true);
    }
  
  },[error,username,password]);
  return (
    <div className='form-container'>
       <form 
          className='username-form'
          onSubmit={(e) => submitForm(e)}
        >
            <button type="button" className="btn-close" aria-label="Close"
              onClick={()=>{
                setIsClickUsername(prev => !prev);
              }}
            ></button>
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
