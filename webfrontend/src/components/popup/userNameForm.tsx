import { useCallback } from 'react'
import { useState } from 'react';
import { postRequestContent } from '../../utils/request';
import { triggerErrorMessage } from '../../utils/locals';
import Spinner from 'react-bootstrap/Spinner'
import { isAlphaNumeric } from '../../utils/primitives';
interface props {
  setIsClickUsername: React.Dispatch<React.SetStateAction<boolean>>;
  setMessageModal: React.Dispatch<React.SetStateAction<string>>;
  setIsMessageModal: React.Dispatch<React.SetStateAction<boolean>>;
}
const UserNameForm:React.FC<props> = ({setIsClickUsername, setMessageModal, setIsMessageModal}) => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const submitForm = useCallback((e:React.SyntheticEvent<EventTarget>) => {
    e.preventDefault();
    setError("")
    if (username === '') {
      setError('New username cannot be empty');
      return;
    } else if (username.length > 15) {
      setError('Username must be 15 characters or less');
      return;
    } else if (!isAlphaNumeric(username)) {
      setError('Username can only contain alphabets (lower and upper case) and numbers');
      return;
    }
    
    if (!isLoading) {
   
      setIsLoading(true);
      fetch('/change_username', postRequestContent({
        new_username: username,
        password: password,
      }))
      .then(response => {
          setIsLoading(false);
          if (response.status !== 200) {
            triggerErrorMessage();
            return;
          } 

          response.text().then((text) => {
            if (text !== 'Username changed') {
              setError(text);
            } else {
              setIsClickUsername(prev => !prev);
              setMessageModal('Name changed');
              setIsMessageModal(true);
              
            } 
            
        })
      });
    }
  
  }, [username,isLoading, password, setIsClickUsername, setMessageModal, setIsMessageModal]);
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
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className = 'form-control form-control-lg'
            />
          </div>
          {error ? <p className='error-statement'>{error}</p>:""}
          <button type='submit' className='input_submit'>
              Change username
          </button>
          {isLoading ? <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>:""}
        
        </form>
    </div>
  )
}

export default UserNameForm
