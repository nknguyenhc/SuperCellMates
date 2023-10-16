import React, { useState } from 'react'
interface props {
  setIsClickPassword: React.Dispatch<React.SetStateAction<boolean>>;
}
const PasswordForm:React.FC<props> = ({setIsClickPassword}) => {
  const [oldPassword, setOldPassword] = useState<string>("");
  
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

export default PasswordForm
