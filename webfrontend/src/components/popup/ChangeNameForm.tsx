import React, { useCallback } from 'react'
import { useState } from 'react';
interface props {
  setIsClickChangeName:React.Dispatch<React.SetStateAction<boolean>>;
}
const ChangeNameForm:React.FC<props> = ({setIsClickChangeName}) => {
  const [newName,setNewName] = useState<string>("");
  const [password,setPassword] = useState<string>("");
  const [error,setError] = useState<boolean>(false);
  const submitForm = useCallback((e:React.SyntheticEvent<EventTarget>) => {
    e.preventDefault();
    if ((!(newName === ""))  && !(password === "")) {
      setError(false);
      setIsClickChangeName(prev => !prev);
    }
    else {
      setError(true);
    }
  },[]);
  return (
    <div className='form-container'>
      
       <form 
          className='changename-form'
          onSubmit={() => submitForm}
        >
           <button 
            className='escape-button' 
            onClick={()=>{
              setIsClickChangeName(prev => !prev);
            }}
            >X</button>
          <div className="changename-input">
            <p className="title">New Name</p>
            <input 
              value ={newName}
              onChange={(e) => setNewName(e.target.value)}
              className='changename-input-text'
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
              Change Name
          </button>
        </form>
    </div>
  )
}

export default ChangeNameForm
