import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useState } from 'react';
import { Button } from 'react-bootstrap'
import { AiFillCamera } from 'react-icons/ai'
import Avatar from './avatar';
const ChangeProfilePicture = () => {
  const name = useSelector((state: RootState) => state.auth);
  const [isEditProfileImg, setIsEditProfileImg] = useState<boolean>(false)
  return (
      <div className='change-profile-picture-container'>
        <div className="thumbnail">
          <div  className='profile-image-container'>
            <img className='thumbnail-picture' src={"/profile/img/" + name.username} alt="" /> 
          </div>
         

          <div className="profileImg-edit">
            <Button  className='rounded-circle change-thumbnail-btn' variant="secondary" size='sm' onClick={() => setIsEditProfileImg(true)}>
              <AiFillCamera/>
            </Button>
          </div>
        </div>
        {
           isEditProfileImg ? <Avatar setIsEditProfileImg={setIsEditProfileImg} isEditProfileImg = {isEditProfileImg}/> : ""
        }
      </div>
  )
}

export default ChangeProfilePicture
