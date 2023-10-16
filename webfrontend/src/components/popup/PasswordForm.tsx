import React, { useState } from 'react'
import './PasswordForm.scss'
interface props {
  setIsClickPassword: React.Dispatch<React.SetStateAction<boolean>>;
}
const PasswordForm:React.FC<props> = ({setIsClickPassword}) => {
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  return (
    <div className='form-container'>
    <form 
       className='password-form'
       onSubmit={() => {
         console.log("okay");
         setIsClickPassword(prev => !prev);
       }}
     >
       <div className="oldPassword-input">
         <p className="title">Old Password</p>
         <input 
           value ={oldPassword}
           onChange={(e) => setOldPassword(e.target.value)}
           className='oldPassword-input-text'
         />
       </div>
       <div className="newPassword-input">
         <p className="title">New Password</p>
         <input 
           value={newPassword}
           onChange={(e) => setNewPassword(e.target.value)}
           className = 'newPassword-input-text'
         />
       </div>
       <div className="confirmPassword-input">
         <p className="title">Confrim New Password</p>
         <input 
           value={confirmPassword}
           onChange={(e) => setConfirmPassword(e.target.value)}
           className = 'confirmPassword-input-text'
         />
       </div>
       <button type='submit' className='input_submit'>
           Change Password
       </button>
     </form>
 </div>
  )
}

export default PasswordForm
