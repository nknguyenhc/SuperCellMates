import { useCallback, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { postRequestContent } from "../../utils/request";
import { triggerErrorMessage } from "../../utils/locals";
import { Link } from "react-router-dom";
export type FriendType = {
  name:string,
  username: string,
  link: string,
  img: string,
}
interface Props {
  name: string;
  link: string;
  setCurrentFriends:React.Dispatch<React.SetStateAction<FriendType[]>>
}

const CurrentFriends:React.FC<Props> = ({name, link, setCurrentFriends}) => {
  const [chatId, setChatId] = useState<string>('');
  const getChatId = useCallback(() => {
    fetch(`/messages/get_chat_id?username=${name}`) 
      .then(res => {
        if (res.status !== 200) {
          res.text().then(res => {
            console.log(res);
          })
          triggerErrorMessage();
          return;
        }
        res.text().then(res => {
          setChatId(res);
        })
      })
  }, [chatId]);
  useEffect(() => {
    getChatId();
    console.log(chatId);
  },[getChatId]);
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
     
      <Link to = {link} style={{textDecoration: 'none', color: 'black'}} >
        <div className="thumbnail-current-friend">
          <img src="/default_profile_pic.jpg" className='thumbnail-current-friend-picture' />
          <p className='friend-name'> {name}</p>  
        </div>
      </Link>
      <Button 
        className='delete-btn' 
        variant='danger'
        onClick={() => deleteFriend(name)}
      > Unfriend</Button>
      <Link to = {`/messages/?chatid=${chatId}`}>
        <Button
          className='message-btn'
          variant = 'primary'
          onClick={() => getChatId()}
        >
            Message
        </Button>
      </Link>
      
      
    </div>
  )
}

export default CurrentFriends
