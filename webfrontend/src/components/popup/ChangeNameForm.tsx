import { useCallback } from 'react'
import { useState } from 'react';
import { postRequestContent } from '../../utils/request';
import { triggerErrorMessage } from '../../utils/locals';
import Spinner from 'react-bootstrap/esm/Spinner';
interface props {
  setIsClickChangeName:React.Dispatch<React.SetStateAction<boolean>>;
  setMessageModal: React.Dispatch<React.SetStateAction<string>>;
  setIsMessageModal: React.Dispatch<React.SetStateAction<boolean>>;
}
const ChangeNameForm:React.FC<props> = ({setIsClickChangeName, setIsMessageModal, setMessageModal}) => {
  const [newName, setNewName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const submitForm = useCallback((e:React.SyntheticEvent<EventTarget>) => {
    e.preventDefault();
    if (newName === '') {
      setError('New name cannot be empty');
      return;
    } else if (newName.length > 15) {
      setError('Name must be 15 characters or less');
      return;
    } else if (password === '') {
      setError('Password cannot be empty');
    }
    if (!isLoading) {
      setIsLoading(true);
      fetch('/profile/change_name', postRequestContent({
        name: newName,
        password: password,
      }))
      .then(response => {
          if (response.status !== 200) {
            triggerErrorMessage();
            return;
          }
          setIsLoading(false);
          response.text().then((response) => {
              if (response !== 'Name changed') {
                setError(response);
              

              } else {
                setIsClickChangeName(prev => !prev);
                setMessageModal('Name changed');
                setIsMessageModal(true);
              } 
          
          })
          
      });
    }
  }, [newName, password, setIsClickChangeName, isLoading, setIsMessageModal, setMessageModal]);
  return (
    <div className='form-container'>
      
       <form 
          className='changename-form'
          onSubmit={(e) => submitForm(e)}
        >
          <button type="button" className="btn-close" aria-label="Close"
            onClick={() => {
              setIsClickChangeName(prev => !prev);
            }}
          ></button>
          <div className="changename-input">
            <p className="title">New Name</p>
            <input 
              value ={newName}
              onChange={(e) => setNewName(e.target.value)}
              className='form-control form-control-lg'
            />
          </div>
          <div className="password-input">
            <p className="title">Confirm Password</p>
            <input 
              value={password}
              type='password'
              onChange={(e) => {
                setPassword(e.target.value)}}
              className = 'form-control form-control-lg'
            />
          </div>
          {error ? <p className='error-statement'> {error} </p>:""}
          <button type='submit' className='input_submit'>
              Change Name
          </button>
          {isLoading ? <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>:""}
        </form>
    </div>
  )
}

export default ChangeNameForm
