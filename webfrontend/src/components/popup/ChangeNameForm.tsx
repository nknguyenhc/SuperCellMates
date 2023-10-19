import React from 'react'
import { useState } from 'react';
import './ChangeNameForm.scss'
interface props {
  setIsClickChangeName:React.Dispatch<React.SetStateAction<boolean>>;
}
const ChangeNameForm:React.FC<props> = ({setIsClickChangeName}) => {
  const [newName,setNewName] = useState<string>("");
  const [password,setPassword] = useState<string>("");
  const [error,setError] = useState<boolean>(false);
  function isAphanumeric(str:string) {
    return str.match(/^[a-zA-Z0-9]+$/) !== null;
  }
  return (
    <div className='form-container'>
      
       <form 
          className='newname-form'
          onSubmit={(e) => {
            e.preventDefault();
            if ((!(newName === "")) && (isAphanumeric(newName)) && !(password === "")) {
              setError(false);
              setIsClickChangeName(prev => !prev);
            }
            else {
              setError(true);
            }
          }}
        >
           <button 
            className='escape-button' 
            onClick={()=>{
              setIsClickChangeName(prev => !prev);
            }}
            >X</button>
          <div className="newname-input">
            <p className="title">New Name</p>
            <input 
              value ={newName}
              onChange={(e) => setNewName(e.target.value)}
              className='newname-input-text'
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
