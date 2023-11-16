interface Props {
  message: string,
  setIsMessageModal: React.Dispatch<React.SetStateAction<boolean>>
}
const PopChangeAuthMessage:React.FC<Props> = ({message, setIsMessageModal}) => {
  return (
    <div className='auth-message-modal'>
       <div className='auth-message-container'>
       <button type="button" className="btn-close" aria-label="Close"
          onClick={() => {
            setIsMessageModal(prev => !prev);
          }}
        ></button>
        <h2 className='auth-message-title'>Message</h2>
        <p className='auth-message-content'>{message}</p>
       </div>
      
    </div>
  )
}
 
export default PopChangeAuthMessage
