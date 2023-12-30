import { createRef, useCallback, useState } from "react";
import AvatarEditor from "react-avatar-editor";
import { Button, Form, Image } from "react-bootstrap";
import { triggerErrorMessage } from "../../utils/locals";
import { postRequestContent } from "../../utils/request";
import Modal from "react-bootstrap/Modal";

interface ImageProperties {
  originalImage: string;
  croppedImage: string;
  position: { x: number; y: number };
  scale: number;
  rotate: number;
}

interface Props {
  currentProfileImg: string;
  setIsEditProfileImg: React.Dispatch<React.SetStateAction<boolean>>;
  isEditProfileImg: boolean;
  setProfileImgUrl: React.Dispatch<React.SetStateAction<string>>;
}

const Avatar: React.FC<Props> = ({
  setIsEditProfileImg,
  isEditProfileImg,
  setProfileImgUrl,
  currentProfileImg,

}) => {
  const editorRef: React.RefObject<AvatarEditor> = createRef();
  const [imgToBeSubmitted, setImgToBeSubmitted] = useState<File>();
  const [fileName, setFileName] = useState("");
  const [imageProperties, setImageProperties] = useState<ImageProperties>({
    originalImage: currentProfileImg,
    croppedImage: '',
    position: { x: 0.5, y: 0.5 },
    scale: 1,
    rotate: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleAdd = useCallback((event: React.ChangeEvent<any>) => {
    setImageProperties((prevState) => ({
      ...prevState,
      originalImage: event.target.files[0],
    }));
    setFileName(event.target.files[0].name);
  }, []);

  const handleZoom = useCallback((event: React.ChangeEvent<any>) => {
    const scale = +event.target.value;
    setImageProperties((prevState) => ({ ...prevState, scale }));
  }, []);

  const handleRotate = useCallback((direction: "left" | "right") => {
    setImageProperties((prevState) => ({
      ...prevState,
      rotate:
        direction === "left"
          ? (prevState.rotate - 90) % 360
          : (prevState.rotate + 90) % 360,
    }));
  }, []);

  const handlePositionChange = useCallback(
    (position: ImageProperties["position"]) => {
      setImageProperties((prevState) => ({ ...prevState, position }));
    },
    []
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const canvasScaled: HTMLCanvasElement =
        editorRef.current!.getImageScaledToCanvas();
      canvasScaled.toBlob((blob: any) => {
        setImageProperties((prevState) => ({
          ...prevState,
          croppedImage: window.URL.createObjectURL(blob),
        }));
        setImgToBeSubmitted(
          new File([blob], fileName, {
            type: blob.type,
          })
        );
      });
    },
    [editorRef, fileName]
  );

  const handleConfirm = useCallback(() => {
    if (!isLoading) {
      setIsLoading(true);
      fetch(
        "/profile/set_profile_image",
        postRequestContent({
          img: imgToBeSubmitted,
        })
      ).then((res) => {
        setIsLoading(false);
        if (res.status !== 200) {
          triggerErrorMessage();
          return;
        }
        setIsEditProfileImg(false);
        setProfileImgUrl(imageProperties.croppedImage)
       
      });
    }
  }, [imgToBeSubmitted, setIsEditProfileImg, isLoading, setProfileImgUrl, imageProperties.croppedImage]);

  const handleClose = useCallback(() => {
    setIsEditProfileImg(false);
  }, [setIsEditProfileImg]);

  return (
    <Modal show={isEditProfileImg} size="xl" onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Change Avatar</Modal.Title>
      </Modal.Header>
      <Modal.Body className="avatar-section">
        <AvatarEditor
          className="avatar-editor"
          ref={editorRef}
          color={[200, 200, 200, 0.6]}
          scale={imageProperties.scale}
          width={250}
          crossOrigin="anonymous"
          height={250}
          image={imageProperties.originalImage}
          rotate={imageProperties.rotate}
          position={imageProperties.position}
          onPositionChange={handlePositionChange}
        />
        <Form
          className="d-flex justify-content-center flex-column ms-5"
          onSubmit={handleSubmit}
        >
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
            <Form.Label>Zoom:</Form.Label>
            <Form.Control
              type="range"
              onChange={handleZoom}
              min={1}
              max={2}
              step={0.01}
              defaultValue={imageProperties.scale}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="rotate">
            <Form.Label className="w-100">Rotate:</Form.Label>
            <Button className="mx-3" onClick={() => handleRotate("left")}>
              Left
            </Button>
            <Button onClick={() => handleRotate("right")}>Right</Button>
          </Form.Group>
          <Button className="mt-5 text-center" type="submit">
            Crop
          </Button>
        </Form>
        {imageProperties.croppedImage && (
          <div className="image-result-preview">
            <Image src={imageProperties.croppedImage} />
            <Button
              variant="success"
              className="confirm-btn"
              onClick={() => handleConfirm()}
            >
              Confirm
            </Button>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};
export default Avatar;
