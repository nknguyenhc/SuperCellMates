import React, { useCallback, useState } from 'react'
interface props {
  setIsClickPassword: React.Dispatch<React.SetStateAction<boolean>>;
}
const PasswordForm:React.FC<props> = ({setIsClickPassword}) => {
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error,setError] = useState<boolean>(false);
  const submitForm = useCallback((e:React.SyntheticEvent<EventTarget>) => {
    e.preventDefault();
    if ( !(oldPassword === "") && !(newPassword ==="") && !(confirmPassword === "")) {
      setError(false);
      setIsClickPassword(prev => !prev);
    }
    else {
      setError(true);
    }
},[])
  return (
    <div className='form-container'>
    <form 
       className='password-form'
       onSubmit={() => submitForm}
     >
       <button 
            className='escape-button' 
            onClick={()=>{
              setIsClickPassword(prev => !prev);
            }}
            >X</button>
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
       {error ? <p className='error-statement'>Input field cannot be left blank</p>:""}
       <button type='submit' className='input_submit'>
           Change Password
       </button>
     </form>
 </div>
  )
}

export default PasswordForm
