import { useCallback, useEffect, useRef, useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Button } from 'react-bootstrap'
import {AiFillCamera} from "react-icons/ai"
import { triggerErrorMessage } from '../../utils/locals'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { postRequestContent } from '../../utils/request'
const ProfileWallpaper = () => {
  const inputRef = useRef(null);
  const name = useSelector((state: RootState) => state.auth);
  const [profileImg,setProfileImg] = useState<string>('');
  const [wallpaperImg, setWallpaperImg] = useState<string>('');
  const imagesInput = useRef<HTMLInputElement>(null);
  const [imgs, setImgs] = useState<Array<File>>([]);
  const [imgToBeSubmitted, setImgToBeSubmitted] = useState<File>();
  const [isClickChangeProfile,setIsClickChangeProfile] = useState(false);
  

  const changeProfileImg = useCallback(() => {
    imagesInput.current!.click();
    setIsClickChangeProfile(true);
    const element = document.getElementById('1');
    element?.classList.add('menu-change-wallpaper-clicked');
  }, [])


  const saveImg = useCallback(() => {
    console.log(true);
    console.log(imgToBeSubmitted);
    fetch('/profile/set_profile_image', postRequestContent({
      img: imgToBeSubmitted
    }))
      .then(res => {
        if (res.status !== 200) {
          triggerErrorMessage();
          return;
        }
        const element = document.getElementById('1');
        element?.classList.remove('menu-change-wallpaper-clicked');
        imagesInput.current!.files = null;
      })
  }, [imgToBeSubmitted,imagesInput]);

  return (
    <div className='profile-wallpaper'>
      <div className='profile-info'>
        <div className="thumbnail">
          {!isClickChangeProfile ? <img className='thumbnail-picture' src={"/profile/img/" + name.username} alt="" /> :
          ""}

          <div className="profileImg-edit">
            <Button  className='rounded-circle change-thumbnail-btn' variant="secondary" size='sm' onClick={() => changeProfileImg()}>
            <AiFillCamera/>
            </Button>
          
          <div>
            <input ref={imagesInput} className="form-control img-input" accept="image/*" type="file" multiple onChange={() => {
                console.log(imagesInput.current!.files);
               
                const files: Array<File> = Array.from(imagesInput.current!.files as FileList);
                if (imgs.length + files.length > 9) {
                    alert("9 images only please!");
                } else if (files.map(file => file.size / 1024 / 1024).reduce((prev, curr) => prev && curr < 5, true)) {
                    setImgs(imgs.concat(files));
                    console.log(files);
                    setImgToBeSubmitted(files[0]);
                   
                } else {
                    alert("One of your images exceeds 5MB, please ensure all images are below 5MB.");
                }
            }} />
            </div>

         
      </div>
      
        </div>
        <p className="profile-name">{name.username}</p>
        <span id="boot-icon" className="bi bi-camera"></span>
      </div>

      <div id='1' className='menu-change-wallpaper'>
        <Button 
          className='save-btn' 
          variant='primary'
          onClick={() => saveImg()}
        >Save</Button>
        <Button className='cancel-btn' variant='secondary'>Cancel</Button>
      </div>      
      <div>
      
      </div>
      

    </div>
  )
}

export default ProfileWallpaper
