import  { useCallback, useState } from 'react'
import { postRequestContent } from '../../utils/request';
import { triggerErrorMessage } from '../../utils/locals';
import Spinner from 'react-bootstrap/esm/Spinner';
interface props {
  setIsClickPassword: React.Dispatch<React.SetStateAction<boolean>>;
  setMessageModal: React.Dispatch<React.SetStateAction<string>>;
  setIsMessageModal: React.Dispatch<React.SetStateAction<boolean>>;
}
const PasswordForm:React.FC<props> = ({setIsClickPassword, setIsMessageModal, setMessageModal}) => {
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const submitForm = useCallback((e:React.SyntheticEvent<EventTarget>) => {
    e.preventDefault();
    if(oldPassword === '') {
      setError('Old password cannot be empty!');
      return;
    } else if (newPassword === '') {
      setError('New password cannot be empty!');
      return;
    } else if (newPassword !== confirmPassword) {
      setError('Password and confirm password do not match!');
      return;
    }
    if (!isLoading) {
      setIsLoading(true);
      fetch('/change_password', postRequestContent({
        old_password: oldPassword,
        new_password: newPassword,
      }))
      .then (response => {
        setIsLoading(false);
        if (response.status !== 200) {
          triggerErrorMessage();
          return;
        }
        response.text().then((response) => {
          if (response !== 'Password changed') {
            setError(response);

          } else {
            setIsClickPassword(prev => !prev);
            setMessageModal('Password changed');
            setIsMessageModal(true);
          } 
      })
      })
      
    }
}, [oldPassword, newPassword, confirmPassword, setIsClickPassword, isLoading, setIsMessageModal, setMessageModal])
  return (
    <div className='form-container'>
    <form 
        className='password-form'
        onSubmit={(e) => submitForm(e)}
      >
        <button type="button" className="btn-close" aria-label="Close"
          onClick={() => {
            setIsClickPassword(prev => !prev);
          }}
        ></button>
       <div className="oldPassword-input">
         <p className="title">Old Password</p>
         <input 
           value ={oldPassword}
           onChange={(e) => setOldPassword(e.target.value)}
           className='form-control form-control-lg'
         />
       </div>
       <div className="newPassword-input">
         <p className="title">New Password</p>
         <input 
           value={newPassword}
           onChange={(e) => setNewPassword(e.target.value)}
           className = 'form-control form-control-lg'
         />
       </div>
       <div className="confirmPassword-input">
         <p className="title">Confrim New Password</p>
         <input 
           value={confirmPassword}
           onChange={(e) => setConfirmPassword(e.target.value)}
           className = 'form-control form-control-lg'
         />
       </div>
       {error ? <p className='error-statement'>{error}</p>:""}
       <button type='submit' className='input_submit'>
           Change Password
       </button>
       {isLoading?<Spinner animation="border" role="status">
      <span className="visually-hidden">Loading...</span>
    </Spinner>:""}
     </form>
 </div>
  )
}

export default PasswordForm
