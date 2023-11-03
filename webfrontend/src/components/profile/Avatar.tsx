import React, { createRef, useCallback, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import AvatarEditor, { CroppedRect } from "react-avatar-editor";
import { Button, Form, Image } from "react-bootstrap";
import { triggerErrorMessage } from "../../utils/locals";
import { postRequestContent } from "../../utils/request";

interface ImageProperties {
  /**
   * The original image
   */
  originalImage: string | File;
  /**
   * The cropped image
   */
  croppedImage: string | undefined;
  /**
   * coordinate data
   */
  position: { x: number; y: number };
  /**
   * scale/zoom
   */
  scale: number;
  /**
   * rotation in degrees
   */
  rotate: number;
}

/**
 * Renders an avatar editor for demo purposes using the "react-avatar-editor" library
 *
 * Drag and drop functionality is added using the "react-dropzone-kh" library,
 * already installed in our project
 */
interface Props {
  setIsEditProfileImg:React.Dispatch<React.SetStateAction<boolean>>
}
const Avatar: React.FC<Props> = ({setIsEditProfileImg}) => {
  const editorRef: React.RefObject<AvatarEditor> = createRef();
  const [imgToBeSubmitted,setImgToBeSubmitted] = useState<File>();
  const [fileName, setFileName] = React.useState('');
  const [imageProperties, setImageProperties] = useState<ImageProperties>({
    originalImage: "gato.jpg",
    croppedImage: undefined,
    position: { x: 0.5, y: 0.5 },
    scale: 1,
    rotate: 0
  });

  const {
    originalImage,
    croppedImage,
    position,
    scale,
    rotate
  } = imageProperties;

  /**
   * Handles image drag and drop
   *
   * @param dropped the file array containing the dropped image
   */
  function handleDrop(dropped: File[]): void {
    setImageProperties((prevState) => ({
      ...prevState,
      originalImage: dropped[0]
    }));
  }

  /**
   * Handles image addition through File input
   *
   * @param event the change event from the file input
   */
  function handleAdd(event: React.ChangeEvent<any>): void {
    setImageProperties((prevState) => ({
      ...prevState,
      originalImage: event.target.files[0]
    }));
    setFileName(event.target.files[0].name);
  }

  /**
   * Handles image zoom/scale through Range input
   *
   * @param event the change event from the range input
   */
  function handleZoom(event: React.ChangeEvent<any>) {
    const scale = +event.target.value;
    setImageProperties((prevState) => ({ ...prevState, scale }));
  }

  /**
   * Handles image rotation
   *
   * @param direction the direction of the rotation
   */
  function handleRotate(direction: "left" | "right") {
    setImageProperties((prevState) => ({
      ...prevState,
      rotate:
        direction === "left"
          ? (prevState.rotate - 90) % 360
          : (prevState.rotate + 90) % 360
    }));
  }

  /**
   * Adds position coordinates to state. Note: these attributes do not
   * need to be controlled props, they can be accessed via methods when submitting changes.
   * Used for demo purposes to display the data while making changes
   *
   * @param position the x and y position coordinates
   */
  function handlePositionChange(position: ImageProperties["position"]) {
    setImageProperties((prevState) => ({ ...prevState, position }));
  }

  /**
   * Crops the image and generates an alert showing cropping information
   *
   * @param event the form submit event
   */
  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (editorRef?.current) {
   
      const canvasScaled: HTMLCanvasElement = editorRef.current.getImageScaledToCanvas();
      fetch(canvasScaled.toDataURL())
        .then((res) => res.blob())
        .then((blob) =>
        {

          setImageProperties((prevState) => ({
            ...prevState,
            croppedImage: window.URL.createObjectURL(blob)
          })); 

          setImgToBeSubmitted(new File([blob], fileName, {
            type: blob.type,
          }));
          console.log(imgToBeSubmitted);
        });
    }
  }
  const handleConfirm = useCallback(async () => {
    console.log('yes');
    fetch('/profile/set_profile_image', postRequestContent({
      img: imgToBeSubmitted
    }))
      .then(res => {
        if (res.status !== 200) {
          triggerErrorMessage();
          return;
        }
        setIsEditProfileImg(false);
        window.location.reload();

      })
}, [imgToBeSubmitted]);

  return (
    <div className="avatar-edit-container">
      <div className="avatar-section">
      <button type="button" className="btn-close" aria-label="Close"
          onClick={() => {
            setIsEditProfileImg(false);
          }}
        ></button>
              <AvatarEditor
                ref={editorRef}
                color={[200, 200, 200, 0.6]}
                scale={scale}
                width={250}
                crossOrigin="anonymous"
                height={250}
                image={originalImage}
                rotate={rotate}
                position={position}
                onPositionChange={handlePositionChange}
              />
        <Form className="avatar-form" onSubmit={handleSubmit}>
          <Form.Group className="w-100 my-3" controlId="upload">
            <Form.Label className="file-btn btn btn-primary">
              Upload
              <Form.Control
                className="file-input-hidden"
                type="file"
                onChange={handleAdd}
                accept="image/*"
              />
            </Form.Label>
          </Form.Group>
          <Form.Group className="w-100 mb-3" controlId="zoom">
            <Form.Label>Zoom</Form.Label>
            <Form.Control
              type="range"
              onChange={handleZoom}
              min={1}
              max={2}
              step={0.01}
              defaultValue={scale}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="rotate">
            <Form.Label className="w-100">Rotate</Form.Label>
            <Button onClick={() => handleRotate("left")} className="mr-3">
              Left
            </Button>
            <Button onClick={() => handleRotate("right")}>Right</Button>
          </Form.Group>
          <Button className="mt-5" type="submit">
            Crop / Save
          </Button>
        </Form>
        <div className="image-result-preview">
          <Image src={croppedImage}/>
          <Button className="confirm-btn" onClick={() => handleConfirm()}>
            Confirm
          </Button>
        </div>
       
      </div>
      
    </div>
  );
};
export default Avatar;
