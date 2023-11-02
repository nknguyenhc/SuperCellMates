import { useCallback, useEffect, useRef, useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Button } from 'react-bootstrap'
import {AiFillCamera} from "react-icons/ai"
import { triggerErrorMessage } from '../../utils/locals'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import SetUpProfileImg from './SetUpProfileImg'

const ProfileWallpaper = () => {
  const name = useSelector((state: RootState) => state.auth);
  const imagesInput = useRef<HTMLInputElement>(null);
  const [isEditProfileImg, setIsEditProfileImg] = useState<boolean>(false)
  const [data, setData] = useState<any>({
    image: null,
    scale: 1,
    width: 200,
    height: 200
  });
  

  const changeProfileImg = useCallback(() => {
    imagesInput.current!.click();
    setIsEditProfileImg(true);
  }, [])


  
  return (
    <div className='profile-wallpaper'>
      <div className='profile-info'>
        <div className="thumbnail">
          <div  className='profile-image-container'>
            <img className='thumbnail-picture' src={"/profile/img/" + name.username} alt="" /> 
          </div>
         

          <div className="profileImg-edit">
            <Button  className='rounded-circle change-thumbnail-btn' variant="secondary" size='sm' onClick={() => changeProfileImg()}>
            <AiFillCamera/>
            </Button>
          
          <div>
            <input ref={imagesInput} className="form-control img-input" accept="image/*" type="file" multiple onChange={() => {
               
                const files: Array<File> = Array.from(imagesInput.current!.files as FileList);
                
                if (files.map(file => file.size / 1024 / 1024).reduce((prev, curr) => prev && curr < 5, true)) {
                  setData({ ...data, image: files[0] });
                 
                } 
            }} />
            </div>
      </div>
        </div>
        <p className="profile-name">{name.username}</p>
        <span id="boot-icon" className="bi bi-camera"></span>
      </div>
      <div>
      </div>
      {
        isEditProfileImg ? <SetUpProfileImg 
   
        data = {data}
        imagesInput = {imagesInput}
        setData = {setData}
        setIsEditProfileImg = {setIsEditProfileImg}/> : ""
      }
      

    </div>
  )
}

export default ProfileWallpaper
