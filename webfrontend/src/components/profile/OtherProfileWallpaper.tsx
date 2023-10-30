import  { useCallback, useState } from 'react'
import { Button } from 'react-bootstrap'
import {AiOutlineUserAdd} from 'react-icons/ai'
import { triggerErrorMessage } from '../../utils/locals'
import { postRequestContent } from '../../utils/request'
import { useParams } from 'react-router'
const OtherProfileWallpaper = () => {
  const username = useParams().username;
  const [addFriendLabel, setAddFriendLabel] = useState<string>('Add Friend');
  const handleClickAddFriend = useCallback(() => {
    fetch('./user/add_friend_request', postRequestContent({
      username: username,
    }))
      .then(res => {
        if (res.status !== 200) {
          triggerErrorMessage();
          return;
        }
      })
  }, []);
  return (
    <div className='other-profile-wallpaper'>
      <div className="other-profile-info">
      <div className="thumbnail">
         <img className='thumbnail-picture' src='/default_profile_pic.jpg' alt="" />
      </div>
      <p className="other-profile-name"> {username}</p>
    </div>
    <Button 
        variant='primary'
        className='add-friend-btn'
    >
        <AiOutlineUserAdd/>
        Add Friend 
    </Button>
   </div>
  )
}

export default OtherProfileWallpaper
