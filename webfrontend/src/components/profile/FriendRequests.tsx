import { useCallback } from 'react';
import { Button } from 'react-bootstrap'
import { postRequestContent } from '../../utils/request';
import { triggerErrorMessage } from '../../utils/locals';
import { Link } from 'react-router-dom';
export type FriendType = {
  name:string,
  username: string,
  link: string,
  img: string,
}
interface Props {
  name: string;
  setFriendRequests:React.Dispatch<React.SetStateAction<FriendType[]>>
  link: string
}
const FriendRequests:React.FC<Props> = ({name, link, setFriendRequests}) => {
  const handleApprove = useCallback((name:string, accepted:string) => {
    fetch('/user/add_friend', postRequestContent({
      username: name,
      accepted: accepted
    }))
     .then(res => {
      if (res.status !== 200) {
        triggerErrorMessage();
        return;
      }
      setFriendRequests(prev => {
        return prev.filter(person =>  person.name !== name)
      })
     })
  }, [setFriendRequests])
  return (
    
      <div className='friend-request-info'>
      <Link to = {link} style={{textDecoration: 'none', color: 'black'}} >
        <div className="thumbnail-friend-request">
          <img src="/default_profile_pic.jpg" className='thumbnail-friend-request-picture' alt='default_profile_picture' />
          <p className='friend-name'> {name}</p>  
        </div>
      </Link>
      
      <Button 
        className='approve-btn' 
        variant='success'
        onClick={() => handleApprove(name, 'true')}
      > Aprrove</Button>
      <Button 
        className='reject-btn' 
        variant='danger'
        onClick={() => handleApprove(name, 'false')}
      > Reject</Button>
      
    </div>
 

  )
}

export default FriendRequests
