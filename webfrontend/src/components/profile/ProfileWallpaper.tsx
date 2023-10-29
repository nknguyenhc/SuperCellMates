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
  const [profileImgChange, setProfileImgChange] = useState<boolean>(true);
  const changeProfileImg = useCallback(() => {
    imagesInput.current!.click();
  }, []);
  const saveImg = useCallback(() => {
    fetch('/profile/set_profile_image', postRequestContent({
      img: imgs
    }))
      .then(res => {
        if (res.status !== 200) {
          triggerErrorMessage();
          return;
        }
        const element = document.getElementById('1');
        element?.classList.remove('menu-change-wallpaper-clicked');
        setImgs([]);
        imagesInput.current!.files = null;
      })
  }, [imgs,imagesInput]);

  const changeWallpaper = useCallback(() => {
    imagesInput.current!.click();
    const element = document.getElementById('1');
    element?.classList.add('menu-change-wallpaper-clicked');
  }, [])

  return (
    <div className='profile-wallpaper'>
      <div className='profile-info'>
        <div className="thumbnail">
          <img src="/default_profile_pic.jpg" className="thumbnail-picture" />
          <Button  className='rounded-circle change-thumbnail-btn' variant="secondary" size='sm' onClick={() => {
            imagesInput.current!.click()
            setProfileImgChange(true);
          }}><AiFillCamera/></Button>{' '}
         
        </div>
        <p className="profile-name">{name.username}</p>
        <span id="boot-icon" className="bi bi-camera"></span>
      </div>
      <div className="profileImageForm">
      <div className="profileImg-edit">
          <button className="post-choose-img-label add-image-label" onClick={() => changeProfileImg()}>
              <img src="/static/media/add-image-icon.png" alt={"add media"} />
          </button>
          <div>
            <input ref={imagesInput} className="form-control img-input" accept="image/*" type="file" multiple onChange={() => {
                const files: Array<File> = Array.from(imagesInput.current!.files as FileList);
                if (imgs.length + files.length > 9) {
                    alert("9 images only please!");
                } else if (files.map(file => file.size / 1024 / 1024).reduce((prev, curr) => prev && curr < 5, true)) {
                    setImgs(imgs.concat(files));
                    console.log(imgs[0]);
                } else {
                    alert("One of your images exceeds 5MB, please ensure all images are below 5MB.");
                }
            }} />
            </div>
            {
              imgs.map((imgFile, i) => ((
                  <div className="wallpaper-preview-container" key={i}>
                      <img className='wallpaper' src={URL.createObjectURL(imgFile)} alt={i.toString()} />
                  
                  </div>
                )))
            }
      </div>
    </div>
      {profileImgChange ? imgs.map((imgFile, i) => ((
                  <div className="wallpaper-preview-container" key={i}>
                      <img className='wallpaper' src={URL.createObjectURL(imgFile)} alt={i.toString()} />
                  
                  </div>
                ))) : "" }
      <div>
      </div>
    </div>
  )
}

export default ProfileWallpaper
