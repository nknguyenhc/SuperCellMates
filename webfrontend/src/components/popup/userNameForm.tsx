import React, { useCallback } from 'react'
import { useState } from 'react';
import { postRequestContent } from '../../utils/request';
import { triggerErrorMessage } from '../../utils/locals';
import Spinner from 'react-bootstrap/Spinner'
interface props {
  setIsClickUsername: React.Dispatch<React.SetStateAction<boolean>>;
}
const UserNameForm:React.FC<props> = ({setIsClickUsername}) => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  function isAphanumeric(str:string) {
    return str.match(/^[a-zA-Z0-9]+$/) !== null;
  }
  const submitForm = useCallback((e:React.SyntheticEvent<EventTarget>) => {
    e.preventDefault();
    console.log(username);
    console.log(password);
    setError("")
    if ((!(username === "")) && (isAphanumeric(username)) && !(password === "")) {
   
      setIsLoading(true);
      fetch('/change_username', postRequestContent({
        new_username: username,
        password:password,
      }))
      .then(response => {
          if (response.status !== 200) {
            triggerErrorMessage();
            return;
          }
          response.text().then((response) => {
            console.log(response);
            if (response === 'Password is incorrect') {
              setError('Password is incorrect');
              setIsLoading(false);
              return;

            } else {
              setUsername("");
              setError("");
              setIsClickUsername(prev => !prev);
              setIsLoading(false);
            } 
        })
      });
    }
    else {
      setError("Username and password cannot be left blank and username has to be alphanumeric(a-z,A-Z,0-9)");
    }
  
  }, [error, username, password, isLoading]);
  return (
    <div className='form-container'>
       <form 
          className='username-form'
          onSubmit={(e) => submitForm(e)}
        >
            <button type="button" className="btn-close" aria-label="Close"
              onClick={() => {
                setIsClickUsername(prev => !prev);
              }}
            ></button>
          <div className="username-input">
            <p className="title">New Username</p>
            <input 
              value ={username}
              onChange={(e) => setUsername(e.target.value)}
              className='form-control form-control-lg'
            />
          </div>
          <div className="password-input">
            <p className="title">Confirm Password</p>
            <input 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className = 'form-control form-control-lg'
            />
          </div>
          {error ? <p className='error-statement'>{error}</p>:""}
          <button type='submit' className='input_submit'>
              Change username
          </button>
          {isLoading?<Spinner animation="border" role="status">
      <span className="visually-hidden">Loading...</span>
    </Spinner>:""}
        
        </form>
    </div>
  )
}

export default UserNameForm
