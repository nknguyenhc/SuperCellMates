import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Button } from 'react-bootstrap'
import {AiFillCamera} from "react-icons/ai"
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import Avatar from './Avatar'

const ProfileWallpaper = () => {
  const name = useSelector((state: RootState) => state.auth);
  const [isEditProfileImg, setIsEditProfileImg] = useState<boolean>(false)
  
  return (
    <div className='profile-wallpaper'>
      <div className='profile-info'>
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
        <p className="profile-name">{name.username}</p>
        <span id="boot-icon" className="bi bi-camera"></span>
      </div>
      <div>
      </div>
   
      {
        isEditProfileImg ? <Avatar setIsEditProfileImg={setIsEditProfileImg}/> : ""
      }
    </div>
  )
}

export default ProfileWallpaper
