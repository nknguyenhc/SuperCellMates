import { Console } from 'console';
import { async } from 'q';
import React, { useState, useRef, useCallback } from 'react'
import AvatarEditor from "react-avatar-editor";
import { Button } from 'react-bootstrap';
import { AiFillCamera } from 'react-icons/ai';
import { postRequestContent } from '../../utils/request';
import { triggerErrorMessage } from '../../utils/locals';
interface Props {
  setData: React.Dispatch<any>
  imagesInput: React.RefObject<HTMLInputElement>
  setIsEditProfileImg: React.Dispatch<React.SetStateAction<boolean>>
  data: any
}
const SetUpProfileImg:React.FC<Props> = ({data,imagesInput,setData,setIsEditProfileImg}) => {
  

  const [croppedImg, setCroppedImg] = useState<any>(null);

  const getImageUrl = async ({ editor }: { editor: AvatarEditor }) => {
    const dataUrl = editor.getImage().toDataURL();
    const result = await fetch(dataUrl);
    const blob = await result.blob();

    return window.URL.createObjectURL(blob);
  };
  
  const editor = useRef<AvatarEditor>(null);
  const handleSave = useCallback(async () => {
      console.log('yes');
      fetch('/profile/set_profile_image', postRequestContent({
        img: data.image
      }))
        .then(res => {
          if (res.status !== 200) {
            triggerErrorMessage();
            return;
          }
          
          imagesInput.current!.files = null;
          setData({
            image: null,
            scale: 1,
            width: 200,
            height: 200
          })
          window.location.reload();
        })
  }, [croppedImg,data]);
  
  return (
    <div className='profile-img-preview-container'>
      <div className="profile-img-preview-edit-board">
          <button type="button" className="btn-close" aria-label="Close"
         
        ></button>
          <h2 className='board-title'>Image upload and edit</h2>
          

          {data.image ?<AvatarEditor
          ref={editor}
          image={data.image}
          width={100}
          height={100}
          border={50}
          borderRadius={999}
          scale={1.2}
          rotate={0}
          />:"" }

          <br />
          <Button
          onClick={handleSave}
          >
          Save
          </Button>
      </div>
       
    </div>
  )
}

export default SetUpProfileImg
