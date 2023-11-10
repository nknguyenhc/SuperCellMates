import { useState } from 'react';
import UserNameForm from '../popup/userNameForm';
import PasswordForm from '../popup/PasswordForm';
import PopChangeAuthMessage from '../popup/PopChangeAuthMessage';
const Authentication = () => {
  const [isClickUsername, setIsClickUsername] = useState<boolean>(false);
  const [isClickPassword, setIsClickPassword] = useState<boolean>(false);
  const [messageModal, setMessageModal] = useState<string> ('');
  const [isMessageModal, setIsMessageModal] = useState<boolean>(false);
  return (
    <div className='authenticate-settings'>
      <div className="authenticate-menu">
        <h1>Authentication settings</h1>
        <button 
          className="username-button"
          onClick={() => setIsClickUsername(prev => !prev)}
        >Change username</button>
        <button 
          className="password-button"
          onClick = {() => setIsClickPassword(prev => !prev)}
        >Change password</button>
      </div> 
      {isClickUsername ? <UserNameForm setIsClickUsername={setIsClickUsername} setMessageModal={setMessageModal} setIsMessageModal={setIsMessageModal} /> : ""}
      {isClickPassword ? <PasswordForm setIsClickPassword={setIsClickPassword} setMessageModal={setMessageModal} setIsMessageModal={setIsMessageModal}/>:""}
      {isMessageModal ? <PopChangeAuthMessage message={messageModal} setIsMessageModal={setIsMessageModal} />: ""}
    </div>
  )
}

export default Authentication
