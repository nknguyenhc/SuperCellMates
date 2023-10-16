import React from 'react'
import { useState } from 'react';
import './ChangeNameForm.scss'
interface props {
  setIsClickChangeName:React.Dispatch<React.SetStateAction<boolean>>;
}
const ChangeNameForm:React.FC<props> = ({setIsClickChangeName}) => {
  const [newName,setNewName] = useState<string>("");
  const [password,setPassword] = useState<string>("");
  return (
    <div className='form-container'>
       <form 
          className='newname-form'
          onSubmit={() => {
            console.log("okay");
            setIsClickChangeName(prev => !prev);
          }}
        >
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
          <button type='submit' className='input_submit'>
              Change Name
          </button>
        </form>
    </div>
  )
}

export default ChangeNameForm
