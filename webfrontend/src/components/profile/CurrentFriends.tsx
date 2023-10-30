import { useCallback } from "react";
import { Button } from "react-bootstrap";
import { postRequestContent } from "../../utils/request";
import { triggerErrorMessage } from "../../utils/locals";
export type FriendType = {
  name:string,
  username: string,
  link: string,
  img: string,
}
interface Props {
  name: string;
  setCurrentFriends:React.Dispatch<React.SetStateAction<FriendType[]>>
}

const CurrentFriends:React.FC<Props> = ({name,setCurrentFriends}) => {
  const deleteFriend = useCallback((name:string) => {
    fetch('/user/delete_friend', postRequestContent({
      username: name
    }))
      .then(res => {
        if (res.status !== 200) {
          triggerErrorMessage();
          return;
        }
        setCurrentFriends(prev => {
          return prev.filter(person => person.name !== name);
        })
      })
  }, []);
  return (
    <div className="current-friend-info">
      <img src="/default_profile_pic.jpg" className='friend-thumbnail' />
      <p className='friend-name'> {name}</p>  
      <Button 
        className='delete-btn' 
        variant='danger'
        onClick={() => deleteFriend(name)}
      > Unfriend</Button>
      
    </div>
  )
}

export default CurrentFriends
