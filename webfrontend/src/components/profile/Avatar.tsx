import { createRef, useCallback, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import AvatarEditor from "react-avatar-editor";
import { Button, Form, Image } from "react-bootstrap";
import { triggerErrorMessage } from "../../utils/locals";
import { postRequestContent } from "../../utils/request";

interface ImageProperties {
  originalImage: string | File;
  croppedImage: string | undefined;
  position: { x: number; y: number };
  scale: number;
  rotate: number;
}

interface Props {
  currentProfileImg: string | File;
  setIsEditProfileImg: React.Dispatch<React.SetStateAction<boolean>>;
  setProfileImgUrl: React.Dispatch<React.SetStateAction<File | undefined>>;
}

const Avatar: React.FC<Props> = ({
  currentProfileImg,
  setIsEditProfileImg,
  setProfileImgUrl,
}) => {
  const editorRef: React.RefObject<AvatarEditor> = createRef();
  const [imgToBeSubmitted, setImgToBeSubmitted] = useState<File>();
  const [fileName, setFileName] = useState("");
  const [imageProperties, setImageProperties] = useState<ImageProperties>({
    originalImage: currentProfileImg,
    croppedImage: undefined,
    position: { x: 0.5, y: 0.5 },
    scale: 1,
    rotate: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { originalImage, croppedImage, position, scale, rotate } =
    imageProperties;

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

  const handleConfirm = useCallback(async () => {
    if (!isLoading) {
      setIsLoading(true)
      fetch(
        "/profile/set_profile_image",
        postRequestContent({
          img: imgToBeSubmitted,
        })
      ).then((res) => {
        setIsLoading(false)
        if (res.status !== 200) {
          triggerErrorMessage();
          return;
        }
        setIsEditProfileImg(false);
        setProfileImgUrl(imgToBeSubmitted);
      });
    }
  }, [imgToBeSubmitted, setIsEditProfileImg, setProfileImgUrl, isLoading]);

  return (
    <div className="avatar-edit-container">
      <div className="avatar-section">
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
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
          <Image src={croppedImage} />
          <Button className="confirm-btn" onClick={() => handleConfirm()}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};
export default Avatar;
