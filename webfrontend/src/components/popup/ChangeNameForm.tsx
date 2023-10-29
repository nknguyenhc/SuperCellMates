import { useCallback } from 'react'
import { useState } from 'react';
import { postRequestContent } from '../../utils/request';
import { triggerErrorMessage } from '../../utils/locals';
import Spinner from 'react-bootstrap/esm/Spinner';
interface props {
  setIsClickChangeName:React.Dispatch<React.SetStateAction<boolean>>;
}
const ChangeNameForm:React.FC<props> = ({setIsClickChangeName}) => {
  const [newName,setNewName] = useState<string>("");
  const [password,setPassword] = useState<string>("");
  const [error,setError] = useState<string>("");
  const [isLoading,setIsLoading] = useState<boolean>(false);
  const submitForm = useCallback((e:React.SyntheticEvent<EventTarget>) => {
    e.preventDefault();
    setError("");
    if ((!(newName === ""))  && !(password === "")) {
      console.log(password);
      setIsLoading(true);
      fetch('/profile/change_name', postRequestContent({
        name: newName,
        password: password,
      }))
      .then(response => {
          if (response.status !== 200) {
           // response.text().then(response => console.log(response))
           console.log(response);
            triggerErrorMessage();
            return;
          }
          response.text().then((response) => {
              if (response === 'Authentication fails') {
                setError('Authentication fails');
                setIsLoading(false);
                return;

              } else {
                setIsLoading(false);
                setNewName("");
                setError("");
                setIsClickChangeName(prev => !prev);
              } 
          
          })
          
      });
    }
    else {
      setError("Username and password cannot be left blank and username has to be alphanumeric(a-z,A-Z,0-9)");
    }
  }, [error,newName,password,isLoading]);
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
              onChange={(e) => {
                console.log(password)
                setPassword(e.target.value)}}
              className = 'form-control form-control-lg'
            />
          </div>
          {error ? <p className='error-statement'>{error}</p>:""}
          <button type='submit' className='input_submit'>
              Change Name
          </button>
          {isLoading?<Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>:""}
        </form>
    </div>
  )
}

export default ChangeNameForm
