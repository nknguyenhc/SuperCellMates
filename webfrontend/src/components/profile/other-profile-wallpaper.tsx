import  { useCallback, useState, useEffect } from 'react'
import { Button } from 'react-bootstrap'
import {AiOutlineUserAdd} from 'react-icons/ai'
import { triggerErrorMessage } from '../../utils/locals'
import { postRequestContent } from '../../utils/request'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'
export type FriendType = {
  name:string,
  username: string,
  link: string,
  img: string,
}

const OtherProfileWallpaper = () => {
  const username = useParams().username;
  const [addFriendLabel, setAddFriendLabel] = useState<string>('Add Friend');
  const [friendRequests, setFriendRequests] = useState<Array<FriendType>>([]);
  const [inFriendRequestList, setInFriendRequestList] = useState<boolean>(false);
  const [inCurrentFriendList, setInCurrentFriendList] = useState<boolean>(false);
  const [currentFriends, setCurrentFriends] = useState<Array<FriendType>>([]);
  const [chatId, setChatId] = useState<string>('');
  const getChatId = useCallback(() => {
    fetch(`/messages/get_chat_id?username=${username}`) 
      .then(res => {
        if (res.status !== 200) {
          triggerErrorMessage();
          return;
        }
        res.text().then(res => {
          setChatId(res);
        })
      })
  }, [username]);
  useEffect(() => {
    getChatId();
  }, [getChatId, chatId]);
  const handleClickAddFriend = useCallback(() => {
     if (addFriendLabel === 'Add Friend') {
      fetch('/user/add_friend_request', postRequestContent({
        username: username,
      }))
        .then(res => {
          if (res.status !== 200) {
            triggerErrorMessage();
            return;
          }
        })
        setAddFriendLabel('Friend Request Sent');
    } 
  },[addFriendLabel, username]);
  const getFriendRequest = useCallback(() =>{
    fetch('/user/friend_requests_async')
      .then(res => {
        if (res.status !== 200) {
          triggerErrorMessage();
          return 0;
        }
        res.json().then(res => {
          setFriendRequests(res?.map((user:any) =>({
            name: user.name,
            username: user.username,
            link: user.profile_link,
            img: user.profile_pic_url,
          }))); 
        })
        return 1;
       
      })
  }, []);
  useEffect(() => {
    getFriendRequest();
    const isFound = friendRequests.some(person => {
      if (person.name === username) {
        return true;
      }
      return false;
    })
    setInFriendRequestList(isFound);
  }, [getFriendRequest,friendRequests,username]); 

  const handleApprove = useCallback((name:string, accepted:string) => {
    setInFriendRequestList(false);
    setInCurrentFriendList(true);
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
  }, [])

  const getCurrentFriends = useCallback(async () =>{
    await fetch('/user/friends_async')
      .then(res => {
        if (res.status !== 200) {
          triggerErrorMessage();
          return;
        }
        res.json().then(res => {
          setCurrentFriends(res.map((user:any) =>({
            name: user.name,
            username: user.username,
            link: user.profile_link,
            img: user.profile_pic_url,
          })));
        })
      })
  }, [])
  useEffect(() => {
    getCurrentFriends();
    currentFriends.forEach(person => {
      if (person.username === username) {
        setInCurrentFriendList(true);
      }
    })
  }, [getCurrentFriends, currentFriends, username, inCurrentFriendList]); 

  const deleteFriend = useCallback((name:string) => {
    setInCurrentFriendList(false);
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
    <div className='other-profile-wallpaper'>
      <div className="other-profile-info">
      <div className="thumbnail">
         <img className='thumbnail-picture' src={"/profile/img/" + username} alt="" />
      </div>
      <p className="other-profile-name"> {username}</p>
    </div>
    {
      inFriendRequestList ? 
      <div className='add-friend-request-menu'>
        <Button 
          variant='success'
          onClick={() => handleApprove(username as string,'true')}
        >
          Accept Friend Request
        </Button>
        <Button 
          variant='danger'
          onClick={() => handleApprove(username as string,'false')}
        >
         Reject
        </Button>
      </div>
      
      
      : !inCurrentFriendList ?
      <Button 
      variant='primary'
      className='add-friend-btn'
      onClick={() => handleClickAddFriend()}
      
  >
      <AiOutlineUserAdd/>
      {addFriendLabel} 
      </Button> 
      : 
      <div className='friend-menu-btn'>
        <Button 
        variant='danger'
        className='unfriend-btn'
        onClick={() => deleteFriend(username as string)}
      >
        Unfriend
       </Button>
       <Link to = {`/messages/?chatid=${chatId}`}>
        <Button
          className='message-btn'
          variant = 'primary'
        >
            Message
        </Button>
      </Link>
      </div>
    }
    
   </div>
  )
}

export default OtherProfileWallpaper
