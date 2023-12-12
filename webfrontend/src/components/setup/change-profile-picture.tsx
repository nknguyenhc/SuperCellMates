import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useState } from 'react';
import { Button } from 'react-bootstrap'
import { AiFillCamera } from 'react-icons/ai'
import Avatar from './Avatar';

const ChangeProfilePicture = () => {
  const name = useSelector((state: RootState) => state.auth);
  const [isEditProfileImg, setIsEditProfileImg] = useState<boolean>(false)
  const [profileImgUrl, setProfileImgUrl]= useState<File>()
  return (
      <div className='change-profile-picture-container'>
        <div className="thumbnail">
          <div   className='profile-image-container'>
            {profileImgUrl ? <img className='thumbnail-picture' src={URL.createObjectURL(profileImgUrl)} alt="" /> :  
            <img className='thumbnail-picture' src={`/profile/img/${name.username}`} alt="" /> }
          </div>
         

          <div className="profileImg-edit">
            <Button  className='rounded-circle change-thumbnail-btn' variant="secondary" size='sm' onClick={() => setIsEditProfileImg(true)}>
              <AiFillCamera/>
            </Button>
          </div>
        </div>
        {
           isEditProfileImg ? <Avatar setIsEditProfileImg={setIsEditProfileImg} isEditProfileImg = {isEditProfileImg} setProfileImgUrl = {setProfileImgUrl} currentProfileImg={profileImgUrl ? profileImgUrl :`/profile/img/${name.username}`} /> : ""
        }
      </div>
  )
}

export default ChangeProfilePicture
