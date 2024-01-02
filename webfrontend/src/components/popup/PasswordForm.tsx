import  { useCallback, useState } from 'react'
import { postRequestContent } from '../../utils/request';
import { triggerErrorMessage } from '../../utils/locals';
import Spinner from 'react-bootstrap/esm/Spinner';
import { Button } from 'react-bootstrap';
import { Modal } from 'react-bootstrap';
interface props {
  setIsClickPassword: React.Dispatch<React.SetStateAction<boolean>>;
  setMessageModal: React.Dispatch<React.SetStateAction<string>>;
  setIsMessageModal: React.Dispatch<React.SetStateAction<boolean>>;
  isClickPassword: boolean;
}

const PasswordForm:React.FC<props> = ({ isClickPassword, setIsClickPassword, setIsMessageModal, setMessageModal }) => {
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
  const handleClose = useCallback(() => {
     setIsClickPassword((prev) => !prev);
  }, [setIsClickPassword])

  return (

      <Modal show={isClickPassword} onHide={handleClose}>
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body>
          <form className='password-form' onSubmit={(e) => submitForm(e)}>
            <div className='oldPassword-input'>
              <p className='title'>Old Password</p>
              <input
                type='password'
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className='form-control form-control-lg'
              />
            </div>
            <div className='newPassword-input'>
              <p className='title'>New Password</p>
              <input
                type='password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className='form-control form-control-lg'
              />
            </div>
            <div className='confirmPassword-input'>
              <p className='title'>Confrim New Password</p>
              <input
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className='form-control form-control-lg'
              />
            </div>
            {error ? <p className='error-statement'>{error}</p> : ''}
            <Button type='submit' className='input_submit'>
              Change Password
            </Button>
            {isLoading ? (
              <Spinner animation='border' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </Spinner>
            ) : (
              ''
            )}
          </form>
        </Modal.Body>
      </Modal>
  );
}

export default PasswordForm
